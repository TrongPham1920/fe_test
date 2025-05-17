import { createContext, useState, useContext } from 'react'

const GameContext = createContext()

export const useGame = () => useContext(GameContext)

export const GameProvider = ({ children }) => {
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [player1Choice, setPlayer1Choice] = useState(null)
  const [player2Choice, setPlayer2Choice] = useState(null)
  const [result, setResult] = useState('')
  const [gameOver, setGameOver] = useState(false)

  const resetRound = () => {
    setPlayer1Choice(null)
    setPlayer2Choice(null)
    setCurrentPlayer(1)
    setResult('')
    setGameOver(false)
  }

  const resetGame = () => {
    resetRound()
    setPlayer1Score(0)
    setPlayer2Score(0)
  }

  const makeChoice = (choice) => {
    if (currentPlayer === 1) {
      setPlayer1Choice(choice)
      setCurrentPlayer(2)
    } else {
      setPlayer2Choice(choice)
      determineWinner(player1Choice, choice)
    }
  }

  const determineWinner = (p1Choice, p2Choice) => {
    setGameOver(true)
    
    if (p1Choice === p2Choice) {
      setResult('Draw! Both players chose the same.')
      return
    }

    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    }

    if (winConditions[p1Choice] === p2Choice) {
      setResult('Player 1 wins this round!')
      setPlayer1Score(prev => prev + 1)
    } else {
      setResult('Player 2 wins this round!')
      setPlayer2Score(prev => prev + 1)
    }
  }

  const value = {
    player1Score,
    player2Score,
    currentPlayer,
    player1Choice,
    player2Choice,
    result,
    gameOver,
    makeChoice,
    resetRound,
    resetGame
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}