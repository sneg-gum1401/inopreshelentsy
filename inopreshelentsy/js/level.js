class Level {
  constructor(data) {
    this.name = data.name || '';
    this.theme = data.theme || 'base';
    this.w = data.w || 100;
    this.h = data.h || 12;
    this.tiles = data.tiles || [];
    this.bgTiles = data.bgTiles || [];
    this.playerSpawn = data.playerSpawn || { x: 2, y: 9 };
    this.goal = data.goal || null;
    this.goalTile = data.goalTile || 0;
    this.enemies = [];
    this.items = [];
    this.player = null;
    this.bgColor = THEMES[this.theme].bgColor;
    this.parallaxTiles = data.parallaxTiles || [];

    if (data.enemies) {
      for (const e of data.enemies) {
        this.enemies.push(new Enemy(e, this.theme));
      }
    }
    if (data.items) {
      for (const it of data.items) {
        this.items.push(new Item(it, this.theme));
      }
    }

    this.movingPlatforms = [];
    if (data.movingPlatforms) {
      for (const mp of data.movingPlatforms) {
        this.movingPlatforms.push({
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

    this.complete = false;
    this.crumbleState = new Map();
    this.shroomAnim = new Map();
    this.flagState = 0;
    this.flagTimer = 0;
    this._oldTiles = new Uint16Array(this.tiles);
  }

  createPlayer() {
    this.player = new Player(
      this.playerSpawn.x * TILE,
      this.playerSpawn.y * TILE,
      this.theme
    );
    return this.player;
  }

  spawnHeart(x, y) {
    const item = new Item({ x: Math.floor(x / TILE), y: Math.floor(y / TILE), heart: true, tileIndex: 44 }, this.theme);
    item.justSpawned = 10;
    this.items.push(item);
  }

  update() {
    if (this.complete) return;

    this._updateLever();
    this._updateMovingPlatforms();
    this._carryEntities();

    this.player.update(this);
    for (const e of this.enemies) e.update(this);
    for (const it of this.items) it.update();

    this._updateCrumble();
    this._updateShroomAnim();
    this._updateFlag();

    const deathTiles = THEMES[this.theme].deathTiles;
    if (deathTiles && this.player.alive && this.player.vy >= 0) {
      const cx = Math.floor((this.player.x + this.player.w / 2) / TILE);
      const footY = Math.floor((this.player.y + this.player.h - 1) / TILE);
      const id = tileAt(this, cx, footY);
      if (id > 0 && deathTiles.includes(id)) {
        this.player.takeDamage(this);
        if (!this.player.alive) return;
      }
    }

    for (const e of this.enemies) {
      if (!e.alive || e.dead) continue;
      if (aabb(this.player, e)) {
        if (this.player.vy > 0 && this.player.y + this.player.h - e.y < 12) {
          e.dead = true;
          this.player.vy = -5;
        } else if (this.player.invincible <= 0) {
          this.player.takeDamage(this);
          if (!this.player.alive) return;
        }
      }
    }

    for (const it of this.items) {
      if (it.collected) continue;
      if (it.justSpawned > 0) { it.justSpawned--; continue; }
      if (aabb(this.player, it)) {
        it.collected = true;
        if (it.heart) {
          this.player.hp = Math.min(this.player.hp + 1, this.player.maxHp);
        } else {
          game.score += 100;
        }
      }
    }

    if (this.goal && aabb(this.player, {
      x: this.goal.x * TILE, y: this.goal.y * TILE,
      w: TILE, h: TILE
    })) {
      this.complete = true;
    }
  }

  _updateCrumble() {
    if (!this.player.alive || !this.player.onGround) return;
    const px = Math.floor((this.player.x + this.player.w / 2) / TILE);
    const py = Math.floor((this.player.y + this.player.h) / TILE);
    const key = px + '_' + py;
    const id = tileAt(this, px, py);
    if (isCrumbleTile(id)) {
      const timer = (this.crumbleState.get(key) || 0) + 1;
      this.crumbleState.set(key, timer);
      if (timer > CRUMBLE_DELAY) {
        this.tiles[py * this.w + px] = 0;
        this.crumbleState.delete(key);
      }
    }
  }

  _updateShroomAnim() {
    for (const [key, timer] of [...this.shroomAnim]) {
      if (timer <= 1) {
        const [fx, fy] = key.split('_').map(Number);
        this.tiles[fy * this.w + fx] = 107;
        this.shroomAnim.delete(key);
      } else {
        this.shroomAnim.set(key, timer - 1);
      }
    }
  }

  _updateLever() {
    if (!this.player || !this.player.alive) return;
    if (!input.actionPressed) return;

    // рычаг на движущейся платформе — детектим через _onPlatform
    for (const mp of this.movingPlatforms) {
      if (!this._onPlatform(this.player, mp)) continue;
      if (mp._leverState !== LEVER_OFF && mp._leverState !== LEVER_ON_LEFT && mp._leverState !== LEVER_ON_RIGHT) continue;
      const newState = mp._leverState === LEVER_OFF
        ? (this.player.facing === -1 ? LEVER_ON_LEFT : LEVER_ON_RIGHT)
        : LEVER_OFF;
      mp._leverState = newState;
      mp._targetState = newState; // для движения
      mp.active = true;
      return;
    }

    // рычаг на земле (в тайлмапе)
    const px = Math.floor((this.player.x + this.player.w / 2) / TILE);
    const py = Math.floor((this.player.y + this.player.h) / TILE);
    const footTile = tileAt(this, px, py);
    const onLever = footTile === LEVER_OFF || footTile === LEVER_ON_LEFT || footTile === LEVER_ON_RIGHT;
    if (!onLever) return;

    const footIdx = py * this.w + px;
    const newTile = footTile === LEVER_OFF
      ? (this.player.facing === -1 ? LEVER_ON_LEFT : LEVER_ON_RIGHT)
      : LEVER_OFF;
    this.tiles[footIdx] = newTile;
    for (const mp of this.movingPlatforms) {
      mp._targetState = newTile;
      mp.active = true;
    }
  }

  _updateMovingPlatforms() {
    for (const mp of this.movingPlatforms) {
      mp._prevX = mp.x;
      mp._prevY = mp.y;
      if (!mp.active) { mp._dx = 0; mp._dy = 0; continue; }
      const totalDist = Math.abs(mp.rangeX * TILE);
      if (totalDist === 0) { mp._dx = 0; mp._dy = 0; mp.active = false; continue; }

      let targetPhase;
      if (mp._targetState === LEVER_ON_LEFT) targetPhase = -1;
      else if (mp._targetState === LEVER_OFF) targetPhase = 0;
      else targetPhase = 1;

      if (mp.phase < targetPhase) {
        mp.phase = Math.min(mp.phase + mp.speed / totalDist, targetPhase);
      } else if (mp.phase > targetPhase) {
        mp.phase = Math.max(mp.phase - mp.speed / totalDist, targetPhase);
      }
      mp.x = mp.startX + mp.phase * Math.abs(mp.rangeX) * TILE;
      mp._dx = mp.x - mp._prevX;
      mp._dy = mp.y - mp._prevY;

      if (mp.phase === targetPhase) {
        mp.active = false;
      }
    }
  }

  _carryEntities() {
    for (const mp of this.movingPlatforms) {
      if (mp._dx === 0 && mp._dy === 0) continue;
      if (this._onPlatform(this.player, mp)) {
        this.player.x += mp._dx;
      }
      for (const e of this.enemies) {
        if (!e.alive || e.dead) continue;
        if (this._onPlatform(e, mp)) {
          e.x += mp._dx;
        }
      }
    }
  }

  _onPlatform(entity, mp) {
    const eBot = entity.y + entity.h;
    if (eBot < mp.y - 2 || eBot > mp.y + 4) return false;
    if (entity.x + entity.w <= mp.x + 1 || entity.x >= mp.x + mp.w - 1) return false;
    return true;
  }

  _updateFlag() {
    if (!this.goal || !this.player.alive) return;
    const gx = this.goal.x * TILE;
    const gy = this.goal.y * TILE;
    const dist = Math.abs(this.player.x - gx) + Math.abs(this.player.y - gy);
    if (dist < TILE * 5) {
      this.flagTimer++;
      if (this.flagTimer > 10 && this.flagState < 2) {
        this.flagState++;
        this.flagTimer = 0;
      }
    }
  }

  draw(ctx, cam) {
    const cw = Math.ceil(W / TILE) + 1;
    const ch = Math.ceil(H / TILE) + 1;
    const startCol = Math.floor(cam.x / TILE);
    const startRow = Math.floor(cam.y / TILE);
    const sheetKey = this.theme;

    for (let ry = 0; ry < ch; ry++) {
      for (let rx = 0; rx < cw; rx++) {
        const tx = startCol + rx;
        const ty = startRow + ry;
        if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) continue;
        const dx = tx * TILE - cam.x;
        const dy = ty * TILE - cam.y;

        const bgId = this.bgTiles[ty * this.w + tx];
        if (bgId > 0) drawTile(ctx, sheetKey, bgId, dx, dy);

        const tileId = this.tiles[ty * this.w + tx];

        if (tileId > 0) drawTile(ctx, sheetKey, tileId, dx, dy);
      }
    }

    for (const it of this.items) it.draw(ctx, cam);

    for (const mp of this.movingPlatforms) {
      drawTile(ctx, this.theme, MOVING_PLATFORM_TILE, mp.x - cam.x, mp.y - cam.y);
      if (LEVER_TILES.includes(mp._leverState)) {
        drawTile(ctx, this.theme, mp._leverState, mp.x - cam.x, mp.y - cam.y);
      }
    }

    for (const e of this.enemies) e.draw(ctx, cam);

    if (this.goal) {
      const gx = this.goal.x * TILE - cam.x;
      const gy = this.goal.y * TILE - cam.y;
      if (this.flagState > 0) {
        const flagTile = FLAG_ACTIVE[Math.min(this.flagState - 1, FLAG_ACTIVE.length - 1)];
        drawTile(ctx, sheetKey, flagTile, gx, gy);
      } else {
        drawTile(ctx, sheetKey, FLAG_INACTIVE, gx, gy);
      }
    }

    this.player.draw(ctx, cam);
  }

  reset() {
    if (this._oldTiles && this._oldTiles.length === this.tiles.length) {
      for (let i = 0; i < this.tiles.length; i++) this.tiles[i] = this._oldTiles[i];
    }
    this.player.reset();
    for (const e of this.enemies) {
      e.alive = true;
      e.dead = false;
      e.deadTimer = 0;
      e.x = e.startX;
      e.y = e.startY;
      e.vy = 0;
    }
    for (const it of this.items) it.collected = false;
    for (const mp of this.movingPlatforms) {
      mp.x = mp.startX; mp.y = mp.startY;
      mp._prevX = mp.startX; mp._prevY = mp.startY;
      mp._dx = 0; mp._dy = 0;
      mp.phase = 0; mp.active = false; mp._leverState = LEVER_OFF; mp._targetState = LEVER_OFF;
    }
    this.complete = false;
    this.crumbleState.clear();
    this.shroomAnim.clear();
    this.flagState = 0;
    this.flagTimer = 0;
  }
}
