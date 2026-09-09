import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createUserMutation,
  deleteUserMutation,
  listUsersOptions,
  listUsersQueryKey,
  updateUserMutation,
} from '../client/@tanstack/react-query.gen'
import { formatApiError } from '../lib/format-error'
import { UserForm, type UserFormValues } from './UserForm'

// Mirrors MALFORMED_USER_ID in apps/api/app/routers/users.py — always returns a
// response that violates the User schema, to demo the SDK's response validator.
const MALFORMED_USER_ID = 999

type UserListProps = {
  onSelectUser: (userId: number) => void
}

export function UserList({ onSelectUser }: UserListProps) {
  const queryClient = useQueryClient()
  const usersQuery = useQuery(listUsersOptions())
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: listUsersQueryKey() })

  const createMutation = useMutation({
    ...createUserMutation(),
    onSuccess: () => {
      invalidate()
      setCreating(false)
    },
  })

  const updateMutation = useMutation({
    ...updateUserMutation(),
    onSuccess: () => {
      invalidate()
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    ...deleteUserMutation(),
    onSuccess: () => {
      invalidate()
      setConfirmingDeleteId(null)
    },
  })

  if (usersQuery.isPending) {
    return <p className="status">Loading users…</p>
  }

  if (usersQuery.isError) {
    return <p className="status error">Failed to load users: {formatApiError(usersQuery.error)}</p>
  }

  const users = usersQuery.data ?? []

  const handleCreate = (values: UserFormValues) => {
    createMutation.mutate({ body: values })
  }

  const handleUpdate = (userId: number, values: UserFormValues) => {
    updateMutation.mutate({ path: { user_id: userId }, body: values })
  }

  const handleDelete = (userId: number) => {
    deleteMutation.mutate({ path: { user_id: userId } })
  }

  return (
    <>
      <div className="toolbar">
        <span>{users.length} user(s)</span>
        {!creating && (
          <button className="primary" onClick={() => setCreating(true)}>
            New user
          </button>
        )}
      </div>

      {creating && (
        <UserForm
          submitLabel="Create"
          pending={createMutation.isPending}
          error={formatApiError(createMutation.error)}
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) =>
            editingId === user.id ? (
              <tr key={user.id}>
                <td colSpan={3}>
                  <UserForm
                    defaultValues={{ name: user.name, email: user.email }}
                    submitLabel="Save"
                    pending={updateMutation.isPending}
                    error={formatApiError(updateMutation.error)}
                    onSubmit={(values) => handleUpdate(user.id, values)}
                    onCancel={() => setEditingId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {confirmingDeleteId === user.id ? (
                    <div className="row-actions">
                      <span className="error">Delete {user.name}?</span>
                      <button
                        className="danger"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? 'Deleting…' : 'Confirm'}
                      </button>
                      <button onClick={() => setConfirmingDeleteId(null)} disabled={deleteMutation.isPending}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="row-actions">
                      <button onClick={() => onSelectUser(user.id)}>View</button>
                      <button onClick={() => setEditingId(user.id)}>Edit</button>
                      <button className="danger" onClick={() => setConfirmingDeleteId(user.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      <p className="subtitle">
        <button onClick={() => onSelectUser(MALFORMED_USER_ID)}>
          View user {MALFORMED_USER_ID} (always returns a schema-invalid response)
        </button>
      </p>
    </>
  )
}
