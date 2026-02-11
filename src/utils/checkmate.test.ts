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
    it('should filter moves that leave king in check', () => {
      const board = emptyBoard()
      // 先手の王が(8,4)、後手の飛車が(0,4)で縦に王手
      // 先手の銀が(5,4)にいる場合、銀を動かすと王手が通るので動かせない
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      board[5][4] = { type: 'silver', player: 'sente', isPromoted: false }

      const moves = getLegalMoves(board, { row: 5, col: 4 })
      // 銀を4列目から動かすと飛車の利きが王に通る → 4列目に留まる手のみ合法
      // ただし(4,4)に移動すれば飛車の利きをブロックし続けるので合法
      for (const move of moves) {
        expect(move.col).toBe(4)
      }
    })

    it('should allow king to escape check', () => {
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
  })

  describe('getLegalDropPositions', () => {
    it('should filter drops that do not resolve check', () => {
      const board = emptyBoard()
      board[8][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'rook', player: 'gote', isPromoted: false }
      // 先手が歩を持っている場合、飛車と王の間に打てば王手を防げる
      const drops = getLegalDropPositions(board, 'pawn', 'sente')
      // 合法な打ち込みは4列目（飛車の利きをブロックする位置）のみ
      for (const drop of drops) {
        expect(drop.col).toBe(4)
      }
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
