(() => {
  const tabs = [...document.querySelectorAll('.game-tabs button')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }));

  const grid = document.getElementById('memory-grid');
  const memoryStatus = document.getElementById('memory-status');
  const faces = ['🐶', '🐱', '🐰', '🐼', '🦊', '🐨'];
  let opened = [], matched = 0, moves = 0, locked = false, pending;
  function resetMemory() {
    clearTimeout(pending);
    opened = []; matched = 0; moves = 0; locked = false;
    memoryStatus.textContent = '카드 두 장을 뒤집어 같은 동물을 찾아보세요.';
    const deck = [...faces, ...faces];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    grid.replaceChildren();
    deck.forEach((face, index) => {
      const card = document.createElement('button');
      card.className = 'memory-card'; card.textContent = '?';
      card.setAttribute('aria-label', `${index + 1}번 카드 뒤집기`);
      card.addEventListener('click', () => {
        if (locked || card.disabled || opened.some(item => item.card === card)) return;
        card.textContent = face; card.classList.add('revealed');
        card.setAttribute('aria-label', `${index + 1}번 카드 ${face}`);
        opened.push({card, face, index});
        if (opened.length < 2) return;
        moves++;
        if (opened[0].face === opened[1].face) {
          opened.forEach(({card}) => { card.disabled = true; card.classList.add('matched'); });
          matched++; opened = [];
          memoryStatus.textContent = matched === 6 ? `🎉 모두 찾았어요! ${moves}번 만에 성공!` : `잘했어요! ${matched}/6쌍 · ${moves}번 시도`;
        } else {
          locked = true; memoryStatus.textContent = `다시 찾아볼까요? ${matched}/6쌍 · ${moves}번 시도`;
          pending = setTimeout(() => {
            opened.forEach(({card, index}) => {
              card.textContent = '?'; card.classList.remove('revealed');
              card.setAttribute('aria-label', `${index + 1}번 카드 뒤집기`);
            });
            opened = []; locked = false;
          }, 850);
        }
      });
      grid.append(card);
    });
  }
  document.getElementById('memory-reset').addEventListener('click', resetMemory);
  resetMemory();

  const machine = document.getElementById('claw-machine');
  const head = document.getElementById('claw-head');
  const aim = document.getElementById('claw-aim');
  const status = document.getElementById('claw-status');
  const basket = document.getElementById('prize-basket');
  const controls = [...document.querySelectorAll('[data-claw-control]')];
  let prizes = [], busy = false, caught = 0;
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  function position() { head.style.left = `${aim.value}%`; }
  function resetClaw() {
    if (busy) return;
    machine.querySelectorAll('.prize').forEach(el => el.remove());
    prizes = [15, 38, 62, 85].map((x, i) => {
      const el = document.createElement('span'); el.className = 'prize';
      el.textContent = faces[i]; el.style.left = `${x}%`; el.setAttribute('aria-hidden','true');
      machine.append(el); return {x, el};
    });
    caught = 0; basket.textContent = '🧺'; aim.value = 50; position();
    document.getElementById('claw-drop').disabled = false;
    status.textContent = '집게를 동물 위로 옮긴 뒤 뽑기 버튼을 눌러요.';
  }
  aim.addEventListener('input', position);
  document.getElementById('claw-left').addEventListener('click', () => { aim.value = Math.max(8, +aim.value - 5); position(); });
  document.getElementById('claw-right').addEventListener('click', () => { aim.value = Math.min(92, +aim.value + 5); position(); });
  document.getElementById('claw-reset').addEventListener('click', resetClaw);
  document.getElementById('claw-drop').addEventListener('click', async () => {
    if (busy || !prizes.length) return;
    busy = true; controls.forEach(el => el.disabled = true);
    status.textContent = '집게가 내려가요…';
    const target = prizes.find(prize => Math.abs(prize.x - +aim.value) <= 9);
    head.style.top = '187px'; await pause(700);
    head.classList.add('closed'); await pause(250);
    let held;
    if (target) {
      held = document.createElement('span'); held.className = 'held-prize';
      held.textContent = target.el.textContent; head.append(held); target.el.remove();
      prizes = prizes.filter(prize => prize !== target);
    }
    head.style.top = '26px'; await pause(700);
    if (held) {
      head.style.left = '15%'; await pause(300);
      basket.textContent += held.textContent; held.remove(); caught++;
      status.textContent = prizes.length ? `🎉 성공! 동물 ${caught}마리를 모았어요.` : '🎉 동물을 모두 뽑았어요! 다시 채워서 도전해 보세요.';
    } else status.textContent = '아쉬워요! 집게를 동물 바로 위에 맞춰보세요.';
    head.classList.remove('closed'); position();
    busy = false; controls.forEach(el => el.disabled = false);
    document.getElementById('claw-drop').disabled = !prizes.length;
  });
  resetClaw();
})();
