import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";

export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <PageContainer>
          <Outlet />
        </PageContainer>
      </div>
    </div>
  )
}
