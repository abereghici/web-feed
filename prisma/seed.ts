import fs from 'fs'
import { prisma } from '~/utils/db.server.ts'
import { deleteAllData } from 'tests/setup/utils.ts'
import { getPasswordHash } from '~/utils/auth.server.ts'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')
	deleteAllData()
	console.timeEnd('🧹 Cleaned up the database...')

	console.time(`👑 Created admin role/permission...`)
	const adminRole = await prisma.role.create({
		data: {
			name: 'admin',
			permissions: {
				create: { name: 'admin' },
			},
		},
	})
	console.timeEnd(`👑 Created admin role/permission...`)

	console.time(
		`🐨 Created user "admin" with the password "password" and admin role`,
	)
	await prisma.user.create({
		data: {
			email: 'admin@web-feed.dev',
			username: 'admin',
			name: 'Admin',
			roles: { connect: { id: adminRole.id } },
			password: {
				create: {
					hash: await getPasswordHash('password'),
				},
			},
		},
	})
	console.timeEnd(
		`🐨 Created user "admin" with the password "password" and admin role`,
	)

	console.time(`Creating categories...`)
	const category = await prisma.category.create({
		data: { name: 'News' },
	})
	console.timeEnd(`Creating categories...`)

	console.time(`Creating sources...`)
	await prisma.source.create({
		data: {
			name: 'The New York Times',
			slug: 'the-new-york-times',
			url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
			image: {
				create: {
					contentType: 'image/png',
					file: {
						create: {
							blob: await fs.promises.readFile('./tests/fixtures/user.png'),
						},
					},
				},
			},
			links: {
				create: {
					url: 'https://www.nytimes.com/',
					imageUrl:
						'https://yt3.googleusercontent.com/ytc/AOPolaT6tAH_gUDkztSjfyMu4ekEt0XYoOYFe1D9RcDgEQ=s900-c-k-c0x00ffffff-no-rj',
				},
			},
			category: {
				connect: {
					id: category.id,
				},
			},
		},
	})
	console.timeEnd(`Creating sources...`)

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

/*
eslint
	@typescript-eslint/no-unused-vars: "off",
*/
