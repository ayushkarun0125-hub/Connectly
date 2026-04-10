import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import ToastContainer from './components/ui/ToastContainer'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme()
  return (
    <BrowserRouter>
      <AppRouter />
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
