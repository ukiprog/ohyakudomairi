/**
 * CompletionScene - 御百度参り完了シーン
 * 神様の登場、祝福メッセージ、完了証明書の表示を管理
 */
class CompletionScene extends Scene {
    constructor() {
        super('completion');
        
        // 神様キャラクター
        this.deity = null;
        
        // プレイヤーデータ
        this.playerName = '';
        this.playerWish = '';
        this.completionTime = null;
        
        // シーンの状態
        this.phase = 'deity_appearance'; // 'deity_appearance', 'blessing_message', 'certificate'
        this.phaseTimer = 0;
        
        // メッセージ表示
        this.messageAlpha = 0;
        this.messageVisible = false;
        this.currentMessage = '';
        this.messageLines = [];
        
        // 証明書表示
        this.certificateAlpha = 0;
        this.certificateVisible = false;
        
        // 音声再生フラグ
        this.hasPlayedAppearanceSound = false;
        this.hasPlayedBlessingSound = false;
        this.hasPlayedBGM = false;
        
        // 背景エフェクト
        this.backgroundParticles = [];
        this.particleTimer = 0;
        
        console.log('CompletionScene created');
    }
    
    /**
     * シーンの初期化
     */
    init() {
        super.init();
        
        // 背景パーティクルの初期化
        this.initBackgroundParticles();
        
        console.log('CompletionScene initialized');
    }
    
    /**
     * シーンがアクティブになった時の処理
     */
    onEnter() {
        super.onEnter();
        
        // 神様キャラクターを再生成して状態をリセット
        const canvas = document.getElementById('game-canvas');
        const cw = canvas ? canvas.width  : 800;
        const ch = canvas ? canvas.height : 600;
        this.deity = new Deity(cw / 2 - 16, ch * 0.33);
        
        // 神様の登場完了コールバック
        this.deity.setOnAppearanceComplete(() => {
            this.onDeityAppearanceComplete();
        });
        
        // 神様の祝福完了コールバック
        this.deity.setOnBlessingComplete(() => {
            this.onBlessingComplete();
        });
        
        // 完了時刻を記録
        this.completionTime = new Date();
        
        // 状態をリセット
        this.phase = 'deity_appearance';
        this.phaseTimer = 0;
        this.messageAlpha = 0;
        this.messageVisible = false;
        this.certificateAlpha = 0;
        this.certificateVisible = false;
        this.hasPlayedAppearanceSound = false;
        this.hasPlayedBlessingSound = false;
        this.hasPlayedBGM = false;
        
        // 特別なBGMを再生
        this.playCompletionBGM();
        
        // クリックイベントリスナーを追加
        this.clickHandler = this.handleClick.bind(this);
        document.addEventListener('click', this.clickHandler);
        
        console.log('CompletionScene entered');
    }
    
