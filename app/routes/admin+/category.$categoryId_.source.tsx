import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '~/components/ui/dropdown-menu.tsx'
import { Button } from '~/components/ui/button.tsx'
import { type DataFunctionArgs, json } from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useFormAction,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table.tsx'
import { prisma } from '~/utils/db.server.ts'
import { requireAdmin } from '~/utils/permissions.server.ts'
import { Icon } from '~/components/ui/icon.tsx'
import { z } from 'zod'
import { redirectWithToast } from '~/utils/flash-session.server.ts'
import { useForm } from '@conform-to/react'
import { StatusButton } from '~/components/ui/status-button.tsx'
import { ErrorList } from '~/components/forms.tsx'
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { getImgSrc } from '~/utils/misc.ts'

const DeleteSourceSchema = z.object({
	intent: z.literal('delete-source'),
	sourceId: z.string(),
})

export async function loader({ request, params }: DataFunctionArgs) {
	await requireAdmin(request)

	const category = await prisma.sourceCategory.findFirst({
		where: {
			id: params.categoryId,
		},
		select: {
			id: true,
			name: true,
			sources: true,
		},
	})
	if (!category) {
		throw new Response('Not found', { status: 404 })
	}

	return json({
		category,
	})
}

export async function action({ request }: DataFunctionArgs) {
	await requireAdmin(request)
	const formData = await request.formData()

	const submission = parse(formData, {
		schema: DeleteSourceSchema,
		acceptMultipleErrors: () => true,
	})
	if (!submission.value || submission.intent !== 'submit') {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}

	const { sourceId } = submission.value

	const source = await prisma.source.findFirst({
		select: { id: true, sourceCategoryId: true },
		where: {
			id: sourceId,
		},
	})
	if (!source) {
		submission.error.sourceId = ['Source not found']
		return json({ status: 'error', submission } as const, {
			status: 404,
		})
	}

	await prisma.source.delete({
		where: { id: source.id },
	})

	return redirectWithToast(
		`/admin/category/${source.sourceCategoryId}/source`,
		{
			title: 'Source deleted',
			variant: 'destructive',
		},
	)
}

export default function SourcesList() {
	const { category } = useLoaderData<typeof loader>()
	return (
		<main className="container my-4">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Manage Sources</h2>
				<p className="text-muted-foreground">
					{category.name} - {category.sources.length}{' '}
					{category.sources.length === 1 ? 'source' : 'sources'}
				</p>
			</div>
			<div className="flex justify-start py-4">
				<Button asChild variant="secondary">
					<Link to={`/admin/category/${category.id}/source/new`}>
						<Icon name="plus" className="mr-2 scale-125" />
						<span>New Source</span>
					</Link>
				</Button>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Source</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{category.sources.length ? (
							category.sources.map(source => (
								<TableRow key={source.id}>
									<TableCell>
										<div className="flex items-center font-bold">
											<Avatar className="mr-2 h-6 w-6">
												<AvatarImage src={getImgSrc(source.imageId)} alt="" />
											</Avatar>
											{source.name}
										</div>
									</TableCell>
									<TableCell align="right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
												>
													<Icon name="dots-horizontal" className="h-4 w-4" />
													<span className="sr-only">Open menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-[160px]">
												<DropdownMenuItem asChild>
													<EditSource
														categoryId={category.id}
														sourceId={source.id}
													/>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<DeleteSource id={source.id} />
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={2} className="text-center">
									No sources yet.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</main>
	)
}

export function EditSource({
	categoryId,
	sourceId,
}: {
	categoryId: string
	sourceId: string
}) {
	return (
		<Button asChild variant="ghost" className="w-full justify-start">
			<Link to={`/admin/category/${categoryId}/source/${sourceId}/edit`}>
				<Icon name="pencil-1" className="mr-2 scale-125" />
				<span>Edit</span>
			</Link>
		</Button>
	)
}

export function DeleteSource({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()
	const formAction = useFormAction()
	const [form] = useForm({
		id: 'delete-source',
		lastSubmission: actionData?.submission,
		constraint: getFieldsetConstraint(DeleteSourceSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: DeleteSourceSchema })
		},
	})

	return (
		<Form method="post" {...form.props}>
			<input type="hidden" name="sourceId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-source"
				variant="ghost"
				status={
					navigation.state === 'submitting' &&
					navigation.formAction === formAction &&
					navigation.formData?.get('intent') === 'delete-source' &&
					navigation.formMethod === 'POST'
						? 'pending'
						: actionData?.status ?? 'idle'
				}
				disabled={navigation.state !== 'idle'}
				className="w-full justify-start"
			>
				<Icon name="trash" className="mr-2 scale-125" />
				<span>Delete</span>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}
