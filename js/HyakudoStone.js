/**
 * HyakudoStone - 百度石クラス
 * 御百度参りの起点となる百度石オブジェクト
 */
class HyakudoStone extends EnvironmentObject {
    constructor(x, y) {
        // 百度石のサイズ（60x70ピクセル - 高さを低く）
        super(x, y, 60, 70, 'hyakudo-stone');
        
        // 百度石特有のプロパティ
        this.isInteractable = true;
        this.hasCollision = true;
        
        // プレイヤーとの相互作用状態
        this.isPlayerNear = false;
        this.lastPlayerReachTime = 0;
        
        // 到達イベント用のコールバック
        this.onReachCallback = null;
        this.onLeaveCallback = null;
        
        // 視覚効果用のプロパティ
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.animationTime = 0;
        
        console.log(`HyakudoStone created at (${x}, ${y})`);
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // アニメーション時間の更新
        this.animationTime += deltaTime;
        
        // グロー効果のアニメーション
        this.updateGlowEffect(deltaTime);
    }
    
    /**
     * グロー効果の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateGlowEffect(deltaTime) {
        if (this.isPlayerNear) {
            // プレイヤーが近くにいる場合はグロー効果を強くする
            this.glowIntensity += this.glowDirection * (deltaTime / 1000) * 2;
            
            if (this.glowIntensity >= 1) {
                this.glowIntensity = 1;
                this.glowDirection = -1;
            } else if (this.glowIntensity <= 0.3) {
                this.glowIntensity = 0.3;
                this.glowDirection = 1;
            }
        } else {
            // プレイヤーが離れている場合は徐々にグロー効果を弱くする
            this.glowIntensity = Math.max(0, this.glowIntensity - (deltaTime / 1000) * 0.5);
        }
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        if (!this.isVisible) {
            return;
        }
        
        // グロー効果の描画
        if (this.glowIntensity > 0) {
            this.renderGlowEffect(context);
        }
        
        // 百度石本体の描画
        this.renderStone(context);
        
        // 文字の描画
        this.renderText(context);
        
        // プレイヤーが近くにいる場合の相互作用インジケーター
        if (this.isPlayerNear) {
            this.renderInteractionIndicator(context);
        }
        
        // デバッグ情報の描画
        if (this.showDebugInfo) {
            this.renderDebugInfo(context);
        }
    }
    
    /**
     * グロー効果の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderGlowEffect(context) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const maxRadius = Math.max(this.width, this.height) * 0.8;
        
        // グラデーションを作成
        const gradient = context.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, maxRadius
        );
        
        const alpha = this.glowIntensity * 0.3;
        gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 百度石本体の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderStone(context) {
        // 石の基本色
        const baseColor = '#708090';
        const shadowColor = '#2F4F4F';
        const highlightColor = '#C0C0C0';
        
        // 不規則な石の形を描画（真四角ではなく）
        context.fillStyle = shadowColor;
        context.beginPath();
        context.moveTo(this.x + 5, this.y + 5);
        context.lineTo(this.x + this.width - 3, this.y + 8);
        context.lineTo(this.x + this.width + 2, this.y + this.height - 5);
        context.lineTo(this.x + 8, this.y + this.height + 2);
        context.lineTo(this.x - 2, this.y + this.height - 8);
        context.lineTo(this.x + 2, this.y + 12);
        context.closePath();
        context.fill();
        
        // 石本体の描画（不規則な形）
        context.fillStyle = baseColor;
        context.beginPath();
        context.moveTo(this.x + 3, this.y + 2);
        context.lineTo(this.x + this.width - 5, this.y + 5);
        context.lineTo(this.x + this.width - 2, this.y + this.height - 8);
        context.lineTo(this.x + 6, this.y + this.height - 2);
        context.lineTo(this.x - 4, this.y + this.height - 10);
        context.lineTo(this.x, this.y + 10);
        context.closePath();
        context.fill();
        
        // ハイライトの描画（石の質感）
        context.fillStyle = highlightColor;
        context.beginPath();
        context.moveTo(this.x + 3, this.y + 2);
        context.lineTo(this.x + this.width - 15, this.y + 5);
        context.lineTo(this.x + this.width - 20, this.y + 15);
        context.lineTo(this.x, this.y + 10);
        context.closePath();
        context.fill();
        
        // 石の表面の凹凸を表現
        context.fillStyle = shadowColor;
        context.beginPath();
        context.ellipse(this.x + 15, this.y + 25, 8, 5, 0, 0, Math.PI * 2);
        context.fill();
        
        context.beginPath();
        context.ellipse(this.x + 35, this.y + 45, 6, 4, 0, 0, Math.PI * 2);
        context.fill();
        
        context.beginPath();
        context.ellipse(this.x + 20, this.y + 65, 7, 3, 0, 0, Math.PI * 2);
        context.fill();
        
        // 石の亀裂や模様
        context.strokeStyle = shadowColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(this.x + 10, this.y + 30);
        context.lineTo(this.x + 25, this.y + 35);
        context.lineTo(this.x + 40, this.y + 32);
        context.stroke();
        
        context.beginPath();
        context.moveTo(this.x + 5, this.y + 50);
        context.lineTo(this.x + 30, this.y + 55);
        context.stroke();
        
        context.beginPath();
        context.moveTo(this.x + 15, this.y + 75);
        context.lineTo(this.x + 35, this.y + 78);
        context.stroke();
        
        // 苔や汚れの表現
        context.fillStyle = '#556B2F';
        context.beginPath();
        context.ellipse(this.x + 8, this.y + 40, 4, 6, 0, 0, Math.PI * 2);
        context.fill();
        
        context.beginPath();
        context.ellipse(this.x + 45, this.y + 60, 3, 5, 0, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 文字の描画（石に刻まれた文字）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderText(context) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 石に刻まれた「百度石」の文字
        context.fillStyle = '#2F4F4F'; // 暗い色で刻まれた感じ
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 文字を少し凹んだ感じに表現
        context.strokeStyle = '#708090';
        context.lineWidth = 1;
        context.strokeText('百度石', centerX, centerY);
        context.fillText('百度石', centerX, centerY);
        
        // 影を追加して刻まれた感じを強調
        context.fillStyle = '#1C1C1C';
        context.fillText('百度石', centerX + 1, centerY + 1);
        
        // 再度メインの文字を描画
        context.fillStyle = '#2F4F4F';
        context.fillText('百度石', centerX, centerY);
    }
    
    /**
     * 相互作用インジケーターの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderInteractionIndicator(context) {
        const centerX = this.x + this.width / 2;
        const indicatorY = this.y - 20;
        
        // 上下に動くアニメーション
        const bounce = Math.sin(this.animationTime * 0.005) * 3;
        
        // 矢印の描画
        context.fillStyle = '#f39c12';
        context.beginPath();
        context.moveTo(centerX, indicatorY + bounce);
        context.lineTo(centerX - 6, indicatorY - 8 + bounce);
        context.lineTo(centerX + 6, indicatorY - 8 + bounce);
        context.closePath();
        context.fill();
        
        // 「到達」の文字
        context.fillStyle = '#f39c12';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillText('到達', centerX, indicatorY - 10 + bounce);
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
        
        // 百度石は少し大きめの当たり判定を持つ
        const expandedBounds = {
            x: this.x - 10,
            y: this.y - 10,
            width: this.width + 20,
            height: this.height + 20
        };
        
        const playerBounds = player.getBounds();
        
        return (
            playerBounds.x < expandedBounds.x + expandedBounds.width &&
            playerBounds.x + playerBounds.width > expandedBounds.x &&
            playerBounds.y < expandedBounds.y + expandedBounds.height &&
            playerBounds.y + playerBounds.height > expandedBounds.y
        );
    }
    
    /**
     * プレイヤーが百度石に到達した時の処理
     * @param {PlayerCharacter} player - プレイヤーキャラクター
     */
    onPlayerReach(player) {
        super.onPlayerReach(player);
        
        this.isPlayerNear = true;
        this.lastPlayerReachTime = performance.now();
        
        // 到達イベントのコールバック実行
        if (this.onReachCallback && typeof this.onReachCallback === 'function') {
            this.onReachCallback(player, this);
        }
        
        console.log('Player reached Hyakudo Stone');
    }
    
