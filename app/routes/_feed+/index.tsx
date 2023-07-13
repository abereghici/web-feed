import type { V2_MetaFunction } from '@remix-run/node'
import { ArticleCard } from '~/components/cards/article-card.tsx'

export const meta: V2_MetaFunction = () => [{ title: 'Web Feed' }]

export default function Index() {
	return (
		<main className="container grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<ArticleCard
				title="The list of Feeds"
				description="Here is the full list of feeds, categorized the same way as in the OPML file, and each category is in alphabetical order (same as in the OPML file)."
				href="/"
				image="https://flowbite.com/docs/images/blog/image-1.jpg"
			/>
		</main>
	)
}
