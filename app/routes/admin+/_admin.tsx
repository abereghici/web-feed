import { Outlet } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
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

export function ErrorBoundary() {
	return (
		<MainLayout
			content={
				<div className="my-8 text-h4">
					<GeneralErrorBoundary
						statusHandlers={{
							401: () => <h1>401 | unauthorized</h1>,
							403: () => <h1>403 | forbidden</h1>,
							404: () => <h1>404 | not found</h1>,
							500: () => <h1>500 | server error</h1>,
						}}
					/>
				</div>
			}
		/>
	)
}
