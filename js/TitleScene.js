/**
 * TitleScene - タイトル画面シーン
 * プレイヤーの名前と願い事の入力を受け付け、ゲームを開始する
 */
class TitleScene extends Scene {
    constructor() {
        super('title');
        
        // UI状態
        this.currentInputField = 'name'; // 'name' or 'wish'
        this.playerName = '';
        this.playerWish = '';
        this.isInputActive = false;
        
        // 入力フィールドの設定
        this.nameMaxLength = 20;
        this.wishMaxLength = 100;
        
        // UI要素の位置とサイズ
        this.ui = {
            title: { x: 400, y: 100 },
            nameLabel: { x: 200, y: 220 },
            nameInput: { x: 200, y: 250, width: 400, height: 30 },
            wishLabel: { x: 200, y: 320 },
            wishInput: { x: 200, y: 350, width: 400, height: 60 },
            startButton: { x: 350, y: 470, width: 100, height: 40 },
            errorMessage: { x: 400, y: 540 }
        };
        
        // マウス状態
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseOverButton = false;
        
        // エラーメッセージ
        this.errorMessage = '';
        this.showError = false;
        
        // アニメーション用
        this.blinkTimer = 0;
        this.showCursor = true;
        
        // 日本語入力対応のための隠しinput要素
        this.hiddenInput = null;
        
        // キーボード入力の処理
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }
    
    /**
     * シーンの初期化
     */
    init() {
        super.init();
        console.log('TitleScene initialized');
        
        // デフォルト値の設定
        this.playerName = '';
        this.playerWish = '';
        this.currentInputField = 'name';
        this.clearError();
    }
    
    /**
     * シーンがアクティブになった時の処理
     */
    onEnter() {
        super.onEnter();
        
        // イベントリスナーを追加
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keypress', this.handleKeyPress);
        document.addEventListener('click', this.handleMouseClick);
        document.addEventListener('mousemove', this.handleMouseMove);
        
        // 入力フィールドをアクティブに
        this.isInputActive = true;
        this.currentInputField = 'name';
        
        console.log('TitleScene entered');
    }
    
    /**
     * シーンが非アクティブになった時の処理
     */
    onExit() {
        super.onExit();
        
        // イベントリスナーを削除
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keypress', this.handleKeyPress);
        document.removeEventListener('click', this.handleMouseClick);
        document.removeEventListener('mousemove', this.handleMouseMove);
        
        this.isInputActive = false;
        
        console.log('TitleScene exited');
    }
    
    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // カーソルの点滅アニメーション
        this.blinkTimer += deltaTime;
        if (this.blinkTimer >= 500) {
            this.showCursor = !this.showCursor;
            this.blinkTimer = 0;
        }
        
        // エラーメッセージの自動消去
        if (this.showError && this.blinkTimer > 3000) {
            this.clearError();
        }
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        // 背景
        this.renderBackground(context);
        
        // タイトル
        this.renderTitle(context);
        
        // 入力フォーム
        this.renderInputForm(context);
        
        // スタートボタン
        this.renderStartButton(context);
        
