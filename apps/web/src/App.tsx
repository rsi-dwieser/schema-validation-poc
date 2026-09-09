import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { UserDetail } from './components/UserDetail'
import { UserList } from './components/UserList'

function App() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  return (
    <>
      <h1>Users</h1>
      <p className="subtitle">FastAPI + Pydantic → OpenAPI → hey-api → TanStack Query + Zod</p>
      {selectedUserId === null ? (
        <UserList onSelectUser={setSelectedUserId} />
      ) : (
        <UserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
      )}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

export default App
