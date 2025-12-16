import './App.css'
import Card from './component/Card'
import { ApiProvider } from './context/api'
import { ModalProvider } from './context/modal'
import { ResizeProvider } from './context/resize'
import { ThumbProvider } from './context/thumb'


function App() {
  return (
    <ResizeProvider>
      <ThumbProvider>
        <ApiProvider>
          <ModalProvider>
            <Card />
          </ModalProvider>
        </ApiProvider>
      </ThumbProvider>
    </ResizeProvider>
  )
}

export default App
