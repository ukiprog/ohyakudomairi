/**
 * ProgressTracker - 御百度参りの進捗管理システム
 * 往復回数のカウント、進捗計算、完了判定を管理
 */
class ProgressTracker {
    constructor() {
        // 往復カウント
        this.currentRoundTrips = 0;
        this.totalRoundTrips = 100; // 御百度参りの目標回数
        
        // 状態管理
        this.completed = false;
        this.lastLocation = null; // 'hyakudo' または 'hall'
        this.hasReachedHyakudo = false;
        this.hasReachedHall = false;
        
        // 中間達成フラグ
        this.hasShownMidpointMessage = false;
        
        // イベントコールバック
        this.onProgressUpdate = null;
        this.onMidpointReached = null;
        this.onCompletion = null;
        
        console.log('ProgressTracker initialized');
    }
    
    /**
     * プレイヤーが百度石に到達した時の処理
     */
    onPlayerReachHyakudo() {
        this.hasReachedHyakudo = true;
        
        // 社殿から百度石への移動で往復完了
        if (this.lastLocation === 'hall' && this.hasReachedHall) {
            this.incrementRoundTrip();
        }
        
        this.lastLocation = 'hyakudo';
        console.log('Player reached Hyakudo Stone');
    }
    
    /**
     * プレイヤーが社殿に到達した時の処理
     */
    onPlayerReachHall() {
        this.hasReachedHall = true;
        
        // 百度石から社殿への移動で往復完了
        if (this.lastLocation === 'hyakudo' && this.hasReachedHyakudo) {
            this.incrementRoundTrip();
        }
        
        this.lastLocation = 'hall';
        console.log('Player reached Main Hall');
    }
    
    /**
     * 往復回数を増加
     */
    incrementRoundTrip() {
        if (this.completed) {
            return;
        }
        
        this.currentRoundTrips++;
        console.log(`Round trip completed: ${this.currentRoundTrips}/${this.totalRoundTrips}`);
        
        // 進捗更新コールバック
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.currentRoundTrips, this.getRemainingCount());
        }
        
        // 50往復達成時の中間メッセージ
        if (this.currentRoundTrips === 50 && !this.hasShownMidpointMessage) {
            this.hasShownMidpointMessage = true;
            if (this.onMidpointReached) {
                this.onMidpointReached();
            }
            console.log('Midpoint reached: 50 round trips completed!');
        }
        
        // 100往復完了判定
        if (this.currentRoundTrips >= this.totalRoundTrips) {
            this.completed = true;
            if (this.onCompletion) {
                this.onCompletion();
            }
            console.log('御百度参り completed! 100 round trips achieved!');
        }
    }
    
    /**
     * 現在の往復回数を取得
     * @returns {number} 現在の往復回数
     */
    getCurrentCount() {
        return this.currentRoundTrips;
    }
    
    /**
     * 残り往復回数を取得
     * @returns {number} 残り往復回数
     */
    getRemainingCount() {
        return Math.max(0, this.totalRoundTrips - this.currentRoundTrips);
    }
    
    /**
     * 進捗率を取得（0-100%）
     * @returns {number} 進捗率
     */
    getProgressPercentage() {
        return Math.min(100, (this.currentRoundTrips / this.totalRoundTrips) * 100);
    }
    
    /**
     * 御百度参りが完了しているかチェック
     * @returns {boolean} 完了状態
     */
    isCompleted() {
        return this.completed;
    }
    
    /**
     * 50往復の中間地点に達しているかチェック
     * @returns {boolean} 中間地点到達状態
     */
    isMidpointReached() {
        return this.currentRoundTrips >= 50;
    }
    
    /**
     * 進捗更新時のコールバックを設定
     * @param {Function} callback - コールバック関数
     */
    setOnProgressUpdate(callback) {
        this.onProgressUpdate = callback;
    }
    
    /**
     * 中間地点到達時のコールバックを設定
     * @param {Function} callback - コールバック関数
     */
    setOnMidpointReached(callback) {
        this.onMidpointReached = callback;
    }
    
    /**
     * 完了時のコールバックを設定
     * @param {Function} callback - コールバック関数
     */
    setOnCompletion(callback) {
        this.onCompletion = callback;
    }
    
    /**
     * 進捗をリセット
     */
    reset() {
        this.currentRoundTrips = 0;
        this.completed = false;
        this.lastLocation = null;
        this.hasReachedHyakudo = false;
        this.hasReachedHall = false;
        this.hasShownMidpointMessage = false;
        
        console.log('ProgressTracker reset');
    }
    
    /**
     * 現在の状態を取得（デバッグ用）
     * @returns {Object} 現在の状態
     */
    getState() {
        return {
            currentRoundTrips: this.currentRoundTrips,
            totalRoundTrips: this.totalRoundTrips,
            remainingCount: this.getRemainingCount(),
            progressPercentage: this.getProgressPercentage(),
            isCompleted: this.completed,
            isMidpointReached: this.isMidpointReached(),
            lastLocation: this.lastLocation,
            hasReachedHyakudo: this.hasReachedHyakudo,
            hasReachedHall: this.hasReachedHall
        };
    }
    
    /**
     * 状態をJSONとして保存用に取得
     * @returns {Object} 保存用状態データ
     */
    getSaveData() {
        return {
            currentRoundTrips: this.currentRoundTrips,
            isCompleted: this.completed,
            lastLocation: this.lastLocation,
            hasReachedHyakudo: this.hasReachedHyakudo,
            hasReachedHall: this.hasReachedHall,
            hasShownMidpointMessage: this.hasShownMidpointMessage
        };
    }
    
    /**
     * 保存データから状態を復元
     * @param {Object} saveData - 保存データ
     */
    loadSaveData(saveData) {
        if (!saveData) return;
        
        this.currentRoundTrips = saveData.currentRoundTrips || 0;
        this.completed = saveData.isCompleted || false;
        this.lastLocation = saveData.lastLocation || null;
        this.hasReachedHyakudo = saveData.hasReachedHyakudo || false;
        this.hasReachedHall = saveData.hasReachedHall || false;
        this.hasShownMidpointMessage = saveData.hasShownMidpointMessage || false;
        
        console.log('ProgressTracker state loaded:', this.getState());
    }
}