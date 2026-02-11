import type { Board, Player, Position, PieceType, CapturedPieces, CapturablePieceType } from '../types/shogi'
import { getValidMoves } from './moveRules'
import { getDropPositions } from './dropRules'

// 指定プレイヤーの王が盤上に存在するかチェック
export function isKingCaptured(board: Board, player: Player): boolean {
  return findKingPosition(board, player) === null
}

// 指定プレイヤーの王の位置を取得
export function findKingPosition(board: Board, player: Player): Position | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'king' && piece.player === player) {
        return { row, col }
      }
    }
  }
  return null
}

// 指定マスが attacker の駒によって攻撃されているか判定
export function isSquareAttackedBy(board: Board, position: Position, attacker: Player): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.player === attacker) {
        const moves = getValidMoves(board, { row, col })
        if (moves.some(m => m.row === position.row && m.col === position.col)) {
          return true
        }
      }
    }
  }
  return false
}

// 指定プレイヤーの王が王手されているか判定
export function isInCheck(board: Board, player: Player): boolean {
  const kingPos = findKingPosition(board, player)
  if (!kingPos) return false
  const opponent = player === 'sente' ? 'gote' : 'sente'
  return isSquareAttackedBy(board, kingPos, opponent)
}

// 移動をシミュレートし、移動後に自玉が王手になるか判定
function wouldBeInCheck(board: Board, from: Position, to: Position, player: Player): boolean {
  const newBoard = board.map(row => [...row])
  newBoard[to.row][to.col] = newBoard[from.row][from.col]
  newBoard[from.row][from.col] = null
  return isInCheck(newBoard, player)
}

// 持ち駒の打ち込みをシミュレートし、打った後に自玉が王手になるか判定
function wouldBeInCheckAfterDrop(board: Board, pieceType: PieceType, to: Position, player: Player): boolean {
  const newBoard = board.map(row => [...row])
  newBoard[to.row][to.col] = { type: pieceType, player, isPromoted: false }
  return isInCheck(newBoard, player)
}

// 自玉を王手に晒さない合法手のみを返す
export function getLegalMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col]
  if (!piece) return []
  const moves = getValidMoves(board, from)
  return moves.filter(to => !wouldBeInCheck(board, from, to, piece.player))
}

// 自玉を王手に晒さない合法な打ち込み先のみを返す
export function getLegalDropPositions(board: Board, pieceType: CapturablePieceType, player: Player): Position[] {
  const positions = getDropPositions(board, pieceType, player)
  return positions.filter(to => !wouldBeInCheckAfterDrop(board, pieceType, to, player))
}

// 指定プレイヤーが詰みかどうかを判定
// 条件: 王手されている AND 合法手が一つも存在しない
export function isCheckmate(board: Board, player: Player, capturedPieces: CapturedPieces): boolean {
  // 王手されていなければ詰みではない
  if (!isInCheck(board, player)) return false

  // 全ての自駒の合法手を調べる
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const legalMoves = getLegalMoves(board, { row, col })
        if (legalMoves.length > 0) return false
      }
    }
  }

  // 持ち駒の打ち込みで王手を解除できるか調べる
  const pieceTypes: CapturablePieceType[] = ['pawn', 'lance', 'knight', 'silver', 'gold', 'bishop', 'rook']
  for (const pieceType of pieceTypes) {
    if (capturedPieces[pieceType] > 0) {
      const dropPositions = getLegalDropPositions(board, pieceType, player)
      if (dropPositions.length > 0) return false
    }
  }

  return true
}
