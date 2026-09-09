import { useQuery } from '@tanstack/react-query'
import { getUserOptions } from '../client/@tanstack/react-query.gen'
import { formatApiError } from '../lib/format-error'

type UserDetailProps = {
  userId: number
  onBack: () => void
}

export function UserDetail({ userId, onBack }: UserDetailProps) {
  const userQuery = useQuery(getUserOptions({ path: { user_id: userId } }))

  return (
    <>
      <div className="toolbar">
        <button onClick={onBack}>← Back to list</button>
      </div>

      {userQuery.isPending && <p className="status">Loading user…</p>}

      {userQuery.isError && (
        <div className="user-form">
          <p className="error">
            <strong>Response failed schema validation.</strong> The API returned a 200 for user{' '}
            {userId}, but its body doesn't match the <code>User</code> schema hey-api generated
            from the backend's OpenAPI spec, so the SDK's Zod validator rejected it before it
            could reach this component:
          </p>
          <p className="error">{formatApiError(userQuery.error)}</p>
        </div>
      )}

      {userQuery.isSuccess && (
        <table>
          <tbody>
            <tr>
              <th>ID</th>
              <td>{userQuery.data.id}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{userQuery.data.name}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{userQuery.data.email}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{userQuery.data.created_at}</td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  )
}
