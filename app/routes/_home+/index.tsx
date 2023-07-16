import { type V2_MetaFunction } from '@remix-run/react'

import { loader, default as SourceIndex } from './$source.tsx'

export const meta: V2_MetaFunction = () => [{ title: 'Web Feed' }]

export { loader }
export default SourceIndex
