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

  const tabs = document.querySelectorAll('[data-game]');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-pressed', String(selected));
      document.getElementById(item.dataset.game + '-panel').hidden = !selected;
    });
  }));
  const words = [['🐶','강아지'],['🐱','고양이'],['🐰','토끼'],['🦊','여우'],['🐼','판다'],['🐸','개구리'],['🍎','사과'],['🍌','바나나'],['🌻','해바라기'],['🚗','자동차'],['🐻','곰'],['🐘','코끼리']];
  const shuffle = list => {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function quiz(type, question, answer, choices) {
    const display = document.getElementById(type + '-question');
    const options = document.getElementById(type + '-options');
    const status = document.getElementById(type + '-status');
    const next = document.getElementById(type + '-next');
    display.textContent = question; status.textContent = ''; next.hidden = true;
    options.replaceChildren();
    shuffle(choices).forEach(value => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = value;
      button.addEventListener('click', () => {
        if (value === answer) {
          status.textContent = '🎉 정답이에요! 잘했어요!';
          button.classList.add('correct');
          options.querySelectorAll('button').forEach(item => item.disabled = true);
          next.hidden = false;
        } else {
          status.textContent = '괜찮아요! 다시 골라볼까요?';
          button.disabled = true;
        }
      });
      options.append(button);
    });
  }
  function newHangul() {
    const items = shuffle(words).slice(0, 4), correct = items[0];
    quiz('hangul', correct[0], correct[1], items.map(item => item[1]));
  }
  function newMath() {
    const level = +document.getElementById('math-level').value;
    const a = level || 2 + Math.floor(Math.random() * 8), b = 1 + Math.floor(Math.random() * 9), answer = a * b;
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const candidate = answer + Math.floor(Math.random() * 19) - 9;
      if (candidate > 0) choices.add(candidate);
    }
    quiz('math', `${a} × ${b} = ?`, answer, [...choices]);
  }
  document.getElementById('hangul-next').addEventListener('click', newHangul);
  document.getElementById('math-next').addEventListener('click', newMath);
  document.getElementById('math-level').addEventListener('change', newMath);
  newHangul(); newMath();
})();
