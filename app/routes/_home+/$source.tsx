import { json, type DataFunctionArgs } from '@remix-run/node'
import { LinkCard } from '~/components/cards/link-card.tsx'
import { prisma } from '~/utils/db.server.ts'
import { useLoaderData } from '@remix-run/react'
import { cachified, cache } from '~/utils/cache.server.ts'
import { getImgSrc } from '~/utils/misc.ts'
import { type Source } from '@prisma/client'
import { config, getFreshLinks } from '~/utils/sources.server.ts'

export async function getLinks(source: Source) {
	const cachedLinks = await cachified({
		key: `${source.slug}:links`,
		cache,
		getFreshValue: () => getFreshLinks(source),
		// Time To Live (ttl) in milliseconds: the cached value is considered valid for 24 hours
		ttl: config.ttl,
		// Stale While Revalidate (swr) in milliseconds: if the cached value is less than 30 days
		// expired, return it while fetching a fresh value in the background
		staleWhileRevalidate: config.staleWhileRevalidate,
	})
	return cachedLinks
}

export async function loader({ params }: DataFunctionArgs) {
	let source
	const sourceName = params.source

	if (sourceName) {
		source = await prisma.source.findUnique({
			where: { slug: sourceName },
		})
	} else {
		const firstCategory = await prisma.sourceCategory.findFirst({
			include: { sources: true },
		})
		source = firstCategory?.sources[0]
	}

	if (!source) {
		throw new Response('Not found', { status: 404 })
	}

	try {
		return json({
			links: await getLinks(source),
		})
	} catch (e) {
		console.error(e)
		throw new Response('Server error', { status: 500 })
	}
}

export default function SourceLinks() {
	const data = useLoaderData<typeof loader>()
	return (
		<main className="container my-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{data.links.map(link => (
				<LinkCard
					key={link.link}
					title={link.title ?? 'No title'}
					href={link.link ?? '#'}
					image={link.image}
					sourceImage={getImgSrc(link.sourceImageId)}
				/>
			))}
		</main>
	)
}
