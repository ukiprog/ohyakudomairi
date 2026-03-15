/**
 * GameScene - メインゲームシーン
 * 御百度参りのメインゲームプレイを管理
 * 全コンポーネントを統合し、ゲームループで更新・描画を行う
 */
class GameScene extends Scene {
    constructor() {
        super('game');
        
        // プレイヤーデータ
        this.playerName = '';
        this.playerWish = '';
        
        // ゲームコンポーネント
        this.shrineEnvironment = null;
        this.playerCharacter = null;
        this.hyakudoStone = null;
        this.mainHall = null;
        this.progressTracker = null;
        this.progressUI = null;
        
        // 衝突検出システム
        this.collisionDetector = CollisionDetector;
        
        // 音響システム
        this.audioManager = window.audioManager || null;
        
        // ゲーム状態
        this.isGameCompleted = false;
        this.lastCollisionCheck = {
            hyakudo: false,
            hall: false
        };
        
        // 完了メッセージ表示
        this.showCompletionMessage = false;
        this.completionMessageTimer = 0;
        this.completionMessageDuration = 3000; // 3秒間表示
        
        console.log('GameScene created');
    }
    
    /**
     * シーンの初期化
     */
    init() {
        super.init();
        console.log('GameScene initialized');
    }
    
    /**
     * ゲームコンポーネントの生成（onEnterで呼ぶ）
     */
    setupComponents() {
        // Canvas サイズを取得
        const canvasWidth = 800;
        const canvasHeight = 600;
        
        // 神社環境の初期化
        this.shrineEnvironment = new ShrineEnvironment(canvasWidth, canvasHeight);
        
        // ShrineEnvironmentのレイアウトに合わせた座標
        // 参道: y=220〜490、地面開始: y=200
        // 百度石: 参道下端付近
        this.hyakudoStone = new HyakudoStone(
            canvasWidth / 2 - 30,  // 中央
            canvasHeight - 120     // y=480（参道下端付近）
        );
        
        // 社殿: 参道上端付近（地面の上）
        this.mainHall = new MainHall(
            canvasWidth / 2 - 100, // 中央
            200                    // y=200（地面開始ライン）
        );
        
        // プレイヤーキャラクターの初期化（百度石の近く）
        this.playerCharacter = new PlayerCharacter(
            canvasWidth / 2 - 16,  // 中央
            canvasHeight - 200     // 百度石の少し上
        );
        
        // audioManagerを最新の参照で取得（非同期初期化後に確実に取得）
        this.audioManager = window.audioManager || null;
        this.playerCharacter.audioManager = this.audioManager;
        
        // 進捗管理システムの初期化
        this.progressTracker = new ProgressTracker();
        
        // 進捗UIの初期化
        this.progressUI = new ProgressUI(canvasWidth, canvasHeight);
        
        // 環境オブジェクトを環境に追加
        this.shrineEnvironment.addEnvironmentObject(this.hyakudoStone);
        this.shrineEnvironment.addEnvironmentObject(this.mainHall);
        
        // 進捗トラッカーのコールバック設定
        this.setupProgressCallbacks();
        
        // 百度石と社殿のコールバック設定
        this.setupEnvironmentCallbacks();
        
        console.log('GameScene components setup');
    }
    
    /**
     * 進捗トラッカーのコールバック設定
     */
    setupProgressCallbacks() {
        // 進捗更新時のコールバック
        this.progressTracker.setOnProgressUpdate((current, remaining) => {
            this.progressUI.updateProgress(
                current,
                remaining,
                this.progressTracker.getProgressPercentage()
            );
        });
        
        // 50往復達成時のコールバック
        this.progressTracker.setOnMidpointReached(() => {
            this.progressUI.showMidpointMessage();
            console.log('Midpoint reached: 50 round trips!');
        });
        
        // 100往復完了時のコールバック
        this.progressTracker.setOnCompletion(() => {
            this.onGameCompletion();
        });
    }
    
    /**
     * 環境オブジェクトのコールバック設定
     */
    setupEnvironmentCallbacks() {
        // 百度石到達時のコールバック
        this.hyakudoStone.setOnReachCallback(() => {
            this.progressTracker.onPlayerReachHyakudo();
        });
        
        // 社殿到達時のコールバック
        this.mainHall.setOnReachCallback(() => {
            this.progressTracker.onPlayerReachHall();
        });
    }
    
