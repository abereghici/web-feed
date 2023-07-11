import type { V2_MetaFunction } from '@remix-run/node'

export const meta: V2_MetaFunction = () => [{ title: 'Web Feed' }]

export default function Index() {
	return <main className="container"></main>
}
