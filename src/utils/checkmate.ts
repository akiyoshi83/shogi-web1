import type { Board, Player } from '../types/shogi'

// 指定プレイヤーの王が盤上に存在するかチェック
export function isKingCaptured(board: Board, player: Player): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'king' && piece.player === player) {
        return false // 王が存在する
      }
    }
  }
  return true // 王が存在しない（取られた）
}
