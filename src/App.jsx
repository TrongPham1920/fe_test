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

  const firstFaceDownCardIndex = hands[myId]?.findIndex(
    (card) => !card.isFaceUp
  );

  useEffect(() => {
    const handleConnect = () => {
      setMyId(socket.id);
      console.log("🔌 Socket connected, id:", socket.id);
    };

    socket.on("connect", handleConnect);

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
      socket.off("connect", handleConnect);
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

  useEffect(() => {
    console.log("myId:", myId, "currentTurn:", currentTurn);
  }, [myId, currentTurn]);

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
    cards?.map((c, i) => {
      const isClickable = currentTurn === myId && !c.isFaceUp;

      return (
        <span
          key={i}
          style={{
            margin: "0 8px",
            fontWeight: "700",
            fontSize: "40px",
            cursor: isClickable ? "pointer" : "default",
            opacity: c.isFaceUp ? 1 : 0.3,
            borderBottom: c.isFaceUp
              ? "3px solid #22c55e"
              : "3px solid #9ca3af",
            borderRadius: 4,
            paddingBottom: 4,
            userSelect: "none",
            transition:
              "opacity 0.3s ease, border-color 0.3s ease, transform 0.2s ease",
          }}
          onClick={() => {
            if (isClickable) handleFlipCard(i);
          }}
          onMouseEnter={(e) => {
            if (isClickable) {
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.borderBottomColor = "#16a34a";
            }
          }}
          onMouseLeave={(e) => {
            if (isClickable) {
              e.currentTarget.style.opacity = c.isFaceUp ? "1" : "0.3";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderBottomColor = c.isFaceUp
                ? "#22c55e"
                : "#9ca3af";
            }
          }}
          title={`${c.value}${c.suit}`}
        >
          {c.isFaceUp ? `${c.value}${c.suit}` : `🂠`}
        </span>
      );
    });

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
    <div
      className="app"
      style={{
        padding: 24,
        maxWidth: "100%",
        height: "100vh",
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: `url("https://a.storyblok.com/f/161938/1200x675/999110f523/guide-to-live-dealer-casinos.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div style={{ width: "40%", padding: 20, background: "#ffffffb5" }}>
        <h2>🃏 Game Bài 3 Lá - Ba Cây - 5 người</h2>
        <p
          style={{
            backgroundColor: "#eef6ff",
            padding: "12px 16px",
            borderRadius: 8,
            minHeight: 60,
            fontWeight: "700",
            color: "#1a3e72",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: 20,
            marginTop: 20,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          {status}
        </p>

        {!roomId && (
          <form
            onSubmit={handleJoinRoom}
            style={{
              marginBottom: 20,
              width: "100%",
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "#344055",
                  fontSize: 14,
                }}
              >
                Tên của bạn:{" "}
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập tên..."
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.8px solid #a2a9b8",
                    borderRadius: 6,
                    fontSize: 15,
                    outlineOffset: 2,
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#a2a9b8")}
                />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "#344055",
                  fontSize: 14,
                }}
              >
                ID Phòng:{" "}
                <input
                  type="text"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  placeholder="Nhập ID phòng hoặc tạo mới"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.8px solid #a2a9b8",
                    borderRadius: 6,
                    fontSize: 15,
                    outlineOffset: 2,
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#a2a9b8")}
                />
              </label>
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                fontWeight: 700,
                padding: "12px 20px",
                fontSize: 16,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background-color 0.25s ease",
                width: "100%",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
            >
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
            <p
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1e3a8a",
                marginBottom: 16,
              }}
            >
              💰 Tiền cược (pot):{" "}
              <span style={{ color: "#22c55e" }}>{pot}</span>
            </p>

            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  marginBottom: 12,
                  color: "#334155",
                  borderBottom: "2px solid #3b82f6",
                  paddingBottom: 6,
                }}
              >
                Bài của bạn:
              </h4>
              <div>{renderCards(hands[myId])}</div>
              {currentTurn === myId && firstFaceDownCardIndex !== -1 && (
                <button
                  style={{
                    marginTop: 16,
                    padding: "12px 24px",
                    fontSize: 16,
                    fontWeight: "700",
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(34, 197, 94, 0.4)",
                    transition: "background-color 0.3s ease",
                    userSelect: "none",
                  }}
                  onClick={() => handleFlipCard(firstFaceDownCardIndex)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#16a34a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#22c55e")
                  }
                >
                  🔄 Lật bài
                </button>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  marginBottom: 12,
                  color: "#334155",
                  borderBottom: "2px solid #2563eb",
                  paddingBottom: 6,
                }}
              >
                Danh sách người chơi:
              </h4>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {players.map((p) => (
                  <li
                    key={p.id}
                    style={{
                      fontWeight: p.id === myId ? "700" : "500",
                      color: p.id === currentTurn ? "#2563eb" : "#475569",
                      marginBottom: 8,
                      userSelect: "none",
                    }}
                  >
                    {p.id === myId ? "Bạn" : p.name || p.id.slice(0, 5) + "..."}{" "}
                    {scores[p.id] !== undefined
                      ? `| Điểm: ${scores[p.id]}`
                      : ""}
                    {p.id === currentTurn && (
                      <span
                        style={{
                          fontWeight: "700",
                          color: "#ef4444",
                          marginLeft: 8,
                        }}
                      >
                        ← Đang chơi
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {currentTurn === myId && (
              <div style={{ marginBottom: 12 }}>
                <h4
                  style={{
                    marginBottom: 12,
                    color: "#1e40af",
                    fontWeight: "700",
                  }}
                >
                  🎯 Lượt bạn:
                </h4>
                {["up", "follow", "raise", "allin"].map((action, i) => {
                  const labels = {
                    up: "🃏 Úp bài",
                    follow: "💵 Theo",
                    raise: "⬆️ Tố",
                    allin: "💰 Tất tay",
                  };
                  const colors = {
                    up: "#3b82f6",
                    follow: "#2563eb",
                    raise: "#ea580c",
                    allin: "#dc2626",
                  };
                  return (
                    <button
                      key={action}
                      onClick={() => handleAction(action)}
                      style={{
                        marginRight: i < 3 ? 12 : 0,
                        padding: "10px 18px",
                        fontSize: 15,
                        fontWeight: "700",
                        backgroundColor: colors[action],
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        boxShadow: `0 3px 8px ${colors[action]}99`,
                        transition: "background-color 0.3s ease",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1e40af")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = colors[action])
                      }
                    >
                      {labels[action]}
                    </button>
                  );
                })}
              </div>
            )}

            {winner && (
              <p
                style={{
                  marginTop: 24,
                  fontWeight: "bold",
                  color: winner === myId ? "#22c55e" : "#dc2626",
                  fontSize: 22,
                  textAlign: "center",
                  userSelect: "none",
                }}
              >
                🎉 Người thắng:{" "}
                {winner === myId
                  ? "Bạn"
                  : players.find((p) => p.id === winner)?.name ||
                    winner.slice(0, 5) + "..."}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
