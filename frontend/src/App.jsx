import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import PageContainer from './components/layout/PageContainer'
import Overview from './pages/Overview'
import RouteIntelligence from './pages/RouteIntelligence'
import LiveCollection from './pages/LiveCollection'
import IndexAnalytics from './pages/IndexAnalytics'
import PriceDrivers from './pages/PriceDrivers'
import DataExplorer from './pages/DataExplorer'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-zinc-50 text-zinc-950">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <PageContainer>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/routes" element={<RouteIntelligence />} />
              <Route path="/live-collection" element={<LiveCollection />} />
              <Route path="/analytics" element={<IndexAnalytics />} />
              <Route path="/drivers" element={<PriceDrivers />} />
              <Route path="/explorer" element={<DataExplorer />} />
            </Routes>
          </PageContainer>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
