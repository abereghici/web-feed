import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { sizedPool } from 'promisified-resource-pool'
import { prisma } from '~/utils/db.server.ts'
import { getFreshLinks } from '~/utils/sources.server.ts'

const enqueue = sizedPool<Awaited<ReturnType<typeof getFreshLinks>>>(3)

const updateSources = async () => {
	const sources = await prisma.source.findMany()

	sources.forEach(async source => {
		const links = await enqueue(() => getFreshLinks(source))

		for (const link of links) {
			if (!link.link || !link.title) continue

			await prisma.link.upsert({
				where: { url: link.link },
				create: {
					title: link.title,
					url: link.link,
					imageUrl: link.image,
					source: {
						connect: {
							id: source.id,
						},
					},
				},
				update: {},
			})
		}
	})
}

export async function action({ request }: DataFunctionArgs) {
	const token = process.env.INTERNAL_COMMAND_TOKEN
	const isAuthorized =
		request.headers.get('Authorization') === `Bearer ${token}`
	if (!isAuthorized) {
		// rick roll them
		return redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	}

	updateSources()

	return json({ message: 'ok' })
}