        // エラーメッセージ
        if (this.showError) {
            this.renderErrorMessage(context);
        }
    }
    
    /**
     * 背景の描画
     */
    renderBackground(context) {
        // グラデーション背景
        const gradient = context.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 800, 600);
        
        // 美しい鳥居のデザイン
        this.renderTorii(context);
    }
    
    /**
     * 鳥居の描画
     */
    renderTorii(context) {
        const centerX = 400;
        const toriiY = 30;
        
        // 鳥居の色（朱色）
        context.fillStyle = '#e74c3c';
        context.strokeStyle = '#c0392b';
        context.lineWidth = 2;
        
        // 上部の横木（笠木）
        const kasagiWidth = 120;
        const kasagiHeight = 8;
        context.fillRect(centerX - kasagiWidth/2, toriiY, kasagiWidth, kasagiHeight);
        context.strokeRect(centerX - kasagiWidth/2, toriiY, kasagiWidth, kasagiHeight);
        
        // 中間の横木（貫）
        const nukiWidth = 100;
        const nukiHeight = 6;
        const nukiY = toriiY + 25;
        context.fillRect(centerX - nukiWidth/2, nukiY, nukiWidth, nukiHeight);
        context.strokeRect(centerX - nukiWidth/2, nukiY, nukiWidth, nukiHeight);
        
        // 左の柱
        const pillarWidth = 8;
        const pillarHeight = 45;
        const leftPillarX = centerX - 40;
        context.fillRect(leftPillarX, toriiY, pillarWidth, pillarHeight);
        context.strokeRect(leftPillarX, toriiY, pillarWidth, pillarHeight);
        
        // 右の柱
        const rightPillarX = centerX + 32;
        context.fillRect(rightPillarX, toriiY, pillarWidth, pillarHeight);
        context.strokeRect(rightPillarX, toriiY, pillarWidth, pillarHeight);
        
        // 笠木の両端の装飾（反り上がり）
        context.beginPath();
        context.moveTo(centerX - kasagiWidth/2 - 3, toriiY + kasagiHeight);
        context.lineTo(centerX - kasagiWidth/2, toriiY + kasagiHeight - 2);
        context.lineTo(centerX - kasagiWidth/2, toriiY + kasagiHeight);
        context.closePath();
        context.fill();
        context.stroke();
        
        context.beginPath();
        context.moveTo(centerX + kasagiWidth/2 + 3, toriiY + kasagiHeight);
        context.lineTo(centerX + kasagiWidth/2, toriiY + kasagiHeight - 2);
        context.lineTo(centerX + kasagiWidth/2, toriiY + kasagiHeight);
        context.closePath();
        context.fill();
        context.stroke();
        
        // 影の効果
        context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        context.fillRect(centerX - kasagiWidth/2 + 2, toriiY + kasagiHeight, kasagiWidth, 2);
        context.fillRect(centerX - nukiWidth/2 + 2, nukiY + nukiHeight, nukiWidth, 1);
        context.fillRect(leftPillarX + 2, toriiY + pillarHeight, pillarWidth, 2);
        context.fillRect(rightPillarX + 2, toriiY + pillarHeight, pillarWidth, 2);
    }
    
    /**
     * タイトルの描画
     */
    renderTitle(context) {
        context.fillStyle = '#ecf0f1';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText('御百度参り', this.ui.title.x, this.ui.title.y);
        
        context.font = '16px Arial';
        context.fillText('Ohyakudomairi', this.ui.title.x, this.ui.title.y + 40);
        
        // 注記部分（アイコン付き、適切な間隔と配置）
        const noteY = this.ui.title.y + 80;
        
        context.font = '13px Arial';
        context.fillStyle = '#f39c12';
        context.textAlign = 'center';
        context.fillText('ℹ️', this.ui.title.x - 100, noteY);
        
        context.fillStyle = '#bdc3c7';
        context.textAlign = 'left';
        context.fillText('現在は英語入力のみ対応しています', this.ui.title.x - 85, noteY);
    }
    
    /**
     * 入力フォームの描画
     */
    renderInputForm(context) {
        // 名前入力
        this.renderInputField(
            context,
            '名前 (Name):',
            this.ui.nameLabel,
            this.ui.nameInput,
            this.playerName,
            this.currentInputField === 'name'
        );
        
        // 願い事入力
        this.renderInputField(
            context,
            '願い事 (Wish):',
            this.ui.wishLabel,
            this.ui.wishInput,
            this.playerWish,
            this.currentInputField === 'wish'
        );
    }
    
    /**
     * 入力フィールドの描画
     */
    renderInputField(context, label, labelPos, inputPos, value, isActive) {
        // ラベル
        context.fillStyle = '#ecf0f1';
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(label, labelPos.x, labelPos.y);
        
        // 入力フィールドの背景
        context.fillStyle = isActive ? '#3498db' : '#7f8c8d';
        context.fillRect(inputPos.x - 2, inputPos.y - 2, inputPos.width + 4, inputPos.height + 4);
        
        context.fillStyle = '#2c3e50';
        context.fillRect(inputPos.x, inputPos.y, inputPos.width, inputPos.height);
        
        // テキスト
        context.fillStyle = '#ecf0f1';
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const textX = inputPos.x + 10;
        const textY = inputPos.y + 8; // テキストの垂直位置を調整
        
        // 複数行対応（願い事用）
        if (inputPos.height > 30) {
            this.renderMultilineText(context, value, textX, textY, inputPos.width - 20);
        } else {
            context.fillText(value, textX, textY);
        }
        
        // カーソル
        if (isActive && this.showCursor && this.isInputActive) {
            const textWidth = context.measureText(value).width;
            context.fillStyle = '#e74c3c';
            context.fillRect(textX + textWidth, textY, 2, 16); // カーソルの位置と高さを調整
        }
    }
    
    /**
     * 複数行テキストの描画
     */
    renderMultilineText(context, text, x, y, maxWidth) {
        const words = text.split('');
        let line = '';
        let lineY = y;
        const lineHeight = 18;
        
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                context.fillText(line, x, lineY);
                line = words[i];
                lineY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, lineY);
    }
    
    /**
     * スタートボタンの描画
     */
    renderStartButton(context) {
        const button = this.ui.startButton;
        const isEnabled = this.validateInput().valid;
        const isHovered = this.isMouseOverButton && isEnabled;
        
        // ボタンの背景（ホバー効果付き）
        if (isEnabled) {
            context.fillStyle = isHovered ? '#2ecc71' : '#27ae60';
        } else {
            context.fillStyle = '#7f8c8d';
        }
        context.fillRect(button.x, button.y, button.width, button.height);
        
        // ボタンの枠線
        context.strokeStyle = isEnabled ? '#2ecc71' : '#95a5a6';
        context.lineWidth = isHovered ? 3 : 2;
        context.strokeRect(button.x, button.y, button.width, button.height);
        
        // ボタンのテキスト
        context.fillStyle = '#ecf0f1';
        context.font = isHovered ? 'bold 16px Arial' : '16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            'スタート',
            button.x + button.width / 2,
            button.y + button.height / 2
        );
        
        // カーソルスタイルの変更（視覚的フィードバック）
        if (isHovered) {
            document.body.style.cursor = 'pointer';
        } else if (!this.isMouseOverButton) {
            document.body.style.cursor = 'default';
        }
    }
    
    /**
     * エラーメッセージの描画
     */
    renderErrorMessage(context) {
        context.fillStyle = '#e74c3c';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText(this.errorMessage, this.ui.errorMessage.x, this.ui.errorMessage.y);
    }
    
    /**
     * キーダウンイベントの処理
     */
    handleKeyDown(event) {
        if (!this.isInputActive) return;
        
        switch (event.key) {
            case 'Tab':
                event.preventDefault();
                this.switchInputField();
                break;
                
            case 'Enter':
                event.preventDefault();
                this.attemptGameStart();
                break;
                
            case 'Backspace':
                event.preventDefault();
                this.deleteCharacter();
                break;
        }
    }
    
    /**
     * キープレスイベントの処理（英語入力のみ）
     */
    handleKeyPress(event) {
        if (!this.isInputActive) return;
        
        // 制御文字は無視
        if (event.charCode < 32) return;
        
        const char = String.fromCharCode(event.charCode);
        this.addCharacter(char);
        
        event.preventDefault();
    }
    
    /**
     * 入力イベントの処理（日本語入力対応）
     */
    handleInput(event) {
        if (!this.isInputActive || this.isComposing) return;
        
        // 直接入力された文字を取得
        const inputChar = event.data;
        if (inputChar) {
            this.addCharacter(inputChar);
        }
        
        event.preventDefault();
    }
    
    /**
     * マウスクリック処理
     */
    handleMouseClick(event) {
        if (!this.isInputActive) return;
        
        // Canvasの位置を取得
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 名前入力フィールドのクリック判定
        const nameInput = this.ui.nameInput;
        if (x >= nameInput.x && x <= nameInput.x + nameInput.width &&
            y >= nameInput.y && y <= nameInput.y + nameInput.height) {
            this.currentInputField = 'name';
            this.clearError();
            return;
        }
        
        // 願い事入力フィールドのクリック判定
        const wishInput = this.ui.wishInput;
        if (x >= wishInput.x && x <= wishInput.x + wishInput.width &&
            y >= wishInput.y && y <= wishInput.y + wishInput.height) {
            this.currentInputField = 'wish';
            this.clearError();
            return;
        }
        
        // スタートボタンのクリック判定
        const startButton = this.ui.startButton;
        if (x >= startButton.x && x <= startButton.x + startButton.width &&
            y >= startButton.y && y <= startButton.y + startButton.height) {
            this.attemptGameStart();
            return;
        }
    }
    
    /**
     * マウス移動処理（ホバー効果用）
     */
    handleMouseMove(event) {
        if (!this.isInputActive) return;
        
        // Canvasの位置を取得
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.mouseX = x;
        this.mouseY = y;
        
        // スタートボタンのホバー判定
        const startButton = this.ui.startButton;
        this.isMouseOverButton = (
            x >= startButton.x && x <= startButton.x + startButton.width &&
            y >= startButton.y && y <= startButton.y + startButton.height
        );
    }
    
    /**
     * 入力フィールドの切り替え
     */
    switchInputField() {
        this.currentInputField = this.currentInputField === 'name' ? 'wish' : 'name';
        this.clearError();
    }
    
    /**
     * 文字の追加
     */
    addCharacter(char) {
        if (this.currentInputField === 'name') {
            if (this.playerName.length < this.nameMaxLength) {
                this.playerName += char;
            }
        } else if (this.currentInputField === 'wish') {
            if (this.playerWish.length < this.wishMaxLength) {
                this.playerWish += char;
            }
        }
        this.clearError();
    }
    
    /**
     * 文字の削除
     */
    deleteCharacter() {
        if (this.currentInputField === 'name') {
            this.playerName = this.playerName.slice(0, -1);
        } else if (this.currentInputField === 'wish') {
            this.playerWish = this.playerWish.slice(0, -1);
        }
        this.clearError();
    }
    
    /**
     * 入力検証
     */
    validateInput() {
        // 名前の検証
        if (!this.playerName || this.playerName.trim().length === 0) {
            return { valid: false, message: '名前を入力してください' };
        }
        
        if (this.playerName.length > this.nameMaxLength) {
            return { valid: false, message: `名前は${this.nameMaxLength}文字以内で入力してください` };
        }
        
        // 願い事の検証
        if (!this.playerWish || this.playerWish.trim().length === 0) {
            return { valid: false, message: '願い事を入力してください' };
        }
        
        if (this.playerWish.length > this.wishMaxLength) {
            return { valid: false, message: `願い事は${this.wishMaxLength}文字以内で入力してください` };
        }
        
        return { valid: true };
    }
    
    /**
     * ゲーム開始の試行
     */
    attemptGameStart() {
        const validation = this.validateInput();
        
        if (!validation.valid) {
            this.showErrorMessage(validation.message);
            return;
        }
        
        // 入力データを準備
        const gameData = {
            playerName: this.playerName.trim(),
            playerWish: this.playerWish.trim()
        };
        
        console.log('Starting game with data:', gameData);
        
        // GameSceneに遷移
        const sceneManager = this.gameEngine?.getSceneManager();
        if (sceneManager && sceneManager.hasScene('game')) {
            sceneManager.switchScene('game', gameData);
        } else {
            console.warn('GameScene not available, staying in TitleScene');
            this.showErrorMessage('ゲームシーンが利用できません');
        }
    }
    
    /**
     * エラーメッセージの表示
     */
    showErrorMessage(message) {
        this.errorMessage = message;
        this.showError = true;
        this.blinkTimer = 0;
    }
    
    /**
     * エラーメッセージのクリア
     */
    clearError() {
        this.errorMessage = '';
        this.showError = false;
    }
    
    /**
     * 入力データを取得
     */
    getInputData() {
        return {
            playerName: this.playerName.trim(),
            playerWish: this.playerWish.trim()
        };
    }
    
    /**
     * 入力データをリセット
     */
    resetInput() {
        this.playerName = '';
        this.playerWish = '';
        this.currentInputField = 'name';
        this.clearError();
    }
}