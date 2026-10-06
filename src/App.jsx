import { useCallback, useEffect, useState } from 'react'
import AppShell from './components/AppShell'
import ConfirmDialog from './components/ConfirmDialog'
import Dashboard from './components/Dashboard'
import FarmFormModal from './components/FarmFormModal'
import FarmRecords from './components/FarmRecords'
import RecordDrawer from './components/RecordDrawer'
import Toast from './components/Toast'
import Topbar from './components/Topbar'
import { farmApi } from './lib/api'

const emptyDashboard = {
  total_farms: 0,
  total_area: 0,
  stage_distribution: [],
  variety_distribution: [],
  recent_records: [],
}

const emptyPagination = {
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 1,
}

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('')
  const [formRecord, setFormRecord] = useState(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const refreshDashboard = useCallback(async () => {
    const data = await farmApi.dashboard()
    setDashboard(data)
  }, [])

  const refreshRecords = useCallback(async (requestedPage = page) => {
    const data = await farmApi.list({ query, stage, page: requestedPage })
    setRecords(data.items)
    setPagination(data.pagination)
    setPage(data.pagination.page)
  }, [page, query, stage])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([farmApi.dashboard(), farmApi.list({ query, stage, page: 1 })])
      .then(([dashboardData, recordsData]) => {
        if (!mounted) return
        setDashboard(dashboardData)
        setRecords(recordsData.items)
        setPagination(recordsData.pagination)
      })
      .catch(() => {
        if (mounted) setToast({ type: 'error', title: 'Connection problem', message: 'The farm database could not be reached.' })
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (activeView !== 'records') return
    const timer = window.setTimeout(() => {
      setLoading(true)
      refreshRecords().catch(() => setToast({ type: 'error', title: 'Unable to load records', message: 'Please try again.' })).finally(() => setLoading(false))
    }, 180)
    return () => window.clearTimeout(timer)
  }, [activeView, refreshRecords])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openCreate = () => {
    setSelectedRecord(null)
    setFormRecord(undefined)
    setFormOpen(true)
  }

  const openEdit = (record) => {
    setSelectedRecord(null)
    setFormRecord(record)
    setFormOpen(true)
  }

  const saveRecord = async (payload) => {
    const isEditing = Boolean(formRecord?.id)
    const saved = isEditing
      ? await farmApi.update(formRecord.id, payload)
      : await farmApi.create(payload)
    setFormOpen(false)
    setFormRecord(undefined)
    const destinationPage = isEditing ? page : 1
    if (!isEditing) setPage(1)
    await Promise.all([refreshDashboard(), refreshRecords(destinationPage)])
    setToast({
      title: isEditing ? 'Record updated' : 'Farm record saved',
      message: isEditing
        ? `${saved.farm_name} now reflects the latest crop information.`
        : `${saved.farm_name} is now stored in SQLite.`,
    })
    if (isEditing) setSelectedRecord(saved)
  }

  const confirmDelete = async () => {
    if (!deleteRecord) return
    setDeleting(true)
    try {
      const name = deleteRecord.farm_name
      await farmApi.remove(deleteRecord.id)
      setDeleteRecord(null)
      await Promise.all([refreshDashboard(), refreshRecords()])
      setToast({ title: 'Record deleted', message: `${name} was removed from the database.` })
    } catch (error) {
      setToast({ type: 'error', title: 'Delete failed', message: error.message })
    } finally {
      setDeleting(false)
    }
  }

  const navigate = (view) => {
    setActiveView(view)
    setSelectedRecord(null)
  }

  const updateQuery = (value) => {
    setQuery(value)
    setPage(1)
  }

  const updateStage = (value) => {
    setStage(value)
    setPage(1)
  }

  const heading = activeView === 'dashboard'
    ? { eyebrow: 'Crop & Farm Data Management', title: 'Farm overview', description: 'A focused view of your registered sugarcane plots.' }
    : { eyebrow: 'Crop & Farm Data Management', title: 'Farm records', description: 'Retrieve and update saved farm and crop information.' }

  return (
    <AppShell activeView={activeView} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)}>
      <Topbar {...heading} onMenu={() => setCollapsed((value) => !value)} />
      <div className="content-area">
        {activeView === 'dashboard' ? (
          <Dashboard
            data={dashboard}
            loading={loading}
            onAdd={openCreate}
            onOpenRecords={() => navigate('records')}
            onViewRecord={setSelectedRecord}
          />
        ) : (
          <FarmRecords
            records={records}
            pagination={pagination}
            page={page}
            loading={loading}
            query={query}
            stage={stage}
            onQuery={updateQuery}
            onStage={updateStage}
            onPage={setPage}
            onAdd={openCreate}
            onView={setSelectedRecord}
            onEdit={openEdit}
            onDelete={setDeleteRecord}
          />
        )}
      </div>

      {formOpen && <FarmFormModal record={formRecord} onClose={() => setFormOpen(false)} onSubmit={saveRecord} />}
      <RecordDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onEdit={openEdit} />
      <ConfirmDialog record={deleteRecord} onCancel={() => setDeleteRecord(null)} onConfirm={confirmDelete} busy={deleting} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  )
}
