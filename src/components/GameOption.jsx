import { motion } from 'framer-motion'
import { useGame } from '../contexts/GameContext'

const GameOption = ({ option, label }) => {
  const { makeChoice, currentPlayer, player1Choice, player2Choice } = useGame()
  
  const isDisabled = 
    (currentPlayer === 1 && player1Choice) || 
    (currentPlayer === 2 && player2Choice)
  
  const handleClick = () => {
    if (!isDisabled) {
      makeChoice(option)
    }
  }

  // Get appropriate icon based on the option
  const getIcon = () => {
    switch(option) {
      case 'rock':
        return '👊'
      case 'paper':
        return '✋'
      case 'scissors':
        return '✌️'
      default:
        return '❓'
    }
  }

  return (
    <motion.button 
      className={`btn ${isDisabled ? 'disabled' : ''}`}
      style={{ 
        fontSize: '2rem',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: isDisabled ? '#e0e0e0' : '#4361EE',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
      }}
      onClick={handleClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
    >
      <span style={{ fontSize: '2.5rem' }}>{getIcon()}</span>
      <span style={{ fontSize: '1rem' }}>{label}</span>
    </motion.button>
  )
}

export default GameOption