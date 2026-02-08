/**
 * SceneManager - シーン管理システム
 * ゲームの各画面（タイトル、ゲーム、完了画面）の管理と遷移を行う
 */

/**
 * ベースSceneクラス
 * すべてのシーンが継承する基底クラス
 */
class Scene {
    constructor(name) {
        this.name = name;
        this.isInitialized = false;
        this.isActive = false;
    }
    
    /**
     * シーンの初期化
     * シーンが最初に作成された時に一度だけ呼ばれる
     */
    init() {
        console.log(`Scene "${this.name}" initialized`);
        this.isInitialized = true;
    }
    
    /**
     * シーンがアクティブになった時の処理
     */
    onEnter() {
        console.log(`Entering scene: ${this.name}`);
        this.isActive = true;
    }
    
    /**
     * シーンが非アクティブになった時の処理
     */
    onExit() {
        console.log(`Exiting scene: ${this.name}`);
        this.isActive = false;
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // サブクラスでオーバーライドする
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        // サブクラスでオーバーライドする
    }
    
    /**
     * 入力処理
     * @param {Object} input - 入力情報
     */
    handleInput(input) {
        // サブクラスでオーバーライドする
    }
    
    /**
     * シーンの破棄処理
     */
    destroy() {
        console.log(`Scene "${this.name}" destroyed`);
        this.isActive = false;
        this.isInitialized = false;
    }
    
    /**
     * シーンの名前を取得
     */
    getName() {
        return this.name;
    }
    
    /**
     * シーンがアクティブかどうかを確認
     */
    getIsActive() {
        return this.isActive;
    }
    
    /**
     * シーンが初期化済みかどうかを確認
     */
    getIsInitialized() {
        return this.isInitialized;
    }
}

/**
 * SceneManagerクラス
 * シーンの管理と遷移を行う
 */
class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scenes = new Map();
        this.currentScene = null;
        this.nextScene = null;
        this.isTransitioning = false;
        
        console.log('SceneManager initialized');
    }
    
    /**
     * シーンを追加
     * @param {string} name - シーン名
     * @param {Scene} scene - シーンオブジェクト
     */
    addScene(name, scene) {
        if (!(scene instanceof Scene)) {
            throw new Error(`Scene must be an instance of Scene class: ${name}`);
        }
        
        // シーンにGameEngineの参照を設定
        scene.gameEngine = this.gameEngine;
        
        this.scenes.set(name, scene);
        console.log(`Scene added: ${name}`);
        
        // シーンの初期化
        if (!scene.getIsInitialized()) {
            scene.init();
        }
    }
    
    /**
     * シーンを削除
     * @param {string} name - シーン名
     */
    removeScene(name) {
        const scene = this.scenes.get(name);
        if (scene) {
            // 現在のシーンの場合は先に別のシーンに切り替える
            if (this.currentScene === scene) {
                console.warn(`Cannot remove current active scene: ${name}`);
                return false;
            }
            
            scene.destroy();
            this.scenes.delete(name);
            console.log(`Scene removed: ${name}`);
            return true;
        }
        
        console.warn(`Scene not found for removal: ${name}`);
        return false;
    }
    
    /**
     * シーンを切り替え
     * @param {string} name - 切り替え先のシーン名
     * @param {Object} data - シーンに渡すデータ（オプション）
     */
    switchScene(name, data = null) {
        const scene = this.scenes.get(name);
        if (!scene) {
            console.error(`Scene not found: ${name}`);
            return false;
        }
        
        if (this.isTransitioning) {
            console.warn('Scene transition already in progress');
            return false;
        }
        
        if (this.currentScene === scene) {
            console.warn(`Already in scene: ${name}`);
            return false;
        }
        
        console.log(`Switching to scene: ${name}`);
        
        // 遷移開始
        this.isTransitioning = true;
        this.nextScene = scene;
        
        // 現在のシーンを終了
        if (this.currentScene) {
            this.currentScene.onExit();
        }
        
        // 新しいシーンを開始
        this.currentScene = scene;
        this.currentScene.onEnter();
        
        // データがある場合は渡す
        if (data && typeof this.currentScene.setData === 'function') {
            this.currentScene.setData(data);
        }
        
        // 遷移完了
        this.nextScene = null;
        this.isTransitioning = false;
        
        return true;
    }
    
    /**
     * 現在のシーンを取得
     * @returns {Scene|null} 現在のシーン
     */
    getCurrentScene() {
        return this.currentScene;
    }
    
    /**
     * 現在のシーン名を取得
     * @returns {string|null} 現在のシーン名
     */
    getCurrentSceneName() {
        return this.currentScene ? this.currentScene.getName() : null;
    }
    
    /**
     * シーンが存在するかチェック
     * @param {string} name - シーン名
     * @returns {boolean} シーンが存在するかどうか
     */
    hasScene(name) {
        return this.scenes.has(name);
    }
    
    /**
     * 登録されているシーンの一覧を取得
     * @returns {Array<string>} シーン名の配列
     */
    getSceneNames() {
        return Array.from(this.scenes.keys());
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (this.currentScene && this.currentScene.getIsActive()) {
            this.currentScene.update(deltaTime);
        }
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        if (this.currentScene && this.currentScene.getIsActive()) {
            this.currentScene.render(context);
        }
    }
    
    /**
     * 入力処理
     * @param {Object} input - 入力情報
     */
    handleInput(input) {
        if (this.currentScene && this.currentScene.getIsActive()) {
            this.currentScene.handleInput(input);
        }
    }
    
    /**
     * 遷移中かどうかを確認
     * @returns {boolean} 遷移中かどうか
     */
    getIsTransitioning() {
        return this.isTransitioning;
    }
    
    /**
     * すべてのシーンを破棄
     */
    destroy() {
        console.log('Destroying all scenes...');
        
        // 現在のシーンを終了
        if (this.currentScene) {
            this.currentScene.onExit();
        }
        
        // すべてのシーンを破棄
        for (const [name, scene] of this.scenes) {
            scene.destroy();
        }
        
        this.scenes.clear();
        this.currentScene = null;
        this.nextScene = null;
        this.isTransitioning = false;
        
        console.log('All scenes destroyed');
    }
}