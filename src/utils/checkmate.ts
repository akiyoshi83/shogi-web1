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

// 合法手を返す（王将のみ王手回避フィルタを適用、他の駒はそのまま）
export function getLegalMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col]
  if (!piece) return []
  const moves = getValidMoves(board, from)
  if (piece.type === 'king') {
    return moves.filter(to => !wouldBeInCheck(board, from, to, piece.player))
  }
  return moves
}

// 持ち駒の打ち込み先を返す（打ち込みルールのみ適用）
export function getLegalDropPositions(board: Board, pieceType: CapturablePieceType, player: Player): Position[] {
  return getDropPositions(board, pieceType, player)
}

// 移動後に王手が解消されるか判定（詰み判定用）
function resolvesCheck(board: Board, from: Position, to: Position, player: Player): boolean {
  const newBoard = board.map(row => [...row])
  newBoard[to.row][to.col] = newBoard[from.row][from.col]
  newBoard[from.row][from.col] = null
  return !isInCheck(newBoard, player)
}

// 打ち込み後に王手が解消されるか判定（詰み判定用）
function dropResolvesCheck(board: Board, pieceType: PieceType, to: Position, player: Player): boolean {
  const newBoard = board.map(row => [...row])
  newBoard[to.row][to.col] = { type: pieceType, player, isPromoted: false }
  return !isInCheck(newBoard, player)
}

// 指定プレイヤーが詰みかどうかを判定
// 条件: 王手されている AND 王手を解消する手が一つも存在しない
export function isCheckmate(board: Board, player: Player, capturedPieces: CapturedPieces): boolean {
  // 王手されていなければ詰みではない
  if (!isInCheck(board, player)) return false

  // 全ての自駒について、王手を解消する手があるか調べる
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const moves = getValidMoves(board, { row, col })
        for (const to of moves) {
          if (resolvesCheck(board, { row, col }, to, player)) {
            return false
          }
        }
      }
    }
  }

  // 持ち駒の打ち込みで王手を解消できるか調べる
  const pieceTypes: CapturablePieceType[] = ['pawn', 'lance', 'knight', 'silver', 'gold', 'bishop', 'rook']
  for (const pieceType of pieceTypes) {
    if (capturedPieces[pieceType] > 0) {
      const positions = getDropPositions(board, pieceType, player)
      for (const to of positions) {
        if (dropResolvesCheck(board, pieceType, to, player)) {
          return false
        }
      }
    }
  }

  return true
}