    /**
     * シーンが非アクティブになった時の処理
     */
    onExit() {
        super.onExit();
        
        // クリックイベントリスナーを削除
        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler);
            this.clickHandler = null;
        }
        
        console.log('CompletionScene exited');
    }
    
    /**
     * TitleSceneまたはGameSceneからのデータを設定
     * @param {Object} data - プレイヤーデータ
     */
    setData(data) {
        if (data) {
            this.playerName = data.playerName || '参拝者';
            this.playerWish = data.playerWish || '願い事';
            console.log('CompletionScene data set:', data);
        }
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        this.phaseTimer += deltaTime;
        
        // 神様の更新
        if (this.deity) {
            this.deity.update(deltaTime);
        }
        
        // 背景パーティクルの更新
        this.updateBackgroundParticles(deltaTime);
        
        // フェーズごとの処理
        switch (this.phase) {
            case 'deity_appearance':
                this.updateDeityAppearancePhase(deltaTime);
                break;
            case 'blessing_message':
                this.updateBlessingMessagePhase(deltaTime);
                break;
            case 'certificate':
                this.updateCertificatePhase(deltaTime);
                break;
        }
    }
    
    /**
     * 神様登場フェーズの更新
     */
    updateDeityAppearancePhase(deltaTime) {
        // 登場音を再生（一度だけ）
        if (!this.hasPlayedAppearanceSound && this.phaseTimer > 100) {
            this.playDeityAppearanceSound();
            this.hasPlayedAppearanceSound = true;
        }
    }
    
    /**
     * 祝福メッセージフェーズの更新
     */
    updateBlessingMessagePhase(deltaTime) {
        // メッセージのフェードイン
        if (!this.messageVisible) {
            this.messageVisible = true;
            this.currentMessage = this.generateBlessingMessage();
            this.messageLines = this.wrapText(this.currentMessage, 600);
        }
        
        if (this.messageAlpha < 1.0) {
            this.messageAlpha += deltaTime / 1000; // 1秒でフェードイン
            this.messageAlpha = Math.min(1.0, this.messageAlpha);
        }
        
        // 祝福音を再生（一度だけ）
        if (!this.hasPlayedBlessingSound && this.phaseTimer > 500) {
            this.playBlessingSound();
            this.hasPlayedBlessingSound = true;
            
            // 神様の祝福アニメーションを開始
            if (this.deity) {
                this.deity.startBlessing();
            }
        }
        
        // 一定時間後に証明書フェーズへ
        if (this.phaseTimer > 5000) {
            this.phase = 'certificate';
            this.phaseTimer = 0;
        }
    }
    
    /**
     * 証明書フェーズの更新
     */
    updateCertificatePhase(deltaTime) {
        // 証明書のフェードイン
        if (!this.certificateVisible) {
            this.certificateVisible = true;
        }
        
        if (this.certificateAlpha < 1.0) {
            this.certificateAlpha += deltaTime / 1500; // 1.5秒でフェードイン
            this.certificateAlpha = Math.min(1.0, this.certificateAlpha);
        }
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        // 背景を描画
        this.renderBackground(context);
        
        // 背景パーティクルを描画
        this.renderBackgroundParticles(context);
        
        // 神様を描画
        if (this.deity) {
            this.deity.render(context);
        }
        
        // フェーズごとの描画
        switch (this.phase) {
            case 'deity_appearance':
                this.renderDeityAppearancePhase(context);
                break;
            case 'blessing_message':
                this.renderBlessingMessagePhase(context);
                break;
            case 'certificate':
                this.renderCertificatePhase(context);
                break;
        }
    }
    
    /**
     * 背景の描画
     */
    renderBackground(context) {
        const w = context.canvas.width;
        const h = context.canvas.height;
        const gradient = context.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        context.fillStyle = gradient;
        context.fillRect(0, 0, w, h);

        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % w;
            const y = (i * 73.3)  % h;
            const size = 1 + (i % 3);
            context.fillRect(x, y, size, size);
        }
    }
    
    /**
     * 神様登場フェーズの描画
     */
    renderDeityAppearancePhase(context) {
        const w = context.canvas.width;
        const h = context.canvas.height;
        context.save();
        context.globalAlpha = Math.min(1.0, this.phaseTimer / 1000);
        
        context.fillStyle = '#f1c40f';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('御百度参り 完了', w / 2, h * 0.75);
        
        context.fillStyle = '#ecf0f1';
        context.font = '20px Arial';
        context.fillText('神様が現れました', w / 2, h * 0.83);
        
        context.restore();
    }
    
    /**
     * 祝福メッセージフェーズの描画
     */
    renderBlessingMessagePhase(context) {
        const w = context.canvas.width;
        const h = context.canvas.height;
        const boxW = Math.min(600, w - 40);
        const boxX = (w - boxW) / 2;
        const boxY = h * 0.58;
        const boxH = h * 0.33;

        context.save();
        context.globalAlpha = this.messageAlpha;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(boxX, boxY, boxW, boxH);
        
        context.strokeStyle = '#f1c40f';
        context.lineWidth = 3;
        context.strokeRect(boxX, boxY, boxW, boxH);
        
        context.fillStyle = '#ecf0f1';
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        const startY = boxY + 20;
        const lineHeight = 28;
        this.messageLines.forEach((line, index) => {
            context.fillText(line, w / 2, startY + index * lineHeight);
        });
        
        context.restore();
    }
    
    /**
     * 絵馬フェーズの描画
     */
    renderCertificatePhase(context) {
        const w = context.canvas.width;
        const h = context.canvas.height;
        context.save();
        context.globalAlpha = this.certificateAlpha;
        
        const emaX = w / 2;
        const emaY = h / 2;
        const emaWidth  = Math.min(300, w * 0.75);
        const emaHeight = Math.min(360, h * 0.75);
        
        this.renderEmaShape(context, emaX, emaY, emaWidth, emaHeight);
        this.renderEmaString(context, emaX, emaY - emaHeight / 2);
        this.renderEmaContent(context, emaX, emaY, emaWidth, emaHeight);
        
        context.fillStyle = '#7f8c8d';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('画面をクリックしてタイトルに戻る', w / 2, h - 20);
        
        context.restore();
    }
    
    /**
     * 絵馬の形状を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} centerX - 中心X座標
     * @param {number} centerY - 中心Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    renderEmaShape(context, centerX, centerY, width, height) {
        const left = centerX - width / 2;
        const right = centerX + width / 2;
        const top = centerY - height / 2;
        const bottom = centerY + height / 2;
        const roofHeight = 50;
        
        // 絵馬の本体（五角形）
        context.beginPath();
        context.moveTo(centerX, top); // 屋根の頂点
        context.lineTo(right, top + roofHeight); // 右上
        context.lineTo(right, bottom); // 右下
        context.lineTo(left, bottom); // 左下
        context.lineTo(left, top + roofHeight); // 左上
        context.closePath();
        
        // 木の色（明るい茶色）
        const woodGradient = context.createLinearGradient(left, top, right, bottom);
        woodGradient.addColorStop(0, '#d4a574');
        woodGradient.addColorStop(0.5, '#c9a068');
        woodGradient.addColorStop(1, '#b8935c');
        context.fillStyle = woodGradient;
        context.fill();
        
        // 絵馬の枠線
        context.strokeStyle = '#8b6f47';
        context.lineWidth = 3;
        context.stroke();
        
        // 木目の表現
        context.strokeStyle = 'rgba(139, 111, 71, 0.3)';
        context.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const y = top + roofHeight + 20 + i * 35;
            context.beginPath();
            context.moveTo(left + 10, y);
            context.quadraticCurveTo(centerX, y + 5, right - 10, y);
            context.stroke();
        }
        
        // 紐を通す穴
        const holeY = top + roofHeight / 2;
        context.fillStyle = '#5d4e37';
        context.beginPath();
        context.arc(centerX, holeY, 8, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = '#3d2e17';
        context.lineWidth = 2;
        context.stroke();
    }
    
    /**
     * 絵馬の紐を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    renderEmaString(context, x, y) {
        // 赤い紐
        context.strokeStyle = '#c0392b';
        context.lineWidth = 4;
        context.lineCap = 'round';
        
        // 紐のループ
        context.beginPath();
        context.arc(x, y - 15, 15, 0, Math.PI, true);
        context.stroke();
        
        // 紐の結び目
        context.fillStyle = '#c0392b';
        context.beginPath();
        context.arc(x - 15, y - 15, 5, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(x + 15, y - 15, 5, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 絵馬の内容を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} centerX - 中心X座標
     * @param {number} centerY - 中心Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    renderEmaContent(context, centerX, centerY, width, height) {
        const top = centerY - height / 2;
        
        // タイトル「百度参り満願成就」
        context.fillStyle = '#2c3e50';
        context.font = 'bold 24px serif';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('百度参り満願成就', centerX, top + 70);
        
        // 装飾線
        context.strokeStyle = '#8b6f47';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(centerX - 100, top + 105);
        context.lineTo(centerX + 100, top + 105);
        context.stroke();
        
        // 参拝者名
        context.fillStyle = '#34495e';
        context.font = '18px serif';
        context.textAlign = 'left';
        context.fillText('参拝者', centerX - 120, top + 130);
        
        context.font = 'bold 20px serif';
        context.fillText(this.playerName, centerX - 120, top + 160);
        
        // 願い事
        context.font = '18px serif';
        context.fillText('願い事', centerX - 120, top + 200);
        
        context.font = '16px serif';
        const wishLines = this.wrapTextForEma(this.playerWish, 18);
        wishLines.forEach((line, index) => {
            context.fillText(line, centerX - 120, top + 230 + index * 25);
        });
        
        // 日付
        context.font = '14px serif';
        context.textAlign = 'center';
        const dateStr = this.formatCompletionTimeJapanese();
        context.fillText(dateStr, centerX, top + 320);
    }
    
    /**
     * 絵馬用のテキスト折り返し
     * @param {string} text - テキスト
     * @param {number} maxLength - 最大文字数
     * @returns {Array<string>} 行の配列
     */
    wrapTextForEma(text, maxLength) {
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < text.length; i++) {
            currentLine += text[i];
            
            if (currentLine.length >= maxLength) {
                lines.push(currentLine);
                currentLine = '';
            }
        }
        
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        
        // 最大3行まで
        return lines.slice(0, 3);
    }
    
    /**
     * 完了時刻を和暦風にフォーマット
     * @returns {string} フォーマットされた日時
     */
    formatCompletionTimeJapanese() {
        if (!this.completionTime) {
            return '不明';
        }
        
        const year = this.completionTime.getFullYear();
        const month = this.completionTime.getMonth() + 1;
        const day = this.completionTime.getDate();
        
        return `${year}年${month}月${day}日`;
    }
    
    /**
     * 背景パーティクルの初期化
     */
    initBackgroundParticles() {
        this.backgroundParticles = [];
        for (let i = 0; i < 30; i++) {
            this.backgroundParticles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 2 + Math.random() * 3,
                alpha: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    /**
     * 背景パーティクルの更新
     */
    updateBackgroundParticles(deltaTime) {
        const canvas = document.getElementById('game-canvas');
        const cw = canvas ? canvas.width  : 800;
        const ch = canvas ? canvas.height : 600;
        this.particleTimer += deltaTime;
        
        this.backgroundParticles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0)  particle.x = cw;
            if (particle.x > cw) particle.x = 0;
            if (particle.y < 0)  particle.y = ch;
            if (particle.y > ch) particle.y = 0;
            
            particle.alpha = 0.3 + Math.sin(this.particleTimer / 1000 + particle.x) * 0.3;
        });
    }
    
    /**
     * 背景パーティクルの描画
     */
    renderBackgroundParticles(context) {
        this.backgroundParticles.forEach(particle => {
            context.fillStyle = `rgba(241, 196, 15, ${particle.alpha})`;
            context.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
    }
    
    /**
     * 神様登場完了時の処理
     */
    onDeityAppearanceComplete() {
        console.log('Deity appearance complete, transitioning to blessing message');
        this.phase = 'blessing_message';
        this.phaseTimer = 0;
    }
    
    /**
     * 祝福完了時の処理
     */
    onBlessingComplete() {
        console.log('Blessing animation complete');
    }
    
    /**
     * 祝福メッセージを生成
     * @returns {string} 祝福メッセージ
     */
    generateBlessingMessage() {
        return `${this.playerName}よ、よくぞ百度参りを完遂した。` +
               `汝の願い「${this.playerWish}」は確かに受け取った。` +
               `その努力と誠意に敬意を表し、祝福を授けよう。`;
    }
    
    /**
     * テキストを指定幅で折り返し
     * @param {string} text - テキスト
     * @param {number} maxWidth - 最大幅（ピクセル）
     * @returns {Array<string>} 行の配列
     */
    wrapText(text, maxWidth) {
        // 簡易的な折り返し処理
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < text.length; i++) {
            currentLine += text[i];
            
            // 句読点や区切りで改行を検討
            if (text[i] === '。' || text[i] === '、' || currentLine.length > 30) {
                if (currentLine.length > 30 || text[i] === '。') {
                    lines.push(currentLine);
                    currentLine = '';
                }
            }
        }
        
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    /**
     * 完了時刻をフォーマット
     * @returns {string} フォーマットされた日時
     */
    formatCompletionTime() {
        if (!this.completionTime) {
            return '不明';
        }
        
        const year = this.completionTime.getFullYear();
        const month = String(this.completionTime.getMonth() + 1).padStart(2, '0');
        const day = String(this.completionTime.getDate()).padStart(2, '0');
        const hours = String(this.completionTime.getHours()).padStart(2, '0');
        const minutes = String(this.completionTime.getMinutes()).padStart(2, '0');
        
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    }
    
    /**
     * 完了BGMを再生
     */
    playCompletionBGM() {
        if (this.hasPlayedBGM) return;
        
        if (window.audioManager && window.audioManager.isInitialized) {
            // 特別なBGMがあれば再生
            // 現時点では音声ファイルが未実装なので、ログのみ
            console.log('Playing completion BGM');
            this.hasPlayedBGM = true;
        }
    }
    
    /**
     * 神様登場音を再生
     */
    playDeityAppearanceSound() {
        if (window.audioManager && window.audioManager.isInitialized) {
            // 神様登場の効果音を再生
            // 現時点では音声ファイルが未実装なので、ログのみ
            console.log('Playing deity appearance sound');
        }
    }
    
    /**
     * 祝福音を再生
     */
    playBlessingSound() {
        if (window.audioManager && window.audioManager.isInitialized) {
            // 祝福の効果音を再生
            // 現時点では音声ファイルが未実装なので、ログのみ
            console.log('Playing blessing sound');
        }
    }
    
    /**
     * 入力処理
     * @param {Object} input - 入力情報
     */
    handleInput(input) {
        // 証明書フェーズでクリックされたらタイトルに戻る
        // 実際のクリック処理はhandleClickメソッドで行う
    }
    
    /**
     * クリックイベントの処理
     */
    handleClick(event) {
        // 証明書フェーズでクリックされたらタイトルに戻る
        if (this.phase === 'certificate' && this.certificateAlpha >= 1.0) {
            console.log('Returning to title scene...');
            this.returnToTitle();
        }
    }
    
    /**
     * タイトルシーンに戻る
     */
    returnToTitle() {
        if (this.gameEngine && this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.switchScene('title');
        }
    }
    
    /**
     * シーンの破棄処理
     */
    destroy() {
        if (this.deity) {
            this.deity.destroy();
            this.deity = null;
        }
        
        this.backgroundParticles = [];
        
        super.destroy();
        console.log('CompletionScene destroyed');
    }
}
