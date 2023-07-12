import { Logo } from './logo.tsx'

type Props = {
	leftSlot?: React.ReactNode
	rightSlot?: React.ReactNode
}

export function Nav({ leftSlot, rightSlot }: Props) {
	return (
		<nav className="flex items-center">
			{leftSlot}

			<Logo className="mx-auto" />

			{rightSlot}
		</nav>
	)
}
