function makeGround(w, h, topTile, fillTile, gaps, waterTile) {
  const tiles = new Uint16Array(w * h);
  for (let x = 0; x < w; x++) {
    const isGap = gaps && gaps.some(g => x >= g[0] && x <= g[1]);
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      if (y >= h - 1) {
        tiles[i] = isGap && waterTile ? waterTile : fillTile;
      }
      if (y === h - 2 && !isGap) tiles[i] = topTile;
    }
  }
  return tiles;
}

function addFoliage(tiles, w, h, surfaceRow, chance) {
  const decos = [97, 98, 30, 32, 129, 128];
  for (let x = 0; x < w; x++) {
    const i = (surfaceRow - 1) * w + x;
    const below = surfaceRow * w + x;
    if (x > 0 && x < w - 1 && tiles[below] > 0 && tiles[i] === 0) {
      if (Math.random() < (chance || 0.2)) {
        tiles[i] = decos[Math.floor(Math.random() * decos.length)];
      }
    }
  }
}

function addClouds(bg, w, rows, tiles) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < w; x++) {
      if (Math.random() < 0.06) {
        bg[y * w + x] = tiles[Math.floor(Math.random() * tiles.length)];
        if (Math.random() < 0.5 && x + 1 < w) bg[y * w + x + 1] = tiles[Math.floor(Math.random() * tiles.length)];
      }
    }
  }
}

