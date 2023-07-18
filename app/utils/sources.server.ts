import { type Source } from '@prisma/client'
import RSSParser from 'rss-parser'
import metadataParser, { type Result } from 'url-metadata'
import { isFulfilled } from './misc.ts'
import { sizedPool } from 'promisified-resource-pool'
import axios from 'axios'

export const config = {
	// Time To Live (ttl) in milliseconds: the cached value is considered valid for 24 hours
	ttl: 1000 * 60 * 60 * 24,
	// Stale While Revalidate (swr) in milliseconds: if the cached value is less than 30 days
	// expired, return it while fetching a fresh value in the background
	staleWhileRevalidate: 1000 * 60 * 60 * 24 * 30,
}

export async function fetchSource(url: string) {
	// const xml = await fetch(url, {
	// 	headers: {
	// 		connection: 'keep-alive',
	// 	},
	// }).then(res => res.text())

	const xml = await axios.get(url)
	return new RSSParser().parseString(xml.data)
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
	sourceImageId: string
} | null>(3)

export async function getFreshLinks(source: Source) {
	console.log('Fetching ', source.url)

	const data = await fetchSource(source.url).catch(err => {
		console.error(err)
		return null
	})

	if (!data) return []

	const links = await Promise.allSettled(
		data.items.map(async item => {
			return enqueue(async () => {
				let link = item.link
				if (link?.startsWith('/')) {
					link = new URL(link, source.url).toString()
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
						sourceImageId: source.imageId,
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
