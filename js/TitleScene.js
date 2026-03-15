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
        
        // UI要素はrenderのたびにcanvasサイズから計算する
        this.ui = {};

        // UIレイアウト計算に使用した最後のキャンバスサイズ
        this.lastCanvasWidth = null;
        this.lastCanvasHeight = null;
        
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
     * canvasサイズに基づいてUI座標を再計算
     */
    recalcUI(w, h) {
        const padX = Math.max(w * 0.08, 20);
        const fieldW = w - padX * 2;
        this.ui = {
            title:       { x: w / 2, y: h * 0.16 },
            nameLabel:   { x: padX,  y: h * 0.36 },
            nameInput:   { x: padX,  y: h * 0.42, width: fieldW, height: Math.max(36, h * 0.07) },
            wishLabel:   { x: padX,  y: h * 0.55 },
            wishInput:   { x: padX,  y: h * 0.61, width: fieldW, height: Math.max(52, h * 0.11) },
            startButton: { x: w / 2 - fieldW * 0.25, y: h * 0.79, width: fieldW * 0.5, height: Math.max(44, h * 0.08) },
            errorMessage:{ x: w / 2, y: h * 0.93 }
        };
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
        
        // タッチコントロールはタイトル画面では非表示
        const touchControls = document.getElementById('touch-controls');
        if (touchControls) touchControls.classList.remove('visible');
        
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
        const w = context.canvas.width;
        const h = context.canvas.height;

        // キャンバスサイズが変化した場合のみUIレイアウトを再計算する
        if (this.lastCanvasWidth !== w || this.lastCanvasHeight !== h) {
            this.recalcUI(w, h);
            this.lastCanvasWidth = w;
            this.lastCanvasHeight = h;
        }

        // 背景
        this.renderBackground(context, w, h);
        
        // タイトル
        this.renderTitle(context, w, h);
        
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
    renderBackground(context, w, h) {
        const gradient = context.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        context.fillStyle = gradient;
        context.fillRect(0, 0, w, h);
        this.renderTorii(context, w, h);
    }

    renderTorii(context, w, h) {
        const centerX = w / 2;
        const toriiY = h * 0.03;
        const scale = Math.min(w / 800, h / 600);

        context.fillStyle = '#e74c3c';
        context.strokeStyle = '#c0392b';
        context.lineWidth = 2;

        const kasagiWidth = 120 * scale;
        const kasagiHeight = 8 * scale;
        context.fillRect(centerX - kasagiWidth/2, toriiY, kasagiWidth, kasagiHeight);
        context.strokeRect(centerX - kasagiWidth/2, toriiY, kasagiWidth, kasagiHeight);

        const nukiWidth = 100 * scale;
        const nukiHeight = 6 * scale;
        const nukiY = toriiY + 25 * scale;
        context.fillRect(centerX - nukiWidth/2, nukiY, nukiWidth, nukiHeight);

        const pillarWidth = 8 * scale;
        const pillarHeight = 45 * scale;
        context.fillRect(centerX - 40 * scale, toriiY, pillarWidth, pillarHeight);
        context.fillRect(centerX + 32 * scale, toriiY, pillarWidth, pillarHeight);
    }
    
    /**
     * タイトルの描画
     */
    renderTitle(context, w, h) {
        // Allow w and h to be optionally passed in; fall back to canvas size for backwards compatibility
        if (typeof w !== 'number') {
            w = context.canvas.width;
        }
        if (typeof h !== 'number') {
            h = context.canvas.height;
        }
        const fontSize = Math.max(24, Math.min(44, w * 0.055));
        context.fillStyle = '#ecf0f1';
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.fillText('御百度参り', this.ui.title.x, this.ui.title.y);
        
        const subSize = Math.max(14, fontSize * 0.5);
        context.font = `${subSize}px Arial`;
        context.fillText('Ohyakudomairi', this.ui.title.x, this.ui.title.y + fontSize * 1.1);
        
        const noteY = this.ui.title.y + fontSize * 2;
        const noteSize = Math.max(11, subSize * 0.85);
        context.font = `${noteSize}px Arial`;
        context.fillStyle = '#bdc3c7';
        context.fillText('ℹ 現在は英語入力のみ対応しています', this.ui.title.x, noteY);
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
        const w = context.canvas.width;
        const labelSize = Math.max(14, Math.min(20, w * 0.025));
        const textSize  = Math.max(13, Math.min(18, w * 0.022));

        // ラベル
        context.fillStyle = '#ecf0f1';
        context.font = `${labelSize}px Arial`;
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
        context.font = `${textSize}px Arial`;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const textX = inputPos.x + 12;
        const textY = inputPos.y + 10;
        
        if (inputPos.height > 40) {
            this.renderMultilineText(context, value, textX, textY, inputPos.width - 24);
        } else {
            context.fillText(value, textX, textY);
        }
        
        // カーソル
        if (isActive && this.showCursor && this.isInputActive) {
            const textWidth = context.measureText(value).width;
            context.fillStyle = '#e74c3c';
            context.fillRect(textX + textWidth, textY, 2, textSize + 2);
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
        const w = context.canvas.width;
        const button = this.ui.startButton;
        const isEnabled = this.validateInput().valid;
        const isHovered = this.isMouseOverButton && isEnabled;
        const btnFontSize = Math.max(16, Math.min(22, w * 0.027));
        
        if (isEnabled) {
            context.fillStyle = isHovered ? '#2ecc71' : '#27ae60';
        } else {
            context.fillStyle = '#7f8c8d';
        }
        context.fillRect(button.x, button.y, button.width, button.height);
        
        context.strokeStyle = isEnabled ? '#2ecc71' : '#95a5a6';
        context.lineWidth = isHovered ? 3 : 2;
        context.strokeRect(button.x, button.y, button.width, button.height);
        
        context.fillStyle = '#ecf0f1';
        context.font = isHovered ? `bold ${btnFontSize}px Arial` : `${btnFontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('スタート', button.x + button.width / 2, button.y + button.height / 2);
        
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
        const w = context.canvas.width;
        context.fillStyle = '#e74c3c';
        context.font = `${Math.max(13, Math.min(18, w * 0.022))}px Arial`;
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
        
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        // タッチイベントも考慮
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top)  * scaleY;
        
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
        
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top)  * scaleY;
        
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
        
        // AudioContextを再開（ブラウザのautoplay policy対応）
        if (window.audioManager) {
            window.audioManager.resumeAudioContext();
            console.log('AudioContext resumed on game start');
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