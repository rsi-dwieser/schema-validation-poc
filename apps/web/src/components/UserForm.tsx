import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { zUserCreate } from '../client/zod.gen'

export type UserFormValues = z.infer<typeof zUserCreate>

type UserFormProps = {
  defaultValues?: UserFormValues
  submitLabel: string
  pending: boolean
  error?: string
  onSubmit: (values: UserFormValues) => void
  onCancel: () => void
}

export function UserForm({ defaultValues, submitLabel, pending, error, onSubmit, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(zUserCreate),
    defaultValues: defaultValues ?? { name: '', email: '' },
  })

  return (
    <form className="user-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} autoFocus />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="text" {...register('email')} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>
      {!!error && <span className="error">{error}</span>}
      <div className="form-actions">
        <button type="submit" className="primary" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
      </div>
    </form>
  )
}
