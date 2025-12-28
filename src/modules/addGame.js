// 加法遊戲：糖果收集王（Candy Collector）
// 每次出 3 題（來自共用題庫），每題以糖果圖像呈現數量
// 學生點擊糖果收集數量並提交；答對顯示煙火特效，答錯顯示短暫叉叉

const title = '加法遊戲：糖果收集王';

function makeCandy(color){
  const d = document.createElement('div');
  d.className = `candy ${color}`;
  d.textContent = '';
  return d;
}

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min }
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } }

function start(container, shared, onComplete){
  container.innerHTML = '';
  const header = document.createElement('div'); header.className='game-title'; header.textContent = title;
  container.appendChild(header);
  const area = document.createElement('div'); area.className='play-area';
  container.appendChild(area);

  const feedback = document.createElement('div'); feedback.className='feedback'; feedback.style.textAlign='center';
  area.appendChild(feedback);

  // 從共用題庫抽 3 題（加法）
  const questions = shared.questions.pickRandom(3, 'add');
  let idx = 0;

  const basket = document.createElement('div'); basket.className='basket'; basket.textContent = '已放入 0';
  const submit = document.createElement('button'); submit.className='btn-primary'; submit.textContent='提交答案';

  function renderQuestion(i){
    // 清除先前題目元件
    area.querySelectorAll('.candies, .controls-row, .hint').forEach(n=>n.remove());
    const q = questions[i];
    const a = q.a; const b = q.b; const correct = q.answer;

    const qText = document.createElement('div'); qText.className='hint'; qText.textContent = `第 ${i+1} 題：請幫忙收集 ${a} 顆紅糖果和 ${b} 顆藍糖果`;
    area.insertBefore(qText, feedback);

  // create a pool of candies that contains at least the required red/blue,
  // plus a few extra distractor candies to increase challenge
  const candiesRow = document.createElement('div'); candiesRow.className='candies';
  const pool = [];
  for(let k=0;k<a;k++) pool.push('red');
  for(let k=0;k<b;k++) pool.push('blue');
  const extra = randInt(1,4); // 1~4 extra candies
  const colors = ['red','blue','yellow'];
  for(let k=0;k<extra;k++) pool.push(colors[randInt(0, colors.length-1)]);
  shuffle(pool);
  pool.forEach(col => candiesRow.appendChild(makeCandy(col)));
  area.insertBefore(candiesRow, feedback);

    const ctrl = document.createElement('div'); ctrl.className='controls-row'; ctrl.style.display='flex'; ctrl.style.justifyContent='center'; ctrl.style.gap='12px'; ctrl.style.marginTop='12px';
    basket.textContent = '已放入 0';
    ctrl.appendChild(basket); ctrl.appendChild(submit);
    area.insertBefore(ctrl, feedback);

    let count = 0;
    candiesRow.querySelectorAll('.candy').forEach(c => {
      c.style.pointerEvents = 'auto'; c.style.opacity = '1'; c.style.transform='none';
      // allow toggling selection: click once to select, click again to deselect
      function toggle(){
        const selected = c.classList.toggle('selected');
        if(selected){
          c.style.transform = 'translateY(6px) scale(.9)';
          c.style.opacity = '0.25';
          count += 1;
        } else {
          c.style.transform = 'none';
          c.style.opacity = '1';
          count = Math.max(0, count-1);
        }
        basket.textContent = `已放入 ${count}`;
      }
      c.addEventListener('click', toggle);
      // keyboard accessibility
      c.setAttribute('tabindex','0');
      c.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){ e.preventDefault(); toggle(); }});
    });

    submit.onclick = ()=>{
      if(count === correct){
        shared.ui.showFirework(container);
        shared.ui.showInlineFeedback(feedback, '答對囉！很棒～', true);
        setTimeout(()=> nextQuestion(), 900);
      } else {
        shared.ui.showCross(container);
        shared.ui.showInlineFeedback(feedback, '再數一次看看！', false);
      }
    };
  }

  function nextQuestion(){
    idx++;
    if(idx < questions.length){ renderQuestion(idx); }
    else{
      shared.ui.showMessage(container, '全部題目完成！好棒！');
      if(onComplete) onComplete({module:'add', result:true});
    }
  }

  // 啟動第一題
  renderQuestion(0);
}

export default { title, start };
