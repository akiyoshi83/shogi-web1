import './App.css'
import Board from './components/Board'
import CapturedPieces from './components/CapturedPieces'
import { useGameState } from './hooks/useGameState'

function App() {
  const {
    board,
    currentPlayer,
    capturedBySente,
    capturedByGote,
    selectedPosition,
    validMoves,
    isGameOver,
    winner,
    inCheck,
    selectSquare,
    selectDropPiece,
    resetGame,
  } = useGameState()

  return (
    <div className="app">
      <h1>将棋</h1>

      <div className="game-info">
        {isGameOver ? (
          <p className="game-over">
            🎉 {winner === 'sente' ? '先手' : '後手'}の勝ちです！
          </p>
        ) : (
          <p className="turn-indicator">
            {currentPlayer === 'sente' ? '▲ 先手の番です' : '△ 後手の番です'}
            {inCheck && <span className="check-indicator"> - 王手！</span>}
          </p>
        )}
        <button onClick={resetGame} className="reset-button">
          新しいゲーム
        </button>
      </div>

      <div className="game-container">
        <CapturedPieces
          capturedPieces={capturedByGote}
          player="gote"
          onPieceClick={selectDropPiece}
          isCurrentPlayer={currentPlayer === 'gote'}
        />

        <Board
          board={board}
          selectedPosition={selectedPosition}
          validMoves={validMoves}
          onSquareClick={selectSquare}
        />

        <CapturedPieces
          capturedPieces={capturedBySente}
          player="sente"
          onPieceClick={selectDropPiece}
          isCurrentPlayer={currentPlayer === 'sente'}
        />
      </div>
    </div>
  )
}

export default App
