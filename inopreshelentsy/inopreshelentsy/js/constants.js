const TILE = 18;
const CHAR_TILE = 24;
const CHAR_OFFSET_X = -3;
const W = 360;
const H = 216;
const SCALE = 4;
const COLS = Math.ceil(W / TILE);
const ROWS = Math.ceil(H / TILE);

const GRAVITY = 0.5;
const MAX_FALL = 12;
const MOVE_SPEED = 2.5;
const JUMP_VEL = -8;
const FRICTION = 0.78;

const MAX_HP = 3;
const CRUMBLE_DELAY = 120;
const DROWN_DELAY = 90;
const ICE_SPEED = 4;
const ICE_FRICTION = 0.95;
const MUSHROOM_BOUNCE = -14;

const CRUMBLE_TILES = [6, 7, 8];
const WATER_TILES = [33, 53, 73];
const ICE_TILES = [34, 35];
const SHROOM_TILES = [107];
const DECOR_TILES = [124, 125, 126, 127, 128, 129];
const BOX_TILE = 26;
const MOVING_PLATFORM_TILE = 47;
const LEVER_OFF = 65;
const LEVER_ON_LEFT = 64;
const LEVER_ON_RIGHT = 66;
const LEVER_TILES = [LEVER_OFF, LEVER_ON_LEFT, LEVER_ON_RIGHT];
const HEART_PICKUP_TILES = [44, 46];
const COIN_TILE = 67;
const FLAG_INACTIVE = 110;
const FLAG_ACTIVE = [111, 112];

const PARALLAX_COLS = 6;
const PARALLAX_ROWS = 4;
const PARALLAX_SPEED = 0.3;

const THEMES = {
  base: {
    tileset: 'assets/tilemaps/tilemap_base.png',
    cols: 20, rows: 9,
    charSheet: 'assets/tilemaps/tilemap_char.png',
    charCols: 9,
    bgColor: '#6bb8ff',
    deathTiles: [132, 133, 134, 135],
  },
  industrial: {
    tileset: 'assets/tilemaps/tilemap_industrial.png',
    cols: 16, rows: 7,
    charSheet: 'assets/tilemaps/tilemap_char.png',
    charCols: 9,
    bgColor: '#3a3a4a',
    deathTiles: [13, 14, 15, 29, 30, 31],
  },
  food: {
    tileset: 'assets/tilemaps/tilemap_food.png',
    cols: 16, rows: 7,
    charSheet: 'assets/tilemaps/tilemap_char.png',
    charCols: 9,
    bgColor: '#ffd4e8',
    deathTiles: [43, 59, 61, 62, 63, 75, 77, 78, 79],
  }
};

const PLAYER_SKINS = {
  base: { idle: [0], run: [0, 1], jump: [0], fall: [0] },
  industrial: { idle: [2], run: [2, 3], jump: [2], fall: [2] },
  food: { idle: [4], run: [4, 5], jump: [4], fall: [4] },
};

const ENEMY_TYPES = {
  golem: { idle: [6], run: [6, 7], speed: 0.5 },
  slime: { idle: [9], run: [9, 10], speed: 0.7 },
  enemy1: { idle: [11], run: [11, 12], speed: 0.5 },
  enemy2: { idle: [13], run: [13, 14], speed: 0.5 },
  enemy3: { idle: [15], run: [15, 16, 17], speed: 0.5 },
  enemy4: { idle: [18], run: [18, 19, 20], speed: 0.5 },
  enemy5: { idle: [21], run: [21, 22, 23], speed: 0.5 },
  enemy6: { idle: [24], run: [24, 25, 26], speed: 0.5 },
};

const STATE = {
  MENU: 0,
  PLAYING: 1,
  PAUSED: 2,
  LEVEL_COMPLETE: 3,
  GAME_OVER: 4,
  WIN: 5,
};