    /**
     * プレイヤーが百度石から離れた時の処理
     * @param {PlayerCharacter} player - プレイヤーキャラクター
     */
    onPlayerLeave(player) {
        super.onPlayerLeave(player);
        
        this.isPlayerNear = false;
        
        // 離脱イベントのコールバック実行
        if (this.onLeaveCallback && typeof this.onLeaveCallback === 'function') {
            this.onLeaveCallback(player, this);
        }
        
        console.log('Player left Hyakudo Stone');
    }
    
    /**
     * 到達イベントのコールバックを設定
     * @param {Function} callback - コールバック関数
     */
    setOnReachCallback(callback) {
        this.onReachCallback = callback;
    }
    
    /**
     * 離脱イベントのコールバックを設定
     * @param {Function} callback - コールバック関数
     */
    setOnLeaveCallback(callback) {
        this.onLeaveCallback = callback;
    }
    
    /**
     * プレイヤーが近くにいるかどうかを取得
     * @returns {boolean} プレイヤーが近くにいるかどうか
     */
    isPlayerNearby() {
        return this.isPlayerNear;
    }
    
    /**
     * 最後にプレイヤーが到達した時刻を取得
     * @returns {number} 最後の到達時刻（performance.now()の値）
     */
    getLastReachTime() {
        return this.lastPlayerReachTime;
    }
    
    /**
     * リソースの破棄
     */
    destroy() {
        this.onReachCallback = null;
        this.onLeaveCallback = null;
        super.destroy();
        console.log('HyakudoStone destroyed');
    }
}