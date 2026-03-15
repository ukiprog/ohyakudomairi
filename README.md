# 御百度参り - Ohyakudomairi Web Game

日本の伝統的な神社参拝の習慣「百度参り」をブラウザで体験できる2Dゲームです。

## 遊び方

1. `index.html` をブラウザで開く
2. 名前と願い事を入力してゲーム開始
3. キャラクターを操作して **百度石** と **社殿** の間を100往復する
4. 100往復達成すると神様が登場し、願い事への祝福メッセージが表示される

## 操作方法

| 操作 | キーボード | タッチ |
|------|-----------|--------|
| 移動 | WASD / 矢印キー | 画面上の仮想Dパッド |

## 技術スタック

- HTML5 Canvas
- Web Audio API
- Vanilla JavaScript (ES6+)
- ビルドツール不要 — `index.html` をそのまま開くだけで動作

## ファイル構成

```
├── index.html
├── styles/
│   └── main.css
└── js/
    ├── main.js              # エントリーポイント
    ├── GameEngine.js        # ゲームループ
    ├── SceneManager.js      # シーン管理
    ├── TitleScene.js        # タイトル画面
    ├── GameScene.js         # メインゲーム画面
    ├── CompletionScene.js   # 完了画面
    ├── PlayerCharacter.js   # プレイヤー
    ├── ShrineEnvironment.js # 神社背景
    ├── HyakudoStone.js      # 百度石
    ├── MainHall.js          # 社殿
    ├── ProgressTracker.js   # 往復カウント
    ├── ProgressUI.js        # 進捗UI
    ├── AudioManager.js      # 音響
    ├── Deity.js             # 神様
    ├── CollisionDetector.js # 当たり判定
    ├── EnvironmentObject.js # 環境オブジェクト基底クラス
    ├── SpriteRenderer.js    # スプライト描画
    └── TouchControls.js     # タッチ操作
```

## デバッグ用コマンド（ブラウザコンソール）

```js
startGame()          // タイトルをスキップしてゲーム開始
setRoundTrips(99)    // 往復回数を任意の値に設定
```
