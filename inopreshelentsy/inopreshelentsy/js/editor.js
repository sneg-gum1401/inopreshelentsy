class Editor {
  constructor(canvas) {
    this.canvas = canvas;
    this.active = false;
    this.currentPage = 0;
    this.selectedIndex = 0;
    this.mx = -1;
    this.my = -1;
    this.mouseDown = false;
    this.rightDown = false;

    this.pages = [
      {
        name: 'Тайлы',
        items: [
          { kind: 'tile', tile: 1, name: 'Земля' },
          { kind: 'tile', tile: 33, name: 'Вода' },
          { kind: 'tile', tile: 34, name: 'Лёд' },
          { kind: 'tile', tile: 6, name: 'Рушится' },
          { kind: 'tile', tile: 107, name: 'Грибок' },
          { kind: 'tile', tile: 26, name: 'Ящик' },
          { kind: 'tile', tile: 110, name: 'Флаг' },
          { kind: 'tile', tile: 65, name: 'Рычаг' },
          { kind: 'movingPlatform', tile: 47, name: 'Платформа' },
          { kind: 'eraser', name: 'Ластик' },
        ],
      },
      {
        name: 'Враги',
        items: [
          { kind: 'enemy', type: 'enemy1', name: 'Враг 1' },
          { kind: 'enemy', type: 'enemy2', name: 'Враг 2' },
          { kind: 'enemy', type: 'enemy3', name: 'Враг 3' },
          { kind: 'enemy', type: 'enemy4', name: 'Враг 4' },
          { kind: 'enemy', type: 'enemy5', name: 'Враг 5' },
          { kind: 'enemy', type: 'enemy6', name: 'Враг 6' },
          { kind: 'enemy', type: 'golem', name: 'Голем' },
          { kind: 'enemy', type: 'slime', name: 'Слизень' },
          null,
          { kind: 'erase_enemy', name: 'Убрать врага' },
        ],
      },
      {
        name: 'Декор + Монеты',
        items: [
          { kind: 'coin', tile: 67, name: 'Монетка' },
          { kind: 'decor', tile: 124, name: 'Декор 1' },
          { kind: 'decor', tile: 125, name: 'Декор 2' },
          { kind: 'decor', tile: 126, name: 'Декор 3' },
          { kind: 'decor', tile: 127, name: 'Декор 4' },
          { kind: 'decor', tile: 128, name: 'Декор 5' },
          { kind: 'decor', tile: 129, name: 'Декор 6' },
          null,
          null,
          { kind: 'erase_item', name: 'Убрать предмет' },
        ],
      },
    ];

    this._setupMouse();
    this._setupKeyboard();
  }

  get _item() {
    const p = this.pages[this.currentPage];
    if (this.selectedIndex >= p.items.length) return null;
    return p.items[this.selectedIndex];
  }

  _setupMouse() {
    const c = this.canvas;
    const self = this;
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      this.mx = (e.clientX - r.left) * (c.width / r.width);
      this.my = (e.clientY - r.top) * (c.height / r.height);
      if (!this.active) return;
      if (this.mouseDown) this._paint();
      if (this.rightDown) this._erase();
    });
    c.addEventListener('mousedown', e => {
      const r = c.getBoundingClientRect();
      this.mx = (e.clientX - r.left) * (c.width / r.width);
      this.my = (e.clientY - r.top) * (c.height / r.height);
      if (!this.active) return;
      e.preventDefault();
      if (e.button === 0) {
        if (this._onPalette()) { this._handlePaletteClick(); return; }
        this.mouseDown = true;
        this._paint();
      } else if (e.button === 2) {
        if (this._onPalette()) { this._handlePaletteClick(); return; }
        this.rightDown = true;
        this._erase();
      }
    });
    c.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouseDown = false;
      if (e.button === 2) this.rightDown = false;
    });
    c.addEventListener('mouseleave', () => {
      this.mouseDown = false; this.rightDown = false;
      this.mx = -1; this.my = -1;
    });
    c.addEventListener('contextmenu', e => { if (this.active) e.preventDefault(); });
  }

  _setupKeyboard() {
    const self = this;
    document.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        if (!self.active && game.state === STATE.PLAYING) { e.preventDefault(); self._activate(); }
        else if (self.active) { e.preventDefault(); self._deactivate(); }
        return;
      }
      if (!self.active) return;
      const k = e.key;
      if (k >= '1' && k <= '9' && !e.altKey) { self.selectedIndex = parseInt(k) - 1; e.preventDefault(); }
      else if (k === '0' && !e.altKey) { self.selectedIndex = 9; e.preventDefault(); }
      else if (e.altKey && k >= '1' && k <= '3') { self.currentPage = parseInt(k) - 1; self.selectedIndex = 0; e.preventDefault(); }
      else if (k === '[' || k === 'х') { self._prevPage(); e.preventDefault(); }
      else if (k === ']' || k === 'ъ') { self._nextPage(); e.preventDefault(); }
      else if (k === 's' || k === 'ы') { self._save(); e.preventDefault(); }
      else if (k === 'l' || k === 'д') { self._load(); e.preventDefault(); }
      else if (k === 'r' || k === 'к') { self._resetLevel(); e.preventDefault(); }
    });
  }

  _prevPage() {
    this.currentPage = (this.currentPage - 1 + this.pages.length) % this.pages.length;
    this.selectedIndex = 0;
  }
  _nextPage() {
    this.currentPage = (this.currentPage + 1) % this.pages.length;
    this.selectedIndex = 0;
  }

  _activate() {
    this.active = true;
    game.editorActive = true;
    const i = input;
    i.left = false; i.right = false; i.jump = false; i.jumpPressed = false;
    i._jumpWas = false; i.action = false; i.actionPressed = false;
    i._actionWas = false; i.anyKey = false;
  }
  _deactivate() {
    this.active = false;
    game.editorActive = false;
    this._autoSave();
  }

  _onPalette() { return this.my >= H - 28; }

  _handlePaletteClick() {
    const n = this.pages[this.currentPage].items.length;
    const sz = 20;
    const tw = n * sz;
    const sx = (W - tw) / 2;
    for (let i = 0; i < n; i++) {
      const x = sx + i * sz;
      if (this.mx >= x && this.mx < x + sz) { this.selectedIndex = i; return; }
    }
  }

  _tilePos() {
    const lv = game.level;
    if (!lv) return null;
    const tx = Math.floor((this.mx + cam.x) / TILE);
    const ty = Math.floor((this.my + cam.y) / TILE);
    if (tx < 0 || tx >= lv.w || ty < 0 || ty >= lv.h) return null;
    return { x: tx, y: ty };
  }

  _paint() {
    if (this._onPalette()) { this._handlePaletteClick(); return; }
    const p = this._tilePos();
    if (!p) return;
    const item = this._item;
    if (!item) return;
    switch (item.kind) {
      case 'tile': case 'decor': this._placeTile(p.x, p.y, item.tile); break;
      case 'eraser': this._eraseTileAt(p.x, p.y); break;
      case 'enemy': this._placeEnemy(p.x, p.y, item.type); break;
      case 'erase_enemy': this._removeEntity(p.x, p.y, 'enemy'); break;
      case 'coin': this._placeCoin(p.x, p.y); break;
      case 'erase_item': this._removeEntity(p.x, p.y, 'item'); break;
      case 'movingPlatform': this._placeMovingPlatform(p.x, p.y); break;
    }
  }

  _erase() {
    if (this._onPalette()) { this._handlePaletteClick(); return; }
    const p = this._tilePos();
    if (!p) return;
    if (this._removeEntity(p.x, p.y, 'any')) return;
    this._eraseTileAt(p.x, p.y);
  }

  _placeTile(tx, ty, tile) {
    const lv = game.level;
    const i = ty * lv.w + tx;
    lv.tiles[i] = tile;
    lv._oldTiles[i] = tile;
    if (tile === 33 && ty === 10) {
      const j = (ty + 1) * lv.w + tx;
      if (ty + 1 < lv.h) { lv.tiles[j] = 53; lv._oldTiles[j] = 53; }
    }
    if (tile === 24 || tile === 25) {
      const wl = tx > 0 && (lv.tiles[ty * lv.w + tx - 1] === 33 || lv.tiles[ty * lv.w + tx - 1] === 53);
      const wr = tx < lv.w - 1 && (lv.tiles[ty * lv.w + tx + 1] === 33 || lv.tiles[ty * lv.w + tx + 1] === 53);
      lv.tiles[i] = wl && !wr ? 25 : 24;
      lv._oldTiles[i] = lv.tiles[i];
    }
  }

  _eraseTileAt(tx, ty) {
    const lv = game.level;
    const i = ty * lv.w + tx;
    lv.tiles[i] = 0;
    lv._oldTiles[i] = 0;
    if (ty + 1 < lv.h) {
      const j = (ty + 1) * lv.w + tx;
      if (lv.tiles[j] === 53) { lv.tiles[j] = 0; lv._oldTiles[j] = 0; }
    }
  }

  _placeEnemy(tx, ty, type) {
    const lv = game.level;
    for (const e of lv.enemies) {
      if (Math.floor(e.startX / TILE) === tx && Math.floor(e.startY / TILE) === ty) return;
    }
    lv.enemies.push(new Enemy({ x: tx, y: ty, dir: -1, patrolDist: 4, type }, lv.theme));
  }

  _placeCoin(tx, ty) {
    const lv = game.level;
    for (const it of lv.items) {
      if (Math.floor(it.x / TILE) === tx && Math.floor(it.y / TILE) === ty) return;
    }
    const item = new Item({ x: tx, y: ty, coin: true }, lv.theme);
    item.justSpawned = 10;
    lv.items.push(item);
  }

  _placeMovingPlatform(tx, ty) {
    const lv = game.level;
    for (const mp of lv.movingPlatforms) {
      if (Math.floor(mp.x / TILE) === tx && Math.floor(mp.y / TILE) === ty) return;
    }
    lv.movingPlatforms.push({
      x: tx * TILE, y: ty * TILE, w: TILE, h: TILE,
      startX: tx * TILE, startY: ty * TILE,
      rangeX: 4, rangeY: 0,
      speed: 1, phase: 0, active: false, _leverState: LEVER_OFF, _targetState: LEVER_OFF,
      _dx: 0, _dy: 0, _prevX: tx * TILE, _prevY: ty * TILE,
    });
  }

  _removeEntity(tx, ty, kind) {
    const lv = game.level;
    if (kind === 'movingPlatform' || kind === 'any') {
      for (let i = lv.movingPlatforms.length - 1; i >= 0; i--) {
        const mp = lv.movingPlatforms[i];
        if (Math.floor(mp.startX / TILE) === tx && Math.floor(mp.startY / TILE) === ty) {
          lv.movingPlatforms.splice(i, 1);
          return true;
        }
      }
    }
    if (kind === 'enemy' || kind === 'any') {
      for (let i = lv.enemies.length - 1; i >= 0; i--) {
        const e = lv.enemies[i];
        if (Math.floor(e.startX / TILE) === tx && Math.floor(e.startY / TILE) === ty) {
          lv.enemies.splice(i, 1);
          return true;
        }
      }
    }
    if (kind === 'item' || kind === 'any') {
      for (let i = lv.items.length - 1; i >= 0; i--) {
        const it = lv.items[i];
        if (Math.floor(it.x / TILE) === tx && Math.floor(it.y / TILE) === ty) {
          lv.items.splice(i, 1);
          return true;
        }
      }
    }
    return false;
  }

  _serialize() {
    const lv = game.level;
    if (!lv) return null;
    return {
      name: lv.name, theme: lv.theme, w: lv.w, h: lv.h,
      tiles: Array.from(lv.tiles), bgTiles: Array.from(lv.bgTiles),
      playerSpawn: lv.playerSpawn, goal: lv.goal,
      enemies: lv.enemies.map(e => ({
        x: Math.floor(e.startX / TILE), y: Math.floor(e.startY / TILE),
        dir: e.dir, patrolDist: e.patrolDist, type: e.type,
      })),
      items: lv.items.map(it => {
        const o = { x: Math.floor(it.x / TILE), y: Math.floor(it.y / TILE) };
        if (it.coin) o.coin = true;
        if (it.heart) { o.heart = true; o.tileIndex = 44; }
        return o;
      }),
      movingPlatforms: lv.movingPlatforms.map(mp => ({
        x: Math.floor(mp.x / TILE), y: Math.floor(mp.y / TILE),
        rangeX: mp.rangeX, rangeY: mp.rangeY, speed: mp.speed,
      })),
    };
  }

  _autoSave() {
    const data = this._serialize();
    if (!data) return;
    try { localStorage.setItem('editor_level_0', JSON.stringify(data)); }
    catch (e) { /* localStorage full or unavailable */ }
  }

  _resetLevel() {
    if (!confirm('Сбросить уровень 1 к оригиналу? Все изменения будут потеряны.')) return;
    try { localStorage.removeItem('editor_level_0'); } catch (e) {}
    location.reload();
  }

  _save() {
    const data = this._serialize();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'level1.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  _load() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    const self = this;
    inp.onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try { self._apply(JSON.parse(r.result)); }
        catch (err) { console.error('Load error:', err); }
      };
      r.readAsText(f);
    };
    inp.click();
  }

  _apply(data) {
    const lv = game.level;
    if (!lv) return;
    if (data.tiles) for (let i = 0; i < data.tiles.length && i < lv.tiles.length; i++) {
      lv.tiles[i] = data.tiles[i];
      lv._oldTiles[i] = data.tiles[i];
    }
    if (data.bgTiles) for (let i = 0; i < data.bgTiles.length && i < lv.bgTiles.length; i++) {
      lv.bgTiles[i] = data.bgTiles[i];
    }
    if (data.w) lv.w = data.w;
    if (data.h) lv.h = data.h;
    if (data.theme) lv.theme = data.theme;
    if (data.name) lv.name = data.name;
    if (data.playerSpawn) lv.playerSpawn = data.playerSpawn;
    if (data.goal) lv.goal = data.goal;
    if (data.enemies) {
      lv.enemies = [];
      for (const e of data.enemies) lv.enemies.push(new Enemy(e, lv.theme));
    }
    if (data.items) {
      lv.items = [];
      for (const it of data.items) lv.items.push(new Item(it, lv.theme));
    }
    if (data.movingPlatforms) {
      lv.movingPlatforms = [];
      for (const mp of data.movingPlatforms) {
        lv.movingPlatforms.push({
          x: mp.x * TILE, y: mp.y * TILE,
          w: TILE, h: TILE,
          startX: mp.x * TILE, startY: mp.y * TILE,
          rangeX: mp.rangeX || 0, rangeY: mp.rangeY || 0,
          speed: mp.speed || 1,
          phase: 0, active: false, _leverState: LEVER_OFF, _targetState: LEVER_OFF,
          _dx: 0, _dy: 0, _prevX: mp.x * TILE, _prevY: mp.y * TILE,
        });
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;
    const lv = game.level;
    if (!lv) return;

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, W, H);

    const sc = Math.floor(cam.x / TILE);
    const sr = Math.floor(cam.y / TILE);
    const ec = sc + Math.ceil(W / TILE) + 1;
    const er = sr + Math.ceil(H / TILE) + 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let tx = sc; tx <= ec; tx++) {
      ctx.beginPath(); ctx.moveTo(tx * TILE - cam.x, 0);
      ctx.lineTo(tx * TILE - cam.x, H); ctx.stroke();
    }
    for (let ty = sr; ty <= er; ty++) {
      ctx.beginPath(); ctx.moveTo(0, ty * TILE - cam.y);
      ctx.lineTo(W, ty * TILE - cam.y); ctx.stroke();
    }

    if (this.mx >= 0 && this.my >= 0 && !this._onPalette()) {
      const p = this._tilePos();
      if (p) {
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 2;
        ctx.strokeRect(p.x * TILE - cam.x + 1, p.y * TILE - cam.y + 1, TILE - 2, TILE - 2);
      }
    }

    this._drawPalette(ctx, lv);

    const item = this._item;
    const keyLabel = this.selectedIndex === 9 ? 0 : this.selectedIndex + 1;
    const page = this.pages[this.currentPage];
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText((item ? item.name + ' [' + keyLabel + ']' : '---') + ' | ' + page.name + ' []', W - 6, 13);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TAB-выйти | Alt+1/2/3-страницы | ЛКМ-поставить | ПКМ-стереть | S-файл | L-файл | R-сброс', 6, H - 34);
  }

  _drawPalette(ctx, lv) {
    const page = this.pages[this.currentPage];
    const n = page.items.length;
    const sz = 20;
    const tw = n * sz;
    const sx = (W - tw) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, H - 28, W, 28);

    for (let i = 0; i < n; i++) {
      const x = sx + i * sz;
      const y = H - 27;
      const item = page.items[i];

      if (item) {
        switch (item.kind) {
          case 'tile': case 'decor': case 'coin': case 'movingPlatform':
            drawTile(ctx, lv.theme, item.tile, x + 1, y + 1);
            break;
          case 'enemy':
            this._drawEnemyIcon(ctx, lv.theme, item.type, x + 1, y + 1, sz - 2);
            break;
          case 'eraser': case 'erase_enemy': case 'erase_item':
            ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + 16, y + 16);
            ctx.beginPath(); ctx.moveTo(x + 16, y + 4); ctx.lineTo(x + 4, y + 16);
            ctx.stroke();
            break;
        }
      }

      if (i === this.selectedIndex) {
        ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2;
        ctx.strokeRect(x, y, sz, sz);
      } else {
        ctx.strokeStyle = item && item.kind !== 'eraser' && item.kind !== 'erase_enemy' && item.kind !== 'erase_item' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, sz, sz);
      }
    }
  }

  _drawEnemyIcon(ctx, theme, type, x, y, size) {
    const info = ENEMY_TYPES[type];
    if (!info) { ctx.fillStyle = '#ff6b6b'; ctx.fillRect(x + 2, y + 2, size - 4, size - 4); return; }
    const charIndex = info.idle[0];
    const img = charSheetCache[theme];
    if (!img) return;
    const t = THEMES[theme] || THEMES.base;
    const cols = t.charCols || 9;
    const step = CHAR_TILE;
    const sx = (charIndex % cols) * step;
    const sy = Math.floor(charIndex / cols) * step;
    const s = size / CHAR_TILE;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.drawImage(img, sx, sy, CHAR_TILE, CHAR_TILE, 0, 0, CHAR_TILE, CHAR_TILE);
    ctx.restore();
  }
}
