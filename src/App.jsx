import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import Home from './components/Home'
import Game from './components/Game'
import './App.css'

function App() {
  return (
    <GameProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App