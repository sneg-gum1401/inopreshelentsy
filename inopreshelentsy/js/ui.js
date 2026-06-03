function drawBackground(ctx, color) {
  ctx.fillStyle = color || '#5c94fc';
  ctx.fillRect(0, 0, W, H);
}

function drawHUD(ctx) {
  const sheetKey = game.level ? game.level.theme : 'base';
  const hp = game.level && game.level.player ? game.level.player.hp : MAX_HP;

  for (let i = 0; i < MAX_HP; i++) {
    const ti = i < hp ? 44 : 46;
    drawTile(ctx, sheetKey, ti, 4 + i * 15, H - 34);
  }

  ctx.fillStyle = '#fff';
  ctx.font = '8px monospace';
  ctx.imageSmoothingEnabled = false;
  ctx.fillText('×' + game.score, 52, H - 24);
}

function drawMenu(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffcc00';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ИНОПРЕШЕЛЕНЦЫ', W / 2, 60);

  ctx.fillStyle = '#fff';
  ctx.font = '8px monospace';
  ctx.fillText('НАЖМИ ENTER ЧТОБЫ НАЧАТЬ', W / 2, 120);
  ctx.fillText('← → ДВИЖЕНИЕ  ↑ ПРЫЖОК', W / 2, 140);

  ctx.textAlign = 'left';
}

function drawLevelComplete(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#5f0';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('УРОВЕНЬ ПРОЙДЕН!', W / 2, 90);
  ctx.fillStyle = '#fff';
  ctx.font = '8px monospace';
  ctx.fillText('ОЧКИ: ' + game.score, W / 2, 115);
  ctx.fillText('ENTER — ДАЛЕЕ', W / 2, 140);
  ctx.textAlign = 'left';
}

function drawGameOver(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f44';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', W / 2, 90);
  ctx.fillStyle = '#fff';
  ctx.font = '8px monospace';
  ctx.fillText('ENTER — ПРОДОЛЖИТЬ', W / 2, 120);
  ctx.textAlign = 'left';
}

function drawWin(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffcc00';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ПОБЕДА!', W / 2, 80);
  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.fillText('ВСЕ УРОВНИ ПРОЙДЕНЫ!', W / 2, 105);
  ctx.fillText('ИТОГО ОЧКОВ: ' + game.score, W / 2, 125);
  ctx.fillText('ENTER — В МЕНЮ', W / 2, 150);
  ctx.textAlign = 'left';
}
