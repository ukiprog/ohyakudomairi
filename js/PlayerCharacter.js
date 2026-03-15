/**
 * PlayerCharacter - プレイヤーキャラクタークラス
 * キャラクターの位置管理、移動機能、入力処理を担当
 */
class PlayerCharacter {
    constructor(x = 0, y = 0) {
        // 位置情報
        this.x = x;
        this.y = y;
        this.previousX = x;
        this.previousY = y;
        
        // キャラクターのサイズ（32x32ピクセル）
        this.width = 32;
        this.height = 32;
        
        // 移動速度（ピクセル/秒）
        this.moveSpeed = 300;
        
        // 移動状態
        this.isMoving = false;
        this.direction = 'down'; // 'up', 'down', 'left', 'right'
        this.targetX = x;
        this.targetY = y;
        
        // スプライトレンダリングシステムを無効化（フォールバック描画を使用）
        this.spriteRenderer = null;
        this.animationController = null;
        
        // デバッグ表示フラグ
        this.showDebugInfo = false;
        
        // 音響システム
        this.audioManager = window.audioManager || null;
        this.footstepTimer = 0;
        this.footstepInterval = 400; // 足音の間隔（ミリ秒）
        this.lastFootstepTime = 0;
        
        console.log('PlayerCharacter audioManager:', this.audioManager ? 'available' : 'not available');
        
        // 入力状態
        this.inputState = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // 境界制限
        this.bounds = {
            minX: 0,
            minY: 0,
            maxX: 800,
            maxY: 600
        };
        
        // イベントハンドラーのバインド
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        
        // タッチ操作用の変数
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isTouching = false;
        this.touchThreshold = 20; // タッチ移動の閾値
        
        console.log(`PlayerCharacter created at position (${x}, ${y})`);
    }
    
    /**
     * 入力イベントリスナーを設定
     */
    setupInputListeners() {
        // キーボード入力
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // タッチ入力はTouchControlsクラスが管理するため、ここでは登録しない
        
        console.log('PlayerCharacter input listeners setup');
    }
    
