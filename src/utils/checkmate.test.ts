import { describe, it, expect } from 'vitest'
import { isKingCaptured } from './checkmate'
import type { Board } from '../types/shogi'

describe('Checkmate Detection', () => {
  describe('isKingCaptured', () => {
    it('should detect when sente king is captured', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      // 先手の王だけ配置（後手の王がない = 先手が後手の王を取った）
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }

      expect(isKingCaptured(board, 'gote')).toBe(true)
    })

    it('should detect when gote king is captured', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      // 後手の王だけ配置（先手の王がない = 後手が先手の王を取った）
      board[4][4] = { type: 'king', player: 'gote', isPromoted: false }

      expect(isKingCaptured(board, 'sente')).toBe(true)
    })

    it('should return false when both kings exist', () => {
      const board: Board = Array(9).fill(null).map(() => Array(9).fill(null))
      board[4][4] = { type: 'king', player: 'sente', isPromoted: false }
      board[0][4] = { type: 'king', player: 'gote', isPromoted: false }

      expect(isKingCaptured(board, 'sente')).toBe(false)
      expect(isKingCaptured(board, 'gote')).toBe(false)
    })
  })
})
