class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  follow(target, levelW) {
    const halfW = W / 2;
    const halfH = H / 2;
    this.x = target.x - halfW;
    this.y = target.y - halfH;

    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x + W > levelW * TILE) this.x = levelW * TILE - W;
    if (this.y + H > 12 * TILE) this.y = 12 * TILE - H;
  }
}
