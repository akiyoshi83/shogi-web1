import type { CapturedPieces as CapturedPiecesType, CapturablePieceType } from '../types/shogi'
import './CapturedPieces.css'

interface CapturedPiecesProps {
  capturedPieces: CapturedPiecesType
  player: 'sente' | 'gote'
  onPieceClick?: (pieceType: CapturablePieceType) => void
  isCurrentPlayer: boolean
  isGameOver: boolean
}

const pieceToJapanese: Record<CapturablePieceType, string> = {
  pawn: '歩',
  lance: '香',
  knight: '桂',
  silver: '銀',
  gold: '金',
  bishop: '角',
  rook: '飛',
}

const pieceOrder: CapturablePieceType[] = ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn']

function CapturedPieces({ capturedPieces, player, onPieceClick, isCurrentPlayer, isGameOver }: CapturedPiecesProps) {
  return (
    <div className={`captured-pieces ${player}`}>
      <h3>{player === 'sente' ? '▲ 先手の持ち駒' : '△ 後手の持ち駒'}</h3>
      <div className="pieces-container">
        {pieceOrder.map((pieceType) => {
          const count = capturedPieces[pieceType]
          if (count === 0) return null

          return (
            <div
              key={pieceType}
              className={`captured-piece ${isCurrentPlayer && !isGameOver && onPieceClick ? 'clickable' : ''}`}
              onClick={() => isCurrentPlayer && !isGameOver && onPieceClick?.(pieceType)}
            >
              <span className="piece-label">{pieceToJapanese[pieceType]}</span>
              {count > 1 && <span className="piece-count">{count}</span>}
            </div>
          )
        })}
        {pieceOrder.every(type => capturedPieces[type] === 0) && (
          <div className="no-pieces">なし</div>
        )}
      </div>
    </div>
  )
}

export default CapturedPieces
