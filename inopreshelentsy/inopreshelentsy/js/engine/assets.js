const imageCache = {};
const tileSheetCache = {};
const charSheetCache = {};
const parallaxSheetCache = {};

function loadImage(key, src) {
  return new Promise(resolve => {
    if (imageCache[key]) { resolve(imageCache[key]); return; }
    const img = new Image();
    img.onload = () => { imageCache[key] = img; resolve(img); };
    img.onerror = () => { console.error('Failed to load:', src); resolve(null); };
    img.src = src;
  });
}

async function loadTilesheets() {
  for (const [name, theme] of Object.entries(THEMES)) {
    if (name === 'base') {
      await loadBaseIndividualTiles(name, theme);
    } else {
      const img = await loadImage('tiles_' + name, theme.tileset);
      if (img) tileSheetCache[name] = img;
    }
    if (theme.charSheet) {
      const cimg = await loadImage('char_' + name, theme.charSheet);
      if (cimg) charSheetCache[name] = cimg;
    }
  }
  await loadParallaxTiles();
}

function loadBaseIndividualTiles(themeKey, theme) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = theme.cols * TILE;
    canvas.height = theme.rows * TILE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let loaded = 0;
    const total = theme.cols * theme.rows;
    function onLoad() {
      loaded++;
      if (loaded >= total) {
        tileSheetCache[themeKey] = canvas;
        resolve();
      }
    }

    for (let i = 0; i < total; i++) {
      const pad = String(i).padStart(4, '0');
      const img = new Image();
      img.onload = () => {
        const sx = (i % theme.cols) * TILE;
        const sy = Math.floor(i / theme.cols) * TILE;
        ctx.drawImage(img, sx, sy, TILE, TILE);
        onLoad();
      };
      img.onerror = onLoad;
      img.src = `assets/tiles/base/tile_${pad}.png`;
    }
  });
}

function loadParallaxTiles() {
  return new Promise(resolve => {
    const total = PARALLAX_COLS * PARALLAX_ROWS;
    const canvas = document.createElement('canvas');
    canvas.width = PARALLAX_COLS * TILE;
    canvas.height = PARALLAX_ROWS * TILE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let loaded = 0;
    function onLoad() {
      loaded++;
      if (loaded >= total) {
        parallaxSheetCache.parallax = canvas;
        resolve();
      }
    }

    for (let i = 0; i < total; i++) {
      const pad = String(i).padStart(4, '0');
      const img = new Image();
      img.onload = () => {
        const sx = (i % PARALLAX_COLS) * TILE;
        const sy = Math.floor(i / PARALLAX_COLS) * TILE;
        ctx.drawImage(img, sx, sy, TILE, TILE);
        onLoad();
      };
      img.onerror = onLoad;
      img.src = `assets/tiles/base/backgrounds/tile_${pad}.png`;
    }
  });
}

const TILE_PAD = 0;

function drawTile(ctx, sheetKey, tileIndex, dx, dy, theme) {
  const img = tileSheetCache[sheetKey];
  if (!img) return;
  const t = THEMES[sheetKey] || THEMES.base;
  const step = TILE + TILE_PAD;
  const sx = (tileIndex % t.cols) * step + TILE_PAD;
  const sy = Math.floor(tileIndex / t.cols) * step + TILE_PAD;
  ctx.drawImage(img, sx, sy, TILE, TILE, dx, dy, TILE, TILE);
}

function drawChar(ctx, sheetKey, tileIndex, dx, dy) {
  const img = charSheetCache[sheetKey];
  if (!img) return;
  const t = THEMES[sheetKey] || THEMES.base;
  const cols = t.charCols || 9;
  const step = CHAR_TILE + TILE_PAD;
  const sx = (tileIndex % cols) * step + TILE_PAD;
  const sy = Math.floor(tileIndex / cols) * step + TILE_PAD;
  ctx.drawImage(img, sx, sy, CHAR_TILE, CHAR_TILE, dx + CHAR_OFFSET_X, dy, CHAR_TILE, CHAR_TILE);
}

function drawCharFlipped(ctx, sheetKey, tileIndex, dx, dy) {
  const img = charSheetCache[sheetKey];
  if (!img) return;
  const t = THEMES[sheetKey] || THEMES.base;
  const cols = t.charCols || 9;
  const step = CHAR_TILE + TILE_PAD;
  const sx = (tileIndex % cols) * step + TILE_PAD;
  const sy = Math.floor(tileIndex / cols) * step + TILE_PAD;
  ctx.save();
  ctx.translate(Math.floor(dx) + CHAR_TILE / 2, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, sx, sy, CHAR_TILE, CHAR_TILE, -CHAR_TILE / 2 + CHAR_OFFSET_X, dy, CHAR_TILE, CHAR_TILE);
  ctx.restore();
}

function drawParallax(ctx) {
  const img = parallaxSheetCache.parallax;
  if (!img) return;
  const ti = 12;
  const sx = (ti % PARALLAX_COLS) * TILE;
  const sy = Math.floor(ti / PARALLAX_COLS) * TILE;
  ctx.drawImage(img, sx, sy, TILE, TILE, W - TILE, 0, TILE, TILE);
  const ti2 = 13;
  const sx2 = (ti2 % PARALLAX_COLS) * TILE;
  const sy2 = Math.floor(ti2 / PARALLAX_COLS) * TILE;
  ctx.drawImage(img, sx2, sy2, TILE, TILE, 0, 0, TILE, TILE);
}
