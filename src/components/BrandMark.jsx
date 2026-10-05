import { Sprout } from 'lucide-react'

export default function BrandMark({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <span className="brand__mark" aria-hidden="true">
        <Sprout size={compact ? 20 : 23} strokeWidth={2.2} />
      </span>
      <span className="brand__copy">
        <strong>Irrigation Advisory</strong>
        {!compact && <small>Crop & farm management system</small>}
      </span>
    </div>
  )
}
