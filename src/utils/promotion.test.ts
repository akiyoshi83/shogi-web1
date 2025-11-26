import { describe, it, expect } from 'vitest'
import { canPromote, getPromotionZone } from './promotion'
import type { Player, PieceType } from '../types/shogi'

describe('Promotion', () => {
  describe('getPromotionZone', () => {
    it('should return rows 0-2 for sente promotion zone', () => {
      const zone = getPromotionZone('sente')
      expect(zone).toEqual([0, 1, 2])
    })

    it('should return rows 6-8 for gote promotion zone', () => {
      const zone = getPromotionZone('gote')
      expect(zone).toEqual([6, 7, 8])
    })
  })

  describe('canPromote', () => {
    const testCases: Array<{
      description: string
      pieceType: PieceType
      player: Player
      from: number
      to: number
      expected: boolean
    }> = [
      {
        description: 'sente pawn entering enemy zone',
        pieceType: 'pawn',
        player: 'sente',
        from: 3,
        to: 2,
        expected: true,
      },
      {
        description: 'sente pawn already in enemy zone',
        pieceType: 'pawn',
        player: 'sente',
        from: 2,
        to: 1,
        expected: true,
      },
      {
        description: 'sente pawn not in enemy zone',
        pieceType: 'pawn',
        player: 'sente',
        from: 5,
        to: 4,
        expected: false,
      },
      {
        description: 'gote pawn entering enemy zone',
        pieceType: 'pawn',
        player: 'gote',
        from: 5,
        to: 6,
        expected: true,
      },
      {
        description: 'king cannot promote',
        pieceType: 'king',
        player: 'sente',
        from: 3,
        to: 2,
        expected: false,
      },
      {
        description: 'gold cannot promote',
        pieceType: 'gold',
        player: 'sente',
        from: 3,
        to: 2,
        expected: false,
      },
      {
        description: 'rook can promote',
        pieceType: 'rook',
        player: 'sente',
        from: 3,
        to: 2,
        expected: true,
      },
      {
        description: 'bishop can promote',
        pieceType: 'bishop',
        player: 'sente',
        from: 3,
        to: 2,
        expected: true,
      },
    ]

    testCases.forEach(({ description, pieceType, player, from, to, expected }) => {
      it(description, () => {
        const result = canPromote(pieceType, player, from, to)
        expect(result).toBe(expected)
      })
    })
  })
})
