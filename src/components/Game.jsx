import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../contexts/GameContext'
import GameOption from './GameOption'
import Result from './Result'

const Game = () => {
  const navigate = useNavigate()
  const { 
    player1Score, 
    player2Score, 
    currentPlayer, 
    player1Choice, 
    player2Choice, 
    result, 
    gameOver,
    resetRound
  } = useGame()

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="title">Rock Paper Scissors</h1>
      
      <div className="score-board">
        <div className="player-score">
          <div className="player-name">Player 1</div>
          <div className="score">{player1Score}</div>
        </div>
        <div className="player-score">
          <div className="player-name">Player 2</div>
          <div className="score">{player2Score}</div>
        </div>
      </div>
      
      {!gameOver ? (
        <>
          <div className="player-turn">
            Player {currentPlayer}'s turn
          </div>
          
          {currentPlayer === 1 && (
            <div className="player-instruction">
              {player1Choice ? 'You chose:' : 'Make your choice:'}
            </div>
          )}
          
          {currentPlayer === 2 && (
            <div className="player-instruction">
              {player2Choice ? 'You chose:' : 'Make your choice:'}
            </div>
          )}
          
          <div className="options-container">
            <GameOption option="rock" label="Rock" />
            <GameOption option="paper" label="Paper" />
            <GameOption option="scissors" label="Scissors" />
          </div>
        </>
      ) : (
        <Result 
          player1Choice={player1Choice} 
          player2Choice={player2Choice}
          result={result}
        />
      )}
      
      <div className="action-buttons">
        {gameOver && (
          <motion.button 
            className="btn"
            onClick={resetRound}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Again
          </motion.button>
        )}
        
        <motion.button 
          className="btn btn-secondary"
          onClick={handleBackToHome}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Game