import type { Board as BoardType, Position } from '../types/shogi'
import './Board.css'

interface BoardProps {
  board: BoardType
  selectedPosition: Position | null
  validMoves: Position[]
  onSquareClick: (position: Position) => void
  isGameOver: boolean
}

// 駒の種類を日本語表記に変換
const pieceToJapanese: Record<string, string> = {
  pawn: '歩',
  lance: '香',
  knight: '桂',
  silver: '銀',
  gold: '金',
  bishop: '角',
  rook: '飛',
  king: '玉',
}

// 成り駒の表記
const promotedPieceToJapanese: Record<string, string> = {
  pawn: 'と',
  lance: '杏',
  knight: '圭',
  silver: '全',
  bishop: '馬',
  rook: '竜',
}

function Board({ board, selectedPosition, validMoves, onSquareClick, isGameOver }: BoardProps) {
  const isSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col
  }

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col)
  }

  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const position: Position = { row: rowIndex, col: colIndex }
          const selected = isSelected(rowIndex, colIndex)
          const validMove = isValidMove(rowIndex, colIndex)

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${selected ? 'selected' : ''} ${validMove ? 'valid-move' : ''} ${isGameOver ? 'game-over' : ''}`}
              onClick={() => onSquareClick(position)}
            >
              {piece && (
                <div className={`piece ${piece.player}`}>
                  {piece.isPromoted
                    ? promotedPieceToJapanese[piece.type]
                    : pieceToJapanese[piece.type]}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default Board
