import { json } from '@remix-run/node'
import { LinkCard } from '~/components/cards/link-card.tsx'
import { prisma } from '~/utils/db.server.ts'
import { useLoaderData } from '@remix-run/react'
import { getImgSrc } from '~/utils/misc.ts'

export async function loader() {
	const categories = await prisma.category.findMany({
		include: {
			sources: {
				include: {
					image: true,
					links: {
						orderBy: { createdAt: 'desc' },
						take: 5,
					},
				},
			},
		},
	})

	const links = categories
		.flatMap(category =>
			category.sources.flatMap(source =>
				source.links.map(link => ({
					...link,
					sourceImageId: source.imageId,
				})),
			),
		)
		.sort((a, b) => {
			try {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			} catch (e) {
				console.error(e)
				return 0
			}
		})

	try {
		return json({
			links,
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
					date={link.createdAt}
					sourceImage={getImgSrc(link.sourceImageId)}
				/>
			))}
		</main>
	)
}
