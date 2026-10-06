import { Sprout } from 'lucide-react'

export default function BrandMark({ compact = false, onClick, expanded, title }) {
  const content = (
    <>
      <span className="brand__mark" aria-hidden="true">
        <Sprout size={compact ? 20 : 23} strokeWidth={2.2} />
      </span>
      <span className="brand__copy">
        <strong>Irrigation Advisory</strong>
        {!compact && <small>Crop & farm management system</small>}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={`brand brand--button ${compact ? 'brand--compact' : ''}`}
        onClick={onClick}
        aria-label={title}
        aria-expanded={expanded}
        title={title}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      {content}
    </div>
  )
}
