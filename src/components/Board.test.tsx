import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Board from './Board'
import { createInitialBoard } from '../utils/initialBoard'

describe('Board Component', () => {
  it('should render without crashing', () => {
    const board = createInitialBoard()
    render(
      <Board
        board={board}
        selectedPosition={null}
        validMoves={[]}
        onSquareClick={() => {}}
        isGameOver={false}
      />
    )
  })

  it('should render 81 squares (9x9)', () => {
    const board = createInitialBoard()
    const { container } = render(
      <Board
        board={board}
        selectedPosition={null}
        validMoves={[]}
        onSquareClick={() => {}}
        isGameOver={false}
      />
    )

    const squares = container.querySelectorAll('.square')
    expect(squares.length).toBe(81)
  })

  it('should display pieces in correct positions', () => {
    const board = createInitialBoard()
    render(
      <Board
        board={board}
        selectedPosition={null}
        validMoves={[]}
        onSquareClick={() => {}}
        isGameOver={false}
      />
    )

    // 駒が表示されているか確認（駒の文字で判定）
    expect(screen.getAllByText('玉')).toHaveLength(2) // 先手1 + 後手1
    expect(screen.getAllByText('歩')).toHaveLength(18) // 先手9 + 後手9
  })

  it('should highlight selected square', () => {
    const board = createInitialBoard()
    const selectedPosition = { row: 6, col: 4 }
    const { container } = render(
      <Board
        board={board}
        selectedPosition={selectedPosition}
        validMoves={[]}
        onSquareClick={() => {}}
        isGameOver={false}
      />
    )

    const squares = container.querySelectorAll('.square')
    const selectedSquare = squares[6 * 9 + 4]
    expect(selectedSquare.classList.contains('selected')).toBe(true)
  })

  it('should highlight valid move squares', () => {
    const board = createInitialBoard()
    const validMoves = [{ row: 5, col: 4 }]
    const { container } = render(
      <Board
        board={board}
        selectedPosition={null}
        validMoves={validMoves}
        onSquareClick={() => {}}
        isGameOver={false}
      />
    )

    const squares = container.querySelectorAll('.square')
    const validMoveSquare = squares[5 * 9 + 4]
    expect(validMoveSquare.classList.contains('valid-move')).toBe(true)
  })
})
