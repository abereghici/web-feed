import { Button } from '../ui/button.tsx'
import { Icon } from '../ui/icon.tsx'
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet.tsx'
import { useMainLayout } from './main-layout-provider.tsx'

export function MobileSidebar({ children }: { children: React.ReactNode }) {
	const { sidebar } = useMainLayout()
	return (
		<Sheet open={sidebar.isOpen} onOpenChange={sidebar.toggle}>
			<SheetTrigger asChild>
				<Button variant="ghost" className="sm:hidden">
					<Icon name="hamburger">
						<span className="sr-only">Toggle menu</span>
					</Icon>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-[280px] p-0 sm:w-[540px]" side="left">
				{children}
			</SheetContent>
		</Sheet>
	)
}
