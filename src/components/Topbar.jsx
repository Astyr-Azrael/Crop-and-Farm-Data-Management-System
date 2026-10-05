import { CalendarDays, Database, Menu } from 'lucide-react'
import BrandMark from './BrandMark'

export default function Topbar({ eyebrow, title, description, onMenu }) {
  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="topbar">
      <div className="topbar__mobile-brand">
        <BrandMark compact />
      </div>
      <div className="topbar__heading">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="topbar__meta">
        <span><CalendarDays size={16} /> {date}</span>
        <span className="status-pill"><Database size={15} /> SQLite connected</span>
      </div>
      <button className="icon-button topbar__menu" onClick={onMenu} aria-label="Open navigation">
        <Menu size={20} />
      </button>
    </header>
  )
}
