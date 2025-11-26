import type { Player, PieceType } from '../types/shogi'

// 成ることができる駒
const PROMOTABLE_PIECES: PieceType[] = ['pawn', 'lance', 'knight', 'silver', 'bishop', 'rook']

// プレイヤーの成り可能ゾーン（敵陣）を取得
export function getPromotionZone(player: Player): number[] {
  return player === 'sente' ? [0, 1, 2] : [6, 7, 8]
}

// 駒が成れるかどうかを判定
export function canPromote(
  pieceType: PieceType,
  player: Player,
  fromRow: number,
  toRow: number
): boolean {
  // 成れない駒（王、金）
  if (!PROMOTABLE_PIECES.includes(pieceType)) {
    return false
  }

  const promotionZone = getPromotionZone(player)

  // 移動先または移動元が成りゾーンにあるか
  return promotionZone.includes(fromRow) || promotionZone.includes(toRow)
}
