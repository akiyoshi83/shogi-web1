import { describe, it, expect } from 'vitest'
import { createInitialBoard } from './initialBoard'
import type { Board } from '../types/shogi'

describe('createInitialBoard', () => {
  let board: Board

  beforeEach(() => {
    board = createInitialBoard()
  })

  it('should create a 9x9 board', () => {
    expect(board.length).toBe(9)
    expect(board[0].length).toBe(9)
  })

  it('should place sente king at correct position', () => {
    const king = board[8][4]
    expect(king).not.toBeNull()
    expect(king?.type).toBe('king')
    expect(king?.player).toBe('sente')
  })

  it('should place gote king at correct position', () => {
    const king = board[0][4]
    expect(king).not.toBeNull()
    expect(king?.type).toBe('king')
    expect(king?.player).toBe('gote')
  })

  it('should place sente rook at correct position', () => {
    const rook = board[7][1]
    expect(rook).not.toBeNull()
    expect(rook?.type).toBe('rook')
    expect(rook?.player).toBe('sente')
  })

  it('should place gote rook at correct position', () => {
    const rook = board[1][7]
    expect(rook).not.toBeNull()
    expect(rook?.type).toBe('rook')
    expect(rook?.player).toBe('gote')
  })

  it('should place sente bishop at correct position', () => {
    const bishop = board[7][7]
    expect(bishop).not.toBeNull()
    expect(bishop?.type).toBe('bishop')
    expect(bishop?.player).toBe('sente')
  })

  it('should place gote bishop at correct position', () => {
    const bishop = board[1][1]
    expect(bishop).not.toBeNull()
    expect(bishop?.type).toBe('bishop')
    expect(bishop?.player).toBe('gote')
  })

  it('should place all sente pawns in the third row', () => {
    for (let col = 0; col < 9; col++) {
      const pawn = board[6][col]
      expect(pawn).not.toBeNull()
      expect(pawn?.type).toBe('pawn')
      expect(pawn?.player).toBe('sente')
    }
  })

  it('should place all gote pawns in the seventh row', () => {
    for (let col = 0; col < 9; col++) {
      const pawn = board[2][col]
      expect(pawn).not.toBeNull()
      expect(pawn?.type).toBe('pawn')
      expect(pawn?.player).toBe('gote')
    }
  })

  it('should have no pieces in the middle rows', () => {
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col < 9; col++) {
        expect(board[row][col]).toBeNull()
      }
    }
  })

  it('should place all pieces as not promoted', () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col]) {
          expect(board[row][col]?.isPromoted).toBe(false)
        }
      }
    }
  })
})
