import { describe, it, expect } from 'vitest'
import { getValidMoves } from './moveRules'
import { createInitialBoard } from './initialBoard'
import type { Board, Position } from '../types/shogi'

describe('Move Rules', () => {
  describe('Pawn (歩)', () => {
    it('should move forward one square for sente', () => {
      const board = createInitialBoard()
      const from: Position = { row: 6, col: 4 }
      const moves = getValidMoves(board, from)

      expect(moves).toHaveLength(1)
      expect(moves[0]).toEqual({ row: 5, col: 4 })
    })

    it('should move forward one square for gote', () => {
      const board = createInitialBoard()
      const from: Position = { row: 2, col: 4 }
      const moves = getValidMoves(board, from)

      expect(moves).toHaveLength(1)
      expect(moves[0]).toEqual({ row: 3, col: 4 })
    })

    it('should not move when blocked by own piece', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[5][4] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[4][4] = { type: 'gold', player: 'sente', isPromoted: false }

      const moves = getValidMoves(board, { row: 5, col: 4 })
      expect(moves).toHaveLength(0)
    })

    it('should capture opponent piece', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[5][4] = { type: 'pawn', player: 'sente', isPromoted: false }
      board[4][4] = { type: 'pawn', player: 'gote', isPromoted: false }

      const moves = getValidMoves(board, { row: 5, col: 4 })
      expect(moves).toHaveLength(1)
      expect(moves[0]).toEqual({ row: 4, col: 4 })
    })
  })

  describe('King (玉)', () => {
    it('should move in all 8 directions', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }

      const moves = getValidMoves(board, { row: 4, col: 4 })
      expect(moves).toHaveLength(8)

      const expectedMoves = [
        { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
        { row: 4, col: 3 },                     { row: 4, col: 5 },
        { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
      ]

      expectedMoves.forEach(expected => {
        expect(moves).toContainEqual(expected)
      })
    })
  })

  describe('Gold (金)', () => {
    it('should move in 6 directions (not diagonal back)', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[4][4] = { type: 'gold', player: 'sente', isPromoted: false }

      const moves = getValidMoves(board, { row: 4, col: 4 })
      expect(moves).toHaveLength(6)

      const expectedMoves = [
        { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
        { row: 4, col: 3 },                     { row: 4, col: 5 },
                            { row: 5, col: 4 },
      ]

      expectedMoves.forEach(expected => {
        expect(moves).toContainEqual(expected)
      })
    })
  })

  describe('Rook (飛)', () => {
    it('should move horizontally and vertically any number of squares', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[4][4] = { type: 'rook', player: 'sente', isPromoted: false }

      const moves = getValidMoves(board, { row: 4, col: 4 })

      // 上下左右の合計（4+4+4+4=16マス）
      expect(moves.length).toBeGreaterThan(10)

      // 縦方向
      expect(moves).toContainEqual({ row: 0, col: 4 })
      expect(moves).toContainEqual({ row: 8, col: 4 })

      // 横方向
      expect(moves).toContainEqual({ row: 4, col: 0 })
      expect(moves).toContainEqual({ row: 4, col: 8 })
    })

    it('should stop at own piece', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[4][4] = { type: 'rook', player: 'sente', isPromoted: false }
      board[4][6] = { type: 'pawn', player: 'sente', isPromoted: false }

      const moves = getValidMoves(board, { row: 4, col: 4 })

      // 右方向は col:5 まで（col:6に自分の駒がある）
      expect(moves).toContainEqual({ row: 4, col: 5 })
      expect(moves).not.toContainEqual({ row: 4, col: 6 })
      expect(moves).not.toContainEqual({ row: 4, col: 7 })
    })
  })

  describe('Bishop (角)', () => {
    it('should move diagonally any number of squares', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[4][4] = { type: 'bishop', player: 'sente', isPromoted: false }

      const moves = getValidMoves(board, { row: 4, col: 4 })

      // 斜め4方向
      expect(moves).toContainEqual({ row: 0, col: 0 })
      expect(moves).toContainEqual({ row: 0, col: 8 })
      expect(moves).toContainEqual({ row: 8, col: 0 })
      expect(moves).toContainEqual({ row: 8, col: 8 })
    })
  })
})
