import { Outlet } from '@remix-run/react'
import { MainLayout } from '~/components/layout/main-layout.tsx'
import {
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '~/components/layout/sidebar.tsx'

export default function AdminLayout() {
	return (
		<MainLayout
			content={<Outlet />}
			aside={
				<Sidebar>
					<SidebarCategory title="Admin">
						<SidebarItem title="Categories" href={`/admin/category`} />
						<SidebarItem title="Cache" href={`/admin/cache`} />
					</SidebarCategory>
				</Sidebar>
			}
		/>
	)
}
