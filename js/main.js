/**
 * main.js - ゲームのエントリーポイント
 * GameEngineを初期化し、ゲームを開始する
 */

// グローバル変数
let gameEngine = null;

/**
 * ページ読み込み完了時の初期化
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing game...');
    
    try {
        // GameEngineの初期化
        gameEngine = new GameEngine('game-canvas');
        gameEngine.init();
        
        // シーンの設定
        setupScenes();
        
        // AudioManagerの初期化とサウンドファイルの読み込み（非同期、エラーがあっても続行）
        initializeAudio().catch(error => {
            console.warn('Audio initialization failed, continuing without sound:', error);
        });
        
        // ローディング画面を非表示にしてゲーム開始
        hideLoadingScreen();
        
        // ゲーム開始
        gameEngine.start();
        
        console.log('Game started successfully');
        console.log('=== Debug Commands Available ===');
        console.log('startGame() - Start the game directly');
        console.log('setRoundTrips(n) - Set round trips count (requires game scene)');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('ゲームの初期化に失敗しました。ブラウザを更新してください。');
    }
});

/**
 * AudioManagerの初期化とサウンドファイルの読み込み
 */
async function initializeAudio() {
    try {
        // audioManagerが存在するかチェック
        if (typeof audioManager === 'undefined') {
            console.warn('AudioManager not found, skipping audio initialization');
            return;
        }
        
        // グローバルなaudioManagerインスタンスを作成
        window.audioManager = audioManager;
        
        // AudioContextの初期化を待つ
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // サウンドファイルの読み込み（実際のファイルがない場合はスキップ）
        await loadSoundFiles();
        
        console.log('Audio system initialized');
        
    } catch (error) {
        console.warn('Audio initialization failed, continuing without sound:', error);
        // 音声なしでゲームを継続
    }
}

/**
 * サウンドファイルの読み込み
 */
async function loadSoundFiles() {
    if (!window.audioManager || !window.audioManager.isInitialized) {
        console.warn('AudioManager not initialized, skipping sound loading');
        return;
    }
    
    const soundFiles = [
        { name: 'footstep', url: 'sounds/footstep.mp3' },
        { name: 'bell', url: 'sounds/bell.mp3' },
        { name: 'prayer-bell', url: 'sounds/prayer-bell.mp3' },
        { name: 'shrine-bgm', url: 'sounds/shrine-bgm.mp3' }
    ];
    
    console.log('Loading sound files...');
    
    // 実際のサウンドファイルがない場合は、ダミーの音声を生成
    for (const sound of soundFiles) {
        try {
            console.log(`Attempting to load: ${sound.name}`);
            const success = await audioManager.loadSound(sound.name, sound.url);
            if (!success) {
                // ファイルが見つからない場合はダミー音声を生成
                console.log(`Creating dummy sound for: ${sound.name}`);
                await createDummySound(sound.name);
            }
        } catch (error) {
            console.warn(`Failed to load ${sound.name}, creating dummy sound`);
            await createDummySound(sound.name);
        }
    }
    
    console.log('Sound loading completed. Available sounds:', Array.from(audioManager.audioBuffers.keys()));
}

/**
 * ダミー音声の生成（実際のサウンドファイルがない場合）
 */
async function createDummySound(soundName) {
    console.log(`Creating dummy sound: ${soundName}`);
    
    if (!audioManager || !audioManager.isInitialized || !audioManager.audioContext) {
        console.warn(`Cannot create dummy sound ${soundName}: AudioManager not ready`);
        return;
    }
    
    try {
        const audioContext = audioManager.audioContext;
        let buffer;
        
        console.log(`AudioContext state: ${audioContext.state}`);
        
        switch (soundName) {
            case 'footstep':
                buffer = createFootstepSound(audioContext);
                break;
            case 'bell':
            case 'prayer-bell':
                buffer = createBellSound(audioContext);
                break;
            case 'shrine-bgm':
                buffer = createAmbientSound(audioContext);
                break;
            default:
                buffer = createSimpleBeep(audioContext);
        }
        
        if (buffer) {
            audioManager.audioBuffers.set(soundName, buffer);
            console.log(`Successfully created dummy sound: ${soundName}`);
        } else {
            console.error(`Failed to create buffer for: ${soundName}`);
        }
        
    } catch (error) {
        console.warn(`Failed to create dummy sound ${soundName}:`, error);
    }
}

/**
 * 足音のダミー音声を生成
 */
function createFootstepSound(audioContext) {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.1; // 100ms
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // ノイズベースの足音
    for (let i = 0; i < length; i++) {
        const envelope = Math.exp(-i / (length * 0.3));
        data[i] = (Math.random() * 2 - 1) * envelope * 0.1;
    }
    
    return buffer;
}

/**
 * 鈴の音のダミー音声を生成
 */
function createBellSound(audioContext) {
    const sampleRate = audioContext.sampleRate;
    const duration = 1.0; // 1秒
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // 鈴の音（複数の周波数の組み合わせ）
    const frequencies = [800, 1200, 1600];
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 3);
        let sample = 0;
        
        frequencies.forEach(freq => {
            sample += Math.sin(2 * Math.PI * freq * t) * envelope;
        });
        
        data[i] = sample * 0.2;
    }
    
    return buffer;
}

