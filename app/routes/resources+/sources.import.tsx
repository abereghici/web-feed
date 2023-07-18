import { type Source } from '@prisma/client'
import { type DataFunctionArgs, redirect, json } from '@remix-run/node'
import { sizedPool } from 'promisified-resource-pool'
import { z } from 'zod'
import { prisma } from '~/utils/db.server.ts'
import { getFavicon, slugify } from '~/utils/misc.ts'
import { getFreshLinks } from '~/utils/sources.server.ts'

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

function upsertCategory(name: string) {
	return prisma.category.upsert({
		where: { name },
		create: { name },
		update: {},
		select: {
			id: true,
		},
	})
}

async function upsertSource({
	name,
	item,
	category,
}: {
	name: string
	item: {
		name: string
		link: string
		rss: string
	}
	category: { id: string }
}) {
	const existingSource = await prisma.source.findFirst({
		where: { slug: slugify(name) },
	})

	if (existingSource) {
		return existingSource
	}

	const { buffer, contentType } = await getFavicon(item.link)
	return prisma.source.create({
		data: {
			name: item.name,
			url: item.rss,
			slug: slugify(item.name),
			image: {
				create: {
					contentType,
					file: {
						create: {
							blob: buffer,
						},
					},
				},
			},
			category: {
				connect: {
					id: category!.id,
				},
			},
		},
	})
}

const enqueue = sizedPool<Awaited<ReturnType<typeof getFreshLinks>>>(3)

async function upsertLinks(source: Source) {
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
}

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

	const parsedData = SourceImportSchema.safeParse(data)

	if (!parsedData.success) {
		return json(
			{
				status: 'error',
				data,
			} as const,
			{ status: 400 },
		)
	}

	parsedData.data.forEach(async data => {
		const category = await upsertCategory(data.category)
		data.items.forEach(async item => {
			const source = await upsertSource({ name: item.name, item, category })
			await upsertLinks(source)
			return source
		})
	})
	return json({ message: 'ok' })
}
