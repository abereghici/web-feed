import { useOptionalUser } from '~/utils/user.ts'
import { Header } from './header.tsx'
import { Nav } from './nav.tsx'
import { UserMenu } from './user-menu.tsx'
import { ThemeSwitch } from '~/routes/resources+/theme/index.tsx'
import { Icon } from '../ui/icon.tsx'
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet.tsx'
import { useRequestInfo } from '~/utils/request-info.ts'
import { Button } from '../ui/button.tsx'
import { cn } from '~/utils/misc.ts'

type Props = {
	content: React.ReactNode
	aside?: React.ReactNode
}

export function MainLayout({ content, aside }: Props) {
	const requestInfo = useRequestInfo()
	const user = useOptionalUser()

	const mobileSidebarSheet = aside ? (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" className="sm:hidden">
					<Icon name="hamburger">
						<span className="sr-only">Toggle menu</span>
					</Icon>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-[280px] p-0 sm:w-[540px]" side="left">
				{aside}
			</SheetContent>
		</Sheet>
	) : null

	const desktopSidebar = aside ? (
		<aside className="fixed left-0 top-16 z-40 hidden h-screen w-64 -translate-x-full border-r transition-transform sm:block sm:translate-x-0">
			{aside}
		</aside>
	) : null

	return (
		<>
			<Header className="sticky top-0 z-10 bg-background">
				<Nav
					leftSlot={mobileSidebarSheet}
					rightSlot={
						<div className="flex items-center gap-4">
							{user ? <UserMenu /> : null}
							<ThemeSwitch userPreference={requestInfo.userPrefs.theme} />
						</div>
					}
				/>
			</Header>

			{desktopSidebar}

			<div className={cn('p-4', desktopSidebar && 'sm:ml-64')}>{content}</div>
		</>
	)
}
