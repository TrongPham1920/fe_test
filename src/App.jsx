import React, { useEffect, useState } from "react";
import socket from "./socket";

function App() {
  const [status, setStatus] = useState("🎮 Nhập tên và ID phòng để kết nối...");
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [hands, setHands] = useState({}); // {playerId: [{value, suit, isFaceUp}]}
  const [scores, setScores] = useState({});
  const [pot, setPot] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [myId, setMyId] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);

  const [playerName, setPlayerName] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");

  useEffect(() => {
    setMyId(socket.id);

    socket.on("roomJoined", (id) => {
      setRoomId(id);
      setStatus(`✅ Vào phòng ${id}, chờ đủ người...`);
    });

    socket.on("playersUpdate", (playerIds) => {
      setPlayers(playerIds);
    });

    socket.on(
      "gameStarted",
      ({ pot: gamePot, hands: serverHands, currentTurnId }) => {
        setIsGameStarted(true);
        setPot(gamePot);
        setWinner(null);
        setHands({});
        setScores({});
        setStatus("🎲 Đã đặt cược xong, bài đã chia úp, chờ lượt lật bài.");

        const parsedHands = {};
        Object.entries(serverHands).forEach(([pid, cards]) => {
          parsedHands[pid] = cards.map((cardStr) => ({
            value: cardStr.slice(0, -1),
            suit: cardStr.slice(-1),
            isFaceUp: false,
          }));
        });
        setHands(parsedHands);
        setCurrentTurn(currentTurnId); // currentTurn là playerId
      }
    );

    socket.on("turnChanged", ({ playerId, playerName }) => {
      console.log(`Lượt của ${playerName} (${playerId})`);
      setCurrentTurn(playerId);
      if (playerId === socket.id) {
        setStatus("🎯 Đến lượt bạn lật bài hoặc đặt cược");
      } else {
        setStatus(`⌛ Chờ người chơi ${playerName} lật bài hoặc cược`);
      }
    });

    socket.on("cardFlipped", ({ playerId, cardIndex }) => {
      setHands((prev) => {
        const newHands = { ...prev };
        if (newHands[playerId] && newHands[playerId][cardIndex]) {
          newHands[playerId][cardIndex].isFaceUp = true;
        }
        return newHands;
      });
    });

    socket.on("potUpdated", (newPot) => {
      setPot(newPot);
    });

    socket.on("gameResult", ({ winnerId, scores: finalScores }) => {
      setScores(finalScores);
      setWinner(winnerId);
      setStatus(
        winnerId === socket.id
          ? `🏆 Bạn thắng với pot ${pot}!`
          : `🎉 Người thắng: ${winnerId.slice(0, 5)} - pot ${pot}`
      );
    });

    socket.on("gameOver", () => {
      setIsGameStarted(false);
      setHands({});
      setPot(0);
      setScores({});
      setWinner(null);
      setStatus("🎮 Ván mới - nhập tên và phòng để chơi tiếp");
      setRoomId(null);
      setPlayers([]);
      setCurrentTurn(null);
    });

    return () => {
      socket.off("roomJoined");
      socket.off("playersUpdate");
      socket.off("gameStarted");
      socket.off("turnChanged");
      socket.off("cardFlipped");
      socket.off("potUpdated");
      socket.off("gameResult");
      socket.off("gameOver");
    };
  }, [pot]);

  // Hành động lật bài - chỉ lượt mình mới bấm được
  const handleFlipCard = (cardIndex) => {
    if (currentTurn !== socket.id) return;
    socket.emit("flipCard", { roomId, cardIndex });
  };

  // Các hành động cược: úp, theo, tố, tất tay
  const handleAction = (action) => {
    if (currentTurn !== socket.id) return;
    socket.emit("playerAction", { roomId, action });
  };

  const renderCards = (cards) =>
    cards?.map((c, i) => (
      <span
        key={i}
        style={{
          margin: "0 6px",
          fontWeight: "bold",
          fontSize: "24px",
          cursor: currentTurn === myId && !c.isFaceUp ? "pointer" : "default",
          opacity: c.isFaceUp ? 1 : 0.2,
          borderBottom: c.isFaceUp ? "2px solid green" : "2px solid gray",
        }}
        onClick={() => {
          if (!c.isFaceUp && currentTurn === myId) handleFlipCard(i);
        }}
        title={c.isFaceUp ? `${c.value}${c.suit}` : "Bài úp"}
      >
        {c.isFaceUp ? `${c.value}${c.suit}` : "🂠"}
      </span>
    ));

  // Gửi joinRoom kèm playerName và roomId
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert("Vui lòng nhập tên của bạn");
      return;
    }
    if (!inputRoomId.trim()) {
      alert("Vui lòng nhập ID phòng");
      return;
    }
    socket.emit("joinRoom", {
      playerName: playerName.trim(),
      roomId: inputRoomId.trim(),
    });
  };

  return (
    <div className="app" style={{ padding: 24, maxWidth: 720, margin: "auto" }}>
      <h2>🃏 Game Bài 3 Lá - Ba Cây - 5 người</h2>
      <p
        style={{
          backgroundColor: "#eef",
          padding: 12,
          borderRadius: 8,
          minHeight: 60,
          fontWeight: "bold",
        }}
      >
        {status}
      </p>

      {!roomId && (
        <form onSubmit={handleJoinRoom} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Tên của bạn:{" "}
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nhập tên..."
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              ID Phòng:{" "}
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder="Nhập ID phòng hoặc tạo mới"
                required
              />
            </label>
          </div>
          <button type="submit" className="btn-primary">
            🔍 Kết nối phòng
          </button>
        </form>
      )}

      {roomId && !isGameStarted && (
        <p>
          {players.length > 0 && (
            <p>
              👥 Người chơi trong phòng ({players.length}):{" "}
              {players.map((p) =>
                p.id === myId ? (
                  <b key={p.id}>Bạn</b>
                ) : (
                  <span key={p.id}>{p.name || p.id.slice(0, 5)}...</span>
                )
              )}
            </p>
          )}
        </p>
      )}

      {isGameStarted && (
        <>
          <p>
            💰 Tiền cược (pot): <b>{pot}</b>
          </p>

          <div>
            <h4>Bài của bạn:</h4>
            {renderCards(hands[myId])}
          </div>

          <div style={{ marginTop: 16 }}>
            <h4>Danh sách người chơi:</h4>
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {players.map((p) => (
                <li
                  key={p.id}
                  style={{
                    fontWeight: p.id === myId ? "bold" : "normal",
                    color: p.id === currentTurn ? "blue" : "black",
                    marginBottom: 6,
                  }}
                >
                  {p.id === myId ? "Bạn" : p.name || p.id.slice(0, 5) + "..."}{" "}
                  {scores[p.id] !== undefined ? `| Điểm: ${scores[p.id]}` : ""}
                  {p.id === currentTurn && " ← Đang chơi"}
                </li>
              ))}
            </ul>
          </div>

          {currentTurn === myId && (
            <div style={{ marginTop: 20 }}>
              <h4>🎯 Lượt bạn:</h4>
              <button onClick={() => handleAction("up")}>🃏 Úp bài</button>{" "}
              <button onClick={() => handleAction("follow")}>💵 Theo</button>{" "}
              <button onClick={() => handleAction("raise")}>⬆️ Tố</button>{" "}
              <button onClick={() => handleAction("allin")}>💰 Tất tay</button>
            </div>
          )}

          {winner && (
            <p
              style={{
                marginTop: 20,
                fontWeight: "bold",
                color: winner === myId ? "green" : "red",
                fontSize: 20,
              }}
            >
              🎉 Người thắng:{" "}
              {winner === myId ? "Bạn" : winner.slice(0, 5) + "..."}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
