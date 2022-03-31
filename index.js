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
}

async function init() {
  /** @type {HTMLCanvasElement} */
  const canvasEl = document.getElementById("canvas");
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;

  const cc = new CanvasCartesian(canvasEl);
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
  // const delay = 100;
  const delay = 50;

  for (let i = step; i < cc.coords.maxX || i < cc.coords.maxY; i += step) {
    await sleep(delay);
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
}

init();
