// src/App.jsx
import React, { useEffect, useState } from "react";
import socket from "./socket";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Chờ bạn bấm bắt đầu...");
  const [roomId, setRoomId] = useState(null);
  const [yourMove, setYourMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [scores, setScores] = useState({});
  const [gameWinner, setgameWinner] = useState(null);

  const handleFindRoom = () => {
    socket.emit("findRoom");
  };

  const handleMove = (move) => {
    if (!roomId || !isGameStarted) return;
    socket.emit("move", { roomId, move });
    setYourMove(move);
    setStatus(`Bạn đã chọn: ${move}`);
  };

  useEffect(() => {
    socket.on("roomJoined", (id) => {
      setRoomId(id);
      setStatus(`Đã vào phòng ${id}, chờ đối thủ...`);
    });

    socket.on("startGame", () => {
      setIsGameStarted(true);
      setStatus("🎮 Trò chơi bắt đầu!");
      setYourMove(null);
      setOpponentMove(null);
      setWinner(null);
    });

    socket.on("roundResult", (result) => {
      const myId = socket.id;
      const enemyId = Object.keys(result).find(
        (id) => id !== myId && id !== "winner"
      );

      setOpponentMove(result[enemyId]?.move);
      setWinner(result.winner);

      setScores((prev) => ({
        ...prev,
        [myId]: result[myId]?.score || 0,
        [enemyId]: result[enemyId]?.score || 0,
      }));

      let msg = `Bạn: ${result[myId]?.move} | Đối thủ: ${result[enemyId]?.move}\n`;
      if (!result.winner) msg += "⚖️ Hòa!";
      else if (result.winner === myId) msg += "✅ Bạn thắng vòng này!";
      else msg += "❌ Bạn thua vòng này!";
      setStatus(msg);
    });

    socket.on("gameOver", ({ winner, scores }) => {
      setGameWinner(winner);
      setScores(scores);

      const msg =
        winner === socket.id
          ? "🏆 Bạn đã thắng cả trận!"
          : "💀 Bạn đã thua trận!";
      setStatus(msg);

      // Đợi vài giây rồi reset UI
      setTimeout(() => {
        setYourMove(null);
        setOpponentMove(null);
        setWinner(null);
        setGameWinner(null);
        setStatus("🎮 Trận mới bắt đầu!");
      }, 4000);
    });

    return () => {
      socket.off("roomJoined");
      socket.off("startGame");
      socket.off("roundResult");
      socket.off("gameOver");
    };
  }, []);

  return (
    <div className="app">
      <h1>🪨📄✂️ Oẳn Tù Tì Realtime</h1>
      <p>{status}</p>
      {isGameStarted && scores && (
        <div className="scoreboard">
          <p>🧍‍♂️ Bạn: {scores[socket.id] || 0}</p>
          <p>
            🧑‍🤝‍🧑 Đối thủ:{" "}
            {Object.keys(scores).find((id) => id !== socket.id)
              ? scores[Object.keys(scores).find((id) => id !== socket.id)]
              : 0}
          </p>
        </div>
      )}
      {!roomId && <button onClick={handleFindRoom}>🔍 Bắt đầu chơi</button>}

      {isGameStarted && (
        <div className="buttons">
          <button onClick={() => handleMove("rock")}>🪨 Đá</button>
          <button onClick={() => handleMove("paper")}>📄 Bao</button>
          <button onClick={() => handleMove("scissors")}>✂️ Kéo</button>
        </div>
      )}

      {opponentMove && (
        <p>
          Đối thủ đã chọn: <strong>{opponentMove}</strong>
        </p>
      )}

      {winner && (
        <p style={{ color: winner === socket.id ? "green" : "red" }}>
          {winner === socket.id ? "🎉 Bạn thắng!" : "😭 Bạn thua!"}
        </p>
      )}
      {gameWinner && (
        <p
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: gameWinner === socket.id ? "green" : "red",
          }}
        >
          {gameWinner === socket.id
            ? "🎉 Bạn thắng cả trận!"
            : "😭 Bạn thua cả trận!"}
        </p>
      )}
    </div>
  );
}

export default App;
