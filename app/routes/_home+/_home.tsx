import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { useCallback } from 'react'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { useMainLayout } from '~/components/layout/main-layout-provider.tsx'
import { MainLayout } from '~/components/layout/main-layout.tsx'
import {
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '~/components/layout/sidebar.tsx'
import { prisma } from '~/utils/db.server.ts'
import { getImgSrc } from '~/utils/misc.ts'

export async function loader() {
	const categories = await prisma.category.findMany({
		include: {
			sources: true,
		},
	})

	return json({
		categories,
	})
}

export default function Feed() {
	const { categories } = useLoaderData<typeof loader>()

	return (
		<MainLayout
			content={<Outlet />}
			aside={<Aside categories={categories} />}
		/>
	)
}

type Categories = ReturnType<typeof useLoaderData<typeof loader>>['categories']

function Aside({ categories }: { categories: Categories }) {
	const { sidebar } = useMainLayout()

	const onClick = useCallback(() => {
		sidebar.close()
	}, [sidebar])

	return (
		<Sidebar>
			{categories.map((category, categoryIndex) => (
				<SidebarCategory key={category.id} title={category.name}>
					{category.sources.map((source, sourceIndex) => (
						<SidebarItem
							key={source.id}
							title={source.name}
							thumbnail={getImgSrc(source.imageId)}
							href={`/${source.slug}`}
							isFirstItem={categoryIndex === 0 && sourceIndex === 0}
							onClick={onClick}
						/>
					))}
				</SidebarCategory>
			))}
		</Sidebar>
	)
}

export function ErrorBoundary() {
	return (
		<MainLayout
			content={
				<div className="my-8 text-h4">
					<GeneralErrorBoundary
						statusHandlers={{
							404: () => <h1>404 | not found</h1>,
							500: () => <h1>500 | server error</h1>,
						}}
					/>
				</div>
			}
		/>
	)
}
