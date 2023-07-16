import { Form, Link, useSubmit } from '@remix-run/react'
import { useRef } from 'react'
import { useUser } from '~/utils/user.ts'
import { Avatar, AvatarFallback } from '~/components/ui/avatar.tsx'
import { Button } from '~/components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu.tsx'
import { Icon } from '~/components/ui/icon.tsx'

export function UserMenu() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-9 w-9">
						<AvatarFallback>
							{(user.name ?? user.username).slice(0, 1)}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">{user.name}</p>
							<p className="text-xs leading-none text-muted-foreground">
								{user.username}
							</p>
						</div>
					</DropdownMenuLabel>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={event => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Link to="/admin">
							<Button variant="ghost" className="justify-start">
								<Icon className="mr-2" name="rocket" />
								Manage
							</Button>
						</Link>
					</DropdownMenuItem>

					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={event => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Button
								variant="ghost"
								className="w-full justify-start"
								type="submit"
							>
								<Icon className="mr-2" name="exit" />
								<span>Logout</span>
							</Button>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}
