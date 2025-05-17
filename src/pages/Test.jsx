import { useEffect, useState } from "react";
import socket from "../socket";

function App() {
  const [status, setStatus] = useState("Chờ bạn bấm bắt đầu...");
  const [roomId, setRoomId] = useState(null);

  const [opponentMove, setOpponentMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

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

      setOpponentMove(result[enemyId]);
      setWinner(result.winner);

      let msg = `Bạn: ${result[myId]} | Đối thủ: ${result[enemyId]}\n`;
      if (!result.winner) msg += "⚖️ Hòa!";
      else if (result.winner === myId) msg += "✅ Bạn thắng!";
      else msg += "❌ Bạn thua!";

      setStatus(msg);
    });

    return () => {
      socket.off("roomJoined");
      socket.off("startGame");
      socket.off("roundResult");
    };
  }, []);

  return (
    <div className="app">
      <h1>🪨📄✂️ Oẳn Tù Tì Realtime</h1>
      <p>{status}</p>

      {!roomId && <button onClick={handleFindRoom}>🔍 Bắt đầu chơi</button>}

      {isGameStarted && (
        <div className="buttons">
          <button onClick={() => handleMove("rock")}>🪨 Kéo</button>
          <button onClick={() => handleMove("paper")}>📄 Bao</button>
          <button onClick={() => handleMove("scissors")}>✂️ Búa</button>
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
    </div>
  );
}

export default App;
