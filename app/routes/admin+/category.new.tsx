import { json } from '@remix-run/router'
import { type DataFunctionArgs } from '@remix-run/server-runtime'
import { CategoryEditor } from '../resources+/category-editor.tsx'
import { requireAdmin } from '~/utils/permissions.server.ts'

export async function loader({ request }: DataFunctionArgs) {
	await requireAdmin(request)
	return json({})
}

export default function CreateCategory() {
	return (
		<div className="container my-4">
			<CategoryEditor />
		</div>
	)
}
