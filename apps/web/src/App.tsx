import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { UserList } from './components/UserList'

function App() {
  return (
    <>
      <h1>Users</h1>
      <p className="subtitle">FastAPI + Pydantic → OpenAPI → hey-api → TanStack Query + Zod</p>
      <UserList />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

export default App
