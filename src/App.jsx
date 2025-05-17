import React, { useEffect, useState } from "react";
import socket from "./socket";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Chờ bạn bấm bắt đầu...");
  const [roomId, setRoomId] = useState(null);

  const [opponentMove, setOpponentMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [scores, setScores] = useState({});
  const [gameWinner, setGameWinner] = useState(null);

  const handleFindRoom = () => {
    socket.emit("findRoom");
  };

  const handleMove = (move) => {
    if (!roomId || !isGameStarted) return;
    socket.emit("move", { roomId, move });

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

      setTimeout(() => {
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

  const opponentId = Object.keys(scores).find((id) => id !== socket.id);

  return (
    <div
      className="app"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f4f8",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: 16 }}>🪨📄✂️ Oẳn Tù Tì Realtime</h1>
        <p
          style={{
            minHeight: 40,
            padding: "8px 12px",
            backgroundColor: "#e7f3ff",
            borderRadius: 6,
            marginBottom: 24,
            fontWeight: "500",
          }}
        >
          {status}
        </p>

        {isGameStarted && scores && (
          <div className="scoreboard" style={{ marginBottom: 24 }}>
            <p>🧍‍♂️ Bạn: {scores[socket.id] || 0}</p>
            <p>🧑‍🤝‍🧑 Đối thủ: {opponentId ? scores[opponentId] : 0}</p>
          </div>
        )}

        {!roomId && (
          <button className="btn-primary" onClick={handleFindRoom}>
            🔍 Bắt đầu chơi
          </button>
        )}

        {isGameStarted && (
          <div className="buttons" style={{ marginTop: 20 }}>
            <button className="btn-move" onClick={() => handleMove("rock")}>
              🪨 Đá
            </button>
            <button className="btn-move" onClick={() => handleMove("paper")}>
              📄 Bao
            </button>
            <button className="btn-move" onClick={() => handleMove("scissors")}>
              ✂️ Kéo
            </button>
          </div>
        )}

        {opponentMove && (
          <p style={{ marginTop: 24, fontWeight: "600" }}>
            Đối thủ đã chọn: <strong>{opponentMove}</strong>
          </p>
        )}

        {winner && (
          <p
            style={{
              color: winner === socket.id ? "green" : "red",
              fontWeight: "bold",
              marginTop: 8,
            }}
          >
            {winner === socket.id ? "🎉 Bạn thắng!" : "😭 Bạn thua!"}
          </p>
        )}

        {gameWinner && (
          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: gameWinner === socket.id ? "green" : "red",
              marginTop: 16,
            }}
          >
            {gameWinner === socket.id
              ? "🎉 Bạn thắng cả trận!"
              : "😭 Bạn thua cả trận!"}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
