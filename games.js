(() => {
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

})();
