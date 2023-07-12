import { type PropsWithChildren } from 'react'
import { cn } from '~/utils/misc.ts'

type Props = PropsWithChildren & {
	className?: string
}

export function Header({ children, className }: Props) {
	return (
		<header className={cn('container border-b py-2', className)}>
			{children}
		</header>
	)
}
