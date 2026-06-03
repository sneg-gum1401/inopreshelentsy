function tileAt(level, tx, ty) {
  if (tx < 0 || tx >= level.w || ty < 0 || ty >= level.h) return -1;
  return level.tiles[ty * level.w + tx];
}

function isSolid(id, level) {
  if (id <= 0) return false;
  if (DECOR_TILES.includes(id)) return false;
  if (WATER_TILES.includes(id)) return false;
  if (level && level.theme) {
    const dt = THEMES[level.theme].deathTiles;
    if (dt && dt.includes(id)) return false;
  }
  return true;
}

function isWaterTile(id) {
  return WATER_TILES.includes(id);
}

function isIceTile(id) {
  return ICE_TILES.includes(id);
}

function isShroomTile(id) {
  return SHROOM_TILES.includes(id);
}

function isCrumbleTile(id) {
  return CRUMBLE_TILES.includes(id);
}

function moveAndCollide(entity, level) {
  const g = entity.gravity || 0;
  const mf = entity.maxFall || MAX_FALL;

  entity.x += entity.vx;

  const x1 = Math.floor(entity.x / TILE);
  const x2 = Math.floor((entity.x + entity.w - 1) / TILE);
  const y1 = Math.floor(entity.y / TILE);
  const y2 = Math.floor((entity.y + entity.h - 1) / TILE);

  for (let ty = y1; ty <= y2; ty++) {
    for (let tx = x1; tx <= x2; tx++) {
      if (!isSolid(tileAt(level, tx, ty), level)) continue;
      if (entity.vx > 0) {
        entity.x = tx * TILE - entity.w;
        entity.vx = 0;
        entity.hitWall = true;
      } else if (entity.vx < 0) {
        entity.x = (tx + 1) * TILE;
        entity.vx = 0;
        entity.hitWall = true;
      }
    }
  }

  if (entity.vx !== 0 && level.movingPlatforms) {
    for (const mp of level.movingPlatforms) {
      if (aabb(entity, mp)) {
        if (entity.vx > 0) { entity.x = mp.x - entity.w; entity.vx = 0; entity.hitWall = true; }
        else if (entity.vx < 0) { entity.x = mp.x + mp.w; entity.vx = 0; entity.hitWall = true; }
      }
    }
  }

  entity.vy += g;
  if (entity.vy > mf) entity.vy = mf;
  entity.y += entity.vy;

  entity.onGround = false;

  const x3 = Math.floor(entity.x / TILE);
  const x4 = Math.floor((entity.x + entity.w - 1) / TILE);
  const y3 = Math.floor(entity.y / TILE);

  for (let ty = y3; ty <= Math.floor((entity.y + entity.h) / TILE); ty++) {
    for (let tx = x3; tx <= x4; tx++) {
      if (!isSolid(tileAt(level, tx, ty), level)) continue;
      if (entity.vy > 0) {
        entity.y = ty * TILE - entity.h;
        entity.vy = 0;
        entity.onGround = true;
      } else if (entity.vy < 0) {
        entity.y = (ty + 1) * TILE;
        entity.vy = 0;
      }
    }
  }

  if (level.movingPlatforms) {
    for (const mp of level.movingPlatforms) {
      if (aabb(entity, mp)) {
        if (entity.vy > 0) { entity.y = mp.y - entity.h; entity.vy = 0; entity.onGround = true; }
        else if (entity.vy < 0) { entity.y = mp.y + mp.h; entity.vy = 0; }
      }
    }
  }
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
