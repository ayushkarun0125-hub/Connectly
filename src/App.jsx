import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import ToastContainer from './components/ui/ToastContainer'
import FlowFieldBackdrop from './components/ui/flow-field-backdrop'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme()
  return (
    <div className="relative isolate min-h-dvh">
      <FlowFieldBackdrop />
      <div className="relative z-10 min-h-dvh">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
      <ToastContainer />
    </div>
  )
}

export default App
