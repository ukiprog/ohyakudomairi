/**
 * main.js - ゲームのエントリーポイント
 * GameEngineを初期化し、ゲームを開始する
 */

// グローバル変数
let gameEngine = null;

/**
 * ページ読み込み完了時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    try {
        // GameEngineの初期化
        gameEngine = new GameEngine('game-canvas');
        gameEngine.init();
        
        // シーンの設定
        setupScenes();
        
        // ローディング画面を非表示にしてゲーム開始
        hideLoadingScreen();
        
        // ゲーム開始
        gameEngine.start();
        
        console.log('Game started successfully');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('ゲームの初期化に失敗しました。ブラウザを更新してください。');
    }
});

/**
 * シーンの設定
 */
function setupScenes() {
    const sceneManager = gameEngine.getSceneManager();
    
    // TitleSceneを追加
    const titleScene = new TitleScene();
    sceneManager.addScene('title', titleScene);
    
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