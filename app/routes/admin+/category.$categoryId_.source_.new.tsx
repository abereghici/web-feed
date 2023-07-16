import { json, type DataFunctionArgs } from '@remix-run/node'
import { requireAdmin } from '~/utils/permissions.server.ts'
import { SourceEditor } from '../resources+/source-editor.tsx'
import { useParams } from '@remix-run/react'

export async function loader({ request }: DataFunctionArgs) {
	await requireAdmin(request)
	return json({})
}

export default function CreateSource() {
	const { categoryId } = useParams<{ categoryId: string }>()
	return (
		<main className="container my-4">
			<SourceEditor categoryId={categoryId!} />
		</main>
	)
}
