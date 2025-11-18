import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome to EV-CMS Brand Admin</h1>
      <p className="mt-4 text-muted-foreground">
        Dashboard upgraded to Next.js 15.0.5 with React 19, Turbopack, shadcn/ui, and TanStack Router
      </p>
    </div>
  )
}
