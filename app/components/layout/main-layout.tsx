import { useOptionalUser } from '~/utils/user.ts'
import { Header } from './header.tsx'
import { Nav } from './nav.tsx'
import { UserMenu } from './user-menu.tsx'
import { ThemeSwitch } from '~/routes/resources+/theme/index.tsx'
import { Icon } from '../ui/icon.tsx'
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet.tsx'
import { useRequestInfo } from '~/utils/request-info.ts'
import { Button } from '../ui/button.tsx'
import { ScrollArea } from '../ui/scroll-area.tsx'

type Props = {
	content: React.ReactNode
	aside?: React.ReactNode
}

export function MainLayout({ content, aside }: Props) {
	const requestInfo = useRequestInfo()
	const user = useOptionalUser()

	return (
		<div className="flex h-screen min-h-screen flex-col">
			<Header>
				<Nav
					className="container"
					leftSlot={
						aside ? (
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="ghost" className="sm:hidden">
										<Icon name="hamburger">
											<span className="sr-only">Toggle menu</span>
										</Icon>
									</Button>
								</SheetTrigger>
								<SheetContent
									className="w-[280px] p-0 sm:w-[540px]"
									side="left"
								>
									{aside}
								</SheetContent>
							</Sheet>
						) : null
					}
					rightSlot={
						<div className="flex items-center gap-4">
							{user ? <UserMenu /> : null}
							<ThemeSwitch userPreference={requestInfo.userPrefs.theme} />
						</div>
					}
				/>
			</Header>
			<div className="container flex flex-1 flex-row overflow-y-hidden">
				<main className="flex-1">
					<ScrollArea className="h-full scroll-py-4">{content}</ScrollArea>
				</main>
				{aside ? (
					<aside className="z-40 order-first hidden w-64 flex-none -translate-x-full border-r transition-transform sm:block sm:translate-x-0">
						{aside}
					</aside>
				) : null}
			</div>
			<footer className="container"></footer>
		</div>
	)
}