/**
 * 環境音のダミー音声を生成
 */
function createAmbientSound(audioContext) {
    const sampleRate = audioContext.sampleRate;
    const duration = 10.0; // 10秒
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // 自然音風の環境音
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const lowFreq = Math.sin(2 * Math.PI * 0.5 * t) * 0.1;
        const midFreq = Math.sin(2 * Math.PI * 2 * t) * 0.05;
        const noise = (Math.random() * 2 - 1) * 0.02;
        
        data[i] = lowFreq + midFreq + noise;
    }
    
    return buffer;
}

/**
 * シンプルなビープ音を生成
 */
function createSimpleBeep(audioContext) {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.2;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 5);
        data[i] = Math.sin(2 * Math.PI * 440 * t) * envelope * 0.1;
    }
    
    return buffer;
}

// ===========================================
// デバッグ用グローバル関数
// ===========================================

/**
 * デバッグ用: 往復回数を設定するショートカット関数
 * @param {number} count - 設定する往復回数
 */
window.setRoundTrips = function(count) {
    // まずwindow.progressTrackerを試す
    if (window.progressTracker) {
        return window.progressTracker.debugSetCount(count);
    }
    
    // GameSceneから直接取得を試す
    if (gameEngine && gameEngine.getSceneManager()) {
        const sceneManager = gameEngine.getSceneManager();
        const gameScene = sceneManager.scenes?.get('game');
        if (gameScene && gameScene.progressTracker) {
            return gameScene.progressTracker.debugSetCount(count);
        }
    }
    
    console.warn('ProgressTracker not available. Make sure you are in the game scene.');
    console.log('Current scene:', gameEngine?.getSceneManager()?.getCurrentSceneName() || 'unknown');
    return null;
};

/**
 * デバッグ用: GameSceneに直接遷移する関数
 */
window.startGame = function() {
    if (gameEngine && gameEngine.getSceneManager()) {
        // AudioContextを再開
        if (window.audioManager) {
            window.audioManager.resumeAudioContext();
            console.log('AudioContext resumed');
        }
        
        const sceneManager = gameEngine.getSceneManager();
        const gameData = {
            playerName: 'Debug Player',
            playerWish: 'Debug Wish'
        };
        sceneManager.switchScene('game', gameData);
        console.log('Switched to GameScene for debugging');
        return true;
    } else {
        console.warn('GameEngine not available');
        return false;
    }
};

/**
 * シーンの設定
 */
function setupScenes() {
    const sceneManager = gameEngine.getSceneManager();
    
    // TitleSceneを追加
    const titleScene = new TitleScene();
    sceneManager.addScene('title', titleScene);
    
    // GameSceneを追加
    const gameScene = new GameScene();
    sceneManager.addScene('game', gameScene);
    
    // CompletionSceneを追加
    const completionScene = new CompletionScene();
    sceneManager.addScene('completion', completionScene);
    
    // GameSceneのProgressTrackerをグローバルにアクセス可能にする（デバッグ用）
    window.progressTracker = null;
    
    // GameSceneが初期化された後にProgressTrackerを取得
    const originalGameSceneInit = gameScene.init.bind(gameScene);
    gameScene.init = function() {
        originalGameSceneInit();
        // ProgressTrackerをグローバルに設定
        window.progressTracker = this.progressTracker;
        console.log('Debug: ProgressTracker is now available globally');
        console.log('Use setRoundTrips(n) to set round trips count');
    };
    
    // 最初のシーンをTitleSceneに設定
    sceneManager.switchScene('title');
    
    console.log('Scenes initialized');
}

/**
 * ローディング画面を非表示にする
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

/**
 * エラーメッセージを表示
 */
function showError(message) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `<p style="color: #e74c3c;">${message}</p>`;
        loadingScreen.classList.remove('hidden');
    }
}

/**
 * ウィンドウサイズ変更時の処理
 */
window.addEventListener('resize', function() {
    if (gameEngine) {
        // レスポンシブ対応は後のタスクで実装
        console.log('Window resized');
    }
});

/**
 * ページ離脱時の処理
 */
window.addEventListener('beforeunload', function() {
    if (gameEngine && gameEngine.isGameRunning()) {
        gameEngine.stop();
        console.log('Game stopped before page unload');
    }
});

/**
 * ユーザーインタラクション時のAudioContext再開
 */
document.addEventListener('click', function() {
    if (window.audioManager) {
        window.audioManager.resumeAudioContext();
    }
}, { once: true });

document.addEventListener('keydown', function() {
    if (window.audioManager) {
        window.audioManager.resumeAudioContext();
    }
}, { once: true });

document.addEventListener('touchstart', function() {
    if (window.audioManager) {
        window.audioManager.resumeAudioContext();
    }
}, { once: true });

/**
 * エラーハンドリング
 */
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showError('予期しないエラーが発生しました。');
});

/**
 * 未処理のPromise拒否のハンドリング
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});