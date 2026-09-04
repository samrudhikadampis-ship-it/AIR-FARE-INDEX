import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LayoutProvider } from './context/LayoutContext'
import { SettingsProvider } from './context/SettingsContext'
import { NotificationsProvider } from './context/NotificationsContext'
import AppShell, { ProtectedRoute, PublicOnlyRoute } from './components/layout/AppShell'
import Overview from './pages/Overview'
import RouteIntelligence from './pages/RouteIntelligence'
import SectorHeatmap from './pages/SectorHeatmap'
import LiveCollection from './pages/LiveCollection'
import IndexAnalytics from './pages/IndexAnalytics'
import PriceDrivers from './pages/PriceDrivers'
import DataExplorer from './pages/DataExplorer'
import Login from './pages/Login'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Signup from "./pages/Signup";
import Documentation from './pages/Documentation'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <NotificationsProvider>
            <LayoutProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                  </Route>
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppShell />}>
                      <Route path="/" element={<Overview />} />
                      <Route path="/routes" element={<RouteIntelligence />} />
                      <Route path="/heatmap" element={<SectorHeatmap />} />
                      <Route path="/live-collection" element={<LiveCollection />} />
                      <Route path="/analytics" element={<IndexAnalytics />} />
                      <Route path="/drivers" element={<PriceDrivers />} />
                      <Route path="/explorer" element={<DataExplorer />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/docs" element={<Documentation />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </BrowserRouter>
            </LayoutProvider>
          </NotificationsProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
