/**
 * AudioManager - Web Audio APIを使用した音響管理システム
 * 効果音とBGMの再生制御、音量調整機能を提供
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGainNode = null;
        this.sfxGainNode = null;
        this.bgmGainNode = null;
        
        // 音声ファイルのバッファを保存
        this.audioBuffers = new Map();
        this.activeSources = new Map();
        
        // 音量設定（0.0 - 1.0）
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.bgmVolume = 0.5;
        
        // BGM用の現在再生中のソース
        this.currentBGM = null;
        
        // 初期化状態
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * AudioContextとゲインノードを初期化
     */
    async init() {
        try {
            // AudioContextを作成（ブラウザ互換性を考慮）
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // マスターゲインノード作成
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.masterVolume;
            this.masterGainNode.connect(this.audioContext.destination);
            
            // 効果音用ゲインノード
            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.gain.value = this.sfxVolume;
            this.sfxGainNode.connect(this.masterGainNode);
            
            // BGM用ゲインノード
            this.bgmGainNode = this.audioContext.createGain();
            this.bgmGainNode.gain.value = this.bgmVolume;
            this.bgmGainNode.connect(this.masterGainNode);
            
            this.isInitialized = true;
            console.log('AudioManager initialized successfully');
            
        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
            this.handleAudioError(error);
        }
    }

    /**
     * ユーザーインタラクション後にAudioContextを再開
     * （ブラウザのautoplay policyに対応）
     */
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('AudioContext resumed');
            } catch (error) {
                console.warn('Failed to resume AudioContext:', error);
            }
        }
    }

    /**
     * 音声ファイルを読み込んでバッファに保存
     * @param {string} name - 音声の識別名
     * @param {string} url - 音声ファイルのURL
     */
    async loadSound(name, url) {
        if (!this.isInitialized) {
            console.warn('AudioManager not initialized');
            return false;
        }

        try {
            const response = await fetch(url);
            
            // レスポンスのステータスをチェック
            if (!response.ok) {
                console.warn(`Failed to load sound ${name}: ${response.status} ${response.statusText}`);
                return false;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.audioBuffers.set(name, audioBuffer);
            console.log(`Sound loaded: ${name}`);
            return true;
            
        } catch (error) {
            console.warn(`Failed to load sound ${name}:`, error);
            this.handleAudioError(error);
            return false;
        }
    }

    /**
     * 効果音を再生
     * @param {string} name - 音声の識別名
     * @param {number} volume - 音量（0.0-1.0、オプション）
     * @param {boolean} loop - ループ再生するか（オプション）
     */
    playSFX(name, volume = 1.0, loop = false) {
        if (!this.isInitialized || !this.audioBuffers.has(name)) {
            console.warn(`Sound not found or AudioManager not ready: ${name}`);
            return null;
        }

        try {
            const buffer = this.audioBuffers.get(name);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.loop = loop;
            gainNode.gain.value = volume;
            
            // 接続: source -> gainNode -> sfxGainNode
            source.connect(gainNode);
            gainNode.connect(this.sfxGainNode);
            
            // 再生開始
            source.start();
            
            // 再生終了時のクリーンアップ
            source.onended = () => {
                this.activeSources.delete(name);
            };
            
            // アクティブなソースとして記録
            this.activeSources.set(name, { source, gainNode });
            
            return source;
            
        } catch (error) {
            console.warn(`Failed to play SFX ${name}:`, error);
            this.handleAudioError(error);
            return null;
        }
    }

    /**
     * BGMを再生
     * @param {string} name - 音声の識別名
     * @param {number} volume - 音量（0.0-1.0、オプション）
     * @param {boolean} fadeIn - フェードイン効果（オプション）
     */
    playBGM(name, volume = 1.0, fadeIn = false) {
        if (!this.isInitialized || !this.audioBuffers.has(name)) {
            console.warn(`BGM not found or AudioManager not ready: ${name}`);
            return null;
        }

        // 既存のBGMを停止
        this.stopBGM();

        try {
            const buffer = this.audioBuffers.get(name);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.loop = true; // BGMは基本的にループ
            
            // フェードイン効果
            if (fadeIn) {
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2.0);
            } else {
                gainNode.gain.value = volume;
            }
            
            // 接続: source -> gainNode -> bgmGainNode
            source.connect(gainNode);
            gainNode.connect(this.bgmGainNode);
            
            // 再生開始
            source.start();
            
            // 現在のBGMとして記録
            this.currentBGM = { source, gainNode, name };
            
            return source;
            
        } catch (error) {
            console.warn(`Failed to play BGM ${name}:`, error);
            this.handleAudioError(error);
            return null;
        }
    }

    /**
     * BGMを停止
     * @param {boolean} fadeOut - フェードアウト効果（オプション）
     */
    stopBGM(fadeOut = false) {
        if (!this.currentBGM) return;

        try {
            if (fadeOut) {
                // フェードアウト効果
                const { gainNode, source } = this.currentBGM;
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.0);
                
                setTimeout(() => {
                    source.stop();
                    this.currentBGM = null;
                }, 1000);
            } else {
                // 即座に停止
                this.currentBGM.source.stop();
                this.currentBGM = null;
            }
        } catch (error) {
            console.warn('Failed to stop BGM:', error);
            this.currentBGM = null;
        }
    }

    /**
     * 特定の効果音を停止
     * @param {string} name - 音声の識別名
     */
    stopSFX(name) {
        if (this.activeSources.has(name)) {
            try {
                const { source } = this.activeSources.get(name);
                source.stop();
                this.activeSources.delete(name);
            } catch (error) {
                console.warn(`Failed to stop SFX ${name}:`, error);
            }
        }
    }

    /**
     * すべての音声を停止
     */
    stopAll() {
        // すべての効果音を停止
        for (const [name] of this.activeSources) {
            this.stopSFX(name);
        }
        
        // BGMを停止
        this.stopBGM();
    }

    /**
     * マスター音量を設定
     * @param {number} volume - 音量（0.0-1.0）
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
    }

    /**
     * 効果音音量を設定
     * @param {number} volume - 音量（0.0-1.0）
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = this.sfxVolume;
        }
    }

    /**
     * BGM音量を設定
     * @param {number} volume - 音量（0.0-1.0）
     */
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmGainNode) {
            this.bgmGainNode.gain.value = this.bgmVolume;
        }
    }

    /**
     * 現在の音量設定を取得
     */
    getVolumeSettings() {
        return {
            master: this.masterVolume,
            sfx: this.sfxVolume,
            bgm: this.bgmVolume
        };
    }

    /**
     * 音声エラーのハンドリング
     * @param {Error} error - エラーオブジェクト
     */
    handleAudioError(error) {
        console.warn('Audio error handled:', error.message);
        // エラーが発生してもゲームは継続する
        // 必要に応じてフォールバック処理を実装
    }

    /**
     * AudioManagerの状態を取得
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            audioContextState: this.audioContext ? this.audioContext.state : 'not created',
            loadedSounds: Array.from(this.audioBuffers.keys()),
            activeSources: Array.from(this.activeSources.keys()),
            currentBGM: this.currentBGM ? this.currentBGM.name : null
        };
    }
}

// シングルトンインスタンスをエクスポート
const audioManager = new AudioManager();