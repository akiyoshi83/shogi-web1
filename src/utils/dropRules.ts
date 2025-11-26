import type { Board, PieceType, Player } from '../types/shogi'

// 持ち駒を打てるかチェック
export function canDropPiece(
  board: Board,
  pieceType: PieceType,
  player: Player,
  row: number,
  col: number
): boolean {
  // マスが空いているかチェック
  if (board[row][col] !== null) {
    return false
  }

  // 歩の二歩チェック
  if (pieceType === 'pawn') {
    // 同じ列に自分の歩（成っていない）があるかチェック
    for (let r = 0; r < 9; r++) {
      const piece = board[r][col]
      if (piece && piece.type === 'pawn' && piece.player === player && !piece.isPromoted) {
        return false
      }
    }
  }

  // 進めないマスへの打ち込みチェック
  if (pieceType === 'pawn' || pieceType === 'lance') {
    // 歩と香は最前列に打てない
    if (player === 'sente' && row === 0) return false
    if (player === 'gote' && row === 8) return false
  }

  if (pieceType === 'knight') {
    // 桂は最前列と2列目に打てない
    if (player === 'sente' && (row === 0 || row === 1)) return false
    if (player === 'gote' && (row === 7 || row === 8)) return false
  }

  return true
}

// 持ち駒を打てる位置を全て取得
export function getDropPositions(board: Board, pieceType: PieceType, player: Player): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = []

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (canDropPiece(board, pieceType, player, row, col)) {
        positions.push({ row, col })
      }
    }
  }

  return positions
}
