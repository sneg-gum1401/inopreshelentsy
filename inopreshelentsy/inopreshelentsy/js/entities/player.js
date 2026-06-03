class Player {
  constructor(x, y, themeKey) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.w = 16;
    this.h = 18;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.gravity = GRAVITY;
    this.maxFall = MAX_FALL;
    this.facing = 1;
    this.state = 'idle';
    this.themeKey = themeKey;
    this.alive = true;
    this.hp = MAX_HP;
    this.maxHp = MAX_HP;
    this.invincible = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.waterTimer = 0;
    this._wasOnGround = false;
    this.hitBox = false;
  }

  getRenderState() {
    if (!this.alive) return 'dead';
    if (!this.onGround) return this.vy < 0 ? 'jump' : 'fall';
    if (Math.abs(this.vx) > 0.5) return 'run';
    return 'idle';
  }

  getTileIndex() {
    const skin = PLAYER_SKINS[this.themeKey] || PLAYER_SKINS.base;
    const anim = skin[this.state] || skin.idle;
    return anim[this.animFrame % anim.length];
  }

  update(level) {
    if (!this.alive) return;
    if (this.invincible > 0) this.invincible--;

    this.hitBox = false;

    const onIce = this.onGround && isIceTile(tileAt(level, Math.floor((this.x + this.w / 2) / TILE), Math.floor((this.y + this.h) / TILE)));
    const moveSpeed = onIce ? ICE_SPEED : MOVE_SPEED;
    const friction = onIce ? ICE_FRICTION : FRICTION;

    if (input.left) { this.vx = -moveSpeed; this.facing = -1; }
    else if (input.right) { this.vx = moveSpeed; this.facing = 1; }
    else this.vx *= friction;

    if (Math.abs(this.vx) < 0.1) this.vx = 0;

    if (input.jumpPressed && this.onGround) {
      this.vy = JUMP_VEL;
      this.onGround = false;
    }

    if (!input.jump && this.vy < -3) this.vy *= 0.85;

    const prevVy = this.vy;
    moveAndCollide(this, level);

    if (prevVy < 0 && this.vy === 0) {
      const hx = Math.floor((this.x + this.w / 2) / TILE);
      const hy = Math.floor(this.y / TILE);
      const headTile = tileAt(level, hx, hy - 1);
      if (headTile === BOX_TILE) {
        this.hitBox = true;
        level.tiles[(hy - 1) * level.w + hx] = 0;
        level.spawnHeart(hx * TILE + 2, (hy - 1) * TILE);
      }
    }

    this._wasOnGround = this.onGround;
    if (this.onGround && prevVy >= 0) {
      const fx = Math.floor((this.x + this.w / 2) / TILE);
      const fy = Math.floor((this.y + this.h) / TILE);
      const footTile = tileAt(level, fx, fy);
      if (isShroomTile(footTile)) {
        this.vy = MUSHROOM_BOUNCE;
        this.onGround = false;
        level.tiles[fy * level.w + fx] = 108;
        level.shroomAnim.set(fx + '_' + fy, 8);
      }
    }

    this.state = this.getRenderState();

    this.animTimer++;
    if (this.state === 'run') { if (this.animTimer > 5) { this.animTimer = 0; this.animFrame++; } }
    else if (this.state === 'idle') { if (this.animTimer > 20) { this.animTimer = 0; this.animFrame++; } }
    else { this.animFrame = 0; }

    if (this.y > level.h * TILE + TILE) {
      if (this.invincible <= 0) {
        this.hp = 0;
        this.alive = false;
      }
    }

    this._checkWater(level);
  }

  _checkWater(level) {
    const cx = Math.floor((this.x + this.w / 2) / TILE);
    const cy = Math.floor((this.y + this.h / 2) / TILE);
    const midTile = tileAt(level, cx, cy);
    if (isWaterTile(midTile)) {
      this.waterTimer++;
      if (this.waterTimer > DROWN_DELAY) {
        this.waterTimer = 0;
        this.takeDamage(level);
      }
    } else {
      this.waterTimer = 0;
    }
  }

  takeDamage(level) {
    if (this.invincible > 0) return;
    this.hp--;
    this.invincible = 60;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  draw(ctx, cam) {
    if (!this.alive) return;
    if (this.invincible > 0 && Math.floor(this.invincible / 3) % 2 === 0) return;

    const dx = Math.round(this.x - cam.x);
    const dy = Math.round(this.y - cam.y);
    const idx = this.getTileIndex();

    if (this.facing < 0) drawCharFlipped(ctx, this.themeKey, idx, dx, dy);
    else drawChar(ctx, this.themeKey, idx, dx, dy);
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
    this.invincible = 60;
    this.waterTimer = 0;
  }
}
