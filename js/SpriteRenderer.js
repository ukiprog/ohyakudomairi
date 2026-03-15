/**
 * SpriteRenderer - スプライト描画システム
 * 32x32ピクセルのキャラクタースプライト描画とアニメーション管理
 */
class SpriteRenderer {
    constructor() {
        // スプライトデータ
        this.sprites = new Map();
        this.animations = new Map();
        
        // 現在のアニメーション状態
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.isPlaying = false;
        
        // スプライトサイズ（32x32ピクセル）
        this.spriteWidth = 32;
        this.spriteHeight = 32;
        
        console.log('SpriteRenderer initialized');
    }
    
    /**
     * スプライトデータを追加
     * @param {string} name - スプライト名
     * @param {Object} spriteData - スプライトデータ
     */
    addSprite(name, spriteData) {
        this.sprites.set(name, spriteData);
        console.log(`Sprite added: ${name}`);
    }
    
    /**
     * アニメーションデータを追加
     * @param {string} name - アニメーション名
     * @param {Object} animationData - アニメーションデータ
     */
    addAnimation(name, animationData) {
        this.animations.set(name, {
            frames: animationData.frames || [],
            duration: animationData.duration || 500, // ミリ秒
            loop: animationData.loop !== false, // デフォルトはループ
            ...animationData
        });
        console.log(`Animation added: ${name}`);
    }
    
    /**
     * アニメーションを設定
     * @param {string} animationName - アニメーション名
     */
    setAnimation(animationName) {
        const animation = this.animations.get(animationName);
        if (!animation) {
            console.warn(`Animation not found: ${animationName}`);
            return false;
        }
        
        // 同じアニメーションの場合は何もしない
        if (this.currentAnimation === animationName) {
            return true;
        }
        
        this.currentAnimation = animationName;
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.isPlaying = true;
        
        return true;
    }
    
    /**
     * アニメーションを停止
     */
    stopAnimation() {
        this.isPlaying = false;
        this.currentFrame = 0;
        this.animationTimer = 0;
    }
    
    /**
     * アニメーションを一時停止
     */
    pauseAnimation() {
        this.isPlaying = false;
    }
    
    /**
     * アニメーションを再開
     */
    resumeAnimation() {
        if (this.currentAnimation) {
            this.isPlaying = true;
        }
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (!this.isPlaying || !this.currentAnimation) {
            return;
        }
        
        const animation = this.animations.get(this.currentAnimation);
        if (!animation || animation.frames.length === 0) {
            return;
        }
        
        this.animationTimer += deltaTime;
        
        // フレーム時間の計算
        const frameTime = animation.duration / animation.frames.length;
        
        if (this.animationTimer >= frameTime) {
            this.currentFrame++;
            this.animationTimer = 0;
            
            // アニメーション終了の処理
            if (this.currentFrame >= animation.frames.length) {
                if (animation.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = animation.frames.length - 1;
                    this.isPlaying = false;
                }
            }
        }
    }
    
    /**
     * スプライトを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {string} spriteName - スプライト名（オプション）
     * @param {number} frame - フレーム番号（オプション）
     */
    render(context, x, y, spriteName = null, frame = null) {
        let targetSprite = null;
        let targetFrame = 0;
        
        // スプライトとフレームの決定
        if (spriteName) {
            targetSprite = spriteName;
            targetFrame = frame || 0;
        } else if (this.currentAnimation) {
            const animation = this.animations.get(this.currentAnimation);
            if (animation && animation.frames.length > 0) {
                targetFrame = Math.min(this.currentFrame, animation.frames.length - 1);
                targetSprite = animation.frames[targetFrame].sprite || animation.sprite;
            }
        }
        
        if (!targetSprite) {
            // デフォルトスプライトを描画
            this.renderDefaultSprite(context, x, y);
            return;
        }
        
        // スプライトデータを取得
        const spriteData = this.sprites.get(targetSprite);
        if (spriteData && spriteData.image) {
            this.renderSpriteFromImage(context, x, y, spriteData, targetFrame);
        } else {
            // プロシージャル生成スプライトを描画
            this.renderProceduralSprite(context, x, y, targetSprite, targetFrame);
        }
    }
    
    /**
     * 画像からスプライトを描画
     */
    renderSpriteFromImage(context, x, y, spriteData, frame) {
        const image = spriteData.image;
        const frameX = (frame % spriteData.framesPerRow) * this.spriteWidth;
        const frameY = Math.floor(frame / spriteData.framesPerRow) * this.spriteHeight;
        
        context.drawImage(
            image,
            frameX, frameY, this.spriteWidth, this.spriteHeight,
            x, y, this.spriteWidth, this.spriteHeight
        );
    }
    
