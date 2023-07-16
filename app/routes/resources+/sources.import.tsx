import { type DataFunctionArgs, redirect, json } from '@remix-run/node'
import { z } from 'zod'
import { prisma } from '~/utils/db.server.ts'
import { getFavicon, slugify } from '~/utils/misc.ts'

const SourceImportSchema = z.array(
	z.object({
		category: z.string(),
		items: z.array(
			z.object({
				name: z.string(),
				link: z.string(),
				rss: z.string(),
			}),
		),
	}),
)

export async function action({ request }: DataFunctionArgs) {
	const token = process.env.INTERNAL_COMMAND_TOKEN
	const isAuthorized =
		request.headers.get('Authorization') === `Bearer ${token}`
	if (!isAuthorized) {
		// rick roll them
		return redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	}

	const data = await request.json()

	if (!data) {
		return json(
			{
				status: 'error',
			} as const,
			{ status: 400 },
		)
	}

	const sources = SourceImportSchema.safeParse(data)

	if (!sources.success) {
		return json(
			{
				status: 'error',
				data,
			} as const,
			{ status: 400 },
		)
	}

	sources.data.forEach(async source => {
		const existingCategory = await prisma.sourceCategory.findFirst({
			where: { name: source.category },
			select: { id: true },
		})

		let category: {
			id: string
		} | null = null

		if (existingCategory) {
			category = await prisma.sourceCategory.update({
				where: { name: source.category },
				data: {
					name: source.category,
				},
			})
		} else {
			category = await prisma.sourceCategory.create({
				data: {
					name: source.category,
				},
			})
		}

		source.items.forEach(async item => {
			const existingItem = await prisma.source.findFirst({
				where: { slug: slugify(item.name) },
				select: { id: true },
			})

			const image = {
				contentType: 'image/png',
				file: {
					create: {
						blob: Buffer.from(await getFavicon(item.link)),
					},
				},
			}

			if (existingItem) {
				await prisma.source.update({
					where: { slug: slugify(item.name) },
					data: {
						name: item.name,
						url: item.rss,
						slug: slugify(item.name),

						image: {
							upsert: {
								create: image,
								update: image,
							},
						},
						category: {
							connect: {
								id: category!.id,
							},
						},
					},
				})
			} else {
				await prisma.source.create({
					data: {
						name: item.name,
						url: item.rss,
						slug: slugify(item.name),
						image: {
							create: image,
						},
						category: {
							connect: {
								id: category!.id,
							},
						},
					},
				})
			}
		})
	})

	return json({ message: 'ok' })
}
