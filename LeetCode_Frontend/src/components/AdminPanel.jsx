import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
	required_error: 'Difficulty is required',
  }),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp'], {
	required_error: 'Tag is required',
  }),
  visibleTestCases: z
	.array(
	  z.object({
		input: z.string().min(1, 'Input is required'),
		output: z.string().min(1, 'Output is required'),
		explanation: z.string().min(1, 'Explanation is required'),
	  })
	)
	.min(1, 'At least one visible test case is required'),
  hiddenTestCases: z
	.array(
	  z.object({
		input: z.string().min(1, 'Input is required'),
		output: z.string().min(1, 'Output is required'),
	  })
	)
	.min(1, 'At least one hidden test case is required'),
  startCode: z
	.array(
	  z.object({
		language: z.enum(['C++', 'Java', 'JavaScript']),
		initialCode: z.string().min(1, 'Initial code is required'),
	  })
	)
	.length(3, 'All three languages are required'),
  referenceSolution: z
	.array(
	  z.object({
		language: z.enum(['C++', 'Java', 'JavaScript']),
		completeCode: z.string().min(1, 'Complete code is required'),
	  })
	)
	.length(3, 'All three languages are required'),
});

const languageLabels = ['C++', 'Java', 'JavaScript'];

function FieldError({ message }) {
  if (!message) return null;

  return (
	<div className="mt-2 inline-flex items-center gap-2 rounded-full bg-error/10 px-3 py-1 text-sm text-error">
	  <span className="font-semibold">Error</span>
	  <span>{message}</span>
	</div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
	<div className="mb-5">
	  <h2 className="text-xl font-bold text-slate-900">{title}</h2>
	  {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
	</div>
  );
}

function AdminPanel() {
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState(null);

  const {
	register,
	control,
	handleSubmit,
	formState: { errors, isSubmitting },
  } = useForm({
	resolver: zodResolver(problemSchema),
	mode: 'onTouched',
	reValidateMode: 'onChange',
	defaultValues: {
	  title: '',
	  description: '',
	  difficulty: 'easy',
	  tags: 'array',
	  visibleTestCases: [
		{
		  input: '',
		  output: '',
		  explanation: '',
		},
	  ],
	  hiddenTestCases: [
		{
		  input: '',
		  output: '',
		},
	  ],
	  startCode: [
		{ language: 'C++', initialCode: '' },
		{ language: 'Java', initialCode: '' },
		{ language: 'JavaScript', initialCode: '' },
	  ],
	  referenceSolution: [
		{ language: 'C++', completeCode: '' },
		{ language: 'Java', completeCode: '' },
		{ language: 'JavaScript', completeCode: '' },
	  ],
	},
  });

  const {
	fields: visibleFields,
	append: appendVisible,
	remove: removeVisible,
  } = useFieldArray({
	control,
	name: 'visibleTestCases',
  });

  const {
	fields: hiddenFields,
	append: appendHidden,
	remove: removeHidden,
  } = useFieldArray({
	control,
	name: 'hiddenTestCases',
  });

  const onSubmit = async (data) => {
	setServerMessage(null);

	try {
	  await axiosClient.post('/problem/create', data);
	  setServerMessage({
		type: 'success',
		text: 'Problem created successfully.',
	  });
	  navigate('/');
	} catch (error) {
	  setServerMessage({
		type: 'error',
		text: error.response?.data?.message || error.message || 'Something went wrong.',
	  });
	}
  };

  const inputClass = (hasError) =>
	[
	  'input input-bordered w-full bg-white text-slate-900 placeholder:text-slate-400',
	  'focus:outline-none focus:ring-2 focus:ring-primary/30',
	  hasError ? 'input-error border-error' : 'border-slate-200',
	].join(' ');

  const textareaClass = (hasError) =>
	[
	  'textarea textarea-bordered w-full bg-white text-slate-900 placeholder:text-slate-400',
	  'focus:outline-none focus:ring-2 focus:ring-primary/30',
	  hasError ? 'textarea-error border-error' : 'border-slate-200',
	].join(' ');

  const selectClass = (hasError) =>
	[
	  'select select-bordered w-full bg-white text-slate-900',
	  'focus:outline-none focus:ring-2 focus:ring-primary/30',
	  hasError ? 'select-error border-error' : 'border-slate-200',
	].join(' ');

  const cardClass =
	'rounded-3xl border border-slate-200 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur';

  const labelClass = 'label pb-1';
  const labelTextClass = 'label-text font-medium text-slate-700';

  return (
	<div className="min-h-screen bg-linear-to-br from-slate-50 via-sky-50 to-indigo-100 px-4 py-8">
	  <div className="mx-auto max-w-7xl">
		<div className="mb-8 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur">
		  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div>
			  <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
				Admin Panel
			  </div>
			  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
				Create New Problem
			  </h1>
			</div>

		  </div>

		  {serverMessage ? (
			<div
			  className={`alert mt-5 ${
				serverMessage.type === 'success' ? 'alert-success' : 'alert-error'
			  }`}
			>
			  <span>{serverMessage.text}</span>
			</div>
		  ) : null}
		</div>

		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
		  {/* Basic Information */}
		  <section className={cardClass}>

			<div className="grid gap-6 px-6 py-6 md:grid-cols-2">
			  <div className="md:col-span-2">
				<div className="form-control">
				  <label className={labelClass}>
					<span className={labelTextClass}>Title</span>
				  </label>
				  <input
					{...register('title')}
					placeholder="Enter problem title"
					className={inputClass(!!errors.title)}
					aria-invalid={!!errors.title}
				  />
				  <FieldError message={errors.title?.message} />
				</div>
			  </div>

			  <div className="md:col-span-2">
				<div className="form-control">
				  <label className={labelClass}>
					<span className={labelTextClass}>Description</span>
				  </label>
				  <textarea
					{...register('description')}
					placeholder="Write the full problem statement..."
					rows={7}
					className={textareaClass(!!errors.description)}
					aria-invalid={!!errors.description}
				  />
				  <FieldError message={errors.description?.message} />
				</div>
			  </div>

			  <div>
				<div className="form-control">
				  <label className={labelClass}>
					<span className={labelTextClass}>Difficulty</span>
				  </label>
				  <select
					{...register('difficulty')}
					className={selectClass(!!errors.difficulty)}
					aria-invalid={!!errors.difficulty}
				  >
					<option value="easy">Easy</option>
					<option value="medium">Medium</option>
					<option value="hard">Hard</option>
				  </select>
				  <FieldError message={errors.difficulty?.message} />
				</div>
			  </div>

			  <div>
				<div className="form-control">
				  <label className={labelClass}>
					<span className={labelTextClass}>Tag</span>
				  </label>
				  <select
					{...register('tags')}
					className={selectClass(!!errors.tags)}
					aria-invalid={!!errors.tags}
				  >
					<option value="array">Array</option>
					<option value="linkedList">Linked List</option>
					<option value="graph">Graph</option>
					<option value="dp">DP</option>
				  </select>
				  <FieldError message={errors.tags?.message} />
				</div>
			  </div>
			</div>
		  </section>

		  {/* Test Cases */}
		  <section className={cardClass}>

			<div className="space-y-8 px-6 py-6">
			  <div>
				<div className="mb-4 flex items-center justify-between gap-4">
				  <div>
					<h3 className="text-lg font-semibold text-slate-900">Visible Test Cases</h3>
					<p className="text-sm text-slate-500">
					  These cases will be shown to users for understanding the problem.
					</p>
				  </div>
				  <button
					type="button"
					onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
					className="btn btn-primary btn-sm rounded-full"
				  >
					+ Add Case
				  </button>
				</div>

				<FieldError message={errors.visibleTestCases?.message} />

				<div className="space-y-4">
				  {visibleFields.map((field, index) => {
					const caseError = errors.visibleTestCases?.[index] || {};
					return (
					  <div
						key={field.id}
						className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
					  >
						<div className="mb-4 flex items-center justify-between">
						  <div className="inline-flex items-center gap-2">
							<span className="badge badge-primary badge-outline">
							  Case {index + 1}
							</span>
						  </div>
						  <button
							type="button"
							onClick={() => removeVisible(index)}
							className="btn btn-error btn-sm btn-outline rounded-full"
							disabled={visibleFields.length === 1}
						  >
							Remove
						  </button>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
						  <div>
							<input
							  {...register(`visibleTestCases.${index}.input`)}
							  placeholder="Input"
							  className={inputClass(!!caseError.input)}
							  aria-invalid={!!caseError.input}
							/>
							<FieldError message={caseError.input?.message} />
						  </div>

						  <div>
							<input
							  {...register(`visibleTestCases.${index}.output`)}
							  placeholder="Output"
							  className={inputClass(!!caseError.output)}
							  aria-invalid={!!caseError.output}
							/>
							<FieldError message={caseError.output?.message} />
						  </div>

						  <div className="md:col-span-2">
							<textarea
							  {...register(`visibleTestCases.${index}.explanation`)}
							  placeholder="Explanation"
							  rows={4}
							  className={textareaClass(!!caseError.explanation)}
							  aria-invalid={!!caseError.explanation}
							/>
							<FieldError message={caseError.explanation?.message} />
						  </div>
						</div>
					  </div>
					);
				  })}
				</div>
			  </div>

			  <div>
				<div className="mb-4 flex items-center justify-between gap-4">
				  <div>
					<h3 className="text-lg font-semibold text-slate-900">Hidden Test Cases</h3>
					<p className="text-sm text-slate-500">
					  These cases stay hidden and are used for final checking.
					</p>
				  </div>
				  <button
					type="button"
					onClick={() => appendHidden({ input: '', output: '' })}
					className="btn btn-primary btn-sm rounded-full"
				  >
					+ Add Case
				  </button>
				</div>

				<FieldError message={errors.hiddenTestCases?.message} />

				<div className="space-y-4">
				  {hiddenFields.map((field, index) => {
					const caseError = errors.hiddenTestCases?.[index] || {};
					return (
					  <div
						key={field.id}
						className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
					  >
						<div className="mb-4 flex items-center justify-between">
						  <div className="inline-flex items-center gap-2">
							<span className="badge badge-secondary badge-outline">
							  Hidden {index + 1}
							</span>
						  </div>
						  <button
							type="button"
							onClick={() => removeHidden(index)}
							className="btn btn-error btn-sm btn-outline rounded-full"
							disabled={hiddenFields.length === 1}
						  >
							Remove
						  </button>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
						  <div>
							<input
							  {...register(`hiddenTestCases.${index}.input`)}
							  placeholder="Input"
							  className={inputClass(!!caseError.input)}
							  aria-invalid={!!caseError.input}
							/>
							<FieldError message={caseError.input?.message} />
						  </div>

						  <div>
							<input
							  {...register(`hiddenTestCases.${index}.output`)}
							  placeholder="Output"
							  className={inputClass(!!caseError.output)}
							  aria-invalid={!!caseError.output}
							/>
							<FieldError message={caseError.output?.message} />
						  </div>
						</div>
					  </div>
					);
				  })}
				</div>
			  </div>
			</div>
		  </section>

		  {/* Code Templates */}
		  <section className={cardClass}>
			<div className="border-b border-slate-200 px-6 py-5">
			  <SectionHeader
				title="Code Templates"
				subtitle="Provide starter code and the full reference solution for each supported language."
			  />
			</div>

			<div className="space-y-6 px-6 py-6">
			  {languageLabels.map((language, index) => {
				const startCodeError = errors.startCode?.[index]?.initialCode;
				const referenceError = errors.referenceSolution?.[index]?.completeCode;

				return (
				  <div key={language} className="rounded-2xl border border-slate-200 p-5">
					<div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
					  <h3 className="text-lg font-semibold text-slate-900">{language}</h3>
					  <span className="badge badge-ghost">{index + 1} / 3</span>
					</div>

					<div className="grid gap-5 lg:grid-cols-2">
					  <div>
						<label className={labelClass}>
						  <span className={labelTextClass}>Initial Code</span>
						</label>
						<textarea
						  {...register(`startCode.${index}.initialCode`)}
						  rows={10}
						  className={`${textareaClass(!!startCodeError)} font-mono text-sm`}
						  placeholder={`Starter code for ${language}`}
						  aria-invalid={!!startCodeError}
						/>
						<FieldError message={startCodeError?.message} />
					  </div>

					  <div>
						<label className={labelClass}>
						  <span className={labelTextClass}>Reference Solution</span>
						</label>
						<textarea
						  {...register(`referenceSolution.${index}.completeCode`)}
						  rows={10}
						  className={`${textareaClass(!!referenceError)} font-mono text-sm`}
						  placeholder={`Reference solution for ${language}`}
						  aria-invalid={!!referenceError}
						/>
						<FieldError message={referenceError?.message} />
					  </div>
					</div>
				  </div>
				);
			  })}
			</div>
		  </section>

		  <button
			type="submit"
			className="btn btn-primary w-full rounded-2xl py-4 text-base font-semibold shadow-lg shadow-primary/20"
			disabled={isSubmitting}
		  >
			{isSubmitting ? 'Creating Problem...' : 'Create Problem'}
		  </button>
		</form>
	  </div>
	</div>
  );
}

export default AdminPanel;




