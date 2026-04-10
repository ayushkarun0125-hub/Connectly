import { cn } from '../../lib/utils'
import { panel, panelPadding } from './styles'

function ConnectlyPanel({ children, className, noPadding = false }) {
  return (
    <div className={cn(panel, !noPadding && panelPadding, className)}>
      {children}
    </div>
  )
}

export default ConnectlyPanel
