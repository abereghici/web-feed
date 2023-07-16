import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from '~/components/ui/card.tsx'
import { prisma } from '~/utils/db.server.ts'
import { requireAdmin } from '~/utils/permissions.server.ts'

export async function loader({ request }: DataFunctionArgs) {
	await requireAdmin(request)
	const categoriesCount = await prisma.sourceCategory.count()
	const sourcesCount = await prisma.source.count()

	return json({
		categoriesCount,
		sourcesCount,
	})
}

export default function AdminIndex() {
	const data = useLoaderData<typeof loader>()
	return (
		<div className="container my-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Categories</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.categoriesCount}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sources</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.sourcesCount}</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
