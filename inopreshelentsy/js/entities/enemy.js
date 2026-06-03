class Enemy {
  constructor(config, themeKey) {
    this.x = config.x * TILE;
    this.y = config.y * TILE;
    this.w = 16;
    this.h = 18;
    const typeDef = ENEMY_TYPES[config.type] || ENEMY_TYPES.golem;
    this.vx = (config.dir || -1) * typeDef.speed;
    this.vy = 0;
    this.gravity = GRAVITY;
    this.maxFall = MAX_FALL;
    this.onGround = false;
    this.hitWall = false;
    this.alive = true;
    this.dead = false;
    this.deadTimer = 0;
    this.startX = this.x;
    this.startY = this.y;
    this.patrolDist = config.patrolDist || 48;
    this.themeKey = themeKey;
    this.type = config.type || 'golem';
    this.idleFrames = typeDef.idle || [2];
    this.runFrames = typeDef.run || [2, 3];
    this.animFrame = 0;
    this.animTimer = 0;
  }

  update(level) {
    if (this.dead) {
      this.deadTimer++;
      if (this.deadTimer > 30) this.alive = false;
      return;
    }

    const prevVx = this.vx;
    moveAndCollide(this, level);

    if (this.hitWall) {
      const dir = prevVx > 0 ? 1 : -1;
      const speed = (ENEMY_TYPES[this.type] || ENEMY_TYPES.golem).speed;
      const blockCol = dir > 0 ? Math.floor((this.x + this.w) / TILE) : Math.floor(this.x / TILE);
      const footRow = Math.floor((this.y + this.h) / TILE);
      const surface = tileAt(level, blockCol, footRow - 1);
      const headClear = tileAt(level, blockCol, footRow - 2);
      if (isSolid(surface, level) && !isSolid(headClear, level)) {
        this.y = (footRow - 1) * TILE - this.h;
        this.x += dir * 2;
        this.vx = dir * speed;
      } else {
        this.vx = -dir * speed;
      }
      this.hitWall = false;
    }

    if (this.x <= this.startX - this.patrolDist) this.vx = Math.abs(this.vx);
    if (this.x >= this.startX + this.patrolDist) this.vx = -Math.abs(this.vx);

    this.animTimer++;
    if (this.animTimer > 8) { this.animTimer = 0; this.animFrame++; }

    if (this.y > level.h * TILE + 32) this.alive = false;
  }

  draw(ctx, cam) {
    if (!this.alive) return;
    const dx = Math.round(this.x - cam.x);
    const dy = Math.round(this.y - cam.y);

    const frames = this.onGround ? this.runFrames : this.idleFrames;
    const idx = frames[this.animFrame % frames.length];

    if (this.dead) {
      const squash = Math.max(0, 1 - this.deadTimer * 0.04);
      ctx.save();
      ctx.translate(dx + 12, dy + this.h * (1 - squash));
      ctx.scale(1, squash);
      drawChar(ctx, this.themeKey, idx, -12, 0);
      ctx.restore();
      return;
    }

    if (this.vx > 0) drawChar(ctx, this.themeKey, idx, dx, dy);
    else drawCharFlipped(ctx, this.themeKey, idx, dx, dy);
  }
}
