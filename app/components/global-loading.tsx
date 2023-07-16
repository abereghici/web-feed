import { useFetchers, useNavigation } from '@remix-run/react'
import { useEffect, useMemo } from 'react'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

export function GlobalLoading() {
	let transition = useNavigation()
	let fetchers = useFetchers()

	let state = useMemo<'idle' | 'loading'>(
		function getGlobalState() {
			let states = [transition.state, ...fetchers.map(fetcher => fetcher.state)]
			if (states.every(state => state === 'idle')) return 'idle'
			return 'loading'
		},
		[transition.state, fetchers],
	)

	useEffect(() => {
		if (state === 'loading') NProgress.start()
		if (state === 'idle') NProgress.done()
	}, [state, transition.state])

	return null
}
