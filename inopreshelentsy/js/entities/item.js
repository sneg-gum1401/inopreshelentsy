class Item {
  constructor(config, themeKey) {
    this.x = config.x * TILE + 2;
    this.y = config.y * TILE + 2;
    this.w = 14;
    this.h = 14;
    this.type = config.type || 'coin';
    this.coin = config.coin || false;
    this.heart = config.heart || false;
    this.tileIndex = this.coin ? COIN_TILE : (this.heart ? (config.tileIndex || 44) : (config.tileIndex || 81));
    this.collected = false;
    this.justSpawned = 0;
    this.bob = Math.random() * Math.PI * 2;
    this.themeKey = themeKey;
  }

  update() {
    this.bob += 0.05;
  }

  draw(ctx, cam) {
    if (this.collected) return;
    const dx = Math.round(this.x - cam.x);
    const dy = Math.round(this.y - cam.y + Math.sin(this.bob) * 2);
    drawTile(ctx, this.themeKey, this.tileIndex, dx, dy, THEMES[this.themeKey]);
  }
}