function createLevel1() {
  const w = 360, h = 12;
  const sr = 10;
  const tiles = new Uint16Array(w * h);
  const gaps = [];

  function gnd(y, x1, x2) {
    for (let x = x1; x <= x2; x++) tiles[y * w + x] = 1;
  }
  function wat(x1, x2) {
    gaps.push([x1, x2]);
    for (let x = x1; x <= x2; x++) { tiles[sr * w + x] = 33; tiles[(sr + 1) * w + x] = 53; }
    if (x1 > 0) tiles[sr * w + x1 - 1] = 24;
    if (x2 < w - 1) tiles[sr * w + x2 + 1] = 25;
  }
  function plat(y, x1, w2) {
    for (let x = x1; x < x1 + w2; x++) tiles[y * w + x] = 1;
  }

  // ========== УЧАСТОК 1: СТАРТ ========== (x=0–24) высота sr
  gnd(sr, 0, 24);
  for (let x = 5; x <= 8; x++) tiles[(sr + 1) * w + x] = 104;
  plat(7, 6, 3);   // стартовая платформа с монетками
  plat(8, 14, 3);

  // ========== ВОДА 1 ========== (x=25–27)
  wat(25, 27);

  // ========== УЧАСТОК 2: ПОДЪЁМ НА +3 ТАЙЛА ========== (x=28–55)
  // основание на sr, ступеньки вверх
  gnd(sr, 28, 55);
  gnd(9, 32, 55);      // +1 тайл
  gnd(8, 36, 55);      // +2 тайла
  gnd(7, 40, 55);      // +3 тайла — верхняя площадка
  // грибки у подножия стены (x=32, y=sr) — чтобы запрыгнуть на +1
  tiles[sr * w + 32] = 107; tiles[sr * w + 33] = 108;
  // лёд на верхней площадке
  for (let x = 42; x <= 50; x++) tiles[7 * w + x] = 34;
  // ящик НАВЕРХУ на платформе y=4 (над верхней площадкой)
  plat(4, 44, 2);
  tiles[4 * w + 44] = 26;
  // враг на верхней площадке

  // ========== ВОДА 2 ========== (x=56–58)
  wat(56, 58);

  // ========== УЧАСТОК 3: СПУСК + РУШАЩАЯСЯ ЗЕМЛЯ ========== (x=59–90)
  gnd(sr, 59, 90);
  gnd(9, 62, 80);
  gnd(8, 65, 80);
  gnd(7, 68, 80);      // ещё одна возвышенность +2 тайла
  // рушащаяся земля на возвышенности
  for (let x = 70; x <= 78; x++) tiles[7 * w + x] = 6 + ((x - 70) % 3);
  // страховочная платформа ПОД рушащейся землёй
  plat(9, 66, 16);

  // ========== ВОДА 3 ========== (x=91–93)
  wat(91, 93);

  // ========== УЧАСТОК 4: ГРИБОЧНЫЙ ПРЫЖОК + ЯЩИК ========== (x=94–125)
  gnd(sr, 94, 125);
  // высокая стена (3 тайла)
  gnd(9, 98, 125);
  gnd(8, 102, 125);
  gnd(7, 106, 125);    // +3 тайла
  // грибки перед стеной (x=96-97) — чтобы запрыгнуть наверх
  tiles[sr * w + 96] = 107; tiles[sr * w + 97] = 108;
  // ящик НАВЕРХУ на платформе y=4 (над y=7)
  plat(4, 108, 2);
  tiles[4 * w + 108] = 26;
  // платформа для прыжка к ящику
  plat(6, 104, 3);

  // ========== ВОДА 4 ========== (x=126–128)
  wat(126, 128);

  // ========== УЧАСТОК 5: ВРАЖИЙ ПРОГОН ========== (x=129–175)
  gnd(sr, 129, 175);
  plat(8, 135, 3);
  plat(7, 145, 4);
  plat(6, 155, 3);
  plat(7, 165, 4);

  // ========== ВОДА 5 ========== (x=176–178)
  wat(176, 178);

  // ========== УЧАСТОК 6: ПОДЪЁМ +3 С ГРИБКАМИ ========== (x=179–215)
  gnd(sr, 179, 215);
  gnd(9, 183, 215);
  gnd(8, 187, 215);
  gnd(7, 191, 215);
  tiles[sr * w + 181] = 107; tiles[sr * w + 182] = 108;  // грибки у подножия
  // ящик наверху
  plat(4, 195, 2);
  tiles[4 * w + 195] = 26;

  // ========== ВОДА 6 ========== (x=216–218)
  wat(216, 218);

  // ========== УЧАСТОК 7: ПЛАТФОРМЫ + ВРАГИ ========== (x=219–300)
  gnd(sr, 219, 300);
  plat(8, 225, 3);
  plat(7, 240, 4);
  plat(6, 255, 3);
  plat(7, 270, 4);
  plat(8, 285, 3);

  // ========== ВОДА 7 ========== (x=301–303)
  wat(301, 303);

  // ========== УЧАСТОК 8: ФИНАЛ ========== (x=304–359)
  gnd(sr, 304, 359);
  plat(8, 310, 3);
  plat(7, 325, 4);
  plat(8, 340, 3);
  // флаг
  tiles[sr * w + 350] = 110;

  // ===== ДЕКОРАЦИИ НАД ЗЕМЛЁЙ =====
  const decos = [124, 125, 126, 127, 128, 129];
  for (let x = 0; x < w; x++) {
    const d = x > 0 && x < w - 1 && tiles[sr * w + x] > 0 && tiles[(sr - 1) * w + x] === 0;
    if (d && Math.random() < 0.25) tiles[(sr - 1) * w + x] = decos[Math.floor(Math.random() * decos.length)];
  }

  // ===== ОБЛАКА =====
  const bg = new Uint16Array(w * h);
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < w; x++)
      bg[y * w + x] = 153 + ((x + y) % 3);

  return {
    name: 'Зелёная планета',
    theme: 'base', w, h, tiles, bgTiles: bg,
    playerSpawn: { x: 4, y: sr - 2 },
    goal: { x: 350, y: sr - 1 },
    enemies: [
      { x: 16, y: sr - 1, dir: -1, patrolDist: 90, type: 'enemy1' },
      { x: 45, y: 6, dir: -1, patrolDist: 90, type: 'enemy2' },
      { x: 65, y: sr - 1, dir: 1, patrolDist: 90, type: 'enemy3' },
      { x: 75, y: 6, dir: -1, patrolDist: 90, type: 'enemy4' },
      { x: 110, y: 6, dir: 1, patrolDist: 108, type: 'enemy1' },
      { x: 140, y: sr - 1, dir: -1, patrolDist: 90, type: 'enemy5' },
      { x: 155, y: 5, dir: 1, patrolDist: 90, type: 'enemy6' },
      { x: 195, y: 6, dir: -1, patrolDist: 108, type: 'enemy2' },
      { x: 230, y: sr - 1, dir: 1, patrolDist: 90, type: 'enemy3' },
      { x: 260, y: 5, dir: -1, patrolDist: 90, type: 'enemy4' },
      { x: 290, y: sr - 1, dir: -1, patrolDist: 108, type: 'enemy1' },
      { x: 320, y: sr - 1, dir: 1, patrolDist: 90, type: 'enemy5' },
      { x: 345, y: 7, dir: -1, patrolDist: 90, type: 'enemy6' },
    ],
    items: [
      { x: 8, y: 6, coin: true }, { x: 9, y: 6, coin: true },
      { x: 16, y: 7, coin: true },
      { x: 34, y: 8, coin: true }, { x: 35, y: 8, coin: true },
      { x: 46, y: 3, coin: true },  // у ящика
      { x: 64, y: sr - 2, coin: true },
      { x: 72, y: 8, coin: true },
      { x: 82, y: sr - 2, coin: true },
      { x: 110, y: 5, coin: true },  // у ящика
      { x: 138, y: 7, coin: true },
      { x: 148, y: 6, coin: true },
      { x: 158, y: 5, coin: true },
      { x: 168, y: 6, coin: true },
      { x: 197, y: 3, coin: true },  // у ящика
      { x: 228, y: 7, coin: true },
      { x: 243, y: 6, coin: true },
      { x: 258, y: 5, coin: true },
      { x: 273, y: 6, coin: true },
      { x: 288, y: 7, coin: true },
      { x: 313, y: 7, coin: true },
      { x: 328, y: 6, coin: true },
      { x: 343, y: 7, coin: true },
    ]
  };
}
