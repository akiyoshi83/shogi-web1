import { describe, it, expect } from 'vitest'
import type { Piece, Position, Square, Board } from './shogi'

describe('Shogi Types', () => {
  describe('Position', () => {
    it('should allow valid positions', () => {
      const position: Position = { row: 0, col: 0 }
      expect(position.row).toBe(0)
      expect(position.col).toBe(0)
    })
  })

  describe('Piece', () => {
    it('should create a piece with basic properties', () => {
      const piece: Piece = {
        type: 'pawn',
        player: 'sente',
        isPromoted: false
      }

      expect(piece.type).toBe('pawn')
      expect(piece.player).toBe('sente')
      expect(piece.isPromoted).toBe(false)
    })

    it('should create a promoted piece', () => {
      const piece: Piece = {
        type: 'pawn',
        player: 'gote',
        isPromoted: true
      }

      expect(piece.isPromoted).toBe(true)
    })
  })

  describe('Square', () => {
    it('should allow empty square', () => {
      const square: Square = null
      expect(square).toBeNull()
    })

    it('should allow square with a piece', () => {
      const square: Square = {
        type: 'king',
        player: 'sente',
        isPromoted: false
      }

      expect(square).not.toBeNull()
      expect(square?.type).toBe('king')
    })
  })

  describe('Board', () => {
    it('should create a 9x9 board', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))

      expect(board.length).toBe(9)
      expect(board[0].length).toBe(9)
    })
  })
})
