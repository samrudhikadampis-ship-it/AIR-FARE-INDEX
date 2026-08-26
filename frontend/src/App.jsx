import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import PageContainer from './components/layout/PageContainer'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <PageContainer>
          <Dashboard />
        </PageContainer>
      </div>
    </div>
  )
}

export default App