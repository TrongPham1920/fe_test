import { motion } from 'framer-motion'

const Result = ({ player1Choice, player2Choice, result }) => {
  const getIcon = (choice) => {
    switch(choice) {
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

  const getResultClass = () => {
    if (result.includes('Player 1 wins')) return 'win'
    if (result.includes('Player 2 wins')) return 'lose'
    return 'draw'
  }

  return (
    <motion.div
      className="result-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="choices-container" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
        <motion.div 
          className="player-choice"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: '4rem' }}>{getIcon(player1Choice)}</div>
          <div>Player 1</div>
        </motion.div>
        
        <div style={{ fontSize: '2rem', alignSelf: 'center' }}>vs</div>
        
        <motion.div 
          className="player-choice"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div style={{ fontSize: '4rem' }}>{getIcon(player2Choice)}</div>
          <div>Player 2</div>
        </motion.div>
      </div>
      
      <motion.div 
        className={`result-message ${getResultClass()}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        {result}
      </motion.div>
    </motion.div>
  )
}

export default Result