/**
 * ProgressUI - 御百度参りの進捗表示UIコンポーネント
 * 往復回数、残り回数、進捗バー、中間メッセージを表示
 */
class ProgressUI {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // UI配置設定（名前・願い事パネルの下に配置）
        this.progressBarX = 20;
        this.progressBarY = 175;  // テキストパネルの下
        this.progressBarWidth = 300;
        this.progressBarHeight = 20;
        
        // 中間メッセージ設定
        this.midpointMessage = {
            show: false,
            text: '50往復達成！あと半分です！',
            displayTime: 3000, // 3秒間表示
            startTime: 0,
            alpha: 1.0
        };
        
        // アニメーション設定
        this.progressBarAnimation = {
            currentWidth: 0,
            targetWidth: 0,
            animationSpeed: 0.05
        };
        
        console.log('ProgressUI initialized');
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 進捗バーのアニメーション更新
        this.updateProgressBarAnimation();
        
        // 中間メッセージの更新
        this.updateMidpointMessage(deltaTime);
    }
    
    /**
     * 進捗バーのアニメーション更新
     */
    updateProgressBarAnimation() {
        const diff = this.progressBarAnimation.targetWidth - this.progressBarAnimation.currentWidth;
        if (Math.abs(diff) > 0.5) {
            this.progressBarAnimation.currentWidth += diff * this.progressBarAnimation.animationSpeed;
        } else {
            this.progressBarAnimation.currentWidth = this.progressBarAnimation.targetWidth;
        }
    }
    
    /**
     * 中間メッセージの更新
     * @param {number} deltaTime - 経過時間
     */
    updateMidpointMessage(deltaTime) {
        if (!this.midpointMessage.show) return;
        
        const elapsed = performance.now() - this.midpointMessage.startTime;
        
        if (elapsed > this.midpointMessage.displayTime) {
            // フェードアウト
            this.midpointMessage.alpha -= 0.02;
            if (this.midpointMessage.alpha <= 0) {
                this.midpointMessage.show = false;
                this.midpointMessage.alpha = 1.0;
            }
        }
    }
    
    /**
     * 進捗情報を更新
     * @param {number} currentCount - 現在の往復回数
     * @param {number} remainingCount - 残り往復回数
     * @param {number} progressPercentage - 進捗率（0-100）
     */
    updateProgress(currentCount, remainingCount, progressPercentage) {
        // 進捗バーの目標幅を更新
        this.progressBarAnimation.targetWidth = (progressPercentage / 100) * this.progressBarWidth;
    }
    
    /**
     * 50往復達成時の中間メッセージを表示
     */
    showMidpointMessage() {
        this.midpointMessage.show = true;
        this.midpointMessage.startTime = performance.now();
        this.midpointMessage.alpha = 1.0;
        console.log('Showing midpoint message');
    }
    
    /**
     * UI全体の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} currentCount - 現在の往復回数
     * @param {number} remainingCount - 残り往復回数
     * @param {number} progressPercentage - 進捗率
     */
    render(context, currentCount, remainingCount, progressPercentage) {
        const w = context.canvas.width;
        const h = context.canvas.height;
        // canvasサイズが変わった場合に追従
        if (w !== this.canvasWidth || h !== this.canvasHeight) {
            this.canvasWidth  = w;
            this.canvasHeight = h;
            this.progressBarWidth = Math.min(300, w - 40);
        }
        this.renderProgressText(context, currentCount, remainingCount, progressPercentage);
        this.renderProgressBar(context, progressPercentage);
        this.renderMidpointMessage(context);
    }
    
    /**
     * 進捗情報テキストの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} currentCount - 現在の往復回数
     * @param {number} remainingCount - 残り往復回数
     * @param {number} progressPercentage - 進捗率
     */
    renderProgressText(context, currentCount, remainingCount, progressPercentage) {
        // 背景パネル（テキスト2行 + 進捗バー + 50ラベルを含む高さ）
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(10, 100, 320, 90);
        context.strokeStyle = '#3498db';
        context.lineWidth = 2;
        context.strokeRect(10, 100, 320, 90);
        
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        // 往復回数
        context.fillStyle = '#ecf0f1';
        context.font = 'bold 16px Arial';
        context.fillText(`往復回数: ${currentCount} / 100`, 20, 108);
        
        // 残り回数
        context.fillStyle = '#f39c12';
        context.fillText(`残り: ${remainingCount}回`, 200, 108);
        
        // 進捗率
        context.fillStyle = '#2ecc71';
        context.font = '13px Arial';
        context.fillText(`進捗: ${progressPercentage.toFixed(1)}%`, 20, 128);
    }
    
    /**
     * 進捗バーの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} progressPercentage - 進捗率
     */
    renderProgressBar(context, progressPercentage) {
        // 進捗バーの背景（パネル内 y=148）
        context.fillStyle = '#34495e';
        context.fillRect(this.progressBarX, 148, this.progressBarWidth, this.progressBarHeight);
        
        context.strokeStyle = '#7f8c8d';
        context.lineWidth = 1;
        context.strokeRect(this.progressBarX, 148, this.progressBarWidth, this.progressBarHeight);
        
        // 進捗バーの塗りつぶし
        if (this.progressBarAnimation.currentWidth > 0) {
            const gradient = context.createLinearGradient(
                this.progressBarX, 0,
                this.progressBarX + this.progressBarWidth, 0
            );
            
            if (progressPercentage < 50) {
                gradient.addColorStop(0, '#3498db');
                gradient.addColorStop(1, '#2980b9');
            } else if (progressPercentage < 100) {
                gradient.addColorStop(0, '#2ecc71');
                gradient.addColorStop(1, '#27ae60');
            } else {
                gradient.addColorStop(0, '#f1c40f');
                gradient.addColorStop(1, '#f39c12');
            }
            
            context.fillStyle = gradient;
            context.fillRect(this.progressBarX, 148, this.progressBarAnimation.currentWidth, this.progressBarHeight);
        }
        
        // 50%マーカー
        const midpointX = this.progressBarX + (this.progressBarWidth * 0.5);
        context.strokeStyle = '#e74c3c';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(midpointX, 144);
        context.lineTo(midpointX, 168);
        context.stroke();
        
        // 50%ラベル（パネル内右端）
        context.fillStyle = '#e74c3c';
        context.font = '11px Arial';
        context.textAlign = 'center';
        context.fillText('50', midpointX, 172);
    }
    
    /**
     * 中間メッセージの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderMidpointMessage(context) {
        if (!this.midpointMessage.show) return;
        
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // 半透明背景
        context.save();
        context.globalAlpha = this.midpointMessage.alpha * 0.8;
        context.fillStyle = 'rgba(231, 76, 60, 0.9)';
        context.fillRect(centerX - 200, centerY - 40, 400, 80);
        
        // 枠線
        context.strokeStyle = '#c0392b';
        context.lineWidth = 3;
        context.strokeRect(centerX - 200, centerY - 40, 400, 80);
        
        // メッセージテキスト
        context.globalAlpha = this.midpointMessage.alpha;
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.midpointMessage.text, centerX, centerY);
        
        // 装飾的な星マーク
        this.renderStars(context, centerX, centerY - 60, this.midpointMessage.alpha);
        this.renderStars(context, centerX, centerY + 60, this.midpointMessage.alpha);
        
        context.restore();
    }
    
    /**
     * 装飾用の星マークを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} centerX - 中心X座標
     * @param {number} centerY - 中心Y座標
     * @param {number} alpha - 透明度
     */
    renderStars(context, centerX, centerY, alpha) {
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = '#f1c40f';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 複数の星を配置
        const starPositions = [-60, -30, 0, 30, 60];
        starPositions.forEach(offset => {
            context.fillText('★', centerX + offset, centerY);
        });
        
        context.restore();
    }
    
    /**
     * 完了メッセージの表示
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderCompletionMessage(context) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // 背景
        context.fillStyle = 'rgba(46, 204, 113, 0.95)';
        context.fillRect(centerX - 250, centerY - 60, 500, 120);
        
        // 枠線
        context.strokeStyle = '#27ae60';
        context.lineWidth = 4;
        context.strokeRect(centerX - 250, centerY - 60, 500, 120);
        
        // 完了メッセージ
        context.fillStyle = '#ffffff';
        context.font = 'bold 28px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('御百度参り完了！', centerX, centerY - 20);
        
        context.font = '18px Arial';
        context.fillText('神様がお出ましになります...', centerX, centerY + 20);
        
        // 装飾
        this.renderStars(context, centerX, centerY - 80, 1.0);
        this.renderStars(context, centerX, centerY + 80, 1.0);
    }
    
    /**
     * UIコンポーネントの破棄処理
     */
    destroy() {
        // 必要に応じてクリーンアップ処理を追加
        console.log('ProgressUI destroyed');
    }
}