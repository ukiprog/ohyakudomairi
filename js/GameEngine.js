/**
 * GameEngine - 御百度参りゲームのコアエンジン
 * HTML5 Canvasを使用した60FPSゲームループを提供
 */
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = null;
        this.debugMode = false;

        // ゲーム状態
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;

        // パフォーマンス監視
        this.frameCount = 0;
        this.fpsCounter = 0;
        this.lastFPSUpdate = 0;

        // シーン管理システム
        this.sceneManager = null;

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
        // Canvas 2Dコンテキストの取得（エラーハンドリング付き）
        try {
            this.context = this.canvas.getContext('2d');
            if (!this.context) throw new Error('Canvas 2D context not available');
        } catch (error) {
            console.error('Canvas initialization failed:', error);
            this.context = null;
            if (typeof showError === 'function') showError('このブラウザはCanvas描画に対応していません。');
            return;
        }

        // ピクセルアートに適した設定
        this.context.imageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        // デフォルトのフォント設定
        this.context.font = '16px Arial';
        this.context.textAlign = 'left';
        this.context.textBaseline = 'top';

        // ベース解像度（論理サイズ）
        this.baseWidth = this.canvas.width;   // 800
        this.baseHeight = this.canvas.height; // 600

        // レスポンシブスケーリングの設定
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    /**
     * ウィンドウリサイズ時にCanvasの論理サイズをビューポートに合わせる
     * デスクトップは最大800x600、モバイルはビューポート全体を使用
     */
    handleResize() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const viewportWidth  = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 横はデスクトップ最大800px、縦はビューポート全体を使う
        const newWidth  = Math.min(viewportWidth, this.baseWidth);
        const newHeight = viewportHeight;

        this.canvas.width  = newWidth;
        this.canvas.height = newHeight;

        this.canvas.style.transform = '';
        this.canvas.style.width  = newWidth  + 'px';
        this.canvas.style.height = newHeight + 'px';

        container.style.width  = newWidth  + 'px';
        container.style.height = newHeight + 'px';

        if (this.context) this.context.imageSmoothingEnabled = false;

        this.currentScale  = 1;
        this.currentWidth  = newWidth;
        this.currentHeight = newHeight;

        if (this.sceneManager) {
            this.sceneManager.onResize(newWidth, newHeight);
        }
    }

    /**
     * ゲームエンジンの初期化
     */
    init() {
        console.log('GameEngine initializing...');

        // シーン管理システムの初期化
        this.sceneManager = new SceneManager(this);

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
        window.removeEventListener('resize', this.handleResize);
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

        // フレーム間隔の計算（タブ切り替え後の大きなジャンプを防ぐため100msでキャップ）
        const deltaTime = Math.min(currentTime - this.lastFrameTime, 100);

        // 60FPS制御（約16.67ms間隔）
        if (deltaTime >= this.frameInterval) {
            // FPS計算
            this.updateFPS(currentTime);

            try {
                // ゲーム更新
                this.update(deltaTime);

                // 描画
                this.render();
            } catch (error) {
                console.error('Game loop error:', error);
            }

            this.lastFrameTime = currentTime;
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
        // シーン管理システムの更新
        if (this.sceneManager) {
            this.sceneManager.update(deltaTime);
        }
    }

    /**
     * 画面描画
     */
    render() {
        if (!this.context) return;

        // 画面クリア
        this.clearScreen();

        // シーン管理システムの描画
        if (this.sceneManager) {
            this.sceneManager.render(this.context);
        } else {
            // シーンマネージャーがない場合はテスト用コンテンツを表示
            this.renderTestContent();
        }

        // デバッグ情報の描画
        this.renderDebugInfo();
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
        if (!this.debugMode) return;
        this.context.fillStyle = '#ecf0f1';
        this.context.font = '12px Arial';
        this.context.textAlign = 'left';
        this.context.textBaseline = 'top';
        this.context.fillText(`FPS: ${this.fpsCounter}`, 15, 15);
        this.context.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 15, 30);
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
     * 現在のスケール比率を取得
     */
    getCanvasScale() {
        return this.currentScale || 1;
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

    /**
     * シーン管理システムを取得
     */
    getSceneManager() {
        return this.sceneManager;
    }
}