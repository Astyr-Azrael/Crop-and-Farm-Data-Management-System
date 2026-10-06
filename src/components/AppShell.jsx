import { Database, LayoutDashboard } from 'lucide-react'
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
          <BrandMark
            compact={collapsed}
            onClick={onToggle}
            expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
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
