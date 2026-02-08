/**
 * ShrineEnvironment - 神社境内の背景と環境描画クラス
 * 2Dドット絵スタイルの神社境内全体を管理・描画
 */
class ShrineEnvironment {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;

        // 環境オブジェクトのリスト
        this.environmentObjects = [];

        // 背景要素の設定
        this.backgroundColor = '#87CEEB'; // 空色
        this.groundColor = '#228B22'; // 森の緑
        this.pathColor = '#D2B48C'; // 参道の色

        // アニメーション用のプロパティ
        this.animationTime = 0;
        this.cloudOffset = 0;
        this.leafAnimationPhase = 0;

        // 環境要素の配置設定
        this.setupEnvironmentLayout();

        console.log(`ShrineEnvironment created with size ${width}x${height}`);
    }

    /**
     * 環境レイアウトの設定
     */
    setupEnvironmentLayout() {
        // 参道の設定（社殿まで）
        this.pathConfig = {
            x: this.width / 2 - 25,
            y: 220, // 社殿の下から開始
            width: 50,
            height: 270, // 百度石まで
            segments: []
        };

        // 参道のセグメントを作成
        const segmentHeight = 30;
        for (let i = 0; i < Math.ceil(this.pathConfig.height / segmentHeight); i++) {
            this.pathConfig.segments.push({
                y: i * segmentHeight,
                height: segmentHeight
            });
        }

        // 鳥居の設定（神社の前に配置、高さを高く）
        this.toriiConfig = {
            x: this.width / 2 - 60,
            y: 180, // 神社の前
            width: 120,
            height: 100 // 高さを大幅に増加
        };

        // 石灯籠の設定（間隔を良い感じに調整）
        this.lanternPositions = [
            { x: this.width / 2 - 80, y: 180 },
            { x: this.width / 2 + 50, y: 180 },
            { x: this.width / 2 - 80, y: 260 },
            { x: this.width / 2 + 50, y: 260 },
            { x: this.width / 2 - 80, y: 340 },
            { x: this.width / 2 + 50, y: 340 },
            { x: this.width / 2 - 80, y: 420 },
            { x: this.width / 2 + 50, y: 420 }
        ];

        // 木々の設定（地面に配置）
        const groundStartY = this.height * 0.33;
        this.treePositions = [
            { x: 50, y: groundStartY + 50, size: 'large' },
            { x: 150, y: groundStartY + 80, size: 'medium' },
            { x: 80, y: groundStartY + 120, size: 'small' },
            { x: this.width - 80, y: groundStartY + 60, size: 'large' },
            { x: this.width - 120, y: groundStartY + 90, size: 'medium' },
            { x: this.width - 60, y: groundStartY + 130, size: 'small' },
            { x: 30, y: groundStartY + 150, size: 'medium' },
            { x: this.width - 40, y: groundStartY + 160, size: 'small' }
        ];

        // 狛犬の設定（百度石の両脇、石灯籠と重ならない位置）
        this.komaInuPositions = [
            { x: this.width / 2 - 100, y: 470, type: 'left' },  // 左の狛犬（百度石の左脇）
            { x: this.width / 2 + 65, y: 470, type: 'right' }   // 右の狛犬（百度石の右脇）
        ];

        // 雲の設定
        this.cloudPositions = [
            { x: 100, y: 30, size: 'large', speed: 0.2 },
            { x: 300, y: 50, size: 'medium', speed: 0.15 },
            { x: 600, y: 25, size: 'small', speed: 0.3 },
            { x: 450, y: 70, size: 'medium', speed: 0.1 }
        ];
    }

    /**
     * フレーム毎の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // アニメーション時間の更新
        this.animationTime += deltaTime;

        // 雲の移動
        this.cloudOffset += deltaTime * 0.01;

        // 葉っぱのアニメーション
        this.leafAnimationPhase += deltaTime * 0.002;

        // 環境オブジェクトの更新
        this.environmentObjects.forEach(obj => {
            if (obj.update) {
                obj.update(deltaTime);
            }
        });
    }

    /**
     * 環境全体の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        // 背景の描画
        this.renderBackground(context);

        // 雲の描画
        this.renderClouds(context);

        // 地面の描画
        this.renderGround(context);

        // 木々の描画
        this.renderTrees(context);

        // 鳥居の描画を削除
        // this.renderTorii(context);

        // 参道の描画
        this.renderPath(context);

        // 石灯籠の描画
        this.renderLanterns(context);

        // 狛犬の描画
        this.renderKomaInu(context);

        // 環境オブジェクトの描画
        this.renderEnvironmentObjects(context);

        // 装飾要素の描画
        this.renderDecorations(context);
    }

    /**
     * 背景（空）の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderBackground(context) {
        // 上部3分の1を空、下部3分の2を地面にする
        const skyHeight = this.height * 0.33;

        // 空のグラデーション
        const skyGradient = context.createLinearGradient(0, 0, 0, skyHeight);
        skyGradient.addColorStop(0, '#87CEEB'); // 明るい空色
        skyGradient.addColorStop(1, '#B0E0E6'); // 薄い青

        context.fillStyle = skyGradient;
        context.fillRect(0, 0, this.width, skyHeight);

        // 地面のグラデーション
        const groundGradient = context.createLinearGradient(0, skyHeight, 0, this.height);
        groundGradient.addColorStop(0, '#90EE90'); // 明るい緑
        groundGradient.addColorStop(0.3, '#228B22'); // 森の緑
        groundGradient.addColorStop(1, '#006400'); // 暗い緑

        context.fillStyle = groundGradient;
        context.fillRect(0, skyHeight, this.width, this.height - skyHeight);
    }

    /**
     * 雲の描画（静的）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderClouds(context) {
        context.fillStyle = '#FFFFFF';

        this.cloudPositions.forEach(cloud => {
            const x = cloud.x;
            const y = cloud.y;

            let size;
            switch (cloud.size) {
                case 'large': size = 40; break;
                case 'medium': size = 25; break;
                case 'small': size = 15; break;
                default: size = 25;
            }

            // 雲の形を複数の円で表現（静的）
            context.beginPath();
            context.arc(x, y, size * 0.6, 0, Math.PI * 2);
            context.arc(x + size * 0.5, y, size * 0.8, 0, Math.PI * 2);
            context.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
            context.arc(x + size * 0.25, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
            context.arc(x + size * 0.75, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
            context.fill();
        });
    }

    /**
     * 地面の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderGround(context) {
        // 地面は背景で既に描画されているので、追加の装飾のみ
        const groundStartY = this.height * 0.33;

        // 静的な草のテクスチャ（アニメーションなし）
        context.fillStyle = '#32CD32';
        const grassPattern = [
            { x: 50, y: groundStartY + 20 }, { x: 120, y: groundStartY + 35 },
            { x: 200, y: groundStartY + 15 }, { x: 280, y: groundStartY + 40 },
            { x: 520, y: groundStartY + 25 }, { x: 600, y: groundStartY + 30 },
            { x: 680, y: groundStartY + 18 }, { x: 750, y: groundStartY + 35 },
            { x: 80, y: groundStartY + 80 }, { x: 160, y: groundStartY + 95 },
            { x: 240, y: groundStartY + 75 }, { x: 320, y: groundStartY + 100 },
            { x: 560, y: groundStartY + 85 }, { x: 640, y: groundStartY + 90 },
            { x: 720, y: groundStartY + 78 }, { x: 30, y: groundStartY + 120 }
        ];

        grassPattern.forEach(grass => {
            context.fillRect(grass.x, grass.y, 3, 8);
            context.fillRect(grass.x + 4, grass.y + 2, 2, 6);
        });

        // 静的な小石の描画
        context.fillStyle = '#A0A0A0';
        const stonePattern = [
            { x: 100, y: groundStartY + 60, size: 3 },
            { x: 300, y: groundStartY + 80, size: 2 },
            { x: 500, y: groundStartY + 45, size: 4 },
            { x: 700, y: groundStartY + 70, size: 2 },
            { x: 150, y: groundStartY + 120, size: 3 },
            { x: 450, y: groundStartY + 110, size: 2 },
            { x: 650, y: groundStartY + 130, size: 3 }
        ];

        stonePattern.forEach(stone => {
            context.beginPath();
            context.arc(stone.x, stone.y, stone.size, 0, Math.PI * 2);
            context.fill();
        });
    }

    /**
     * 木々の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderTrees(context) {
        this.treePositions.forEach(tree => {
            this.renderTree(context, tree.x, tree.y, tree.size);
        });
    }

    /**
     * 単一の木の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} size - サイズ ('small', 'medium', 'large')
     */
    renderTree(context, x, y, size) {
        let trunkWidth, trunkHeight, crownRadius;

        switch (size) {
            case 'large':
                trunkWidth = 12;
                trunkHeight = 60;
                crownRadius = 35;
                break;
            case 'medium':
                trunkWidth = 8;
                trunkHeight = 40;
                crownRadius = 25;
                break;
            case 'small':
                trunkWidth = 6;
                trunkHeight = 30;
                crownRadius = 18;
                break;
            default:
                trunkWidth = 8;
                trunkHeight = 40;
                crownRadius = 25;
        }

        // 幹の描画
        context.fillStyle = '#8B4513';
        context.fillRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight);

        // 幹の質感
        context.fillStyle = '#A0522D';
        context.fillRect(x - trunkWidth / 2, y, 2, trunkHeight);

        // 葉っぱの描画（アニメーションなし）
        const crownX = x;
        const crownY = y - crownRadius * 0.3;

        context.fillStyle = '#228B22';
        context.beginPath();
        context.arc(crownX, crownY, crownRadius, 0, Math.PI * 2);
        context.fill();

        // 葉っぱのハイライト
        context.fillStyle = '#32CD32';
        context.beginPath();
        context.arc(crownX - crownRadius * 0.3, crownY - crownRadius * 0.3, crownRadius * 0.6, 0, Math.PI * 2);
        context.fill();

        // 小さな葉っぱの房
        context.fillStyle = '#228B22';
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const leafX = crownX + Math.cos(angle) * crownRadius * 0.7;
            const leafY = crownY + Math.sin(angle) * crownRadius * 0.7;
            context.beginPath();
            context.arc(leafX, leafY, crownRadius * 0.4, 0, Math.PI * 2);
            context.fill();
        }
    }

    /**
     * 鳥居の描画（高い鳥居）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderTorii(context) {
        const config = this.toriiConfig;

        // 影の描画
        context.fillStyle = '#8B4513';
        context.fillRect(config.x + 2, config.y + 2, config.width, config.height);

        // 柱の描画（2本の太い柱）
        const pillarWidth = 18;
        context.fillStyle = '#CD853F';
        context.fillRect(config.x, config.y + 20, pillarWidth, config.height - 20);
        context.fillRect(config.x + config.width - pillarWidth, config.y + 20, pillarWidth, config.height - 20);

        // 上部の横木（笠木）- より立派に
        context.fillStyle = '#CD853F';
        context.fillRect(config.x - 20, config.y, config.width + 40, 15);

        // 笠木の装飾（反り上がり）
        context.fillStyle = '#DAA520';
        context.beginPath();
        context.moveTo(config.x - 20, config.y + 15);
        context.lineTo(config.x - 15, config.y + 10);
        context.lineTo(config.x + config.width + 15, config.y + 10);
        context.lineTo(config.x + config.width + 20, config.y + 15);
        context.closePath();
        context.fill();

        // 下部の横木（貫）- 位置を調整
        context.fillStyle = '#CD853F';
        context.fillRect(config.x + 10, config.y + 40, config.width - 20, 12);

        // 柱の装飾（木目）
        context.fillStyle = '#8B4513';
        context.fillRect(config.x + 3, config.y + 25, 4, config.height - 25);
        context.fillRect(config.x + config.width - 7, config.y + 25, 4, config.height - 25);

        // 柱の中央装飾
        context.fillRect(config.x + 8, config.y + 50, 2, config.height - 50);
        context.fillRect(config.x + config.width - 10, config.y + 50, 2, config.height - 50);

        // 鳥居の縁取り
        context.strokeStyle = '#8B4513';
        context.lineWidth = 3;
        context.strokeRect(config.x - 20, config.y, config.width + 40, 15);
        context.strokeRect(config.x, config.y + 20, pillarWidth, config.height - 20);
        context.strokeRect(config.x + config.width - pillarWidth, config.y + 20, pillarWidth, config.height - 20);
        context.strokeRect(config.x + 10, config.y + 40, config.width - 20, 12);
    }

    /**
     * 参道の描画（自然な石畳風）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderPath(context) {
        const config = this.pathConfig;

        // 参道の影
        context.fillStyle = '#A0522D';
        context.fillRect(config.x + 2, config.y + 2, config.width, config.height);

        // 参道の基本色（自然な石色）
        context.fillStyle = '#F5F5DC';
        context.fillRect(config.x, config.y, config.width, config.height);

        // 不規則な石畳のパターンを描画
        const stones = [
            // 大きめの石
            { x: config.x + 2, y: config.y + 5, w: 22, h: 18, color: '#E6E6FA' },
            { x: config.x + 26, y: config.y + 8, w: 20, h: 15, color: '#D3D3D3' },
            { x: config.x + 5, y: config.y + 25, w: 18, h: 20, color: '#DCDCDC' },
            { x: config.x + 25, y: config.y + 28, w: 21, h: 17, color: '#E6E6FA' },
            { x: config.x + 3, y: config.y + 48, w: 20, h: 16, color: '#D3D3D3' },
            { x: config.x + 25, y: config.y + 50, w: 19, h: 18, color: '#DCDCDC' },
            { x: config.x + 4, y: config.y + 68, w: 21, h: 15, color: '#E6E6FA' },
            { x: config.x + 27, y: config.y + 70, w: 18, h: 19, color: '#D3D3D3' },
            { x: config.x + 2, y: config.y + 88, w: 23, h: 17, color: '#DCDCDC' },
            { x: config.x + 26, y: config.y + 92, w: 20, h: 16, color: '#E6E6FA' },
            { x: config.x + 5, y: config.y + 108, w: 19, h: 18, color: '#D3D3D3' },
            { x: config.x + 26, y: config.y + 112, w: 21, h: 15, color: '#DCDCDC' },
            { x: config.x + 3, y: config.y + 128, w: 22, h: 19, color: '#E6E6FA' },
            { x: config.x + 27, y: config.y + 132, w: 18, h: 17, color: '#D3D3D3' },
            { x: config.x + 4, y: config.y + 148, w: 20, h: 16, color: '#DCDCDC' },
            { x: config.x + 26, y: config.y + 152, w: 19, h: 18, color: '#E6E6FA' },
            { x: config.x + 2, y: config.y + 168, w: 21, h: 15, color: '#D3D3D3' },
            { x: config.x + 25, y: config.y + 172, w: 22, h: 17, color: '#DCDCDC' },
            { x: config.x + 5, y: config.y + 188, w: 18, h: 19, color: '#E6E6FA' },
            { x: config.x + 25, y: config.y + 192, w: 20, h: 16, color: '#D3D3D3' },
            { x: config.x + 3, y: config.y + 208, w: 23, h: 18, color: '#DCDCDC' },
            { x: config.x + 28, y: config.y + 212, w: 17, h: 15, color: '#E6E6FA' },
            { x: config.x + 4, y: config.y + 228, w: 21, h: 17, color: '#D3D3D3' },
            { x: config.x + 27, y: config.y + 232, w: 19, h: 19, color: '#DCDCDC' },
            { x: config.x + 2, y: config.y + 248, w: 22, h: 16, color: '#E6E6FA' },
            { x: config.x + 26, y: config.y + 252, w: 20, h: 18, color: '#D3D3D3' }
        ];

        // 各石を描画
        stones.forEach(stone => {
            // 石の本体
            context.fillStyle = stone.color;
            context.fillRect(stone.x, stone.y, stone.w, stone.h);

            // 石の境界線（自然な感じに）
            context.strokeStyle = '#A9A9A9';
            context.lineWidth = 1;
            context.strokeRect(stone.x, stone.y, stone.w, stone.h);

            // 石の質感（小さな影と光）
            context.fillStyle = '#B0B0B0';
            context.fillRect(stone.x + 1, stone.y + 1, 2, 2);
            context.fillStyle = '#F8F8FF';
            context.fillRect(stone.x + stone.w - 3, stone.y + stone.h - 3, 2, 2);
        });

        // 参道全体の境界線は削除（自然な感じに）
        // context.strokeStyle = '#8B7355';
        // context.lineWidth = 2;
        // context.strokeRect(config.x, config.y, config.width, config.height);

        // 石と石の間の隙間に小石や砂を表現
        context.fillStyle = '#DEB887';
        for (let i = 0; i < 20; i++) {
            const gapX = config.x + Math.random() * config.width;
            const gapY = config.y + Math.random() * config.height;
            context.beginPath();
            context.arc(gapX, gapY, 1, 0, Math.PI * 2);
            context.fill();
        }
    }

    /**
     * 石灯籠の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderLanterns(context) {
        this.lanternPositions.forEach(pos => {
            this.renderLantern(context, pos.x, pos.y);
        });
    }

    /**
     * 単一の石灯籠の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    renderLantern(context, x, y) {
        const width = 25;
        const height = 60;

        // 影の描画
        context.fillStyle = '#7F8C8D';
        context.fillRect(x + 2, y + 2, width, height);

        // 基礎部分
        context.fillStyle = '#95A5A6';
        context.fillRect(x, y + height - 15, width, 15);

        // 柱部分
        context.fillStyle = '#BDC3C7';
        context.fillRect(x + 5, y + 15, width - 10, height - 30);

        // 灯籠の頭部
        context.fillStyle = '#95A5A6';
        context.fillRect(x - 2, y, width + 4, 20);

        // 屋根部分
        context.fillStyle = '#7F8C8D';
        context.beginPath();
        context.moveTo(x - 5, y + 5);
        context.lineTo(x + width / 2, y - 5);
        context.lineTo(x + width + 5, y + 5);
        context.closePath();
        context.fill();

        // 灯りの部分（微かに光る）
        const lightIntensity = 0.3 + Math.sin(this.animationTime * 0.003 + x * 0.01) * 0.2;
        context.fillStyle = `rgba(255, 255, 0, ${lightIntensity})`;
        context.fillRect(x + 8, y + 20, width - 16, 15);

        // 装飾的な線
        context.strokeStyle = '#34495E';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x + 3, y + 25);
        context.lineTo(x + width - 3, y + 25);
        context.moveTo(x + 3, y + 30);
        context.lineTo(x + width - 3, y + 30);
        context.stroke();
    }

    /**
     * 狛犬の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderKomaInu(context) {
        this.komaInuPositions.forEach(komaInu => {
            this.renderSingleKomaInu(context, komaInu.x, komaInu.y, komaInu.type);
        });
    }

    /**
     * 単一の狛犬の描画（犬らしい輪郭、優しい目）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} type - タイプ ('left' または 'right')
     */
    renderSingleKomaInu(context, x, y, type) {
        const width = 35;
        const height = 45;

        // 影の描画
        context.fillStyle = '#696969';
        context.fillRect(x + 3, y + 3, width, height);

        // 台座
        context.fillStyle = '#A9A9A9';
        context.fillRect(x - 5, y + height - 5, width + 10, 12);
        context.strokeStyle = '#696969';
        context.lineWidth = 2;
        context.strokeRect(x - 5, y + height - 5, width + 10, 12);

        // 狛犬の体（座った姿勢）
        context.fillStyle = '#D3D3D3';
        context.fillRect(x + 5, y + 20, width - 10, height - 25);

        // 狛犬の胸
        context.fillStyle = '#E6E6E6';
        context.fillRect(x + 8, y + 22, width - 16, 15);

        // 狛犬の頭（犬らしい楕円形）
        context.fillStyle = '#D3D3D3';
        context.beginPath();
        context.ellipse(x + width / 2, y + 15, 12, 10, 0, 0, Math.PI * 2);
        context.fill();

        // 狛犬の鼻先（犬らしいマズル）
        context.fillStyle = '#C0C0C0';
        context.beginPath();
        context.ellipse(x + width / 2, y + 20, 6, 4, 0, 0, Math.PI * 2);
        context.fill();

        // 狛犬のたてがみ（控えめに）
        context.fillStyle = '#C0C0C0';
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const maneX = x + width / 2 + Math.cos(angle) * 10;
            const maneY = y + 12 + Math.sin(angle) * 8;
            context.beginPath();
            context.arc(maneX, maneY, 3, 0, Math.PI * 2);
            context.fill();
        }

        // 狛犬の耳（犬らしい垂れ耳）
        context.fillStyle = '#C0C0C0';
        context.beginPath();
        context.ellipse(x + width / 2 - 8, y + 8, 4, 6, -0.3, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.ellipse(x + width / 2 + 8, y + 8, 4, 6, 0.3, 0, Math.PI * 2);
        context.fill();

        // 狛犬の目（優しい黒い目）
        context.fillStyle = '#2F4F4F';
        context.beginPath();
        context.arc(x + width / 2 - 4, y + 12, 2, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(x + width / 2 + 4, y + 12, 2, 0, Math.PI * 2);
        context.fill();

        // 目の中の光（優しい表情）
        context.fillStyle = '#FFFFFF';
        context.beginPath();
        context.arc(x + width / 2 - 4, y + 11, 0.5, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(x + width / 2 + 4, y + 11, 0.5, 0, Math.PI * 2);
        context.fill();

        // 狛犬の鼻
        context.fillStyle = '#2F4F4F';
        context.beginPath();
        context.arc(x + width / 2, y + 18, 1.5, 0, Math.PI * 2);
        context.fill();

        // 狛犬の口（優しい表情）
        context.strokeStyle = '#2F4F4F';
        context.lineWidth = 1;
        context.beginPath();
        if (type === 'left') {
            // 阿形（少し口を開けている）
            context.arc(x + width / 2, y + 21, 2, 0, Math.PI);
        } else {
            // 吽形（口を閉じている）
            context.moveTo(x + width / 2 - 2, y + 21);
            context.lineTo(x + width / 2 + 2, y + 21);
        }
        context.stroke();

        // 狛犬の前足
        context.fillStyle = '#D3D3D3';
        context.fillRect(x + 8, y + 35, 6, 12);
        context.fillRect(x + width - 14, y + 35, 6, 12);

        // 狛犬の後ろ足（座った姿勢）
        context.fillRect(x + 12, y + 30, 8, 17);
        context.fillRect(x + width - 20, y + 30, 8, 17);

        // 狛犬の尻尾（巻いた尻尾）
        context.strokeStyle = '#C0C0C0';
        context.lineWidth = 3;
        context.beginPath();
        if (type === 'left') {
            context.arc(x + width - 5, y + 25, 5, 0, Math.PI * 1.5);
        } else {
            context.arc(x + 5, y + 25, 5, Math.PI * 0.5, Math.PI * 2);
        }
        context.stroke();

        // 狛犬の輪郭
        context.strokeStyle = '#696969';
        context.lineWidth = 2;
        context.beginPath();
        context.ellipse(x + width / 2, y + 15, 12, 10, 0, 0, Math.PI * 2);
        context.stroke();
        context.strokeRect(x + 5, y + 20, width - 10, height - 25);

        // 装飾的な模様（体に）
        context.fillStyle = '#B0B0B0';
        context.beginPath();
        context.arc(x + width / 2, y + 28, 2, 0, Math.PI * 2);
        context.fill();
    }

    /**
     * 環境オブジェクトの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderEnvironmentObjects(context) {
        this.environmentObjects.forEach(obj => {
            if (obj.render && obj.isVisibleObject()) {
                obj.render(context);
            }
        });
    }

    /**
     * 装飾要素の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderDecorations(context) {
        // 舞い散る花びらや葉っぱ
        this.renderFloatingParticles(context);

        // 小鳥の描画
        this.renderBirds(context);
    }

    /**
     * 舞い散る粒子の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderFloatingParticles(context) {
        context.fillStyle = '#FFB6C1';

        for (let i = 0; i < 8; i++) {
            const x = (this.animationTime * 0.02 + i * 100) % this.width;
            const y = (this.animationTime * 0.01 + i * 50) % this.height;
            const size = 2 + Math.sin(this.animationTime * 0.005 + i) * 1;

            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
    }

    /**
     * 小鳥の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderBirds(context) {
        context.strokeStyle = '#2C3E50';
        context.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
            const x = (this.animationTime * 0.05 + i * 200) % (this.width + 100) - 50;
            const y = 80 + Math.sin(this.animationTime * 0.003 + i) * 20;

            // 簡単な鳥の形（V字）
            context.beginPath();
            context.moveTo(x - 5, y);
            context.lineTo(x, y - 3);
            context.lineTo(x + 5, y);
            context.stroke();
        }
    }

    /**
     * 環境オブジェクトを追加
     * @param {EnvironmentObject} object - 追加する環境オブジェクト
     */
    addEnvironmentObject(object) {
        if (object && typeof object === 'object') {
            this.environmentObjects.push(object);
            console.log(`Environment object added: ${object.getType()}`);
        }
    }

    /**
     * 環境オブジェクトを削除
     * @param {EnvironmentObject} object - 削除する環境オブジェクト
     */
    removeEnvironmentObject(object) {
        const index = this.environmentObjects.indexOf(object);
        if (index > -1) {
            this.environmentObjects.splice(index, 1);
            console.log(`Environment object removed: ${object.getType()}`);
        }
    }

    /**
     * 全ての環境オブジェクトを取得
     * @returns {Array} 環境オブジェクトの配列
     */
    getEnvironmentObjects() {
        return [...this.environmentObjects];
    }

    /**
     * 指定したタイプの環境オブジェクトを取得
     * @param {string} type - オブジェクトタイプ
     * @returns {Array} 指定タイプの環境オブジェクトの配列
     */
    getEnvironmentObjectsByType(type) {
        return this.environmentObjects.filter(obj => obj.getType() === type);
    }

    /**
     * 環境のサイズを設定
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.setupEnvironmentLayout();
    }

    /**
     * 環境のサイズを取得
     * @returns {Object} サイズ情報 {width, height}
     */
    getSize() {
        return { width: this.width, height: this.height };
    }

    /**
     * リソースの破棄
     */
    destroy() {
        // 全ての環境オブジェクトを破棄
        this.environmentObjects.forEach(obj => {
            if (obj.destroy) {
                obj.destroy();
            }
        });

        this.environmentObjects = [];
        console.log('ShrineEnvironment destroyed');
    }
}