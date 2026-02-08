/**
 * GameEngine - 御百度参りゲームのコアエンジン
 * HTML5 Canvasを使用した60FPSゲームループを提供
 */
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        
        // ゲーム状態
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // パフォーマンス監視
        this.frameCount = 0;
        this.fpsCounter = 0;
        this.lastFPSUpdate = 0;
        
        // ゲームループのバインド
        this.gameLoop = this.gameLoop.bind(this);
        
        // Canvas設定
        this.setupCanvas();
        
        console.log('GameEngine initialized with canvas:', canvasId);
    }
    
    /**
     * Canvasの初期設定
     */
    setupCanvas() {
        // ピクセルアートに適した設定
        this.context.imageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        
        // デフォルトのフォント設定
        this.context.font = '16px Arial';
        this.context.textAlign = 'left';
        this.context.textBaseline = 'top';
    }
    
    /**
     * ゲームエンジンの初期化
     */
    init() {
        console.log('GameEngine initializing...');
        
        // 初期化処理
        this.lastFrameTime = performance.now();
        this.lastFPSUpdate = this.lastFrameTime;
        
        console.log('GameEngine initialized successfully');
        return this;
    }
    
    /**
     * ゲームループの開始
     */
    start() {
        if (this.isRunning) {
            console.warn('GameEngine is already running');
            return;
        }
        
        console.log('Starting GameEngine...');
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * ゲームループの停止
     */
    stop() {
        console.log('Stopping GameEngine...');
        this.isRunning = false;
    }
    
    /**
     * メインゲームループ
     * requestAnimationFrameを使用した60FPS制御
     */
    gameLoop(currentTime) {
        if (!this.isRunning) {
            return;
        }
        
        // 次のフレームをスケジュール
        requestAnimationFrame(this.gameLoop);
        
        // フレーム間隔の計算
        const deltaTime = currentTime - this.lastFrameTime;
        
        // 60FPS制御（約16.67ms間隔）
        if (deltaTime >= this.frameInterval) {
            // FPS計算
            this.updateFPS(currentTime);
            
            // ゲーム更新
            this.update(deltaTime);
            
            // 描画
            this.render();
            
            this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
        }
    }
    
    /**
     * FPS計算と表示
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.fpsCounter = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
        }
    }
    
    /**
     * ゲーム状態の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 基本実装 - サブクラスでオーバーライド予定
        // 現在は何もしない（後のタスクで実装）
    }
    
    /**
     * 画面描画
     */
    render() {
        // 画面クリア
        this.clearScreen();
        
        // デバッグ情報の描画
        this.renderDebugInfo();
        
        // 基本実装 - サブクラスでオーバーライド予定
        // 現在はテスト用の描画のみ
        this.renderTestContent();
    }
    
    /**
     * 画面クリア
     */
    clearScreen() {
        this.context.fillStyle = '#1a252f';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * デバッグ情報の描画
     */
    renderDebugInfo() {
        this.context.fillStyle = '#ecf0f1';
        this.context.font = '12px Arial';
        this.context.fillText(`FPS: ${this.fpsCounter}`, 10, 10);
        this.context.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, 25);
    }
    
    /**
     * テスト用コンテンツの描画
     */
    renderTestContent() {
        // 中央にテストメッセージを表示
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.context.fillStyle = '#e74c3c';
        this.context.font = '24px Arial';
        this.context.textAlign = 'center';
        this.context.fillText('御百度参り', centerX, centerY - 40);
        
        this.context.fillStyle = '#3498db';
        this.context.font = '16px Arial';
        this.context.fillText('GameEngine Running', centerX, centerY);
        
        this.context.fillStyle = '#2ecc71';
        this.context.font = '14px Arial';
        this.context.fillText('60FPS Game Loop Active', centerX, centerY + 30);
        
        // テスト用のアニメーション（回転する四角形）
        const time = performance.now() * 0.001;
        const rotation = time * 2;
        
        this.context.save();
        this.context.translate(centerX, centerY + 80);
        this.context.rotate(rotation);
        this.context.fillStyle = '#f39c12';
        this.context.fillRect(-20, -20, 40, 40);
        this.context.restore();
        
        // テキストアライメントをリセット
        this.context.textAlign = 'left';
    }
    
    /**
     * Canvasのサイズを取得
     */
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    /**
     * Canvasのコンテキストを取得
     */
    getContext() {
        return this.context;
    }
    
    /**
     * ゲームが実行中かどうかを確認
     */
    isGameRunning() {
        return this.isRunning;
    }
}