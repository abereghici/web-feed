import { type DataFunctionArgs, json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import Parser from 'rss-parser'
import urlMetadata from 'url-metadata'
import { MainLayout } from '~/components/layout/main-layout.tsx'
import {
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '~/components/layout/sidebar.tsx'

export async function loader({ request }: DataFunctionArgs) {
	let parser = new Parser()

	let feed = await parser.parseURL('https://tympanus.net/codrops/feed/')
	const metadata = await urlMetadata(feed.items[0].link ?? '')

	const url = new URL(feed.items[0].link ?? '')

	return json({
		title: metadata.title || metadata['og:title'],
		url: metadata.url || metadata['og:url'],
		image: metadata.image || metadata['og:image'],
		description: metadata.description || metadata['og:description'],
		hostname: url.hostname,
	})
}

export default function Feed() {
	const data = useLoaderData<typeof loader>()

	console.log(data)
	return (
		<MainLayout
			content={<Outlet />}
			aside={
				<Sidebar>
					<SidebarCategory title="Category">
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
					</SidebarCategory>
					<SidebarCategory title="Category">
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
					</SidebarCategory>
					<SidebarCategory title="Category">
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
						<SidebarItem title="Item" thumbnail="/img/user.png"></SidebarItem>
					</SidebarCategory>
				</Sidebar>
			}
		/>
	)
}
