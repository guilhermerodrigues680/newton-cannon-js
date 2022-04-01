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
          this._ctx.drawImage(img, this._cctccsX(x0), this._cctccsY(y0), x1, -y1);
        }
        resolve();
      };

      img.onerror = reject;
      img.src = imgSrc;
    });
  }

  drawCircle(x, y, radius) {
    this._ctx.beginPath();
    this._ctx.arc(this._cctccsX(x), this._cctccsY(y), radius, 0, Math.PI * 2, true);
    this._ctx.fill();
  }
}

/** @type {HTMLCanvasElement} */
const canvasEl = document.getElementById("canvas");
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const cc = new CanvasCartesian(canvasEl);
const animateConstrol = {
  playing: true,
};

const cannonball = {
  x: 0,
  y: 250,
  hSpeed: 2.3,
  vSpeed: 0,
  hAcceleration: 0,
  vAcceleration: 0,
};

function calcDistanceBetweenTwoPoints(x0, y0, x1, y1) {
  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
}

function calcAngBetweenTwoVectors(x0, y0, x1, y1) {
  return Math.acos(
    (x0 * x1 + y0 * y1) /
      (Math.sqrt(Math.pow(x0, 2) + Math.pow(y0, 2)) * Math.sqrt(Math.pow(x1, 2) + Math.pow(y1, 2)))
  );
}

async function renderLoop(timestamp) {
  if (!animateConstrol.playing) {
    return;
  }

  const CONSTANTE_GRAVITACIONAL = 6.74e-11;
  const m1 = 1;
  const m2 = 20000000000000;
  const dM1M2 = calcDistanceBetweenTwoPoints(cannonball.x, cannonball.y, 0, 0);
  const f = CONSTANTE_GRAVITACIONAL * ((m1 * m2) / Math.pow(dM1M2, 2));
  // f = m*a
  // a = f/m
  const a = f / m1;
  console.debug(f, a);

  // CALCS
  const d = calcDistanceBetweenTwoPoints(cannonball.x, cannonball.y, 0, 0);
  const dy = calcDistanceBetweenTwoPoints(cannonball.x, cannonball.y, cannonball.x, 0);
  const dx = calcDistanceBetweenTwoPoints(cannonball.x, 0, 0, 0);
  const o = Math.atan(dx / dy);

  const fx = f * Math.sin(o);
  const fy = f * Math.cos(o);

  console.debug("|d|", d);
  console.debug("|dy|", dy);
  console.debug("|dx|", dx);
  console.debug("|o|", o, o * (180 / Math.PI));
  console.debug("f", f, "fx", fx, "fy", fy);

  console.debug(
    "calcAngBetweenTwoVectors",
    calcAngBetweenTwoVectors(cannonball.x, cannonball.y, 1, 0),
    calcAngBetweenTwoVectors(cannonball.x, cannonball.y, 1, 0) * (180 / Math.PI)
  );

  ///

  console.debug(cannonball.x, cannonball.y);
  cc.drawCircle(cannonball.x, cannonball.y, 20);

  if (cannonball.x > 0 && cannonball.y > 0) {
    cannonball.hAcceleration = -fx;
    cannonball.vAcceleration = -fy;
  } else if (cannonball.x < 0 && cannonball.y > 0) {
    cannonball.hAcceleration = fx;
    cannonball.vAcceleration = -fy;
  } else if (cannonball.x < 0 && cannonball.y < 0) {
    cannonball.hAcceleration = fx;
    cannonball.vAcceleration = fy;
  } else if (cannonball.x > 0 && cannonball.y < 0) {
    cannonball.hAcceleration = -fx;
    cannonball.vAcceleration = fy;
  } else {
    // tudo zero
    console.debug("Tudo zero");
  }

  cannonball.hSpeed = cannonball.hSpeed + cannonball.hAcceleration;
  cannonball.vSpeed = cannonball.vSpeed + cannonball.vAcceleration;
  cannonball.x = cannonball.x + cannonball.hSpeed;
  cannonball.y = cannonball.y + cannonball.vSpeed;

  console.debug("speed", cannonball.hSpeed, cannonball.vSpeed);

  await sleep(100);
  window.requestAnimationFrame(renderLoop);
}

async function initialRender() {
  cc.fillRect(0, 0, 10, 10);

  // Eixo X
  cc.drawLine(cc.coords.minX, cc.coords.centerY, cc.coords.maxX, cc.coords.centerY);

  // Eixo Y
  cc.drawLine(cc.coords.centerX, cc.coords.minY, cc.coords.centerX, cc.coords.maxY);

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

const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");

btnPlay.addEventListener("click", () => {
  animateConstrol.playing = true;
  window.requestAnimationFrame(renderLoop);
});

btnPause.addEventListener("click", () => {
  animateConstrol.playing = false;
});

initialRender();
