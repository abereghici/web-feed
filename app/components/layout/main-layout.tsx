import { useOptionalUser } from '~/utils/user.ts'
import { Header } from './header.tsx'
import { Nav } from './nav.tsx'
import { UserMenu } from './user-menu.tsx'
import { ThemeSwitch } from '~/routes/resources+/theme/index.tsx'
import { useRequestInfo } from '~/utils/request-info.ts'
import { ScrollArea } from '../ui/scroll-area.tsx'
import { MobileSidebar } from './mobile-sidebar.tsx'
import { MainLayoutProvider } from './main-layout-provider.tsx'

type Props = {
	content: React.ReactNode
	aside?: React.ReactNode
	footer?: React.ReactNode
}

function InnerMainLayout({ content, aside, footer }: Props) {
	const requestInfo = useRequestInfo()
	const user = useOptionalUser()

	return (
		<div className="min-h-screen-available flex h-screen flex-col">
			<Header>
				<Nav
					className="container"
					leftSlot={aside ? <MobileSidebar>{aside}</MobileSidebar> : null}
					rightSlot={
						<div className="flex items-center gap-4">
							{user ? <UserMenu /> : null}
							<ThemeSwitch userPreference={requestInfo.userPrefs.theme} />
						</div>
					}
				/>
			</Header>
			<div className="container flex flex-1 flex-row overflow-y-hidden">
			{aside ? (
					<aside className="hidden w-64 border-r sm:block">
						{aside}
					</aside>
				) : null}
				<main className="flex-1">
					<ScrollArea className="h-full scroll-py-4">{content}</ScrollArea>
				</main>
				
			</div>
			<footer>{footer}</footer>
		</div>
	)
}

export function MainLayout(props: Props) {
	return (
		<MainLayoutProvider>
			<InnerMainLayout {...props} />
		</MainLayoutProvider>
	)
}
