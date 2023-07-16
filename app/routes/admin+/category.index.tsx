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

const DeleteCategorySchema = z.object({
	intent: z.literal('delete-category'),
	categoryId: z.string(),
})

export async function loader({ request }: DataFunctionArgs) {
	await requireAdmin(request)

	const categories = await prisma.sourceCategory.findMany()

	return json({
		categories,
	})
}

export async function action({ request }: DataFunctionArgs) {
	await requireAdmin(request)
	const formData = await request.formData()

	const submission = parse(formData, {
		schema: DeleteCategorySchema,
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

	const { categoryId } = submission.value

	const category = await prisma.sourceCategory.findFirst({
		select: { id: true },
		where: {
			id: categoryId,
		},
	})
	if (!category) {
		submission.error.categoryId = ['Category not found']
		return json({ status: 'error', submission } as const, {
			status: 404,
		})
	}

	await prisma.sourceCategory.delete({
		where: { id: category.id },
	})

	return redirectWithToast(`/admin/category`, {
		title: 'Category deleted',
		variant: 'destructive',
	})
}

export default function CategoriesList() {
	const { categories } = useLoaderData<typeof loader>()
	return (
		<main className="container my-4">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Manage Categories</h2>
				<p className="text-muted-foreground">
					{categories.length}{' '}
					{categories.length === 1 ? 'category' : 'categories'}
				</p>
			</div>
			<div className="flex justify-start py-4">
				<Button asChild variant="secondary">
					<Link to="/admin/category/new">
						<Icon name="plus" className="mr-2 scale-125" />
						<span>New Category</span>
					</Link>
				</Button>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Category</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{categories.length ? (
							categories.map(category => (
								<TableRow key={category.id}>
									<TableCell className="font-bold">
										<Link to={`/admin/category/${category.id}/source`}>
											{category.name}
										</Link>
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
													<EditCategory id={category.id} />
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<DeleteCategory id={category.id} />
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={2} className="text-center">
									No categories yet.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</main>
	)
}

export function EditCategory({ id }: { id: string }) {
	return (
		<Button asChild variant="ghost" className="w-full justify-start">
			<Link to={`/admin/category/${id}/edit`}>
				<Icon name="pencil-1" className="mr-2 scale-125" />
				<span>Edit</span>
			</Link>
		</Button>
	)
}

export function DeleteCategory({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()
	const formAction = useFormAction()
	const [form] = useForm({
		id: 'delete-category',
		lastSubmission: actionData?.submission,
		constraint: getFieldsetConstraint(DeleteCategorySchema),
		onValidate({ formData }) {
			return parse(formData, { schema: DeleteCategorySchema })
		},
	})

	return (
		<Form method="post" {...form.props}>
			<input type="hidden" name="categoryId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-category"
				variant="ghost"
				status={
					navigation.state === 'submitting' &&
					navigation.formAction === formAction &&
					navigation.formData?.get('intent') === 'delete-category' &&
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
