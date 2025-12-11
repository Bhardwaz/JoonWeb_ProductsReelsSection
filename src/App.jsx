import './App.css'
import Card from './component/Card'
import { ApiProvider } from './context/api'
import { ModalProvider } from './context/modal'
import { ThumbProvider } from './context/thumb'


function App() {
  return (
    <ApiProvider>
    <ThumbProvider>
    <ModalProvider>
       <Card />
    </ModalProvider>
    </ThumbProvider>
    </ApiProvider>
  )
}

export default App