    /**
     * プロシージャル生成スプライトを描画
     */
    renderProceduralSprite(context, x, y, spriteName, frame) {
        switch (spriteName) {
            case 'character_idle':
                this.renderCharacterIdle(context, x, y, frame);
                break;
            case 'character_walk':
                this.renderCharacterWalk(context, x, y, frame);
                break;
            default:
                this.renderDefaultSprite(context, x, y);
                break;
        }
    }
    
    /**
     * キャラクターのアイドルスプライトを描画
     */
    renderCharacterIdle(context, x, y, frame) {
        // 32x32ピクセルのドット絵キャラクター（アイドル状態）
        const pixelSize = 2; // 2倍サイズ
        
        // ベースカラー
        const bodyColor = '#3498db';
        const headColor = '#f39c12';
        const eyeColor = '#2c3e50';
        
        // 頭部（上部6ピクセル）
        context.fillStyle = headColor;
        context.fillRect(x + 4 * pixelSize, y + 2 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        // 目
        context.fillStyle = eyeColor;
        context.fillRect(x + 6 * pixelSize, y + 4 * pixelSize, 1 * pixelSize, 1 * pixelSize);
        context.fillRect(x + 9 * pixelSize, y + 4 * pixelSize, 1 * pixelSize, 1 * pixelSize);
        
        // 体部（中央部6ピクセル）
        context.fillStyle = bodyColor;
        context.fillRect(x + 5 * pixelSize, y + 8 * pixelSize, 6 * pixelSize, 6 * pixelSize);
        
        // 足部（下部2ピクセル）
        context.fillStyle = '#2c3e50';
        context.fillRect(x + 6 * pixelSize, y + 14 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        context.fillRect(x + 8 * pixelSize, y + 14 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        
        // アイドル時の微細なアニメーション（呼吸効果）
        if (frame % 2 === 1) {
            // 軽微な色調変化で呼吸を表現
            context.fillStyle = 'rgba(255, 255, 255, 0.1)';
            context.fillRect(x + 5 * pixelSize, y + 8 * pixelSize, 6 * pixelSize, 6 * pixelSize);
        }
    }
    
    /**
     * キャラクターの歩行スプライトを描画
     */
    renderCharacterWalk(context, x, y, frame) {
        // 32x32ピクセルのドット絵キャラクター（歩行状態）
        const pixelSize = 2; // 2倍サイズ
        
        // ベースカラー
        const bodyColor = '#3498db';
        const headColor = '#f39c12';
        const eyeColor = '#2c3e50';
        
        // 頭部（上部6ピクセル）
        context.fillStyle = headColor;
        
        // 歩行時の頭の上下動
        const headBob = frame % 2 === 0 ? 0 : 1;
        context.fillRect(x + 4 * pixelSize, y + (2 + headBob) * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        // 目
        context.fillStyle = eyeColor;
        context.fillRect(x + 6 * pixelSize, y + (4 + headBob) * pixelSize, 1 * pixelSize, 1 * pixelSize);
        context.fillRect(x + 9 * pixelSize, y + (4 + headBob) * pixelSize, 1 * pixelSize, 1 * pixelSize);
        
        // 体部（中央部6ピクセル）
        context.fillStyle = bodyColor;
        context.fillRect(x + 5 * pixelSize, y + (8 + headBob) * pixelSize, 6 * pixelSize, 6 * pixelSize);
        
        // 足部（歩行アニメーション）
        context.fillStyle = '#2c3e50';
        
        if (frame % 4 < 2) {
            // 左足前、右足後
            context.fillRect(x + 5 * pixelSize, y + 14 * pixelSize, 2 * pixelSize, 2 * pixelSize);
            context.fillRect(x + 9 * pixelSize, y + 15 * pixelSize, 2 * pixelSize, 1 * pixelSize);
        } else {
            // 右足前、左足後
            context.fillRect(x + 9 * pixelSize, y + 14 * pixelSize, 2 * pixelSize, 2 * pixelSize);
            context.fillRect(x + 5 * pixelSize, y + 15 * pixelSize, 2 * pixelSize, 1 * pixelSize);
        }
        
        // 歩行時のエフェクト
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        context.fillRect(x + 5 * pixelSize, y + (8 + headBob) * pixelSize, 6 * pixelSize, 6 * pixelSize);
    }
    
    /**
     * デフォルトスプライトを描画
     */
    renderDefaultSprite(context, x, y) {
        // シンプルな32x32の四角形
        context.fillStyle = '#3498db';
        context.fillRect(x, y, this.spriteWidth, this.spriteHeight);
        
        // 境界線
        context.strokeStyle = '#2980b9';
        context.lineWidth = 1;
        context.strokeRect(x, y, this.spriteWidth, this.spriteHeight);
        
        // 中央に小さな点
        context.fillStyle = '#ecf0f1';
        context.fillRect(x + 14, y + 14, 4, 4);
    }
    
    /**
     * 現在のアニメーション名を取得
     * @returns {string|null} 現在のアニメーション名
     */
    getCurrentAnimation() {
        return this.currentAnimation;
    }
    
    /**
     * 現在のフレーム番号を取得
     * @returns {number} 現在のフレーム番号
     */
    getCurrentFrame() {
        return this.currentFrame;
    }
    
    /**
     * アニメーションが再生中かどうかを確認
     * @returns {boolean} 再生中かどうか
     */
    getIsPlaying() {
        return this.isPlaying;
    }
    
    /**
     * アニメーションが存在するかチェック
     * @param {string} animationName - アニメーション名
     * @returns {boolean} アニメーションが存在するかどうか
     */
    hasAnimation(animationName) {
        return this.animations.has(animationName);
    }
    
    /**
     * スプライトが存在するかチェック
     * @param {string} spriteName - スプライト名
     * @returns {boolean} スプライトが存在するかどうか
     */
    hasSprite(spriteName) {
        return this.sprites.has(spriteName);
    }
    
    /**
     * 登録されているアニメーション一覧を取得
     * @returns {Array<string>} アニメーション名の配列
     */
    getAnimationNames() {
        return Array.from(this.animations.keys());
    }
    
    /**
     * 登録されているスプライト一覧を取得
     * @returns {Array<string>} スプライト名の配列
     */
    getSpriteNames() {
        return Array.from(this.sprites.keys());
    }
    
    /**
     * リソースの破棄
     */
    destroy() {
        this.sprites.clear();
        this.animations.clear();
        this.currentAnimation = null;
        this.isPlaying = false;
        console.log('SpriteRenderer destroyed');
    }
}

/**
 * AnimationController - アニメーション制御クラス
 * PlayerCharacterと連携してアニメーションを自動制御
 */
class AnimationController {
    constructor(spriteRenderer) {
        this.spriteRenderer = spriteRenderer;
        this.lastDirection = 'down';
        this.lastMovingState = false;
        
        // デフォルトアニメーションを設定
        this.setupDefaultAnimations();
        
        console.log('AnimationController initialized');
    }
    
    /**
     * デフォルトアニメーションの設定
     */
    setupDefaultAnimations() {
        // アイドルアニメーション
        this.spriteRenderer.addAnimation('idle', {
            frames: [
                { sprite: 'character_idle' },
                { sprite: 'character_idle' }
            ],
            duration: 2000, // 2秒
            loop: true
        });
        
        // 歩行アニメーション
        this.spriteRenderer.addAnimation('walk', {
            frames: [
                { sprite: 'character_walk' },
                { sprite: 'character_walk' },
                { sprite: 'character_walk' },
                { sprite: 'character_walk' }
            ],
            duration: 600, // 0.6秒
            loop: true
        });
    }
    
    /**
     * プレイヤーの状態に基づいてアニメーションを更新
     * @param {boolean} isMoving - 移動中かどうか
     * @param {string} direction - 移動方向
     */
    updateAnimation(isMoving, direction) {
        // 状態が変わった場合のみアニメーションを変更
        if (isMoving !== this.lastMovingState || direction !== this.lastDirection) {
            if (isMoving) {
                this.spriteRenderer.setAnimation('walk');
            } else {
                this.spriteRenderer.setAnimation('idle');
            }
            
            this.lastMovingState = isMoving;
            this.lastDirection = direction;
        }
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        this.spriteRenderer.update(deltaTime);
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     */
    render(context, x, y) {
        this.spriteRenderer.render(context, x, y);
    }
    
    /**
     * リソースの破棄
     */
    destroy() {
        if (this.spriteRenderer) {
            this.spriteRenderer.destroy();
        }
        console.log('AnimationController destroyed');
    }
}