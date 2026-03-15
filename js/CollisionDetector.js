/**
 * CollisionDetector - 当たり判定システム
 * 各種当たり判定アルゴリズムを提供する静的クラス
 */
class CollisionDetector {
    /**
     * AABB (Axis-Aligned Bounding Box) 当たり判定
     * 矩形同士の当たり判定を行う
     * @param {Object} objectA - オブジェクトA (getBounds()メソッドを持つ)
     * @param {Object} objectB - オブジェクトB (getBounds()メソッドを持つ)
     * @returns {boolean} 衝突しているかどうか
     */
    static checkAABB(objectA, objectB) {
        if (!objectA || !objectB) {
            return false;
        }
        
        const boundsA = objectA.getBounds();
        const boundsB = objectB.getBounds();
        
        if (!boundsA || !boundsB) {
            return false;
        }
        
        return (
            boundsA.x < boundsB.x + boundsB.width &&
            boundsA.x + boundsA.width > boundsB.x &&
            boundsA.y < boundsB.y + boundsB.height &&
            boundsA.y + boundsA.height > boundsB.y
        );
    }
    
    /**
     * 点と矩形の当たり判定
     * @param {number} pointX - 点のX座標
     * @param {number} pointY - 点のY座標
     * @param {Object} object - 矩形オブジェクト (getBounds()メソッドを持つ)
     * @returns {boolean} 点が矩形内にあるかどうか
     */
    static checkPointInRect(pointX, pointY, object) {
        if (!object) {
            return false;
        }
        
        const bounds = object.getBounds();
        if (!bounds) {
            return false;
        }
        
        return (
            pointX >= bounds.x &&
            pointX <= bounds.x + bounds.width &&
            pointY >= bounds.y &&
            pointY <= bounds.y + bounds.height
        );
    }
    
    /**
     * 円と矩形の当たり判定
     * @param {number} circleX - 円の中心X座標
     * @param {number} circleY - 円の中心Y座標
     * @param {number} radius - 円の半径
     * @param {Object} object - 矩形オブジェクト (getBounds()メソッドを持つ)
     * @returns {boolean} 衝突しているかどうか
     */
    static checkCircleRect(circleX, circleY, radius, object) {
        if (!object) {
            return false;
        }
        
        const bounds = object.getBounds();
        if (!bounds) {
            return false;
        }
        
        // 矩形の最も近い点を計算
        const closestX = Math.max(bounds.x, Math.min(circleX, bounds.x + bounds.width));
        const closestY = Math.max(bounds.y, Math.min(circleY, bounds.y + bounds.height));
        
        // 距離を計算
        const distanceX = circleX - closestX;
        const distanceY = circleY - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        return distanceSquared <= radius * radius;
    }
    
    /**
     * 円同士の当たり判定
     * @param {number} circle1X - 円1の中心X座標
     * @param {number} circle1Y - 円1の中心Y座標
     * @param {number} radius1 - 円1の半径
     * @param {number} circle2X - 円2の中心X座標
     * @param {number} circle2Y - 円2の中心Y座標
     * @param {number} radius2 - 円2の半径
     * @returns {boolean} 衝突しているかどうか
     */
    static checkCircleCircle(circle1X, circle1Y, radius1, circle2X, circle2Y, radius2) {
        const distanceX = circle2X - circle1X;
        const distanceY = circle2Y - circle1Y;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        const radiusSum = radius1 + radius2;
        
        return distanceSquared <= radiusSum * radiusSum;
    }
    
