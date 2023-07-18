import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '~/utils/db.server.ts'
import { requireAdmin } from '~/utils/permissions.server.ts'
import { SourceEditor } from '../resources+/source-editor.tsx'

export async function loader({ params, request }: DataFunctionArgs) {
	await requireAdmin(request)
	const source = await prisma.source.findFirst({
		where: {
			id: params.sourceId,
		},
	})
	if (!source) {
		throw new Response('Not found', { status: 404 })
	}
	return json({ source })
}

export default function EditSource() {
	const data = useLoaderData<typeof loader>()

	return (
		<main className="container my-4">
			<SourceEditor source={data.source} categoryId={data.source.categoryId!} />
		</main>
	)
}
