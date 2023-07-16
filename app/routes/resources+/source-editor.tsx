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
import { getFavicon, slugify } from '~/utils/misc.ts'

export const SourceEditorSchema = z.object({
	id: z.string().optional(),
	categoryId: z.string(),
	name: z.string().trim().min(1),
	url: z.string().trim().url(),
})

export async function action({ request }: DataFunctionArgs) {
	await requireAdmin(request)

	const formData = await request.formData()
	const submission = parse(formData, {
		schema: SourceEditorSchema,
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

	const { name, url, id } = submission.value

	if (id) {
		const existingSource = await prisma.source.findFirst({
			where: { id },
			select: { id: true },
		})

		if (!existingSource) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}

		await prisma.source.update({
			where: { id },
			data: {
				name,
				slug: slugify(name),
				url,
			},
		})
	} else {
		const { buffer, contentType } = await getFavicon(new URL(url).origin)
		const image = {
			contentType,
			file: {
				create: {
					blob: buffer,
				},
			},
		}

		await prisma.source.create({
			data: {
				name,
				slug: slugify(name),
				url,
				image: {
					create: image,
				},
				category: {
					connect: {
						id: submission.value.categoryId,
					},
				},
			},
		})
	}
	return redirectWithToast(
		`/admin/category/${submission.value.categoryId}/source`,
		{
			title: id ? 'Source updated' : 'Source created',
		},
	)
}

export function SourceEditor({
	source,
	categoryId,
}: {
	source?: { id: string; name: string; url: string }
	categoryId: string
}) {
	const sourceEditorFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'source-editor',
		constraint: getFieldsetConstraint(SourceEditorSchema),
		lastSubmission: sourceEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: SourceEditorSchema })
		},
		defaultValue: {
			name: source?.name,
			url: source?.url,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<sourceEditorFetcher.Form
			method="post"
			action="/resources/source-editor"
			className="flex flex-col justify-center gap-y-2"
			{...form.props}
		>
			<input name="id" type="hidden" value={source?.id} />
			<input name="categoryId" type="hidden" value={categoryId} />
			<Field
				labelProps={{ children: 'Name' }}
				inputProps={{
					...conform.input(fields.name),
					autoFocus: true,
				}}
				errors={fields.name.errors}
				className="flex flex-col gap-y-2"
			/>

			<Field
				labelProps={{ children: 'Url' }}
				inputProps={{
					...conform.input(fields.url),
					type: 'url',
				}}
				errors={fields.url.errors}
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
						sourceEditorFetcher.state === 'submitting'
							? 'pending'
							: sourceEditorFetcher.data?.status ?? 'idle'
					}
					type="submit"
					disabled={sourceEditorFetcher.state !== 'idle'}
					className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
				>
					<Icon
						name="arrow-right"
						className="scale-125 max-md:scale-150 md:mr-2"
					/>
					<span className="max-md:hidden">Submit</span>
				</StatusButton>
			</div>
		</sourceEditorFetcher.Form>
	)
}
