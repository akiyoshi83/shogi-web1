# Issue #4: 詰み判定の実装計画

## 背景

現状の勝敗判定は「盤上に王が存在するか」(`isKingCaptured`) で行っている。
本来は「詰み」（王手を掛けられており、それを逃れる手段がない状態）で判定すべき。

## 変更概要

詰み判定を正しく実装するには以下の3つの概念が必要：

1. **王手 (Check)**: 相手の駒が自分の王を攻撃している状態
2. **合法手フィルタリング**: 自玉を王手状態にする手は指せない（自殺手の禁止）
3. **詰み (Checkmate)**: 王手を掛けられており、合法手が一つも存在しない状態

## 実装ステップ

### Step 1: `checkmate.ts` にコア判定関数を追加

既存の `isKingCaptured` を残しつつ（後方互換）、以下の関数を追加する。

#### 1-1. `findKingPosition(board, player): Position | null`
- 指定プレイヤーの王の位置を返す

#### 1-2. `isSquareAttackedBy(board, position, attacker): boolean`
- 指定マスが `attacker` の駒によって攻撃されているか判定
- 実装: 全ての `attacker` の駒について `getValidMoves` を呼び、`position` が含まれるか確認
  - 注意: `getValidMoves` は「味方駒を取れない」フィルタ付きだが、攻撃判定には問題ない（王のマスは敵駒なので移動先に含まれる）

#### 1-3. `isInCheck(board, player): boolean`
- `player` の王が王手されているかを判定
- `findKingPosition` + `isSquareAttackedBy` を組み合わせる

#### 1-4. `wouldBeInCheck(board, from, to, player): boolean`
- `from` → `to` への移動をシミュレートし、移動後に自玉が王手になるか判定
- 盤面のコピーを作り、移動を実行し、`isInCheck` で確認

#### 1-5. `wouldBeInCheckAfterDrop(board, pieceType, to, player): boolean`
- 持ち駒の打ち込みをシミュレートし、打った後に自玉が王手になるか判定

#### 1-6. `getLegalMoves(board, from): Position[]`
- `getValidMoves` の結果から、自玉を王手に晒す手を除外
- `getValidMoves(board, from)` の各移動先について `wouldBeInCheck` でフィルタ

#### 1-7. `getLegalDropPositions(board, pieceType, player): Position[]`
- `getDropPositions` の結果から、自玉を王手に晒す打ち込みを除外

#### 1-8. `isCheckmate(board, player, capturedPieces): boolean`
- `player` が詰みかどうかを判定
- 条件: 王手されている AND 合法手が一つも存在しない
  - `player` の全ての駒の合法手を列挙（`getLegalMoves`）
  - `player` の全ての持ち駒の合法な打ち込み先を列挙（`getLegalDropPositions`）
  - いずれも空なら詰み

### Step 2: `useGameState.ts` の更新

#### 2-1. 駒選択時の合法手表示
- `getValidMoves` → `getLegalMoves` に差し替え
- `getDropPositions` → `getLegalDropPositions` に差し替え

#### 2-2. 勝敗判定の変更
- `isKingCaptured(newBoard, nextPlayer)` → `isCheckmate(newBoard, nextPlayer, capturedPieces)` に差し替え
- 持ち駒の情報も渡す必要がある（詰み判定に打ち込み可能性を考慮するため）

#### 2-3. 王手表示（任意・UI改善）
- `isInCheck` を使い、現在のプレイヤーが王手状態であることを表示可能にする
- `useGameState` の返り値に `isInCheck` 状態を追加

### Step 3: テストの追加・更新

#### 3-1. `checkmate.test.ts` に新規テストを追加
- `findKingPosition`: 王の位置の正確な取得
- `isInCheck`: 各種駒による王手の検出（飛車、角、金など）
- `isInCheck`: 王手でない状態の確認
- `wouldBeInCheck`: 移動後の自玉王手判定
- `getLegalMoves`: 王手状態で合法手のみ返されること
- `isCheckmate`: 基本的な詰みパターン（頭金、逃げ道なしなど）
- `isCheckmate`: 詰みでないパターン（逃げ道あり、合駒可能、王手駒取り可能）

#### 3-2. `useGameState.test.ts` の更新
- 詰み判定でゲームが終了するテストケース
- 合法手フィルタリングが正しく動作するテスト

### Step 4: 既存テストの修正
- 既存のテストが新しいロジックで壊れないことを確認
- 必要に応じて修正

## ファイル変更一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/utils/checkmate.ts` | 王手・詰み判定関数の追加 |
| `src/utils/checkmate.test.ts` | 新規テストケースの追加 |
| `src/hooks/useGameState.ts` | 合法手フィルタ・詰み判定への切り替え |
| `src/hooks/useGameState.test.ts` | テストの更新 |

## 注意点

- `isSquareAttackedBy` の実装で `getValidMoves` を使う際、循環参照にならないよう注意（`checkmate.ts` が `moveRules.ts` をインポート、逆方向の依存はない）
- 持ち駒の打ち歩詰め（打ち歩で詰ませることの禁止）は今回のスコープ外とする（将来的に別Issueで対応）
- パフォーマンス: 毎手ごとに全駒の合法手を計算するため、計算量は増えるが、9x9盤面では問題ないレベル
