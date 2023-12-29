import {
	useForm,
	control,
	getFormProps,
	getInputProps,
	getTextareaProps,
	FormStateInput,
	FormProvider,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { Playground, Field } from '~/components';

const schema = z.object({
	name: z.string({ required_error: 'Name is required' }),
	message: z.string({ required_error: 'Message is required' }),
});

export async function loader({ request }: LoaderArgs) {
	const url = new URL(request.url);

	return {
		noClientValidate: url.searchParams.get('noClientValidate') === 'yes',
	};
}

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema });

	return json(submission.reply());
}

export default function FormControl() {
	const { noClientValidate } = useLoaderData<typeof loader>();
	const lastResult = useActionData();
	const { form, fieldset } = useForm({
		lastResult,
		onValidate: !noClientValidate
			? ({ formData }) => parseWithZod(formData, { schema })
			: undefined,
	});

	return (
		<FormProvider context={form.context}>
			<Form method="post" {...getFormProps(form)}>
				<FormStateInput formId={form.id} />
				<Playground title="Form Control" result={lastResult}>
					<Field label="Name" meta={fieldset.name}>
						<input {...getInputProps(fieldset.name, { type: 'text' })} />
					</Field>
					<Field label="Message" meta={fieldset.message}>
						<textarea {...getTextareaProps(fieldset.message)} />
					</Field>
					<div className="flex flex-col gap-2">
						<button
							className="rounded-md border p-2 hover:border-black"
							{...form.getControlButtonProps(control.validate())}
						>
							Validate Form
						</button>
						<button
							className="rounded-md border p-2 hover:border-black"
							{...form.getControlButtonProps(
								control.validate({ name: fieldset.message.name }),
							)}
						>
							Validate Message
						</button>
						<button
							className="rounded-md border p-2 hover:border-black"
							{...form.getControlButtonProps(
								control.replace({
									name: fieldset.message.name,
									value: 'Hello World',
								}),
							)}
						>
							Update message
						</button>
						<button
							className="rounded-md border p-2 hover:border-black"
							{...form.getControlButtonProps(
								control.replace({
									name: fieldset.message.name,
									value: '',
									validated: true,
								}),
							)}
						>
							Clear message
						</button>
						<button
							className="rounded-md border p-2 hover:border-black"
							{...form.getControlButtonProps(
								control.reset({ name: fieldset.message.name }),
							)}
						>
							Reset message
						</button>
						<button
							className="rounded-md border p-2 hover:border-black"
							{...form.getControlButtonProps(control.reset())}
						>
							Reset form
						</button>
					</div>
				</Playground>
			</Form>
		</FormProvider>
	);
}
