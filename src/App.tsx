import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { TodayPage } from './pages/TodayPage'
import { InboxPage } from './pages/InboxPage'
import { WeekPage } from './pages/WeekPage'
import { GoalsPage } from './pages/GoalsPage'
import { JournalPage } from './pages/JournalPage'
import { InsightsPage } from './pages/InsightsPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/week" element={<WeekPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
