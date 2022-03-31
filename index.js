const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CanvasCartesian {
  _canvas;
  _ctx;
  _canvasCenter;

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._ctx.font = "10px monospace";
    this._canvasCenter = {
      x: Math.round(this._canvas.width / 2),
      y: Math.round(this._canvas.height / 2),
    };
    console.debug(this);
  }

  get coords() {
    return {
      centerX: 0,
      centerY: 0,
      maxX: this._canvasCenter.x,
      minX: -this._canvasCenter.x,
      maxY: this._canvasCenter.y,
      minY: -this._canvasCenter.y,
    };
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns
   */
  _canvasCoordToCartesianCoordinateSystem(x, y) {
    return {
      x: this._canvasCenter.x + x,
      y: this._canvasCenter.y - y,
    };
  }

  _cctccs(x, y) {
    return this._canvasCoordToCartesianCoordinateSystem(x, y);
  }

  _cctccsX(x) {
    return this._canvasCoordToCartesianCoordinateSystem(x, 0).x;
  }

  _cctccsY(y) {
    return this._canvasCoordToCartesianCoordinateSystem(0, y).y;
  }

  fillRect(x, y, w, h) {
    this._ctx.fillRect(this._cctccsX(x), this._cctccsY(y), w, -h);
  }

  drawLine(x0, y0, x1, y1) {
    this._ctx.beginPath();
    this._ctx.moveTo(this._cctccsX(x0), this._cctccsY(y0));
    this._ctx.lineTo(this._cctccsX(x1), this._cctccsY(y1));
    this._ctx.stroke();
  }

  fillText(txt, x, y) {
    this._ctx.fillText(txt, this._cctccsX(x), this._cctccsY(y));
  }

  async useImage(imgSrc, x0, y0, x1 = null, y1 = null) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (x1 == null && y1 == null) {
          this._ctx.drawImage(img, this._cctccsX(x0), this._cctccsY(y0));
        } else {
          this._ctx.drawImage(
            img,
            this._cctccsX(x0),
            this._cctccsY(y0),
            x1,
            -y1
          );
        }
        resolve();
      };

      img.onerror = reject;
      img.src = imgSrc;
    });
  }

  drawCircle(x, y, radius) {
    this._ctx.beginPath();
    this._ctx.arc(
      this._cctccsX(x),
      this._cctccsY(y),
      radius,
      0,
      Math.PI * 2,
      true
    );
    this._ctx.fill();
  }
}

/** @type {HTMLCanvasElement} */
const canvasEl = document.getElementById("canvas");
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const cc = new CanvasCartesian(canvasEl);

const cannonball = {
  x: 0,
  y: 220,
  hSpeed: 1,
  vSpeed: -1,
  hAcceleration: 0.01,
  vAcceleration: 0.1,
};

async function renderLoop(timestamp) {
  console.debug(cannonball.x, cannonball.y);
  cc.drawCircle(cannonball.x, cannonball.y, 20);

  cannonball.hSpeed =
    cannonball.hSpeed + cannonball.hSpeed * cannonball.hAcceleration;
  cannonball.vSpeed =
    cannonball.vSpeed + cannonball.vSpeed * cannonball.vAcceleration;
  cannonball.x = cannonball.x + cannonball.hSpeed;
  cannonball.y = cannonball.y + cannonball.vSpeed;

  await sleep(100);
  window.requestAnimationFrame(renderLoop);
}

async function initialRender() {
  cc.fillRect(0, 0, 10, 10);

  // Eixo X
  cc.drawLine(
    cc.coords.minX,
    cc.coords.centerY,
    cc.coords.maxX,
    cc.coords.centerY
  );

  // Eixo Y
  cc.drawLine(
    cc.coords.centerX,
    cc.coords.minY,
    cc.coords.centerX,
    cc.coords.maxY
  );

  const step = 20;

  for (let i = step; i < cc.coords.maxX || i < cc.coords.maxY; i += step) {
    if (i < cc.coords.maxX) {
      cc.drawLine(i, cc.coords.minY, i, cc.coords.maxY);
      cc.fillText(i, i, cc.coords.centerY);
      cc.drawLine(-i, cc.coords.minY, -i, cc.coords.maxY);
      cc.fillText(-i, -i, cc.coords.centerY);
    }

    if (i < cc.coords.maxY) {
      cc.drawLine(cc.coords.minX, i, cc.coords.maxX, i);
      cc.fillText(i, cc.coords.centerX, i);
      cc.drawLine(cc.coords.minX, -i, cc.coords.maxX, -i);
      cc.fillText(-i, cc.coords.centerX, -i);
    }
  }

  await cc.useImage("assets/earth.png", -200, -200, 400, 400);
  window.requestAnimationFrame(renderLoop);
}

initialRender();
