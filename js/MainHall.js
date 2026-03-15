/**
 * MainHall - 社殿クラス
 * 御百度参りの終点となる社殿オブジェクト
 */
class MainHall extends EnvironmentObject {
    constructor(x, y) {
        // 社殿のサイズ（200x160ピクセル）
        super(x, y, 200, 160, 'main-hall');
        
        // 社殿特有のプロパティ
        this.isInteractable = true;
        this.hasCollision = true;
        
        // プレイヤーとの相互作用状態
        this.isPlayerNear = false;
        this.lastPlayerReachTime = 0;
        
        // 到達イベント用のコールバック
        this.onReachCallback = null;
        this.onLeaveCallback = null;
        
        // 視覚効果用のプロパティ
        this.sacredAura = 0;
        this.auraDirection = 1;
        this.animationTime = 0;
        
        // 屋根の色変化用
        this.roofColorPhase = 0;
        
        // 音響システム
        this.audioManager = window.audioManager || null;
        
        console.log(`MainHall created at (${x}, ${y})`);
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // アニメーション時間の更新
        this.animationTime += deltaTime;
        
        // 神聖なオーラ効果の更新
        this.updateSacredAura(deltaTime);
        
        // 屋根の色変化の更新
        this.roofColorPhase += deltaTime * 0.001;
    }
    
