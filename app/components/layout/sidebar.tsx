import { cn } from '~/utils/misc.ts'
import { Button } from '../ui/button.tsx'
import { ScrollArea } from '../ui/scroll-area.tsx'
import { Link } from '@remix-run/react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.tsx'

type SidebarItem = {
	thumbnail: string
	title: string
	href?: string
	onClick?: () => void
}

export function SidebarItem({ title, thumbnail, href, onClick }: SidebarItem) {
	const content = (
		<>
			<Avatar className=" mr-2 h-6 w-6">
				<AvatarImage src={thumbnail} />
				<AvatarFallback>{title.slice(0, 1)}</AvatarFallback>
			</Avatar>
			{title}
		</>
	)
	return (
		<Button
			asChild={!!href}
			variant="ghost"
			className="w-full justify-start"
			onClick={onClick}
		>
			{href ? <Link to={href}>{content}</Link> : content}
		</Button>
	)
}

type SidebarCategoryProps = {
	title: string
	children: React.ReactNode
}

export function SidebarCategory({ title, children }: SidebarCategoryProps) {
	return (
		<div className="px-3 py-2">
			<h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
				{title}
			</h2>
			<div className="space-y-1">{children}</div>
		</div>
	)
}

type SidebarProps = {
	className?: string
	children: React.ReactNode
}

export function Sidebar({ className, children }: SidebarProps) {
	return (
		<ScrollArea className={cn('h-full max-h-[100vh]', className)}>
			<div className="space-y-4 py-4">{children}</div>
		</ScrollArea>
	)
}
