import { type Source } from '@prisma/client'
import RSSParser from 'rss-parser'
import metadataParser, { type Result } from 'url-metadata'
import { isFulfilled } from './misc.ts'

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

export async function getFreshLinks(source: Source) {
	const result = await fetchSource(source.url)

	const links = await Promise.allSettled(
		result.items.map(async item => {
			let link = item.link
			if (link?.startsWith('/')) {
				link = new URL(link, source.url).toString()
			}

			if (link) {
				const meta = await fetchMetadata(link)
				return {
					title: item.title,
					link: item.link,
					image: meta ? extractImageFromMetadata(meta) : undefined,
					sourceImageId: source.imageId,
				}
			}

			return null
		}),
	)

	return links
		.filter(isFulfilled)
		.map(link => link.value)
		.filter(Boolean)
}
