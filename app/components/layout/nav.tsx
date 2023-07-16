import { cn } from '~/utils/misc.ts'
import { Logo } from './logo.tsx'

type Props = {
	leftSlot?: React.ReactNode
	rightSlot?: React.ReactNode
	className?: string
}

export function Nav({ leftSlot, rightSlot, className }: Props) {
	return (
		<nav className={cn(' flex items-center', className)}>
			{leftSlot}

			<Logo className="mx-auto" />

			{rightSlot}
		</nav>
	)
}
