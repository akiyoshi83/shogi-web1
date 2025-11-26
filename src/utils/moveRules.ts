import type { Board, Position, Piece, PieceType, Player } from '../types/shogi'

// 位置が盤面内かチェック
function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 9 && pos.col >= 0 && pos.col < 9
}

// 指定位置に移動可能かチェック（自分の駒がない）
function canMoveTo(board: Board, pos: Position, player: Player): boolean {
  if (!isValidPosition(pos)) return false
  const target = board[pos.row][pos.col]
  return target === null || target.player !== player
}

// 直線方向の移動を取得（飛車・香車用）
function getLineMoves(
  board: Board,
  from: Position,
  piece: Piece,
  directions: { row: number; col: number }[]
): Position[] {
  const moves: Position[] = []

  for (const dir of directions) {
    let current = { row: from.row + dir.row, col: from.col + dir.col }

    while (isValidPosition(current)) {
      const target = board[current.row][current.col]

      if (target === null) {
        moves.push({ ...current })
      } else if (target.player !== piece.player) {
        moves.push({ ...current })
        break
      } else {
        break
      }

      current = { row: current.row + dir.row, col: current.col + dir.col }
    }
  }

  return moves
}

// 単一マスの移動を取得（王・金・銀用）
function getSingleMoves(
  board: Board,
  from: Position,
  piece: Piece,
  offsets: { row: number; col: number }[]
): Position[] {
  const moves: Position[] = []

  for (const offset of offsets) {
    const target: Position = {
      row: from.row + offset.row,
      col: from.col + offset.col
    }

    if (canMoveTo(board, target, piece.player)) {
      moves.push(target)
    }
  }

  return moves
}

// 各駒の移動ルール
function getPawnMoves(board: Board, from: Position, piece: Piece): Position[] {
  const forward = piece.player === 'sente' ? -1 : 1
  const target: Position = { row: from.row + forward, col: from.col }

  return canMoveTo(board, target, piece.player) ? [target] : []
}

function getLanceMoves(board: Board, from: Position, piece: Piece): Position[] {
  const forward = piece.player === 'sente' ? -1 : 1
  return getLineMoves(board, from, piece, [{ row: forward, col: 0 }])
}

function getKnightMoves(board: Board, from: Position, piece: Piece): Position[] {
  const forward = piece.player === 'sente' ? -2 : 2
  const offsets = [
    { row: forward, col: -1 },
    { row: forward, col: 1 }
  ]

  return getSingleMoves(board, from, piece, offsets)
}

function getSilverMoves(board: Board, from: Position, piece: Piece): Position[] {
  const forward = piece.player === 'sente' ? -1 : 1
  const offsets = [
    { row: forward, col: -1 },
    { row: forward, col: 0 },
    { row: forward, col: 1 },
    { row: -forward, col: -1 },
    { row: -forward, col: 1 }
  ]

  return getSingleMoves(board, from, piece, offsets)
}

function getGoldMoves(board: Board, from: Position, piece: Piece): Position[] {
  const forward = piece.player === 'sente' ? -1 : 1
  const offsets = [
    { row: forward, col: -1 },
    { row: forward, col: 0 },
    { row: forward, col: 1 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    { row: -forward, col: 0 }
  ]

  return getSingleMoves(board, from, piece, offsets)
}

function getBishopMoves(board: Board, from: Position, piece: Piece): Position[] {
  const directions = [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 }
  ]

  return getLineMoves(board, from, piece, directions)
}

function getRookMoves(board: Board, from: Position, piece: Piece): Position[] {
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ]

  return getLineMoves(board, from, piece, directions)
}

function getKingMoves(board: Board, from: Position, piece: Piece): Position[] {
  const offsets = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
  ]

  return getSingleMoves(board, from, piece, offsets)
}

// 成り駒の移動
function getPromotedMoves(board: Board, from: Position, piece: Piece): Position[] {
  // 成り歩、成り香、成り桂、成り銀は金と同じ動き
  if (['pawn', 'lance', 'knight', 'silver'].includes(piece.type)) {
    return getGoldMoves(board, from, piece)
  }

  // 成り角（竜馬）：角の動き + 縦横1マス
  if (piece.type === 'bishop') {
    const bishopMoves = getBishopMoves(board, from, piece)
    const extraMoves = getSingleMoves(board, from, piece, [
      { row: -1, col: 0 }, { row: 1, col: 0 },
      { row: 0, col: -1 }, { row: 0, col: 1 }
    ])
    return [...bishopMoves, ...extraMoves]
  }

  // 成り飛（竜王）：飛車の動き + 斜め1マス
  if (piece.type === 'rook') {
    const rookMoves = getRookMoves(board, from, piece)
    const extraMoves = getSingleMoves(board, from, piece, [
      { row: -1, col: -1 }, { row: -1, col: 1 },
      { row: 1, col: -1 }, { row: 1, col: 1 }
    ])
    return [...rookMoves, ...extraMoves]
  }

  return []
}

// 指定位置の駒の有効な移動先を取得
export function getValidMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col]
  if (!piece) return []

  // 成り駒の場合
  if (piece.isPromoted) {
    return getPromotedMoves(board, from, piece)
  }

  // 通常の駒
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, from, piece)
    case 'lance':
      return getLanceMoves(board, from, piece)
    case 'knight':
      return getKnightMoves(board, from, piece)
    case 'silver':
      return getSilverMoves(board, from, piece)
    case 'gold':
      return getGoldMoves(board, from, piece)
    case 'bishop':
      return getBishopMoves(board, from, piece)
    case 'rook':
      return getRookMoves(board, from, piece)
    case 'king':
      return getKingMoves(board, from, piece)
    default:
      return []
  }
}
