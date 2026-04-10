import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { inputGlass } from './styles'

function SearchInput({ className, iconClassName, ...props }) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search
        className={cn('pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500', iconClassName)}
        strokeWidth={2}
      />
      <input type="search" className={cn(inputGlass, 'pl-10')} {...props} />
    </div>
  )
}

export default SearchInput
