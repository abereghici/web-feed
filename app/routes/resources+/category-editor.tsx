import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { Button } from '~/components/ui/button.tsx'
import { StatusButton } from '~/components/ui/status-button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { prisma } from '~/utils/db.server.ts'
import { ErrorList, Field } from '~/components/forms.tsx'
import { redirectWithToast } from '~/utils/flash-session.server.ts'
import { requireAdmin } from '~/utils/permissions.server.ts'

export const CategoryEditorSchema = z.object({
	id: z.string().optional(),
	name: z.string().trim().min(1),
})

export async function action({ request }: DataFunctionArgs) {
	await requireAdmin(request)

	const formData = await request.formData()
	const submission = parse(formData, {
		schema: CategoryEditorSchema,
		acceptMultipleErrors: () => true,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}

	const { name, id } = submission.value

	const data = {
		name,
	}

	const select = {
		id: true,
	}

	if (id) {
		const existingCategory = await prisma.sourceCategory.findFirst({
			where: { id },
			select: { id: true },
		})
		if (!existingCategory) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}
		await prisma.sourceCategory.update({
			where: { id },
			data,
			select,
		})
	} else {
		await prisma.sourceCategory.create({ data, select })
	}
	return redirectWithToast(`/admin/category`, {
		title: id ? 'Category updated' : 'Category created',
	})
}

export function CategoryEditor({
	category,
}: {
	category?: { id: string; name: string }
}) {
	const categoryEditorFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'category-editor',
		constraint: getFieldsetConstraint(CategoryEditorSchema),
		lastSubmission: categoryEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: CategoryEditorSchema })
		},
		defaultValue: {
			name: category?.name,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<categoryEditorFetcher.Form
			method="post"
			action="/resources/category-editor"
			className="flex flex-col justify-center gap-y-2"
			{...form.props}
		>
			<input name="id" type="hidden" value={category?.id} />
			<Field
				labelProps={{ children: 'Name' }}
				inputProps={{
					...conform.input(fields.name),
					autoFocus: true,
				}}
				errors={fields.name.errors}
				className="flex flex-col gap-y-2"
			/>

			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex justify-end gap-2">
				<Button
					variant="destructive"
					type="reset"
					className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
				>
					<Icon name="reset" className="scale-125 max-md:scale-150 md:mr-2" />
					<span className="max-md:hidden">Reset</span>
				</Button>
				<StatusButton
					status={
						categoryEditorFetcher.state === 'submitting'
							? 'pending'
							: categoryEditorFetcher.data?.status ?? 'idle'
					}
					type="submit"
					disabled={categoryEditorFetcher.state !== 'idle'}
					className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
				>
					<Icon
						name="arrow-right"
						className="scale-125 max-md:scale-150 md:mr-2"
					/>
					<span className="max-md:hidden">Submit</span>
				</StatusButton>
			</div>
		</categoryEditorFetcher.Form>
	)
}
