import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

const MainLayoutContext = createContext<
	| {
			sidebar: {
				isOpen: boolean
				open: () => void
				close: () => void
				toggle: () => void
			}
	  }
	| undefined
>(undefined)

export function MainLayoutProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const toggleSidebar = useCallback(() => {
		setSidebarOpen(prev => !prev)
	}, [])

	const openSidebar = useCallback(() => {
		setSidebarOpen(true)
	}, [])

	const closeSidebar = useCallback(() => {
		setSidebarOpen(false)
	}, [])

	const state = useMemo(
		() => ({
			sidebar: {
				isOpen: sidebarOpen,
				toggle: toggleSidebar,
				open: openSidebar,
				close: closeSidebar,
			},
		}),
		[closeSidebar, openSidebar, sidebarOpen, toggleSidebar],
	)

	return (
		<MainLayoutContext.Provider value={state}>
			{children}
		</MainLayoutContext.Provider>
	)
}

export function useMainLayout() {
	const context = useContext(MainLayoutContext)
	if (!context) {
		throw new Error('useMainLayout must be used within a MainLayoutProvider')
	}
	return context
}
