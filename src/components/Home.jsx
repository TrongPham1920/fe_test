import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame } from "../contexts/GameContext";

const Home = () => {
  const navigate = useNavigate();
  const { resetGame } = useGame();

  const handleStart = () => {
    resetGame();
    navigate("/game");
  };

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="title">Rock Paper Scissors</h1>
      <p className="subtitle">
        A classic game for two players. Take turns to make your choice and see
        who wins!
      </p>

      <div className="game-preview">
        <motion.div
          className="game-icon-container"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <img
            src="https://images.pexels.com/photos/3626733/pexels-photo-3626733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Rock Paper Scissors"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "50%",
              margin: "20px auto",
            }}
          />
        </motion.div>
      </div>

      <motion.button
        className="btn"
        onClick={handleStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Start Game
      </motion.button>
    </motion.div>
  );
};

export default Home;