    /**
     * シーンがアクティブになった時の処理
     */
    onEnter() {
        super.onEnter();
        
        // コンポーネントを生成（audioManagerが確実に初期化された後）
        this.setupComponents();
        
        // プレイヤーキャラクターの入力リスナーを設定
        if (this.playerCharacter) {
            this.playerCharacter.setupInputListeners();
        }
        
        console.log('GameScene entered');
        console.log(`Player: ${this.playerName}, Wish: ${this.playerWish}`);
    }
    
    /**
     * シーンが非アクティブになった時の処理
     */
    onExit() {
        super.onExit();
        
        // プレイヤーキャラクターの入力リスナーを削除
        if (this.playerCharacter) {
            this.playerCharacter.removeInputListeners();
        }
        
        // コンポーネントを破棄（次回onEnterで再生成）
        this.destroyComponents();
        
        console.log('GameScene exited');
    }
    
    /**
     * コンポーネントの破棄
     */
    destroyComponents() {
        if (this.playerCharacter) {
            this.playerCharacter.destroy();
            this.playerCharacter = null;
        }
        if (this.shrineEnvironment) {
            this.shrineEnvironment.destroy();
            this.shrineEnvironment = null;
        }
        if (this.progressUI) {
            this.progressUI.destroy();
            this.progressUI = null;
        }
        this.hyakudoStone = null;
        this.mainHall = null;
        this.progressTracker = null;
        
        // ゲーム状態もリセット
        this.isGameCompleted = false;
        this.showCompletionMessage = false;
        this.completionMessageTimer = 0;
        this.lastCollisionCheck = { hyakudo: false, hall: false };
    }
    
    /**
     * TitleSceneからのデータを設定
     * @param {Object} data - プレイヤーデータ
     */
    setData(data) {
        if (data) {
            this.playerName = data.playerName || '参拝者';
            this.playerWish = data.playerWish || '願い事';
            console.log('GameScene data set:', data);
        }
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // ゲーム完了後は更新を停止
        if (this.isGameCompleted) {
            // 完了メッセージのタイマー更新
            if (this.showCompletionMessage) {
                this.completionMessageTimer += deltaTime;
                
                // 一定時間後にCompletionSceneに遷移
                if (this.completionMessageTimer >= this.completionMessageDuration) {
                    this.transitionToCompletionScene();
                }
            }
            return;
        }
        
        // 神社環境の更新
        if (this.shrineEnvironment) {
            this.shrineEnvironment.update(deltaTime);
        }
        
        // プレイヤーキャラクターの更新
        if (this.playerCharacter) {
            this.playerCharacter.update(deltaTime);
        }
        
        // 衝突判定と相互作用
        this.checkCollisions();
        
        // 進捗UIの更新
        if (this.progressUI) {
            this.progressUI.update(deltaTime);
        }
    }
    
    /**
     * 衝突判定と相互作用の処理
     */
    checkCollisions() {
        if (!this.playerCharacter) return;
        
        // 百度石との衝突判定
        if (this.hyakudoStone) {
            const isCollidingWithHyakudo = this.hyakudoStone.checkCollision(this.playerCharacter);
            
            if (isCollidingWithHyakudo && !this.lastCollisionCheck.hyakudo) {
                // 新たに衝突した
                this.hyakudoStone.onPlayerReach(this.playerCharacter);
            } else if (!isCollidingWithHyakudo && this.lastCollisionCheck.hyakudo) {
                // 衝突から離れた
                this.hyakudoStone.onPlayerLeave(this.playerCharacter);
            }
            
            this.lastCollisionCheck.hyakudo = isCollidingWithHyakudo;
        }
        
        // 社殿との衝突判定
        if (this.mainHall) {
            const isCollidingWithHall = this.mainHall.checkCollision(this.playerCharacter);
            
            if (isCollidingWithHall && !this.lastCollisionCheck.hall) {
                // 新たに衝突した
                this.mainHall.onPlayerReach(this.playerCharacter);
            } else if (!isCollidingWithHall && this.lastCollisionCheck.hall) {
                // 衝突から離れた
                this.mainHall.onPlayerLeave(this.playerCharacter);
            }
            
            this.lastCollisionCheck.hall = isCollidingWithHall;
        }
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        // 神社環境の描画
        if (this.shrineEnvironment) {
            this.shrineEnvironment.render(context);
        }
        
        // プレイヤーキャラクターの描画
        if (this.playerCharacter) {
            this.playerCharacter.render(context);
        }
        
        // 進捗UIの描画
        if (this.progressUI && this.progressTracker) {
            this.progressUI.render(
                context,
                this.progressTracker.getCurrentCount(),
                this.progressTracker.getRemainingCount(),
                this.progressTracker.getProgressPercentage()
            );
        }
        
        // 名前と願い事の表示
        this.renderPlayerInfo(context);
        
        // 完了メッセージの描画
        if (this.showCompletionMessage) {
            this.renderCompletionMessage(context);
        }
    }
    
