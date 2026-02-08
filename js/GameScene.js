/**
 * GameScene - メインゲームシーン（テスト用の基本実装）
 * プレイヤーキャラクターのテスト用シーン
 */
class GameScene extends Scene {
    constructor() {
        super('game');
        
        // プレイヤーキャラクター
        this.player = null;
        
        // ゲームデータ
        this.playerName = '';
        this.playerWish = '';
        
        // テスト用の背景色
        this.backgroundColor = '#2c3e50';
        
        console.log('GameScene created');
    }
    
    /**
     * シーンの初期化
     */
    init() {
        super.init();
        
        // プレイヤーキャラクターを作成（画面中央に配置）
        this.player = new PlayerCharacter(400 - 16, 300 - 16); // 32x32なので中央に配置するため16ピクセルずらす
        this.player.setBounds(0, 0, 800, 600);
        this.player.setDebugDisplay(true); // テスト用にデバッグ表示を有効化
        
        console.log('GameScene initialized');
    }
    
    /**
     * シーンがアクティブになった時の処理
     */
    onEnter() {
        super.onEnter();
        
        // プレイヤーの入力リスナーを設定
        if (this.player) {
            this.player.setupInputListeners();
        }
        
        console.log('GameScene entered');
    }
    
    /**
     * シーンが非アクティブになった時の処理
     */
    onExit() {
        super.onExit();
        
        // プレイヤーの入力リスナーを削除
        if (this.player) {
            this.player.removeInputListeners();
        }
        
        console.log('GameScene exited');
    }
    
    /**
     * TitleSceneからのデータを設定
     * @param {Object} data - プレイヤーデータ
     */
    setData(data) {
        if (data) {
            this.playerName = data.playerName || '';
            this.playerWish = data.playerWish || '';
            console.log('GameScene data set:', data);
        }
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // プレイヤーキャラクターの更新
        if (this.player) {
            this.player.update(deltaTime);
        }
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        // 背景の描画
        this.renderBackground(context);
        
        // UI情報の描画
        this.renderUI(context);
        
        // プレイヤーキャラクターの描画
        if (this.player) {
            this.player.render(context);
        }
        
        // 操作説明の描画
        this.renderInstructions(context);
    }
    
    /**
     * 背景の描画
     */
    renderBackground(context) {
        // シンプルなグラデーション背景
        const gradient = context.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#34495e');
        gradient.addColorStop(1, '#2c3e50');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 800, 600);
        
        // 簡単な神社風の装飾
        this.renderSimpleShrine(context);
    }
    
    /**
     * 簡単な神社風装飾の描画
     */
    renderSimpleShrine(context) {
        // 地面
        context.fillStyle = '#27ae60';
        context.fillRect(0, 500, 800, 100);
        
        // 社殿（上部）- 2倍サイズ
        context.fillStyle = '#e74c3c';
        context.fillRect(300, 60, 200, 160);
        context.fillStyle = '#c0392b';
        context.fillRect(280, 40, 240, 40);
        context.fillStyle = '#7f8c8d';
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText('社殿', 400, 20);
        
        // 百度石（下部）- 2倍サイズ
        context.fillStyle = '#95a5a6';
        context.fillRect(370, 460, 60, 100);
        context.fillStyle = '#7f8c8d';
        context.fillText('百度石', 400, 440);
        
        // 参道（縦方向）- 幅も調整
        context.fillStyle = '#bdc3c7';
        context.fillRect(380, 220, 40, 240);
        
        // 参道の両脇に石灯籠風の装飾 - サイズ調整
        context.fillStyle = '#95a5a6';
        // 左側の石灯籠
        context.fillRect(340, 240, 25, 60);
        context.fillRect(340, 320, 25, 60);
        context.fillRect(340, 400, 25, 60);
        
        // 右側の石灯籠
        context.fillRect(435, 240, 25, 60);
        context.fillRect(435, 320, 25, 60);
        context.fillRect(435, 400, 25, 60);
    }
    
    /**
     * UI情報の描画
     */
    renderUI(context) {
        // プレイヤー情報
        context.fillStyle = '#ecf0f1';
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        if (this.playerName) {
            context.fillText(`名前: ${this.playerName}`, 20, 20);
        }
        
        if (this.playerWish) {
            context.fillText(`願い事: ${this.playerWish}`, 20, 45);
        }
        
        // テスト用の情報
        context.fillStyle = '#f39c12';
        context.font = '14px Arial';
        context.fillText('テストモード - プレイヤーキャラクターシステム', 20, 80);
    }
    
    /**
     * 操作説明の描画
     */
    renderInstructions(context) {
        context.fillStyle = '#bdc3c7';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const instructions = [
            '操作方法:',
            'WASD または 矢印キー: 移動',
            'タッチ: スワイプで移動',
            '',
            'キャラクターを操作して百度石（下）と社殿（上）の間を移動してみてください'
        ];
        
        instructions.forEach((instruction, index) => {
            context.fillText(instruction, 20, 520 + index * 15);
        });
    }
    
    /**
     * 入力処理
     * @param {Object} input - 入力情報
     */
    handleInput(input) {
        // プレイヤーキャラクターが入力を直接処理するため、
        // ここでは特別な処理は不要
    }
    
    /**
     * シーンの破棄処理
     */
    destroy() {
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        
        super.destroy();
        console.log('GameScene destroyed');
    }
}