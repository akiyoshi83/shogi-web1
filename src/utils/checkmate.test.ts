import { describe, it, expect } from 'vitest'
import { isKingCaptured, findKingPosition, isSquareAttackedBy, isInCheck, getLegalMoves, getLegalDropPositions, isCheckmate } from './checkmate'
import type { Board, CapturedPieces } from '../types/shogi'

function emptyBoard(): Board {
  return Array(9).fill(null).map(() => Array(9).fill(null))
}

const emptyCaptured: CapturedPieces = {
  pawn: 0, lance: 0, knight: 0, silver: 0, gold: 0, bishop: 0, rook: 0,
}

describe('Checkmate Detection', () => {
  describe('isKingCaptured', () => {
    it('should detect when sente king is captured', () => {
      const board = emptyBoard()
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }

      expect(isKingCaptured(board, 'gote')).toBe(true)
    })

    it('should detect when gote king is captured', () => {
      const board = emptyBoard()
      board[4][4] = { type: 'king', player: 'gote', isPromoted: false }

      expect(isKingCaptured(board, 'sente')).toBe(true)
    })

    it('should return false when both kings exist', () => {
      const board = emptyBoard()
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'king', player: 'gote', isPromoted: false }

      expect(isKingCaptured(board, 'sente')).toBe(false)
      expect(isKingCaptured(board, 'gote')).toBe(false)
    })
  })

  describe('findKingPosition', () => {
    it('should find sente king position', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }

      expect(findKingPosition(board, 'sente')).toEqual({ row: 8, col: 4 })
    })

    it('should find gote king position', () => {
      const board = emptyBoard()
      board[0][4] = { type: 'king', player: 'gote', isPromoted: false }

      expect(findKingPosition(board, 'gote')).toEqual({ row: 0, col: 4 })
    })

    it('should return null when king does not exist', () => {
      const board = emptyBoard()

      expect(findKingPosition(board, 'sente')).toBeNull()
    })
  })

  describe('isSquareAttackedBy', () => {
    it('should detect attack by rook', () => {
      const board = emptyBoard()
      board[4][0] = { type: 'rook', player: 'gote', isPromoted: false }

      expect(isSquareAttackedBy(board, { row: 4, col: 4 }, 'gote')).toBe(true)
    })

    it('should detect attack by bishop', () => {
      const board = emptyBoard()
      board[2][2] = { type: 'bishop', player: 'gote', isPromoted: false }

      expect(isSquareAttackedBy(board, { row: 4, col: 4 }, 'gote')).toBe(true)
    })

    it('should detect attack by gold', () => {
      const board = emptyBoard()
      // 後手の金が(5,4)にいる場合、(4,4)を攻撃できる（後手にとって前方は+1方向）
      board[5][4] = { type: 'gold', player: 'gote', isPromoted: false }

      expect(isSquareAttackedBy(board, { row: 4, col: 4 }, 'gote')).toBe(true)
    })

    it('should not detect attack when blocked', () => {
      const board = emptyBoard()
      board[4][0] = { type: 'rook', player: 'gote', isPromoted: false }
      board[4][2] = { type: 'pawn', player: 'sente', isPromoted: false } // 間に駒がある

      expect(isSquareAttackedBy(board, { row: 4, col: 4 }, 'gote')).toBe(false)
    })

    it('should not detect attack from own pieces', () => {
      const board = emptyBoard()
      board[4][0] = { type: 'rook', player: 'sente', isPromoted: false }

      expect(isSquareAttackedBy(board, { row: 4, col: 4 }, 'gote')).toBe(false)
    })
  })

  describe('isInCheck', () => {
    it('should detect check by rook', () => {
      const board = emptyBoard()
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[4][0] = { type: 'rook', player: 'gote', isPromoted: false }

      expect(isInCheck(board, 'sente')).toBe(true)
    })

    it('should detect check by pawn', () => {
      const board = emptyBoard()
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }
      // 後手の歩が(3,4)にいる → 後手の歩は下方向(+1)に進むので(4,4)を攻撃
      board[3][4] = { type: 'pawn', player: 'gote', isPromoted: false }

      expect(isInCheck(board, 'sente')).toBe(true)
    })

    it('should return false when not in check', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][0] = { type: 'rook', player: 'gote', isPromoted: false }

      expect(isInCheck(board, 'sente')).toBe(false)
    })

    it('should return false when king does not exist', () => {
      const board = emptyBoard()

      expect(isInCheck(board, 'sente')).toBe(false)
    })
  })

  describe('getLegalMoves', () => {
    it('should not allow pinned pieces to expose king', () => {
      const board = emptyBoard()
      // 先手の王が(8,4)、後手の飛車が(0,4)で縦のライン
      // 先手の銀が(5,4)にいて飛車の利きをブロックしている（ピン状態）
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      board[5][4] = { type: 'silver', player: 'sente', isPromoted: false }

      const moves = getLegalMoves(board, { row: 5, col: 4 })
      // ピンされた駒は王を危険にさらす手は打てない
      // 銀は(4,4)にのみ移動可能（4列目に留まり飛車の利きをブロック）
      expect(moves).toEqual([{ row: 4, col: 4 }])
    })

    it('should filter king moves into check', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }

      const moves = getLegalMoves(board, { row: 8, col: 4 })
      // 王は4列目（飛車の利き）以外に移動する必要がある
      for (const move of moves) {
        expect(move.col).not.toBe(4)
      }
      expect(moves.length).toBeGreaterThan(0)
    })

    it('should allow non-king pieces to move freely when not pinned', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[4][4] = { type: 'rook', player: 'sente', isPromoted: false }

      const moves = getLegalMoves(board, { row: 4, col: 4 })
      // ピンされていない飛車は通常通り移動可能
      expect(moves.length).toBeGreaterThan(0)
    })

    it('should only allow check-resolving moves when in check', () => {
      const board = emptyBoard()
      // 先手の王が(8,4)、後手の飛車が(0,4)で王手
      // 先手の飛車が(5,0)にいて(5,4)に移動して王手をブロックできる
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      board[5][0] = { type: 'rook', player: 'sente', isPromoted: false }

      const moves = getLegalMoves(board, { row: 5, col: 0 })
      // 王手中なので、王手を解消する手のみ許可される
      // 飛車は(5,4)に移動して合駒することでのみ王手を解消できる
      expect(moves).toEqual([{ row: 5, col: 4 }])
    })
  })

  describe('getLegalDropPositions', () => {
    it('should return all valid drop positions when not in check', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][0] = { type: 'rook', player: 'gote', isPromoted: false }
      // 王手されていない場合、通常の打ち込みルールに従う
      const drops = getLegalDropPositions(board, 'gold', 'sente')
      // 空きマス全てに打てる（金なので行制限なし）
      expect(drops.length).toBeGreaterThan(0)
    })

    it('should only allow drops that resolve check when in check', () => {
      const board = emptyBoard()
      // 先手の王が(8,4)、後手の飛車が(0,4)で王手
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      // 王の逃げ道を塞ぐ
      board[8][3] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[8][5] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[7][3] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[7][5] = { type: 'pawn', player: 'sente', isPromoted: false }

      const drops = getLegalDropPositions(board, 'gold', 'sente')
      // 王手を解消する打ち込みのみ許可される（4列目の王と飛車の間に合駒）
      expect(drops.length).toBeGreaterThan(0)
      expect(drops.every(d => d.col === 4)).toBe(true)
      // 飛車(0,4)と王(8,4)の間のマスのみ
      expect(drops.every(d => d.row > 0 && d.row < 8)).toBe(true)
    })
  })

  describe('isCheckmate', () => {
    it('should detect head gold checkmate (頭金の詰み)', () => {
      const board = emptyBoard()
      // 後手の王が(0,4)にいる
      board[0][4] = { type: 'king', player: 'gote', isPromoted: false }
      // 先手の金が(1,4)で王手（頭金）
      board[1][4] = { type: 'gold', player: 'sente', isPromoted: false }
      // 先手の金がもう1枚(1,3)で逃げ道を塞ぐ
      board[1][3] = { type: 'gold', player: 'sente', isPromoted: false }
      // 先手の金がもう1枚(1,5)で逃げ道を塞ぐ
      board[1][5] = { type: 'gold', player: 'sente', isPromoted: false }

      expect(isCheckmate(board, 'gote', emptyCaptured)).toBe(true)
    })

    it('should not be checkmate when king can escape', () => {
      const board = emptyBoard()
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      // 王は左右に逃げられる

      expect(isCheckmate(board, 'sente', emptyCaptured)).toBe(false)
    })

    it('should not be checkmate when a piece can block', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      // 先手の飛車が(5,0)にいる → (5,4)に移動して王手をブロックできる
      board[5][0] = { type: 'rook', player: 'sente', isPromoted: false }
      // 逃げ道も塞ぐが、合駒が可能
      board[8][3] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[8][5] = { type: 'pawn', player: 'sente', isPromoted: false }

      expect(isCheckmate(board, 'sente', emptyCaptured)).toBe(false)
    })

    it('should not be checkmate when checking piece can be captured', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      // 後手の金が(7,4)で王手
      board[7][4] = { type: 'gold', player: 'gote', isPromoted: false }
      // 先手の王が(7,4)の金を取れる
      // 周囲を塞いで王が取る以外の逃げ道をなくす
      board[8][3] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[8][5] = { type: 'pawn', player: 'sente', isPromoted: false }

      expect(isCheckmate(board, 'sente', emptyCaptured)).toBe(false)
    })

    it('should not be checkmate when a drop can block check', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      // 王の左右を塞ぐ
      board[8][3] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[8][5] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[7][3] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[7][5] = { type: 'pawn', player: 'sente', isPromoted: false }

      // 持ち駒に歩があれば、間に打って王手を防げる
      const capturedWithPawn = { ...emptyCaptured, pawn: 1 }
      expect(isCheckmate(board, 'sente', capturedWithPawn)).toBe(false)
    })

    it('should not be checkmate when not in check', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][0] = { type: 'rook', player: 'gote', isPromoted: false }

      expect(isCheckmate(board, 'sente', emptyCaptured)).toBe(false)
    })

    it('should detect checkmate with no escape and no blockers', () => {
      const board = emptyBoard()
      // 後手の王が隅にいる
      board[0][0] = { type: 'king', player: 'gote', isPromoted: false }
      // 先手の飛車が(0,8)と(1,8)で1段目と2段目を制圧
      board[0][8] = { type: 'rook', player: 'sente', isPromoted: false }
      board[1][8] = { type: 'rook', player: 'sente', isPromoted: false }

      // (0,0)の王は0段目が飛車(0,8)に支配され、1段目が飛車(1,8)に支配
      // 逃げ場なし
      expect(isCheckmate(board, 'gote', emptyCaptured)).toBe(true)
    })
  })
})
