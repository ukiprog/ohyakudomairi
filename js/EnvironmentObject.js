/**
 * EnvironmentObject - 環境オブジェクトの基盤クラス
 * 神社境内の各種オブジェクト（百度石、社殿など）の基底クラス
 */
class EnvironmentObject {
    constructor(x, y, width, height, type = 'environment') {
        // 位置とサイズ
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // オブジェクトタイプ
        this.type = type;
        
        // 当たり判定の有効/無効
        this.hasCollision = true;
        
        // プレイヤーとの相互作用が可能かどうか
        this.isInteractable = false;
        
        // 描画の有効/無効
        this.isVisible = true;
        
        // デバッグ表示フラグ
        this.showDebugInfo = false;
        
        console.log(`EnvironmentObject created: ${type} at (${x}, ${y}) size ${width}x${height}`);
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 基底クラスでは何もしない
        // 継承クラスで必要に応じてオーバーライド
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        if (!this.isVisible) {
            return;
        }
        
        // 基本的な矩形描画（継承クラスでオーバーライド推奨）
        this.renderDefault(context);
        
        // デバッグ情報の描画
        if (this.showDebugInfo) {
            this.renderDebugInfo(context);
        }
    }
    
    /**
     * デフォルトの描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderDefault(context) {
        context.fillStyle = '#95a5a6';
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // 境界線
        context.strokeStyle = '#7f8c8d';
        context.lineWidth = 2;
        context.strokeRect(this.x, this.y, this.width, this.height);
        
        // タイプ名を表示
        context.fillStyle = '#2c3e50';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            this.type,
            this.x + this.width / 2,
            this.y + this.height / 2
        );
    }
    
    /**
     * デバッグ情報の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderDebugInfo(context) {
        // 境界ボックスの描画
        context.strokeStyle = '#e74c3c';
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.setLineDash([]);
        
        // 座標情報の表示
        context.fillStyle = '#e74c3c';
        context.font = '10px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(
            `${this.type}: (${this.x}, ${this.y})`,
            this.x,
            this.y - 15
        );
        
        // 中心点の表示
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        context.fillStyle = '#e74c3c';
        context.beginPath();
        context.arc(centerX, centerY, 3, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * プレイヤーとの衝突判定
     * @param {PlayerCharacter} player - プレイヤーキャラクター
     * @returns {boolean} 衝突しているかどうか
     */
    checkCollision(player) {
        if (!this.hasCollision || !player) {
            return false;
        }
        
        return CollisionDetector.checkAABB(this, player);
    }
    
    /**
     * プレイヤーがオブジェクトに到達した時の処理
     * @param {PlayerCharacter} player - プレイヤーキャラクター
     */
    onPlayerReach(player) {
        // 基底クラスでは何もしない
        // 継承クラスで必要に応じてオーバーライド
        console.log(`Player reached ${this.type} at (${this.x}, ${this.y})`);
    }
    
    /**
     * プレイヤーがオブジェクトから離れた時の処理
     * @param {PlayerCharacter} player - プレイヤーキャラクター
     */
    onPlayerLeave(player) {
        // 基底クラスでは何もしない
        // 継承クラスで必要に応じてオーバーライド
        console.log(`Player left ${this.type} at (${this.x}, ${this.y})`);
    }
    
    /**
     * 境界ボックスを取得
     * @returns {Object} 境界ボックス {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * 中心位置を取得
     * @returns {Object} 中心位置 {x, y}
     */
    getCenterPosition() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    /**
     * 位置を設定
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * サイズを設定
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    setSize(width, height) {
        this.width = Math.max(0, width);
        this.height = Math.max(0, height);
    }
    
    /**
     * 当たり判定の有効/無効を設定
     * @param {boolean} enabled - 当たり判定を有効にするかどうか
     */
    setCollisionEnabled(enabled) {
        this.hasCollision = enabled;
    }
    
    /**
     * 相互作用可能かどうかを設定
     * @param {boolean} interactable - 相互作用可能かどうか
     */
    setInteractable(interactable) {
        this.isInteractable = interactable;
    }
    
    /**
     * 表示/非表示を設定
     * @param {boolean} visible - 表示するかどうか
     */
    setVisible(visible) {
        this.isVisible = visible;
    }
    
    /**
     * デバッグ表示の切り替え
     * @param {boolean} show - デバッグ情報を表示するかどうか
     */
    setDebugDisplay(show) {
        this.showDebugInfo = show;
    }
    
    /**
     * オブジェクトタイプを取得
     * @returns {string} オブジェクトタイプ
     */
    getType() {
        return this.type;
    }
    
    /**
     * 当たり判定が有効かどうかを取得
     * @returns {boolean} 当たり判定が有効かどうか
     */
    hasCollisionEnabled() {
        return this.hasCollision;
    }
    
    /**
     * 相互作用可能かどうかを取得
     * @returns {boolean} 相互作用可能かどうか
     */
    isInteractableObject() {
        return this.isInteractable;
    }
    
    /**
     * 表示されているかどうかを取得
     * @returns {boolean} 表示されているかどうか
     */
    isVisibleObject() {
        return this.isVisible;
    }
    
    /**
     * リソースの破棄
     */
    destroy() {
        // 基底クラスでは特に何もしない
        // 継承クラスで必要に応じてオーバーライド
        console.log(`EnvironmentObject destroyed: ${this.type}`);
    }
}