    /**
     * 神聖なオーラ効果の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateSacredAura(deltaTime) {
        if (this.isPlayerNear) {
            // プレイヤーが近くにいる場合はオーラ効果を強くする
            this.sacredAura += this.auraDirection * (deltaTime / 1000) * 1.5;
            
            if (this.sacredAura >= 1) {
                this.sacredAura = 1;
                this.auraDirection = -1;
            } else if (this.sacredAura <= 0.2) {
                this.sacredAura = 0.2;
                this.auraDirection = 1;
            }
        } else {
            // プレイヤーが離れている場合は徐々にオーラ効果を弱くする
            this.sacredAura = Math.max(0, this.sacredAura - (deltaTime / 1000) * 0.3);
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
        
        // 神聖なオーラ効果の描画
        if (this.sacredAura > 0) {
            this.renderSacredAura(context);
        }
        
        // 社殿本体の描画
        this.renderHallStructure(context);
        
        // 屋根の描画
        this.renderRoof(context);
        
        // 装飾の描画
        this.renderDecorations(context);
        
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
     * 神聖なオーラ効果の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderSacredAura(context) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const maxRadius = Math.max(this.width, this.height) * 0.7;
        
        // 複数のオーラ層を描画
        for (let i = 0; i < 3; i++) {
            const radius = maxRadius * (0.3 + i * 0.3);
            const alpha = this.sacredAura * (0.15 - i * 0.03);
            
            const gradient = context.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );
            
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 215, 0, ${alpha * 0.7})`);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    /**
     * 社殿構造の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderHallStructure(context) {
        // 影の描画
        context.fillStyle = '#7f8c8d';
        context.fillRect(this.x + 3, this.y + 3, this.width, this.height);
        
        // 社殿本体（木造部分）
        context.fillStyle = '#d35400';
        context.fillRect(this.x, this.y + 40, this.width, this.height - 40);
        
        // 柱の描画（より太く、本格的に）
        const pillarWidth = 16;
        const pillarCount = 5;
        const pillarSpacing = (this.width - pillarWidth * pillarCount) / (pillarCount - 1);
        context.fillStyle = '#a0522d';
        
        for (let i = 0; i < pillarCount; i++) {
            const pillarX = this.x + i * (pillarWidth + pillarSpacing);
            context.fillRect(pillarX, this.y + 40, pillarWidth, this.height - 40);
            
            // 柱の装飾
            context.fillStyle = '#8B4513';
            context.fillRect(pillarX + 2, this.y + 50, 3, this.height - 50);
            context.fillStyle = '#a0522d';
        }
        
        // 横梁（よこばり）
        context.fillStyle = '#8B4513';
        context.fillRect(this.x, this.y + 60, this.width, 8);
        context.fillRect(this.x, this.y + 100, this.width, 6);
        
        // 基礎部分（石造り風）
        context.fillStyle = '#95a5a6';
        context.fillRect(this.x - 8, this.y + this.height - 25, this.width + 16, 25);
        
        // 基礎の装飾
        context.fillStyle = '#7f8c8d';
        context.fillRect(this.x - 6, this.y + this.height - 23, this.width + 12, 3);
        
        // 階段（3段）
        context.fillStyle = '#bdc3c7';
        for (let i = 0; i < 3; i++) {
            const stepHeight = 8;
            const stepY = this.y + this.height - 25 + i * stepHeight;
            const stepWidth = this.width + 16 + i * 6;
            const stepX = this.x - 8 - i * 3;
            context.fillRect(stepX, stepY, stepWidth, stepHeight);
            
            // 階段の縁
            context.fillStyle = '#95a5a6';
            context.fillRect(stepX, stepY, stepWidth, 2);
            context.fillStyle = '#bdc3c7';
        }
    }
    
    /**
     * 屋根の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderRoof(context) {
        // 屋根の色（時間によって微妙に変化）
        const colorIntensity = 0.8 + Math.sin(this.roofColorPhase) * 0.2;
        const roofColor = `rgb(${Math.floor(139 * colorIntensity)}, ${Math.floor(69 * colorIntensity)}, ${Math.floor(19 * colorIntensity)})`;
        
        // メイン屋根（より大きく、立派に）
        context.fillStyle = roofColor;
        context.beginPath();
        context.moveTo(this.x - 30, this.y + 40);
        context.lineTo(this.x + this.width / 2, this.y - 20);
        context.lineTo(this.x + this.width + 30, this.y + 40);
        context.closePath();
        context.fill();
        
        // 屋根の影
        context.fillStyle = '#654321';
        context.beginPath();
        context.moveTo(this.x + this.width / 2, this.y - 20);
        context.lineTo(this.x + this.width + 30, this.y + 40);
        context.lineTo(this.x + this.width, this.y + 40);
        context.lineTo(this.x + this.width / 2, this.y - 10);
        context.closePath();
        context.fill();
        
        // 屋根の縁取り（金色の装飾）
        context.strokeStyle = '#DAA520';
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(this.x - 30, this.y + 40);
        context.lineTo(this.x + this.width / 2, this.y - 20);
        context.lineTo(this.x + this.width + 30, this.y + 40);
        context.stroke();
        
        // 屋根瓦の表現（より詳細に）
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
            const y = this.y - 15 + i * 5;
            const leftX = this.x - 25 + i * 2.5;
            const rightX = this.x + this.width + 25 - i * 2.5;
            if (leftX < rightX) {
                context.beginPath();
                context.moveTo(leftX, y);
                context.lineTo(rightX, y);
                context.stroke();
            }
        }
        
        // 棟飾り（むねかざり）
        context.fillStyle = '#DAA520';
        context.fillRect(this.x + this.width / 2 - 15, this.y - 25, 30, 8);
        context.fillRect(this.x + this.width / 2 - 5, this.y - 35, 10, 15);
    }
    
    /**
     * 装飾の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderDecorations(context) {
        const centerX = this.x + this.width / 2;
        
        // 鈴（すず）- より大きく立派に
        context.fillStyle = '#f1c40f';
        context.beginPath();
        context.arc(centerX, this.y + 70, 12, 0, Math.PI * 2);
        context.fill();
        
        context.strokeStyle = '#f39c12';
        context.lineWidth = 3;
        context.stroke();
        
        // 鈴の紐
        context.strokeStyle = '#8B4513';
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(centerX, this.y + 45);
        context.lineTo(centerX, this.y + 58);
        context.stroke();
        
        // 賽銭箱（より立派に、文字なし）
        const boxWidth = 100;
        const boxHeight = 35;
        const boxX = centerX - boxWidth / 2;
        const boxY = this.y + this.height - 70;
        
        // 賽銭箱の影
        context.fillStyle = '#5D4E75';
        context.fillRect(boxX + 2, boxY + 2, boxWidth, boxHeight);
        
        // 賽銭箱本体
        context.fillStyle = '#8e44ad';
        context.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // 賽銭箱の装飾
        context.strokeStyle = '#663399';
        context.lineWidth = 3;
        context.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // 賽銭箱の投入口
        context.fillStyle = '#2c3e50';
        context.fillRect(boxX + 15, boxY - 6, boxWidth - 30, 10);
        
        // 賽銭箱の金具装飾
        context.fillStyle = '#DAA520';
        context.fillRect(boxX + 10, boxY + 10, 6, 15);
        context.fillRect(boxX + boxWidth - 16, boxY + 10, 6, 15);
        
        // 提灯（ちょうちん）風の装飾
        context.fillStyle = '#FF6B6B';
        context.beginPath();
        context.ellipse(centerX - 40, this.y + 80, 15, 20, 0, 0, Math.PI * 2);
        context.fill();
        
        context.beginPath();
        context.ellipse(centerX + 40, this.y + 80, 15, 20, 0, 0, Math.PI * 2);
        context.fill();
        
        // 提灯の紐
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(centerX - 40, this.y + 60);
        context.lineTo(centerX - 40, this.y + 60);
        context.moveTo(centerX + 40, this.y + 60);
        context.lineTo(centerX + 40, this.y + 60);
        context.stroke();
    }
    
    /**
     * 文字の描画（削除 - 文字表示なし）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderText(context) {
        // 文字表示は削除されました
        // より自然な神社の外観を保つため
    }
    
    /**
     * 相互作用インジケーターの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderInteractionIndicator(context) {
        const centerX = this.x + this.width / 2;
        const indicatorY = this.y - 45;
        
        // 上下に動くアニメーション
        const bounce = Math.sin(this.animationTime * 0.005) * 4;
        
        // 矢印の描画
        context.fillStyle = '#e74c3c';
        context.beginPath();
        context.moveTo(centerX, indicatorY + bounce);
        context.lineTo(centerX - 8, indicatorY - 10 + bounce);
        context.lineTo(centerX + 8, indicatorY - 10 + bounce);
        context.closePath();
        context.fill();
        
        // 「参拝」の文字
        context.fillStyle = '#e74c3c';
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillText('参拝', centerX, indicatorY - 12 + bounce);
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
        
        // 社殿の下端（階段・賽銭箱エリア）に到達した時だけ反応する
        // 横方向は社殿の幅、縦方向は社殿の下端付近のみ
        const reachZone = {
            x: this.x - 10,
            y: this.y + this.height - 40,  // 社殿下端から40px上
            width: this.width + 20,
            height: 50                      // 下端から50pxの帯
        };
        
        const playerBounds = player.getBounds();
        
        return (
            playerBounds.x < reachZone.x + reachZone.width &&
            playerBounds.x + playerBounds.width > reachZone.x &&
            playerBounds.y < reachZone.y + reachZone.height &&
            playerBounds.y + playerBounds.height > reachZone.y
        );
    }
    
    /**
     * プレイヤーが社殿に到達した時の処理
     * @param {PlayerCharacter} player - プレイヤーキャラクター
     */
    onPlayerReach(player) {
        super.onPlayerReach(player);
        
        this.isPlayerNear = true;
        this.lastPlayerReachTime = performance.now();
        
        // 参拝の鈴の音を再生
        this.playPrayerBellSound();
        
        // 到達イベントのコールバック実行
        if (this.onReachCallback && typeof this.onReachCallback === 'function') {
            this.onReachCallback(player, this);
        }
        
        console.log('Player reached Main Hall');
    }
    
    /**
     * 参拝の鈴の音を再生
     */
    playPrayerBellSound() {
        if (this.audioManager) {
            // 社殿到達時の参拝鈴の音（音量0.7でより響く感じに）
            this.audioManager.playSFX('prayer-bell', 0.7);
        }
    }
    
    /**
     * プレイヤーが社殿から離れた時の処理
     * @param {PlayerCharacter} player - プレイヤーキャラクター
     */
    onPlayerLeave(player) {
        super.onPlayerLeave(player);
        
        this.isPlayerNear = false;
        
        // 離脱イベントのコールバック実行
        if (this.onLeaveCallback && typeof this.onLeaveCallback === 'function') {
            this.onLeaveCallback(player, this);
        }
        
        console.log('Player left Main Hall');
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
        console.log('MainHall destroyed');
    }
}