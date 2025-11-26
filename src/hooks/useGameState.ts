import { useState, useCallback } from 'react'
import type { Board, Position, Player, GameState, CapturedPieces, PieceType } from '../types/shogi'
import { createInitialBoard } from '../utils/initialBoard'
import { getValidMoves } from '../utils/moveRules'
import { canPromote } from '../utils/promotion'
import { getDropPositions } from '../utils/dropRules'
import { isKingCaptured } from '../utils/checkmate'

const initialCapturedPieces: CapturedPieces = {
  pawn: 0,
  lance: 0,
  knight: 0,
  silver: 0,
  gold: 0,
  bishop: 0,
  rook: 0,
}

export function useGameState() {
  const [board, setBoard] = useState<Board>(createInitialBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('sente')
  const [capturedBySente, setCapturedBySente] = useState<CapturedPieces>(initialCapturedPieces)
  const [capturedByGote, setCapturedByGote] = useState<CapturedPieces>(initialCapturedPieces)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [selectedDropPiece, setSelectedDropPiece] = useState<PieceType | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)

  const selectDropPiece = useCallback((pieceType: PieceType) => {
    setSelectedPosition(null)
    setSelectedDropPiece(pieceType)
    setValidMoves(getDropPositions(board, pieceType, currentPlayer))
  }, [board, currentPlayer])

  const selectSquare = useCallback((position: Position) => {
    const piece = board[position.row][position.col]

    // 持ち駒が選択されている場合
    if (selectedDropPiece) {
      const isValidDrop = validMoves.some(
        move => move.row === position.row && move.col === position.col
      )

      if (isValidDrop) {
        const newBoard = board.map(row => [...row])
        newBoard[position.row][position.col] = {
          type: selectedDropPiece,
          player: currentPlayer,
          isPromoted: false
        }

        // 持ち駒を減らす
        if (currentPlayer === 'sente') {
          setCapturedBySente(prev => ({
            ...prev,
            [selectedDropPiece]: prev[selectedDropPiece] - 1
          }))
        } else {
          setCapturedByGote(prev => ({
            ...prev,
            [selectedDropPiece]: prev[selectedDropPiece] - 1
          }))
        }

        setBoard(newBoard)
        setSelectedDropPiece(null)
        setValidMoves([])

        // 勝敗判定
        const nextPlayer = currentPlayer === 'sente' ? 'gote' : 'sente'
        if (isKingCaptured(newBoard, nextPlayer)) {
          setIsGameOver(true)
          setWinner(currentPlayer)
        } else {
          setCurrentPlayer(nextPlayer)
        }
        return
      }

      // 無効な位置をクリックした場合は選択解除
      setSelectedDropPiece(null)
      setValidMoves([])
      return
    }

    // 同じマスをクリックした場合は選択解除
    if (
      selectedPosition &&
      selectedPosition.row === position.row &&
      selectedPosition.col === position.col
    ) {
      setSelectedPosition(null)
      setValidMoves([])
      return
    }

    // 駒が選択されている場合
    if (selectedPosition) {
      // 有効な移動先かチェック
      const isValidMove = validMoves.some(
        move => move.row === position.row && move.col === position.col
      )

      if (isValidMove) {
        // 駒を移動
        const newBoard = board.map(row => [...row])
        const movingPiece = newBoard[selectedPosition.row][selectedPosition.col]
        const capturedPiece = newBoard[position.row][position.col]

        if (!movingPiece) return

        // 駒を取った場合、持ち駒に追加（成り駒は成りを解除）
        if (capturedPiece) {
          const pieceType = capturedPiece.type
          if (currentPlayer === 'sente') {
            setCapturedBySente(prev => ({
              ...prev,
              [pieceType]: prev[pieceType] + 1
            }))
          } else {
            setCapturedByGote(prev => ({
              ...prev,
              [pieceType]: prev[pieceType] + 1
            }))
          }
        }

        // 成り判定
        const shouldPromote =
          !movingPiece.isPromoted &&
          canPromote(
            movingPiece.type,
            movingPiece.player,
            selectedPosition.row,
            position.row
          )

        // 成れる場合は確認
        if (shouldPromote && window.confirm('成りますか？')) {
          movingPiece.isPromoted = true
        }

        newBoard[position.row][position.col] = movingPiece
        newBoard[selectedPosition.row][selectedPosition.col] = null

        setBoard(newBoard)
        setSelectedPosition(null)
        setValidMoves([])

        // 勝敗判定
        const nextPlayer = currentPlayer === 'sente' ? 'gote' : 'sente'
        if (isKingCaptured(newBoard, nextPlayer)) {
          setIsGameOver(true)
          setWinner(currentPlayer)
        } else {
          setCurrentPlayer(nextPlayer)
        }
        return
      }
    }

    // 新しい駒を選択
    if (piece && piece.player === currentPlayer) {
      setSelectedPosition(position)
      setValidMoves(getValidMoves(board, position))
    } else {
      setSelectedPosition(null)
      setValidMoves([])
    }
  }, [board, selectedPosition, selectedDropPiece, validMoves, currentPlayer])

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard())
    setCurrentPlayer('sente')
    setCapturedBySente(initialCapturedPieces)
    setCapturedByGote(initialCapturedPieces)
    setSelectedPosition(null)
    setSelectedDropPiece(null)
    setValidMoves([])
    setIsGameOver(false)
    setWinner(null)
  }, [])

  return {
    board,
    currentPlayer,
    capturedBySente,
    capturedByGote,
    selectedPosition,
    selectedDropPiece,
    validMoves,
    isGameOver,
    winner,
    selectSquare,
    selectDropPiece,
    resetGame,
  }
}
