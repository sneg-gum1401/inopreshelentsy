const input = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  _jumpWas: false,
  action: false,
  actionPressed: false,
  _actionWas: false,
  anyKey: false,
};

function handleKey(e, pressed) {
  if (typeof game !== 'undefined' && game.editorActive) return;
  const k = e.key || '';
  if (k === 'ArrowLeft' || k === 'a' || k === 'ф') input.left = pressed;
  else if (k === 'ArrowRight' || k === 'd' || k === 'в') input.right = pressed;
  else if (k === 'ArrowUp' || k === 'w' || k === 'ц' || k === ' ' || k === 'Enter') {
    input.jump = pressed;
    if (pressed) e.preventDefault();
  }
  if (k === 'e' || k === 'у') input.action = pressed;
  if (pressed) input.anyKey = true;
}

document.addEventListener('keydown', e => handleKey(e, true));
document.addEventListener('keyup', e => handleKey(e, false));

function updateInput() {
  input.jumpPressed = input.jump && !input._jumpWas;
  input._jumpWas = input.jump;
  input.actionPressed = input.action && !input._actionWas;
  input._actionWas = input.action;
}
