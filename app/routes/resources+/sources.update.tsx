import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { updateSources } from '~/utils/sources.server.ts'

export async function action({ request }: DataFunctionArgs) {
	const token = process.env.INTERNAL_COMMAND_TOKEN
	const isAuthorized =
		request.headers.get('Authorization') === `Bearer ${token}`
	if (!isAuthorized) {
		// rick roll them
		return redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	}

	updateSources()

	return json({ message: 'ok' })
}
