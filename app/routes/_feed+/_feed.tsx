import { type DataFunctionArgs, json } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { MainLayout } from '~/components/layout/main-layout.tsx'
import {
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '~/components/layout/sidebar.tsx'

export async function loader({ request }: DataFunctionArgs) {
	return json({})
}

export default function Feed() {
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
