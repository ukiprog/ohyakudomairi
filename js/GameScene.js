/**
 * GameScene - メインゲームシーン
 * 神社環境とプレイヤーキャラクターを統合したゲームシーン
 */
class GameScene extends Scene {
    constructor() {
        super('game');
        
        // プレイヤーキャラクター
        this.player = null;
        
        // 神社環境システム
        this.shrineEnvironment = null;
        
        // 環境オブジェクト
        this.hyakudoStone = null;
        this.mainHall = null;
        
        // ゲームデータ
        this.playerName = '';
        this.playerWish = '';
        
        // プレイヤーの状態追跡
        this.playerAtHyakudoStone = false;
        this.playerAtMainHall = false;
        
        // 進捗管理システム
        this.progressTracker = null;
        this.progressUI = null;
        
        console.log('GameScene created');
    }
    
    /**
     * シーンの初期化
     */
    init() {
        super.init();
        
        // 神社環境システムの初期化
        this.shrineEnvironment = new ShrineEnvironment(800, 600);
        
        // 百度石の作成（画面下部、高さ調整）
        this.hyakudoStone = new HyakudoStone(370, 490);
        this.hyakudoStone.setOnReachCallback((player, stone) => {
            this.onPlayerReachHyakudoStone(player, stone);
        });
        this.hyakudoStone.setOnLeaveCallback((player, stone) => {
            this.onPlayerLeaveHyakudoStone(player, stone);
        });
        
        // 社殿の作成（画面上部）
        this.mainHall = new MainHall(300, 60);
        this.mainHall.setOnReachCallback((player, hall) => {
            this.onPlayerReachMainHall(player, hall);
        });
        this.mainHall.setOnLeaveCallback((player, hall) => {
            this.onPlayerLeaveMainHall(player, hall);
        });
        
        // 環境オブジェクトを環境システムに追加
        this.shrineEnvironment.addEnvironmentObject(this.hyakudoStone);
        this.shrineEnvironment.addEnvironmentObject(this.mainHall);
        
        // プレイヤーキャラクターを作成（百度石の近くに配置）
        this.player = new PlayerCharacter(400 - 16, 400); 
        this.player.setBounds(0, 0, 800, 600);
        this.player.setDebugDisplay(false); // 本格実装なのでデバッグ表示を無効化
        
        // 進捗管理システムの初期化
        this.progressTracker = new ProgressTracker();
        this.progressUI = new ProgressUI(800, 600);
        
        // 進捗トラッカーのコールバック設定
        this.progressTracker.setOnProgressUpdate((current, remaining) => {
            this.progressUI.updateProgress(current, remaining, this.progressTracker.getProgressPercentage());
        });
        
        this.progressTracker.setOnMidpointReached(() => {
            this.progressUI.showMidpointMessage();
        });
        
        this.progressTracker.setOnCompletion(() => {
            console.log('御百度参り完了！神様登場の準備...');
            // TODO: CompletionSceneへの遷移処理
        });
        
        console.log('GameScene initialized with shrine environment');
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
        // 神社環境システムの更新
        if (this.shrineEnvironment) {
            this.shrineEnvironment.update(deltaTime);
        }
        
        // プレイヤーキャラクターの更新
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // 進捗管理システムの更新
        if (this.progressTracker) {
            // 進捗トラッカー自体は状態変化時のみ更新されるため、
            // ここでは特別な更新処理は不要
        }
        
        // 進捗UIの更新
        if (this.progressUI) {
            this.progressUI.update(deltaTime);
        }
        
        // プレイヤーと環境オブジェクトの衝突判定
        this.checkPlayerCollisions();
    }
    
