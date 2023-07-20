import { json, type DataFunctionArgs } from '@remix-run/node'
import { LinkCard } from '~/components/cards/link-card.tsx'
import { prisma } from '~/utils/db.server.ts'
import { useLoaderData } from '@remix-run/react'
import { getImgSrc } from '~/utils/misc.ts'

export async function loader({ params }: DataFunctionArgs) {
	let source
	const sourceName = params.source

	if (sourceName) {
		source = await prisma.source.findUnique({
			where: { slug: sourceName },
			include: {
				links: {
					orderBy: { createdAt: 'desc' },
				},
			},
		})
	} else {
		const firstCategory = await prisma.category.findFirst({
			include: {
				sources: {
					include: {
						links: {
							orderBy: { createdAt: 'desc' },
						},
					},
				},
			},
		})
		source = firstCategory?.sources[0]
	}

	if (!source) {
		throw new Response('Not found', { status: 404 })
	}

	try {
		return json({
			sourceImageId: source.imageId,
			links: source.links,
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
					key={link.url}
					title={link.title ?? 'No title'}
					href={link.url ?? '#'}
					image={link.imageUrl}
					sourceImage={getImgSrc(data.sourceImageId)}
				/>
			))}
		</main>
	)
}
