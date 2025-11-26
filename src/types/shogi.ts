// 駒の種類
export type PieceType =
  | 'pawn'      // 歩
  | 'lance'     // 香
  | 'knight'    // 桂
  | 'silver'    // 銀
  | 'gold'      // 金
  | 'bishop'    // 角
  | 'rook'      // 飛
  | 'king'      // 玉

// プレイヤー
export type Player = 'sente' | 'gote'  // 先手 | 後手

// 駒
export interface Piece {
  type: PieceType
  player: Player
  isPromoted: boolean
}

// 盤上の位置
export interface Position {
  row: number  // 0-8
  col: number  // 0-8
}

// マス（駒があるかnull）
export type Square = Piece | null

// 盤面（9x9）
export type Board = Square[][]

// 持ち駒
export interface CapturedPieces {
  pawn: number
  lance: number
  knight: number
  silver: number
  gold: number
  bishop: number
  rook: number
}

// ゲームの状態
export interface GameState {
  board: Board
  currentPlayer: Player
  capturedBySente: CapturedPieces
  capturedByGote: CapturedPieces
  selectedPosition: Position | null
  validMoves: Position[]
  isGameOver: boolean
  winner: Player | null
}

// 移動
export interface Move {
  from: Position | null  // nullの場合は持ち駒からの打ち込み
  to: Position
  piece: Piece
  isCapture: boolean
  capturedPiece?: Piece
}
