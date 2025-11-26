import type { Board, Piece, Player, PieceType } from '../types/shogi'

function createPiece(type: PieceType, player: Player): Piece {
  return {
    type,
    player,
    isPromoted: false
  }
}

export function createInitialBoard(): Board {
  // 9x9の空の盤面を作成
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))

  // 後手の駒を配置（上側）
  const goteBackRow: PieceType[] = ['lance', 'knight', 'silver', 'gold', 'king', 'gold', 'silver', 'knight', 'lance']
  goteBackRow.forEach((type, col) => {
    board[0][col] = createPiece(type, 'gote')
  })

  // 後手の飛車と角
  board[1][7] = createPiece('rook', 'gote')
  board[1][1] = createPiece('bishop', 'gote')

  // 後手の歩
  for (let col = 0; col < 9; col++) {
    board[2][col] = createPiece('pawn', 'gote')
  }

  // 先手の駒を配置（下側）
  const senteBackRow: PieceType[] = ['lance', 'knight', 'silver', 'gold', 'king', 'gold', 'silver', 'knight', 'lance']
  senteBackRow.forEach((type, col) => {
    board[8][col] = createPiece(type, 'sente')
  })

  // 先手の飛車と角
  board[7][1] = createPiece('rook', 'sente')
  board[7][7] = createPiece('bishop', 'sente')

  // 先手の歩
  for (let col = 0; col < 9; col++) {
    board[6][col] = createPiece('pawn', 'sente')
  }

  return board
}