    /**
     * 2つのオブジェクト間の距離を計算
     * @param {Object} objectA - オブジェクトA (getCenterPosition()メソッドを持つ)
     * @param {Object} objectB - オブジェクトB (getCenterPosition()メソッドを持つ)
     * @returns {number} 距離（ピクセル）
     */
    static getDistance(objectA, objectB) {
        if (!objectA || !objectB) {
            return Infinity;
        }
        
        const posA = objectA.getCenterPosition();
        const posB = objectB.getCenterPosition();
        
        if (!posA || !posB) {
            return Infinity;
        }
        
        const deltaX = posB.x - posA.x;
        const deltaY = posB.y - posA.y;
        
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    
    /**
     * 2つのオブジェクト間の距離の二乗を計算（パフォーマンス重視）
     * @param {Object} objectA - オブジェクトA (getCenterPosition()メソッドを持つ)
     * @param {Object} objectB - オブジェクトB (getCenterPosition()メソッドを持つ)
     * @returns {number} 距離の二乗（ピクセル²）
     */
    static getDistanceSquared(objectA, objectB) {
        if (!objectA || !objectB) {
            return Infinity;
        }
        
        const posA = objectA.getCenterPosition();
        const posB = objectB.getCenterPosition();
        
        if (!posA || !posB) {
            return Infinity;
        }
        
        const deltaX = posB.x - posA.x;
        const deltaY = posB.y - posA.y;
        
        return deltaX * deltaX + deltaY * deltaY;
    }
    
    /**
     * オブジェクトが指定した範囲内にあるかどうかを判定
     * @param {Object} object - 判定対象のオブジェクト (getCenterPosition()メソッドを持つ)
     * @param {number} centerX - 範囲の中心X座標
     * @param {number} centerY - 範囲の中心Y座標
     * @param {number} range - 範囲（半径）
     * @returns {boolean} 範囲内にあるかどうか
     */
    static isInRange(object, centerX, centerY, range) {
        if (!object) {
            return false;
        }
        
        const pos = object.getCenterPosition();
        if (!pos) {
            return false;
        }
        
        const deltaX = pos.x - centerX;
        const deltaY = pos.y - centerY;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        
        return distanceSquared <= range * range;
    }
    
    /**
     * 矩形が別の矩形に完全に含まれているかどうかを判定
     * @param {Object} innerObject - 内側のオブジェクト (getBounds()メソッドを持つ)
     * @param {Object} outerObject - 外側のオブジェクト (getBounds()メソッドを持つ)
     * @returns {boolean} 完全に含まれているかどうか
     */
    static isContainedIn(innerObject, outerObject) {
        if (!innerObject || !outerObject) {
            return false;
        }
        
        const innerBounds = innerObject.getBounds();
        const outerBounds = outerObject.getBounds();
        
        if (!innerBounds || !outerBounds) {
            return false;
        }
        
        return (
            innerBounds.x >= outerBounds.x &&
            innerBounds.y >= outerBounds.y &&
            innerBounds.x + innerBounds.width <= outerBounds.x + outerBounds.width &&
            innerBounds.y + innerBounds.height <= outerBounds.y + outerBounds.height
        );
    }
    
    /**
     * 線分と矩形の当たり判定
     * @param {number} x1 - 線分の開始点X座標
     * @param {number} y1 - 線分の開始点Y座標
     * @param {number} x2 - 線分の終了点X座標
     * @param {number} y2 - 線分の終了点Y座標
     * @param {Object} object - 矩形オブジェクト (getBounds()メソッドを持つ)
     * @returns {boolean} 交差しているかどうか
     */
    static checkLineRect(x1, y1, x2, y2, object) {
        if (!object) {
            return false;
        }
        
        const bounds = object.getBounds();
        if (!bounds) {
            return false;
        }
        
        const rectX = bounds.x;
        const rectY = bounds.y;
        const rectW = bounds.width;
        const rectH = bounds.height;
        
        // 線分の両端が矩形内にある場合
        if (this.checkPointInRect(x1, y1, object) || this.checkPointInRect(x2, y2, object)) {
            return true;
        }
        
        // 線分と矩形の各辺との交差判定
        return (
            this.checkLineIntersection(x1, y1, x2, y2, rectX, rectY, rectX + rectW, rectY) || // 上辺
            this.checkLineIntersection(x1, y1, x2, y2, rectX + rectW, rectY, rectX + rectW, rectY + rectH) || // 右辺
            this.checkLineIntersection(x1, y1, x2, y2, rectX + rectW, rectY + rectH, rectX, rectY + rectH) || // 下辺
            this.checkLineIntersection(x1, y1, x2, y2, rectX, rectY + rectH, rectX, rectY) // 左辺
        );
    }
    
    /**
     * 2つの線分の交差判定
     * @param {number} x1 - 線分1の開始点X座標
     * @param {number} y1 - 線分1の開始点Y座標
     * @param {number} x2 - 線分1の終了点X座標
     * @param {number} y2 - 線分1の終了点Y座標
     * @param {number} x3 - 線分2の開始点X座標
     * @param {number} y3 - 線分2の開始点Y座標
     * @param {number} x4 - 線分2の終了点X座標
     * @param {number} y4 - 線分2の終了点Y座標
     * @returns {boolean} 交差しているかどうか
     */
    static checkLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        
        if (Math.abs(denominator) < 1e-10) {
            return false; // 平行線
        }
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    
    /**
     * デバッグ用：当たり判定の可視化
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} objectA - オブジェクトA
     * @param {Object} objectB - オブジェクトB
     * @param {boolean} isColliding - 衝突しているかどうか
     */
    static renderCollisionDebug(context, objectA, objectB, isColliding) {
        if (!context || !objectA || !objectB) {
            return;
        }
        
        const boundsA = objectA.getBounds();
        const boundsB = objectB.getBounds();
        
        if (!boundsA || !boundsB) {
            return;
        }
        
        // 衝突している場合は赤、していない場合は緑で描画
        context.strokeStyle = isColliding ? '#e74c3c' : '#2ecc71';
        context.lineWidth = 2;
        context.setLineDash([3, 3]);
        
        // オブジェクトAの境界
        context.strokeRect(boundsA.x, boundsA.y, boundsA.width, boundsA.height);
        
        // オブジェクトBの境界
        context.strokeRect(boundsB.x, boundsB.y, boundsB.width, boundsB.height);
        
        // 中心点を結ぶ線
        const centerA = objectA.getCenterPosition();
        const centerB = objectB.getCenterPosition();
        
        if (centerA && centerB) {
            context.beginPath();
            context.moveTo(centerA.x, centerA.y);
            context.lineTo(centerB.x, centerB.y);
            context.stroke();
        }
        
        context.setLineDash([]);
    }
}