    /**
     * プレイヤーと環境オブジェクトの衝突判定
     */
    checkPlayerCollisions() {
        if (!this.player) return;
        
        // 百度石との衝突判定
        if (this.hyakudoStone) {
            const isColliding = this.hyakudoStone.checkCollision(this.player);
            if (isColliding && !this.playerAtHyakudoStone) {
                this.hyakudoStone.onPlayerReach(this.player);
            } else if (!isColliding && this.playerAtHyakudoStone) {
                this.hyakudoStone.onPlayerLeave(this.player);
            }
        }
        
        // 社殿との衝突判定
        if (this.mainHall) {
            const isColliding = this.mainHall.checkCollision(this.player);
            if (isColliding && !this.playerAtMainHall) {
                this.mainHall.onPlayerReach(this.player);
            } else if (!isColliding && this.playerAtMainHall) {
                this.mainHall.onPlayerLeave(this.player);
            }
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
        if (this.player) {
            this.player.render(context);
        }
        
        // 進捗UIの描画
        if (this.progressUI && this.progressTracker) {
            this.progressUI.render(
                context,
                this.progressTracker.getCurrentCount(),
                this.progressTracker.getRemainingCount(),
                this.progressTracker.getProgressPercentage()
            );
            
            // 完了時の特別表示
            if (this.progressTracker.isCompleted()) {
                this.progressUI.renderCompletionMessage(context);
            }
        }
        
        // UI情報の描画
        this.renderUI(context);
        
        // 操作説明の描画
        this.renderInstructions(context);
    }
    
    /**
     * プレイヤーが百度石に到達した時の処理
     */
    onPlayerReachHyakudoStone(player, stone) {
        this.playerAtHyakudoStone = true;
        
        // 進捗トラッカーに通知
        if (this.progressTracker) {
            this.progressTracker.onPlayerReachHyakudo();
        }
        
        console.log('Player reached Hyakudo Stone - 御百度参り開始地点');
    }
    
    /**
     * プレイヤーが百度石から離れた時の処理
     */
    onPlayerLeaveHyakudoStone(player, stone) {
        this.playerAtHyakudoStone = false;
        console.log('Player left Hyakudo Stone');
    }
    
    /**
     * プレイヤーが社殿に到達した時の処理
     */
    onPlayerReachMainHall(player, hall) {
        this.playerAtMainHall = true;
        
        // 進捗トラッカーに通知
        if (this.progressTracker) {
            this.progressTracker.onPlayerReachHall();
        }
        
        console.log('Player reached Main Hall - 参拝地点');
    }
    
    /**
     * プレイヤーが社殿から離れた時の処理
     */
    onPlayerLeaveMainHall(player, hall) {
        this.playerAtMainHall = false;
        console.log('Player left Main Hall');
    }
    
    /**
     * 背景の描画（旧システム - 削除予定）
     */
    renderBackground(context) {
        // この関数は新しい環境システムに置き換えられました
        // 互換性のために残していますが、使用されません
    }
    
    /**
     * 簡単な神社風装飾の描画（旧システム - 削除予定）
     */
    renderSimpleShrine(context) {
        // この関数は新しい環境システムに置き換えられました
        // 互換性のために残していますが、使用されません
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
        
        // 現在の状態表示
        context.fillStyle = '#f39c12';
        context.font = '14px Arial';
        
        if (this.playerAtHyakudoStone) {
            context.fillText('百度石に到達中', 20, 80);
        } else if (this.playerAtMainHall) {
            context.fillText('社殿で参拝中', 20, 80);
        } else {
            context.fillText('神社境内を移動中', 20, 80);
        }
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
        
        if (this.shrineEnvironment) {
            this.shrineEnvironment.destroy();
            this.shrineEnvironment = null;
        }
        
        if (this.hyakudoStone) {
            this.hyakudoStone.destroy();
            this.hyakudoStone = null;
        }
        
        if (this.mainHall) {
            this.mainHall.destroy();
            this.mainHall = null;
        }
        
        if (this.progressTracker) {
            this.progressTracker = null;
        }
        
        if (this.progressUI) {
            this.progressUI.destroy();
            this.progressUI = null;
        }
        
        super.destroy();
        console.log('GameScene destroyed');
    }
}