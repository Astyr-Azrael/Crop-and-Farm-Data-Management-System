import { Database, LayoutDashboard, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import BrandMark from './BrandMark'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'records', label: 'Farm & Crop Records', icon: Database },
]

export default function AppShell({ activeView, onNavigate, collapsed, onToggle, children }) {
  return (
    <div className={`app-shell ${collapsed ? 'app-shell--collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar__top">
          <BrandMark compact={collapsed} />
          <button className="icon-button sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <div className="sidebar__label">Workspace</div>
        <nav className="sidebar__nav" aria-label="Primary navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeView === id ? 'nav-item--active' : ''}`}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__scope">
          <span className="sidebar__scope-dot" />
          <div>
            <strong>FR-02 prototype</strong>
            <small>SQLite persistence active</small>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={activeView === id ? 'mobile-nav__item--active' : ''}
            onClick={() => onNavigate(id)}
          >
            <Icon size={20} />
            <span>{id === 'records' ? 'Records' : label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
