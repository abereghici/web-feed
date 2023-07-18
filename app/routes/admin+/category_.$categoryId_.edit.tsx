import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '~/utils/db.server.ts'
import { requireAdmin } from '~/utils/permissions.server.ts'
import { CategoryEditor } from '~/routes/resources+/category-editor.tsx'

export async function loader({ params, request }: DataFunctionArgs) {
	await requireAdmin(request)
	const category = await prisma.category.findFirst({
		where: {
			id: params.categoryId,
		},
	})
	if (!category) {
		throw new Response('Not found', { status: 404 })
	}
	return json({ category })
}

export default function EditCategory() {
	const data = useLoaderData<typeof loader>()

	return (
		<main className="container my-4">
			<CategoryEditor category={data.category} />
		</main>
	)
}
