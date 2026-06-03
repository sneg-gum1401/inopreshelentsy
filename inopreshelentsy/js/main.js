const game = {
  state: STATE.MENU,
  level: null,
  currentLevel: 0,
  score: 0,
  transitionTimer: 0,
  editorActive: false,
};

const cam = new Camera();
let editor = null;

const levelData = [];

async function init() {
  await loadTilesheets();
  setupLevels();
  editor = new Editor(document.getElementById('game'));
  window.addEventListener('beforeunload', () => { if (editor) editor._autoSave(); });
  gameLoop();
}

function setupLevels() {
  levelData.length = 0;
  if (typeof LEVEL1_DATA !== 'undefined') {
    levelData.push(LEVEL1_DATA);
  } else {
    levelData.push(createLevel1);
  }
  try {
    const saved = localStorage.getItem('editor_level_0');
    if (saved) {
      const data = JSON.parse(saved);
      if (data && data.tiles) levelData[0] = data;
    }
  } catch (e) {}
}

function loadLevel(index) {
  if (index >= levelData.length) {
    game.state = STATE.WIN;
    return;
  }
  const prevHp = game.level && game.level.player ? game.level.player.hp : MAX_HP;
  const data = typeof levelData[index] === 'function' ? levelData[index]() : levelData[index];
  game.level = new Level(data);
  game.level.createPlayer();
  game.level.player.hp = prevHp;
  cam.follow(game.level.player, game.level.w);
  game.state = STATE.PLAYING;
}

function restartLevel() {
  if (game.level) {
    game.level.reset();
    game.level.player.hp = MAX_HP;
    game.state = STATE.PLAYING;
  }
}

function respawnPlayer() {
  if (game.level) {
    game.level.reset();
    game.state = STATE.PLAYING;
  }
}

function nextLevel() {
  game.currentLevel++;
  if (game.currentLevel >= levelData.length) {
    game.state = STATE.WIN;
  } else {
    loadLevel(game.currentLevel);
  }
}

function update() {
  if (editor && editor.active) return;
  updateInput();

  switch (game.state) {
    case STATE.MENU:
      if (input.jumpPressed) {
        game.currentLevel = 0;
        game.score = 0;
        loadLevel(0);
      }
      break;

    case STATE.PLAYING:
      if (game.level) {
        game.level.update();
        cam.follow(game.level.player, game.level.w);

        if (!game.level.player.alive) {
          game.state = STATE.GAME_OVER;
        }
        if (game.level.complete) {
          game.state = STATE.LEVEL_COMPLETE;
          game.transitionTimer = 0;
        }
      }
      break;

    case STATE.LEVEL_COMPLETE:
      game.transitionTimer++;
      if (input.jumpPressed && game.transitionTimer > 30) {
        nextLevel();
      }
      break;

    case STATE.GAME_OVER:
      if (input.jumpPressed) {
        restartLevel();
      }
      break;

    case STATE.WIN:
      if (input.jumpPressed) {
        game.state = STATE.MENU;
      }
      break;
  }
}

function draw() {
  const ctx = game.ctx;

  switch (game.state) {
    case STATE.MENU:
      drawMenu(ctx);
      break;

    case STATE.PLAYING:
    case STATE.LEVEL_COMPLETE:
    case STATE.GAME_OVER:
      if (game.level) {
        drawBackground(ctx, game.level.bgColor);
        game.level.draw(ctx, cam);
        drawHUD(ctx);

        if (game.state === STATE.LEVEL_COMPLETE) drawLevelComplete(ctx);
        if (game.state === STATE.GAME_OVER) drawGameOver(ctx);
      }
      break;

    case STATE.WIN:
      drawBackground(ctx, '#1a1a2e');
      drawWin(ctx);
      break;
  }
}

let accumulator = 0;
let lastTime = 0;
const MS_PER_UPDATE = 1000 / 60;

function gameLoop(time) {
  if (lastTime === 0) {
    lastTime = time || 0;
    update();
    draw();
    if (editor && editor.active) editor.draw(game.ctx);
    requestAnimationFrame(gameLoop);
    return;
  }
  const frameTime = Math.min(time - lastTime, 50);
  lastTime = time;
  accumulator += frameTime;
  while (accumulator >= MS_PER_UPDATE) {
    update();
    accumulator -= MS_PER_UPDATE;
  }
  draw();
  if (editor && editor.active) editor.draw(game.ctx);
  requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = W * SCALE + 'px';
  canvas.style.height = H * SCALE + 'px';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  game.ctx = ctx;
  init();
});
