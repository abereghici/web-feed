import { Icon } from '../ui/icon.tsx'
import { Button } from '../ui/button.tsx'

type Props = {
	title: string
	description: string
	image: string
	href: string
}

export function ArticleCard({ title, description, image, href }: Props) {
	return (
		<div className="max-w-xs justify-self-center overflow-hidden rounded-lg border">
			<a href={href} className="cursor-pointer">
				<img
					className="rounded-t-lg object-cover transition-all hover:scale-105"
					src={image}
					alt=""
				/>
			</a>
			<div className="p-5">
				<a href={href}>
					<h5 className="mb-2 cursor-pointer text-2xl font-bold tracking-tight hover:underline">
						{title}
					</h5>
				</a>
				<p className="mb-3 font-normal">{description}</p>
				<Button asChild>
					<a href={href} className="cursor-pointer">
						Read more
						<Icon name="arrow-right" className="ml-2" />
					</a>
				</Button>
			</div>
		</div>
	)
}