    /**
     * 入力イベントリスナーを削除
     */
    removeInputListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        console.log('PlayerCharacter input listeners removed');
    }
    
    /**
     * キーダウンイベントの処理
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.inputState.up = true;
                event.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.inputState.down = true;
                event.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.inputState.left = true;
                event.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.inputState.right = true;
                event.preventDefault();
                break;
        }
    }
    
    /**
     * キーアップイベントの処理
     */
    handleKeyUp(event) {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.inputState.up = false;
                event.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.inputState.down = false;
                event.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.inputState.left = false;
                event.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.inputState.right = false;
                event.preventDefault();
                break;
        }
    }
    
    /**
     * タッチ開始イベントの処理
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const canvas = event.target;
            const rect = canvas.getBoundingClientRect();
            
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.isTouching = true;
        }
    }
    
    /**
     * タッチ終了イベントの処理
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        this.isTouching = false;
        
        // すべての入力状態をリセット
        this.inputState.up = false;
        this.inputState.down = false;
        this.inputState.left = false;
        this.inputState.right = false;
    }
    
    /**
     * タッチ移動イベントの処理
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (!this.isTouching || event.touches.length === 0) {
            return;
        }
        
        const touch = event.touches[0];
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        const deltaX = currentX - this.touchStartX;
        const deltaY = currentY - this.touchStartY;
        
        // 閾値を超えた場合のみ移動として認識
        if (Math.abs(deltaX) > this.touchThreshold || Math.abs(deltaY) > this.touchThreshold) {
            // すべての入力状態をリセット
            this.inputState.up = false;
            this.inputState.down = false;
            this.inputState.left = false;
            this.inputState.right = false;
            
            // 主要な移動方向を決定
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平移動
                if (deltaX > 0) {
                    this.inputState.right = true;
                } else {
                    this.inputState.left = true;
                }
            } else {
                // 垂直移動
                if (deltaY > 0) {
                    this.inputState.down = true;
                } else {
                    this.inputState.up = true;
                }
            }
        }
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 前の位置を保存
        this.previousX = this.x;
        this.previousY = this.y;
        
        // 入力に基づく移動処理
        this.processMovement(deltaTime);
        
        // 境界チェック
        this.checkBounds();
        
        // 移動状態の更新
        this.updateMovementState();
        
        // 足音の処理
        this.updateFootstepSound(deltaTime);
        
        // アニメーションの更新は無効化（フォールバック描画を使用）
        // this.animationController.updateAnimation(this.isMoving, this.direction);
        // this.animationController.update(deltaTime);
    }
    
    /**
     * 移動処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    processMovement(deltaTime) {
        const moveDistance = (this.moveSpeed * deltaTime) / 1000; // ピクセル/フレーム
        
        let newX = this.x;
        let newY = this.y;
        let hasMovement = false;
        
        // 垂直移動
        if (this.inputState.up && !this.inputState.down) {
            newY -= moveDistance;
            this.direction = 'up';
            hasMovement = true;
        } else if (this.inputState.down && !this.inputState.up) {
            newY += moveDistance;
            this.direction = 'down';
            hasMovement = true;
        }
        
        // 水平移動
        if (this.inputState.left && !this.inputState.right) {
            newX -= moveDistance;
            this.direction = 'left';
            hasMovement = true;
        } else if (this.inputState.right && !this.inputState.left) {
            newX += moveDistance;
            this.direction = 'right';
            hasMovement = true;
        }
        
        // 斜め移動の場合は速度を調整（√2で割る）
        if ((this.inputState.up || this.inputState.down) && 
            (this.inputState.left || this.inputState.right)) {
            const diagonalFactor = 1 / Math.sqrt(2);
            newX = this.x + (newX - this.x) * diagonalFactor;
            newY = this.y + (newY - this.y) * diagonalFactor;
        }
        
        // 位置を更新
        this.x = newX;
        this.y = newY;
        this.isMoving = hasMovement;
    }
    
    /**
     * 境界チェック
     */
    checkBounds() {
        // X座標の境界チェック
        if (this.x < this.bounds.minX) {
            this.x = this.bounds.minX;
        } else if (this.x + this.width > this.bounds.maxX) {
            this.x = this.bounds.maxX - this.width;
        }
        
        // Y座標の境界チェック
        if (this.y < this.bounds.minY) {
            this.y = this.bounds.minY;
        } else if (this.y + this.height > this.bounds.maxY) {
            this.y = this.bounds.maxY - this.height;
        }
    }
    
    /**
     * 移動状態の更新
     */
    updateMovementState() {
        // 実際に位置が変わったかどうかで移動状態を判定
        this.isMoving = (this.x !== this.previousX || this.y !== this.previousY);
    }
    
    /**
     * 足音の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateFootstepSound(deltaTime) {
        if (!this.audioManager) {
            return;
        }
        
        if (!this.isMoving) {
            return;
        }
        
        // 足音タイマーの更新
        this.footstepTimer += deltaTime;
        
        // 足音の間隔に達した場合に音を再生
        if (this.footstepTimer >= this.footstepInterval) {
            this.playFootstepSound();
            this.footstepTimer = 0;
        }
    }
    
    /**
     * 足音を再生
     */
    playFootstepSound() {
        if (!this.audioManager) {
            console.warn('AudioManager not available for footstep sound');
            return;
        }
        
        console.log('Playing footstep sound');
        
        // 足音の音量を調整（0.3で控えめに）
        this.audioManager.playSFX('footstep', 0.3);
    }
    
    /**
     * 描画処理（確実にフォールバック描画を使用）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        // 確実にシンプルなキャラクターを描画
        this.renderSimpleCharacter(context);
        
        // デバッグ情報（開発時のみ）
        if (this.showDebugInfo) {
            this.renderDebugInfo(context);
        }
    }
    
    /**
     * シンプルなキャラクターの描画（フォールバック用）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderSimpleCharacter(context) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 体（縦長の四角形）
        context.fillStyle = '#FF6B6B';
        context.fillRect(centerX - 8, centerY - 2, 16, 20);
        
        // 頭（円形）
        context.fillStyle = '#FFE4B5';
        context.beginPath();
        context.arc(centerX, centerY - 8, 8, 0, Math.PI * 2);
        context.fill();
        
        // 目
        context.fillStyle = '#2C3E50';
        context.beginPath();
        context.arc(centerX - 3, centerY - 10, 1.5, 0, Math.PI * 2);
        context.fill();
        
        context.beginPath();
        context.arc(centerX + 3, centerY - 10, 1.5, 0, Math.PI * 2);
        context.fill();
        
        // 方向インジケーター
        if (this.isMoving) {
            this.renderDirectionIndicator(context);
        }
        
        // 輪郭
        context.strokeStyle = '#2C3E50';
        context.lineWidth = 1;
        
        // 体の輪郭
        context.strokeRect(centerX - 8, centerY - 2, 16, 20);
        
        // 頭の輪郭
        context.beginPath();
        context.arc(centerX, centerY - 8, 8, 0, Math.PI * 2);
        context.stroke();
    }
    
    /**
     * 方向インジケーターの描画
     */
    renderDirectionIndicator(context) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        context.fillStyle = '#e74c3c';
        context.beginPath();
        
        switch (this.direction) {
            case 'up':
                context.moveTo(centerX, centerY - 4);
                context.lineTo(centerX - 3, centerY + 2);
                context.lineTo(centerX + 3, centerY + 2);
                break;
            case 'down':
                context.moveTo(centerX, centerY + 4);
                context.lineTo(centerX - 3, centerY - 2);
                context.lineTo(centerX + 3, centerY - 2);
                break;
            case 'left':
                context.moveTo(centerX - 4, centerY);
                context.lineTo(centerX + 2, centerY - 3);
                context.lineTo(centerX + 2, centerY + 3);
                break;
            case 'right':
                context.moveTo(centerX + 4, centerY);
                context.lineTo(centerX - 2, centerY - 3);
                context.lineTo(centerX - 2, centerY + 3);
                break;
        }
        
        context.closePath();
        context.fill();
    }
    
    /**
     * デバッグ情報の描画
     */
    renderDebugInfo(context) {
        context.fillStyle = '#ecf0f1';
        context.font = '10px Arial';
        context.textAlign = 'left';
        context.fillText(`Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`, this.x, this.y - 5);
        context.fillText(`Dir: ${this.direction}`, this.x, this.y - 15);
        
        if (this.isMoving) {
            context.fillStyle = '#2ecc71';
            context.fillText('Moving', this.x, this.y - 25);
        }
    }
    
    /**
     * 位置を設定
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    setPosition(x, y) {
        this.previousX = this.x;
        this.previousY = this.y;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        
        // 境界チェック
        this.checkBounds();
    }
    
    /**
     * 位置を取得
     * @returns {Object} 位置情報 {x, y}
     */
    getPosition() {
        return { x: this.x, y: this.y };
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
     * 他のオブジェクトとの衝突判定
     * @param {Object} object - 衝突判定対象のオブジェクト
     * @returns {boolean} 衝突しているかどうか
     */
    checkCollision(object) {
        if (!object || typeof object.getBounds !== 'function') {
            return false;
        }
        
        const thisBounds = this.getBounds();
        const otherBounds = object.getBounds();
        
        return (
            thisBounds.x < otherBounds.x + otherBounds.width &&
            thisBounds.x + thisBounds.width > otherBounds.x &&
            thisBounds.y < otherBounds.y + otherBounds.height &&
            thisBounds.y + thisBounds.height > otherBounds.y
        );
    }
    
    /**
     * 移動速度を設定
     * @param {number} speed - 移動速度（ピクセル/秒）
     */
    setMoveSpeed(speed) {
        this.moveSpeed = Math.max(0, speed);
    }
    
    /**
     * 移動速度を取得
     * @returns {number} 移動速度
     */
    getMoveSpeed() {
        return this.moveSpeed;
    }
    
    /**
     * 境界を設定
     * @param {number} minX - 最小X座標
     * @param {number} minY - 最小Y座標
     * @param {number} maxX - 最大X座標
     * @param {number} maxY - 最大Y座標
     */
    setBounds(minX, minY, maxX, maxY) {
        this.bounds = { minX, minY, maxX, maxY };
        
        // 現在位置が境界外の場合は調整
        this.checkBounds();
    }
    
    /**
     * 移動状態を取得
     * @returns {boolean} 移動中かどうか
     */
    getIsMoving() {
        return this.isMoving;
    }
    
    /**
     * 現在の方向を取得
     * @returns {string} 方向 ('up', 'down', 'left', 'right')
     */
    getDirection() {
        return this.direction;
    }
    
    /**
     * 入力状態を取得（デバッグ用）
     * @returns {Object} 入力状態
     */
    getInputState() {
        return { ...this.inputState };
    }
    
    /**
     * デバッグ表示の切り替え
     * @param {boolean} show - デバッグ情報を表示するかどうか
     */
    setDebugDisplay(show) {
        this.showDebugInfo = show;
    }
    
    /**
     * スプライトレンダラーを取得
     * @returns {SpriteRenderer} スプライトレンダラー
     */
    getSpriteRenderer() {
        return this.spriteRenderer;
    }
    
    /**
     * アニメーションコントローラーを取得
     * @returns {AnimationController} アニメーションコントローラー
     */
    getAnimationController() {
        return this.animationController;
    }
    
    /**
     * リソースの破棄
     */
    destroy() {
        this.removeInputListeners();
        
        if (this.animationController && this.animationController.destroy) {
            try {
                this.animationController.destroy();
            } catch (error) {
                // エラーを無視
            }
        }
        
        if (this.spriteRenderer && this.spriteRenderer.destroy) {
            try {
                this.spriteRenderer.destroy();
            } catch (error) {
                // エラーを無視
            }
        }
        
        console.log('PlayerCharacter destroyed');
    }
}