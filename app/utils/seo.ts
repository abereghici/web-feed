export function getSocialMetas({
	url,
	title = 'Web Feed',
	description = 'A curated list of blogs and resources for web developers, delivered through RSS, to effortlessly stay up to date with the latest trends, insights, and best practices.',
	image = 'https://web-feed.dev/img/og.jpeg',
	keywords = 'javascript,typescript,css,html,web,frontend,developer,react,vue,angular,node,deno,webdev,webdevelopment,rss,feed,news,resources',
}: {
	image?: string
	url: string
	title?: string
	description?: string
	keywords?: string
}) {
	return [
		{ title },
		{ name: 'description', content: description },
		{ name: 'keywords', content: keywords },
		{ name: 'image', content: image },
		{ name: 'og:url', content: url },
		{ name: 'og:title', content: title },
		{ name: 'og:description', content: description },
		{ name: 'og:image', content: image },
		{
			name: 'twitter:card',
			content: image ? 'summary_large_image' : 'summary',
		},
		{ name: 'twitter:creator', content: '@alexandru.brg' },
		{ name: 'twitter:site', content: '@alexandru.brg' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: image },
		{ name: 'twitter:image:alt', content: title },
	]
}
