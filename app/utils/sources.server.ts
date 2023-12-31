import RSSParser from 'rss-parser'
import metadataParser, { type Result } from 'url-metadata'
import { sizedPool } from 'promisified-resource-pool'
import { prisma } from '~/utils/db.server.ts'
import { isFulfilled } from '~/utils/misc.ts'

export const config = {
	// Time To Live (ttl) in milliseconds: the cached value is considered valid for 24 hours
	ttl: 1000 * 60 * 60 * 24,
	// Stale While Revalidate (swr) in milliseconds: if the cached value is less than 30 days
	// expired, return it while fetching a fresh value in the background
	staleWhileRevalidate: 1000 * 60 * 60 * 24 * 30,
}

export async function fetchSource(url: string) {
	const xml = await fetch(url, {
		headers: {
			connection: 'keep-alive',
		},
	}).then(res => res.text())

	return new RSSParser().parseString(xml)
}

export async function fetchMetadata(url: string) {
	try {
		return metadataParser(url)
	} catch (e) {
		console.error(e)
		return null
	}
}

function isValidURL(text: unknown): text is string {
	try {
		new URL(decodeURIComponent(text as string))
	} catch (_) {
		return false
	}
	return true
}

export function extractImageFromMetadata(metadata: Result) {
	let imageLink
	if (isValidURL(metadata['og:image'])) {
		imageLink = metadata['og:image'] as string
	} else if (
		typeof metadata['og:image'] === 'string' &&
		metadata['og:image'] !== '' &&
		isValidURL(metadata['url'] + metadata['og:image'])
	) {
		imageLink = new URL(metadata['url'] + metadata['og:image'])['href']
	} else if (isValidURL(metadata['twitter:image'])) {
		imageLink = metadata['twitter:image']
	} else if (isValidURL(metadata['image'])) {
		imageLink = metadata['image']
	} else if (
		typeof metadata['image'] === 'string' &&
		metadata['image'] !== '' &&
		isValidURL(metadata['url'] + metadata['image']) === true
	) {
		imageLink = new URL(metadata['url'] + metadata['image'])['href']
	}

	return imageLink
}

const enqueue = sizedPool<{
	title: string | undefined
	link: string | undefined
	image: string | undefined
	createdDate: Date | undefined
} | null>(3)

export async function getFreshLinks(sourceUrl: string) {
	console.log('Fetching ', sourceUrl)

	const data = await fetchSource(sourceUrl).catch(err => {
		console.error(err)
		return null
	})

	if (!data) return []

	const links = await Promise.allSettled(
		data.items.map(async item => {
			return enqueue(async () => {
				let link = item.link
				if (link?.startsWith('/')) {
					link = new URL(link, sourceUrl).toString()
				}

				if (link) {
					const meta = await fetchMetadata(link).catch(err => {
						console.error(link, err)
						return null
					})

					// If we can't fetch metadata, we don't want to show the link, might be 404
					if (!meta) return null

					return {
						title: item.title,
						link: item.link,
						image: meta ? extractImageFromMetadata(meta) : undefined,
						createdDate: item.pubDate ? new Date(item.pubDate) : undefined,
					}
				}

				return null
			})
		}),
	)

	return links
		.filter(isFulfilled)
		.map(link => link.value)
		.filter(Boolean)
}

const enqueueLinks = sizedPool<Awaited<ReturnType<typeof getFreshLinks>>>(3)

export const updateSources = async () => {
	const sources = await prisma.source.findMany({
		select: {
			id: true,
			url: true,
		},
	})

	sources.forEach(async source => {
		const links = await enqueueLinks(() => getFreshLinks(source.url))

		for (const link of links) {
			if (!link.link || !link.title) continue

			await prisma.link.upsert({
				where: { url: link.link },
				create: {
					title: link.title,
					url: link.link,
					imageUrl: link.image,
					createdAt: link.createdDate ? link.createdDate : undefined,
					source: {
						connect: {
							id: source.id,
						},
					},
				},
				update: link.createdDate ? {
					createdAt: link.createdDate
				}: {},
			})
		}
	})
}
