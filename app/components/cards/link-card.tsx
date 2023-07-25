import { Icon } from '../ui/icon.tsx'
import { Button } from '../ui/button.tsx'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '../ui/card.tsx'
import { Avatar, AvatarImage } from '../ui/avatar.tsx'

type Props = {
	title: string
	image?: string | null
	href: string
	sourceImage?: string
	date?: string
}

export function LinkCard({ title, href, image, sourceImage, date }: Props) {
	return (
		<Card>
			<CardHeader>
				{sourceImage ? (
					<Avatar className="h-4 w-4">
						<AvatarImage src={sourceImage} alt="" />
					</Avatar>
				) : null}
				<CardTitle>
					<a href={href} target="_blank" rel="noopener noreferrer">
						<h5 className="mb-2 cursor-pointer text-2xl font-bold tracking-tight hover:underline">
							{title}
						</h5>
					</a>
				</CardTitle>
				<CardDescription>
					{date
						? new Date(date).toLocaleDateString('en-us', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								timeZone: 'UTC',
						  })
						: null}
				</CardDescription>
			</CardHeader>
			{image ? (
				<CardContent>
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="cursor-pointer"
					>
						<img
							className="aspect-video rounded-lg object-cover transition-all hover:scale-105"
							src={image}
							alt=""
						/>
					</a>
				</CardContent>
			) : null}
			<CardFooter>
				<Button variant="secondary" asChild>
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="cursor-pointer"
					>
						Read more
						<Icon name="arrow-right" className="ml-2" />
					</a>
				</Button>
			</CardFooter>
		</Card>
	)
}
