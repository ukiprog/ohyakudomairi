/**
 * Deity - 神様キャラクタークラス
 * 100往復完了時に登場する神様のキャラクターとアニメーション
 */
class Deity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // 神様のサイズ（32x32ピクセル - プレイヤーより大きい）
        this.width = 32;
        this.height = 32;
        
        // アニメーション状態
        this.currentAnimation = 'appearance'; // 'appearance', 'blessing', 'idle'
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 150; // ミリ秒/フレーム
        
        // 登場アニメーションの状態
        this.isAppearing = true;
        this.appearanceProgress = 0; // 0-1の範囲
        this.appearanceDuration = 2000; // 2秒
        
        // 祝福アニメーションの状態
        this.isBlessing = false;
        this.blessingProgress = 0;
        this.blessingDuration = 1500; // 1.5秒
        
        // エフェクト用
        this.glowIntensity = 0;
        this.glowTimer = 0;
        
        // コールバック
        this.onAppearanceComplete = null;
        this.onBlessingComplete = null;
        
        console.log('Deity created at', x, y);
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // アニメーションタイマーの更新
        this.animationTimer += deltaTime;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame++;
            this.animationTimer = 0;
        }
        
        // 登場アニメーションの更新
        if (this.isAppearing) {
            this.appearanceProgress += deltaTime / this.appearanceDuration;
            
            if (this.appearanceProgress >= 1.0) {
                this.appearanceProgress = 1.0;
                this.isAppearing = false;
                this.currentAnimation = 'idle';
                
                if (this.onAppearanceComplete) {
                    this.onAppearanceComplete();
                }
                
                console.log('Deity appearance animation complete');
            }
        }
        
        // 祝福アニメーションの更新
        if (this.isBlessing) {
            this.blessingProgress += deltaTime / this.blessingDuration;
            
            if (this.blessingProgress >= 1.0) {
                this.blessingProgress = 1.0;
                this.isBlessing = false;
                this.currentAnimation = 'idle';
                
                if (this.onBlessingComplete) {
                    this.onBlessingComplete();
                }
                
                console.log('Deity blessing animation complete');
            }
        }
        
        // グロー効果の更新
        this.glowTimer += deltaTime;
        this.glowIntensity = Math.sin(this.glowTimer / 500) * 0.5 + 0.5;
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        context.save();
        
        // 登場アニメーション中の透明度とスケール
        if (this.isAppearing) {
            const alpha = this.appearanceProgress;
            const scale = 0.5 + (this.appearanceProgress * 0.5);
            
            context.globalAlpha = alpha;
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.scale(scale, scale);
            context.translate(-this.width / 2, -this.height / 2);
            
            this.renderDeitySprite(context, 0, 0);
        } else {
            // 通常描画
            this.renderDeitySprite(context, this.x, this.y);
        }
        
        // 祝福アニメーション中のエフェクト
        if (this.isBlessing) {
            this.renderBlessingEffect(context);
        }
        
        // グロー効果
        this.renderGlowEffect(context);
        
        context.restore();
    }
    
    /**
     * 神様スプライトの描画（32x32ピクセル）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     */
    renderDeitySprite(context, x, y) {
        const pixelSize = 2; // 2倍サイズで16x16グリッド
        
        // 神様の配色
        const robeColor = '#9b59b6'; // 紫の衣
        const faceColor = '#f9e79f'; // 金色の顔
        const crownColor = '#f39c12'; // 金色の冠
        const eyeColor = '#2c3e50'; // 目
        const accentColor = '#e74c3c'; // アクセント（赤）
        
        // 冠（上部）
        context.fillStyle = crownColor;
        context.fillRect(x + 4 * pixelSize, y + 1 * pixelSize, 8 * pixelSize, 2 * pixelSize);
        context.fillRect(x + 5 * pixelSize, y + 0 * pixelSize, 2 * pixelSize, 1 * pixelSize);
        context.fillRect(x + 9 * pixelSize, y + 0 * pixelSize, 2 * pixelSize, 1 * pixelSize);
        
        // 顔（頭部）
        context.fillStyle = faceColor;
        context.fillRect(x + 5 * pixelSize, y + 3 * pixelSize, 6 * pixelSize, 5 * pixelSize);
        
        // 目
        context.fillStyle = eyeColor;
        context.fillRect(x + 6 * pixelSize, y + 5 * pixelSize, 1 * pixelSize, 1 * pixelSize);
        context.fillRect(x + 9 * pixelSize, y + 5 * pixelSize, 1 * pixelSize, 1 * pixelSize);
        
        // 口（微笑み）
        context.fillStyle = accentColor;
        context.fillRect(x + 7 * pixelSize, y + 7 * pixelSize, 2 * pixelSize, 1 * pixelSize);
        
        // 衣（体部）
        context.fillStyle = robeColor;
        context.fillRect(x + 3 * pixelSize, y + 8 * pixelSize, 10 * pixelSize, 6 * pixelSize);
        
        // 袖（腕）
        context.fillRect(x + 1 * pixelSize, y + 9 * pixelSize, 2 * pixelSize, 4 * pixelSize);
        context.fillRect(x + 13 * pixelSize, y + 9 * pixelSize, 2 * pixelSize, 4 * pixelSize);
        
        // 衣の装飾
        context.fillStyle = crownColor;
        context.fillRect(x + 7 * pixelSize, y + 10 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        
        // 下部（衣の裾）
        context.fillStyle = robeColor;
        context.fillRect(x + 4 * pixelSize, y + 14 * pixelSize, 8 * pixelSize, 2 * pixelSize);
        
        // アニメーションフレームによる変化
        if (this.currentAnimation === 'blessing' || this.isBlessing) {
            // 祝福時の手の動き
            const frame = Math.floor(this.animationFrame / 2) % 2;
            if (frame === 1) {
                // 手を上げる
                context.fillStyle = faceColor;
                context.fillRect(x + 1 * pixelSize, y + 7 * pixelSize, 2 * pixelSize, 2 * pixelSize);
                context.fillRect(x + 13 * pixelSize, y + 7 * pixelSize, 2 * pixelSize, 2 * pixelSize);
            }
        }
        
        // アイドル時の微細なアニメーション
        if (this.currentAnimation === 'idle') {
            const frame = Math.floor(this.animationFrame / 4) % 2;
            if (frame === 1) {
                // 衣の輝き
                context.fillStyle = 'rgba(255, 255, 255, 0.3)';
                context.fillRect(x + 3 * pixelSize, y + 8 * pixelSize, 10 * pixelSize, 6 * pixelSize);
            }
        }
    }
    
    /**
     * グロー効果の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderGlowEffect(context) {
        if (this.isAppearing) return; // 登場中はグロー効果なし
        
        const glowRadius = 40 + (this.glowIntensity * 10);
        const gradient = context.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, glowRadius
        );
        
        gradient.addColorStop(0, `rgba(241, 196, 15, ${0.3 * this.glowIntensity})`);
        gradient.addColorStop(0.5, `rgba(241, 196, 15, ${0.1 * this.glowIntensity})`);
        gradient.addColorStop(1, 'rgba(241, 196, 15, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(
            this.x - glowRadius,
            this.y - glowRadius,
            this.width + glowRadius * 2,
            this.height + glowRadius * 2
        );
    }
    
    /**
     * 祝福エフェクトの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderBlessingEffect(context) {
        const progress = this.blessingProgress;
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = progress * 60;
            const px = this.x + this.width / 2 + Math.cos(angle) * distance;
            const py = this.y + this.height / 2 + Math.sin(angle) * distance;
            const size = 4 * (1 - progress);
            const alpha = 1 - progress;
            
            context.fillStyle = `rgba(241, 196, 15, ${alpha})`;
            context.fillRect(px - size / 2, py - size / 2, size, size);
        }
        
        // 中央からの光の放射
        const gradient = context.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, progress * 80
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.5 * (1 - progress)})`);
        gradient.addColorStop(0.5, `rgba(241, 196, 15, ${0.3 * (1 - progress)})`);
        gradient.addColorStop(1, 'rgba(241, 196, 15, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(
            this.x - 80,
            this.y - 80,
            this.width + 160,
            this.height + 160
        );
    }
    
    /**
     * 祝福アニメーションを開始
     */
    startBlessing() {
        this.isBlessing = true;
        this.blessingProgress = 0;
        this.currentAnimation = 'blessing';
        console.log('Deity blessing animation started');
    }
    
    /**
     * 登場完了コールバックを設定
     * @param {Function} callback - コールバック関数
     */
    setOnAppearanceComplete(callback) {
        this.onAppearanceComplete = callback;
    }
    
    /**
     * 祝福完了コールバックを設定
     * @param {Function} callback - コールバック関数
     */
    setOnBlessingComplete(callback) {
        this.onBlessingComplete = callback;
    }
    
    /**
     * 位置を取得
     * @returns {Object} {x, y}
     */
    getPosition() {
        return { x: this.x, y: this.y };
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
     * 登場アニメーションが完了したかチェック
     * @returns {boolean} 完了状態
     */
    isAppearanceComplete() {
        return !this.isAppearing && this.appearanceProgress >= 1.0;
    }
    
    /**
     * 祝福アニメーションが完了したかチェック
     * @returns {boolean} 完了状態
     */
    isBlessingComplete() {
        return !this.isBlessing && this.blessingProgress >= 1.0;
    }
    
    /**
     * リソースの破棄
     */
    destroy() {
        this.onAppearanceComplete = null;
        this.onBlessingComplete = null;
        console.log('Deity destroyed');
    }
}
