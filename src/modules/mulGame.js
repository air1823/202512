// 乘法遊戲：排隊小動物（Animals in Rows）
// 玩法：顯示 r × c 的排隊動物，顯示重複加法輔助說明，學生回答總數

const title = '乘法遊戲：排隊小動物';

function makeAnimal(){
  const a = document.createElement('div'); a.className='animal'; a.textContent='🐶'; return a;
}

function start(container, shared, onComplete){
  container.innerHTML = '';
  const header = document.createElement('div'); header.className='game-title'; header.textContent = title;
  container.appendChild(header);
  const area = document.createElement('div'); area.className='play-area'; container.appendChild(area);
  const feedback = document.createElement('div'); feedback.className='feedback'; feedback.style.textAlign='center'; area.appendChild(feedback);

  const questions = shared.questions.pickRandom(3, 'mul');
  let idx = 0;

  function renderQuestion(i){
    area.querySelectorAll('.animal-grid, .hint, .controls-row').forEach(n=>n.remove());
    const q = questions[i];
    const rows = q.a; const per = q.b; const total = q.answer;

    const hint = document.createElement('div'); hint.className='hint'; hint.textContent = `第 ${i+1} 題： ${rows} × ${per} = ?（表示為 ${Array(rows).fill(per).join(' + ')}）`;
    area.appendChild(hint);

    const grid = document.createElement('div'); grid.className='animal-grid'; grid.style.gridTemplateColumns = `repeat(${per}, auto)`;
    for(let k=0;k<total;k++) grid.appendChild(makeAnimal());
    area.appendChild(grid);

    const ctrl = document.createElement('div'); ctrl.className='controls-row'; ctrl.style.textAlign='center'; ctrl.style.marginTop='12px';
    const input = document.createElement('input'); input.type='number'; input.style.width='120px'; input.placeholder='輸入總數';
    const btn = document.createElement('button'); btn.className='btn-primary'; btn.textContent='提交';
    ctrl.appendChild(input); ctrl.appendChild(btn); area.appendChild(ctrl);

    btn.addEventListener('click', ()=>{
      const val = Number(input.value);
      if(val === total){ shared.ui.showFirework(area); shared.ui.showInlineFeedback(feedback, '答對囉！', true); setTimeout(()=> nextQuestion(), 900); }
      else{ shared.ui.showCross(area); shared.ui.showInlineFeedback(feedback, '再想一想，試著把每排逐一相加！', false); }
    });
  }

  function nextQuestion(){
    idx++;
    if(idx < questions.length) renderQuestion(idx);
    else { shared.ui.showMessage(container, '全部題目完成！太棒了！'); if(onComplete) onComplete({module:'mul', result:true}); }
  }

  // start
  renderQuestion(0);
}

export default { title, start };
