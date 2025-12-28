// 減法遊戲：氣球飛走了（Balloons Away）
// 玩法：一開始顯示若干氣球，根據題目（a - b），會有 b 顆氣球飛走，學生選擇剩下的數量

const title = '減法遊戲：氣球飛走了';

function makeBalloon(color,i){
  const b = document.createElement('div'); b.className = `balloon ${color}`; b.textContent = '';
  b.dataset.idx = i; return b;
}

function start(container, shared, onComplete){
  container.innerHTML = '';
  const header = document.createElement('div'); header.className='game-title'; header.textContent = title;
  container.appendChild(header);
  const area = document.createElement('div'); area.className='play-area'; container.appendChild(area);
  const feedback = document.createElement('div'); feedback.className='feedback'; feedback.style.textAlign='center'; area.appendChild(feedback);

  const questions = shared.questions.pickRandom(3, 'sub');
  let idx = 0;

  function showChoices(areaEl, remain){
    const choices = document.createElement('div'); choices.className='choices'; choices.style.marginTop='12px'; choices.style.textAlign='center';
    const prompt = document.createElement('div'); prompt.className='hint'; prompt.textContent = '請選擇剩下的氣球數量：'; choices.appendChild(prompt);
    for(let i=0;i<=10;i++){
      const b = document.createElement('button'); b.className='small-btn'; b.textContent = i; b.style.margin='6px';
      b.addEventListener('click', ()=>{
        if(i === remain){ shared.ui.showFirework(areaEl); shared.ui.showInlineFeedback(prompt, '答對囉！', true); setTimeout(()=> nextQuestion(), 900); }
        else { shared.ui.showCross(areaEl); shared.ui.showInlineFeedback(prompt, '再數一次看看！', false); }
      });
      choices.appendChild(b);
    }
    areaEl.appendChild(choices);
  }

  function renderQuestion(i){
    area.querySelectorAll('.balloon-row, .choices, .hint').forEach(n=>n.remove());
    const q = questions[i];
    const a = q.a; const b = q.b; const remain = q.answer;
    const hint = document.createElement('div'); hint.className='hint'; hint.textContent = `第 ${i+1} 題： ${a} - ${b} = ?（看著 ${b} 顆氣球飛走）`;
    area.appendChild(hint);

  const row = document.createElement('div'); row.className='balloon-row';
  const palette = ['green','blue','pink','orange','purple','yellow'];
  for(let k=0;k<a;k++){ const color = palette[Math.floor(Math.random()*palette.length)]; row.appendChild(makeBalloon(color,k)); }
    area.appendChild(row);

    // animate b balloons flying away after short delay
    setTimeout(()=>{
      const balloons = Array.from(row.children);
      for(let t=0;t<b && balloons.length>0;t++){
        const idxPick = Math.floor(Math.random()*balloons.length);
        const el = balloons[idxPick]; el.classList.add('float-away');
        setTimeout(()=> el.remove(), 1100);
        balloons.splice(idxPick,1);
      }
      setTimeout(()=> showChoices(area, remain), 1200);
    }, 700);
  }

  function nextQuestion(){
    idx++;
    if(idx < questions.length) renderQuestion(idx);
    else { shared.ui.showMessage(container, '全部題目完成！很好！'); if(onComplete) onComplete({module:'sub', result:true}); }
  }

  // start
  renderQuestion(0);
}

export default { title, start };
