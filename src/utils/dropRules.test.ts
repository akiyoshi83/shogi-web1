import { describe, it, expect } from 'vitest'
import { canDropPiece } from './dropRules'
import type { Board } from '../types/shogi'

describe('Drop Rules', () => {
  let emptyBoard: Board

  beforeEach(() => {
    emptyBoard = Array(9).fill(null).map(() => Array(9).fill(null))
  })

  it('should allow dropping a piece on empty square', () => {
    expect(canDropPiece(emptyBoard, 'pawn', 'sente', 4, 4)).toBe(true)
  })

  it('should not allow dropping on occupied square', () => {
    emptyBoard[4][4] = { type: 'pawn', player: 'sente', isPromoted: false }
    expect(canDropPiece(emptyBoard, 'gold', 'sente', 4, 4)).toBe(false)
  })

  it('should not allow dropping pawn on same column if pawn exists', () => {
    emptyBoard[6][4] = { type: 'pawn', player: 'sente', isPromoted: false }
    expect(canDropPiece(emptyBoard, 'pawn', 'sente', 3, 4)).toBe(false)
  })

  it('should allow dropping pawn on column without pawn', () => {
    emptyBoard[6][4] = { type: 'pawn', player: 'sente', isPromoted: false }
    expect(canDropPiece(emptyBoard, 'pawn', 'sente', 3, 5)).toBe(true)
  })

  it('should allow dropping pawn if existing pawn is promoted', () => {
    emptyBoard[6][4] = { type: 'pawn', player: 'sente', isPromoted: true }
    expect(canDropPiece(emptyBoard, 'pawn', 'sente', 3, 4)).toBe(true)
  })

  it('should allow dropping opponent pawn on same column', () => {
    emptyBoard[6][4] = { type: 'pawn', player: 'sente', isPromoted: false }
    expect(canDropPiece(emptyBoard, 'pawn', 'gote', 3, 4)).toBe(true)
  })

  it('should not allow dropping pawn on first row for sente', () => {
    expect(canDropPiece(emptyBoard, 'pawn', 'sente', 0, 4)).toBe(false)
  })

  it('should not allow dropping pawn on last row for gote', () => {
    expect(canDropPiece(emptyBoard, 'pawn', 'gote', 8, 4)).toBe(false)
  })

  it('should not allow dropping lance on first row for sente', () => {
    expect(canDropPiece(emptyBoard, 'lance', 'sente', 0, 4)).toBe(false)
  })

  it('should not allow dropping knight on first two rows for sente', () => {
    expect(canDropPiece(emptyBoard, 'knight', 'sente', 0, 4)).toBe(false)
    expect(canDropPiece(emptyBoard, 'knight', 'sente', 1, 4)).toBe(false)
    expect(canDropPiece(emptyBoard, 'knight', 'sente', 2, 4)).toBe(true)
  })

  it('should allow dropping other pieces on any row', () => {
    expect(canDropPiece(emptyBoard, 'gold', 'sente', 0, 4)).toBe(true)
    expect(canDropPiece(emptyBoard, 'silver', 'sente', 0, 4)).toBe(true)
    expect(canDropPiece(emptyBoard, 'bishop', 'sente', 0, 4)).toBe(true)
    expect(canDropPiece(emptyBoard, 'rook', 'sente', 0, 4)).toBe(true)
  })
})
