/**
 * TouchControls - 仮想Dパッドによるタッチコントロール
 * モバイルデバイス向けのオンスクリーンボタンを管理し、
 * PlayerCharacter の inputState と同じインターフェースで入力を提供する
 */
class TouchControls {
    /**
     * @param {PlayerCharacter} playerCharacter - 入力を渡すプレイヤーキャラクター
     */
    constructor(playerCharacter) {
        this.playerCharacter = playerCharacter;
        this.container = document.getElementById('touch-controls');
        this.buttons = {};
        this.activeDirections = new Set();

        // ボタン要素を収集
        if (this.container) {
            this.container.querySelectorAll('.touch-btn').forEach(btn => {
                const dir = btn.dataset.dir;
                if (dir) this.buttons[dir] = btn;
            });
        }

        // イベントハンドラーのバインド
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd   = this._onTouchEnd.bind(this);
        this._onTouchMove  = this._onTouchMove.bind(this);
    }

    /**
     * タッチコントロールを有効化し、表示する
     * タッチデバイスまたは小さい画面でのみ表示する
     */
    show() {
        if (!this.container) return;
        this.container.classList.add('visible');
        this._attachListeners();
    }

    /**
     * タッチコントロールを非表示にする
     */
    hide() {
        if (!this.container) return;
        this.container.classList.remove('visible');
        this._detachListeners();
        this._releaseAll();
    }

    /**
     * タッチデバイスかどうかを判定して自動的に表示/非表示を切り替える
     */
    autoShow() {
        const isTouchDevice = ('ontouchstart' in window) ||
                              (navigator.maxTouchPoints > 0) ||
                              (window.innerWidth <= 1023);
        if (isTouchDevice) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * リソースの解放
     */
    destroy() {
        this._detachListeners();
        this._releaseAll();
    }

    // ─── private ───────────────────────────────────────────────

    _attachListeners() {
        if (!this.container) return;
        this.container.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.container.addEventListener('touchend',   this._onTouchEnd,   { passive: false });
        this.container.addEventListener('touchcancel',this._onTouchEnd,   { passive: false });
        this.container.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
    }

    _detachListeners() {
        if (!this.container) return;
        this.container.removeEventListener('touchstart', this._onTouchStart);
        this.container.removeEventListener('touchend',   this._onTouchEnd);
        this.container.removeEventListener('touchcancel',this._onTouchEnd);
        this.container.removeEventListener('touchmove',  this._onTouchMove);
    }

    /**
     * タッチ座標からボタン要素を特定する
     * @param {number} clientX
     * @param {number} clientY
     * @returns {string|null} 方向文字列 or null
     */
    _dirFromPoint(clientX, clientY) {
        for (const [dir, btn] of Object.entries(this.buttons)) {
            const rect = btn.getBoundingClientRect();
            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top  && clientY <= rect.bottom) {
                return dir;
            }
        }
        return null;
    }

    _press(dir) {
        if (!dir || this.activeDirections.has(dir)) return;
        this.activeDirections.add(dir);
        if (this.playerCharacter) {
            this.playerCharacter.inputState[dir] = true;
        }
        if (this.buttons[dir]) {
            this.buttons[dir].classList.add('pressed');
        }
    }

    _release(dir) {
        if (!dir || !this.activeDirections.has(dir)) return;
        this.activeDirections.delete(dir);
        if (this.playerCharacter) {
            this.playerCharacter.inputState[dir] = false;
        }
        if (this.buttons[dir]) {
            this.buttons[dir].classList.remove('pressed');
        }
    }

    _releaseAll() {
        for (const dir of [...this.activeDirections]) {
            this._release(dir);
        }
    }

    _onTouchStart(event) {
        event.preventDefault();
        for (const touch of event.changedTouches) {
            const dir = this._dirFromPoint(touch.clientX, touch.clientY);
            if (dir) this._press(dir);
        }
    }

    _onTouchEnd(event) {
        event.preventDefault();
        // 現在アクティブなタッチ一覧を再評価して、離れたボタンを解放する
        const stillActive = new Set();
        for (const touch of event.touches) {
            const dir = this._dirFromPoint(touch.clientX, touch.clientY);
            if (dir) stillActive.add(dir);
        }
        for (const dir of [...this.activeDirections]) {
            if (!stillActive.has(dir)) this._release(dir);
        }
    }

    _onTouchMove(event) {
        event.preventDefault();
        // 各タッチポイントが今どのボタン上にあるかを再評価
        const nowActive = new Set();
        for (const touch of event.touches) {
            const dir = this._dirFromPoint(touch.clientX, touch.clientY);
            if (dir) nowActive.add(dir);
        }
        // 新たに押されたボタンを press
        for (const dir of nowActive) {
            if (!this.activeDirections.has(dir)) this._press(dir);
        }
        // 離れたボタンを release
        for (const dir of [...this.activeDirections]) {
            if (!nowActive.has(dir)) this._release(dir);
        }
    }
}
