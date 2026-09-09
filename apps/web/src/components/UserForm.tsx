import { useForm } from '@tanstack/react-form'
import type { z } from 'zod'
import { zUserCreate } from '../client/users/zod.gen'

export type UserFormValues = z.infer<typeof zUserCreate>

// TanStack Form's Standard Schema adapter reports each field's errors as the
// raw Zod issue objects, not plain strings.
function fieldErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

type UserFormProps = {
  defaultValues?: UserFormValues
  submitLabel: string
  pending: boolean
  error?: string
  onSubmit: (values: UserFormValues) => void
  onCancel: () => void
}

export function UserForm({ defaultValues, submitLabel, pending, error, onSubmit, onCancel }: UserFormProps) {
  const form = useForm({
    defaultValues: defaultValues ?? { name: '', email: '' },
    // zUserCreate is a Standard Schema (Zod implements it directly), so TanStack
    // Form can validate the whole object with it — no resolver adapter needed.
    validators: { onChange: zUserCreate },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      className="user-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="name"
        children={(field) => (
          <div className="field">
            <label htmlFor={field.name}>Name</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              autoFocus
            />
            {!field.state.meta.isValid && (
              <span className="error">{field.state.meta.errors.map(fieldErrorMessage).join(', ')}</span>
            )}
          </div>
        )}
      />
      <form.Field
        name="email"
        children={(field) => (
          <div className="field">
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <span className="error">{field.state.meta.errors.map(fieldErrorMessage).join(', ')}</span>
            )}
          </div>
        )}
      />
      {!!error && <span className="error">{error}</span>}
      <div className="form-actions">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" className="primary" disabled={pending || !canSubmit}>
              {pending || isSubmitting ? 'Saving…' : submitLabel}
            </button>
          )}
        />
        <button type="button" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
      </div>
    </form>
  )
}