    /**
     * 名前と願い事の表示
     * @param {CanvasRenderingContext2D} context
     */
    renderPlayerInfo(context) {
        context.save();
        
        // 背景パネル（往復回数の上に配置、y=100の上）
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(10, 50, 320, 50);
        context.strokeStyle = '#3498db';
        context.lineWidth = 2;
        context.strokeRect(10, 50, 320, 50);
        
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        // 名前
        context.fillStyle = '#bdc3c7';
        context.fillText('名前:', 20, 60);
        context.fillStyle = '#ecf0f1';
        context.fillText(this.playerName, 65, 60);
        
        // 願い事
        context.fillStyle = '#bdc3c7';
        context.fillText('願い事:', 20, 80);
        context.fillStyle = '#f39c12';
        // 長い場合は切り詰める
        const wish = this.playerWish.length > 20 ? this.playerWish.slice(0, 20) + '…' : this.playerWish;
        context.fillText(wish, 75, 80);
        
        context.restore();
    }
    
    /**
     * 完了メッセージの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderCompletionMessage(context) {
        if (this.progressUI) {
            this.progressUI.renderCompletionMessage(context);
        }
    }
    
    /**
     * ゲーム完了時の処理
     */
    onGameCompletion() {
        console.log('Game completed! 100 round trips achieved!');
        
        this.isGameCompleted = true;
        this.showCompletionMessage = true;
        this.completionMessageTimer = 0;
    }
    
    /**
     * CompletionSceneへの遷移
     */
    transitionToCompletionScene() {
        console.log('Transitioning to CompletionScene...');
        
        const sceneManager = this.gameEngine?.getSceneManager();
        if (sceneManager && sceneManager.hasScene('completion')) {
            const completionData = {
                playerName: this.playerName,
                playerWish: this.playerWish
            };
            
            sceneManager.switchScene('completion', completionData);
        } else {
            console.warn('CompletionScene not available');
        }
    }
    
    /**
     * 入力処理
     * @param {Object} input - 入力情報
     */
    handleInput(input) {
        // プレイヤーキャラクターが入力を直接処理するため、ここでは特に何もしない
    }
    
    /**
     * ゲーム状態を取得（デバッグ用）
     * @returns {Object} ゲーム状態
     */
    getGameState() {
        return {
            playerName: this.playerName,
            playerWish: this.playerWish,
            isCompleted: this.isGameCompleted,
            progressTracker: this.progressTracker ? this.progressTracker.getState() : null,
            playerPosition: this.playerCharacter ? this.playerCharacter.getPosition() : null
        };
    }
    
    /**
     * シーンのリセット
     */
    reset() {
        console.log('Resetting GameScene...');
        
        // 進捗トラッカーをリセット
        if (this.progressTracker) {
            this.progressTracker.reset();
        }
        
        // プレイヤーキャラクターを初期位置に戻す
        if (this.playerCharacter) {
            this.playerCharacter.setPosition(
                400 - 16,  // 中央
                600 - 180  // 百度石の少し上
            );
        }
        
        // ゲーム状態をリセット
        this.isGameCompleted = false;
        this.showCompletionMessage = false;
        this.completionMessageTimer = 0;
        this.lastCollisionCheck = {
            hyakudo: false,
            hall: false
        };
        
        console.log('GameScene reset complete');
    }
    
    /**
     * シーンの破棄処理
     */
    destroy() {
        this.destroyComponents();
        super.destroy();
        console.log('GameScene destroyed');
    }
}
