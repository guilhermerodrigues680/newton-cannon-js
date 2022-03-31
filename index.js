/** @type {HTMLCanvasElement} */
const canvasEl = document.getElementById("canvas");
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const canvasCenter = {
  x: Math.round(canvasEl.width / 2),
  y: Math.round(canvasEl.height / 2),
  maxX: Math.round(canvasEl.width / 2),
  minX: -Math.round(canvasEl.width / 2),
  maxY: Math.round(canvasEl.height / 2),
  minY: -Math.round(canvasEl.height / 2),
};
console.debug(canvasCenter);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {number} x
 * @param {number} y
 * @returns
 */
function canvasCoordToCartesianCoordinateSystem(x, y) {
  return {
    // x: x < 0 ? canvasCenter.x + x : canvasCenter.x + x,
    x: canvasCenter.x + x,
    y: canvasCenter.y + y,
  };
}

function cctccs(x, y) {
  return canvasCoordToCartesianCoordinateSystem(x, y);
}

function cctccsX(x) {
  return canvasCoordToCartesianCoordinateSystem(x, 0).x;
}

function cctccsY(y) {
  return canvasCoordToCartesianCoordinateSystem(0, y).y;
}

async function init() {
  const ctx = canvasEl.getContext("2d");
  ctx.fillRect(cctccsX(0), cctccsY(0), 10, -10);

  // Eixo X
  ctx.beginPath();
  ctx.moveTo(cctccsX(canvasCenter.minX), cctccsY(0));
  ctx.lineTo(cctccsX(canvasCenter.maxX), cctccsY(0));
  ctx.stroke();

  // Eixo Y
  ctx.beginPath();
  ctx.moveTo(cctccsX(0), cctccsY(canvasCenter.minY));
  ctx.lineTo(cctccsX(0), cctccsY(canvasCenter.maxY));
  ctx.stroke();

  const step = 20;

  for (let i = step; i < canvasCenter.maxX; i += step) {
    await sleep(100);
    ctx.beginPath();
    ctx.moveTo(cctccsX(i), cctccsY(canvasCenter.minY));
    ctx.lineTo(cctccsX(i), cctccsY(canvasCenter.maxY));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cctccsX(-i), cctccsY(canvasCenter.minY));
    ctx.lineTo(cctccsX(-i), cctccsY(canvasCenter.maxY));
    ctx.stroke();
  }

  for (let i = step; i < canvasCenter.maxY; i += step) {
    await sleep(100);
    ctx.beginPath();
    ctx.moveTo(cctccsX(canvasCenter.minX), cctccsY(i));
    ctx.lineTo(cctccsX(canvasCenter.maxX), cctccsY(i));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cctccsX(canvasCenter.minX), cctccsY(-i));
    ctx.lineTo(cctccsX(canvasCenter.maxX), cctccsY(-i));
    ctx.stroke();
  }
}

init();
