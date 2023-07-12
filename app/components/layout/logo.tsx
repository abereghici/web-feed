import { Link } from '@remix-run/react'
import { cn } from '~/utils/misc.ts'
import { Button } from '../ui/button.tsx'

export function Logo({ className }: { className?: string }) {
	return (
		<Button variant="ghost" asChild className={cn(className)}>
			<Link to="/">
				<img src="/img/logo.svg" alt="" width="84" />
			</Link>
		</Button>
	)
}
