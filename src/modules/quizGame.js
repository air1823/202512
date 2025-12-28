// 遊戲化隨堂小考
// 使用 Questions 模組抽題，五題隨機抽取，提供即時回饋與計分

import Questions from '../questions.js';
const title = '隨堂小考';

function start(container, shared, onComplete, options){
  container.innerHTML = '';
  const header = document.createElement('div'); header.className='game-title'; header.textContent = title; container.appendChild(header);

  const intro = document.createElement('div'); intro.className='quiz-screen'; intro.innerHTML = `<p>系統會從題庫中隨機抽 5 題，答題後會即時給予回饋與分數。</p>`;
  container.appendChild(intro);

  const controls = document.createElement('div'); controls.style.marginTop='8px';
  const select = document.createElement('select'); ['mixed','add','sub','mul'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent = (v==='mixed'?'綜合':(v==='add'?'加法':v==='sub'?'減法':'乘法')); select.appendChild(o); });
  const startBtn = document.createElement('button'); startBtn.className='btn-primary'; startBtn.textContent='開始'; controls.appendChild(select); controls.appendChild(startBtn); container.appendChild(controls);

  const qArea = document.createElement('div'); qArea.className='quiz-screen hidden';
  const qBox = document.createElement('div'); qBox.className='question-box'; qArea.appendChild(qBox);
  const answerRow = document.createElement('div'); answerRow.className='answer-row';
  const input = document.createElement('input'); input.type='number'; input.id='quiz-input'; input.style.width='120px';
  const submit = document.createElement('button'); submit.className='btn-primary'; submit.textContent='提交'; answerRow.appendChild(input); answerRow.appendChild(submit); qArea.appendChild(answerRow);
  const fb = document.createElement('div'); fb.className='feedback'; qArea.appendChild(fb);
  const progress = document.createElement('div'); progress.className='quiz-progress'; qArea.appendChild(progress);
  container.appendChild(qArea);

  let questions = [];
  let idx = 0; let score = 0; const QUIZ_N = 5;

  // start logic extracted so we can call it from modal via options or via the button
  function beginQuiz(type){
    const t = type || select.value || 'mixed';
    questions = shared.questions.pickRandom(QUIZ_N, t);
    idx = 0; score = 0; showQ(); intro.classList.add('hidden'); qArea.classList.remove('hidden');
  }

  startBtn.addEventListener('click', ()=> beginQuiz());

  // if options were passed in (from main), auto-start with that type
  if(options && options.type){
    // set select value for clarity
    select.value = options.type;
    // small timeout to ensure DOM focus is fine
    setTimeout(()=> beginQuiz(options.type), 50);
  }

  function showQ(){
    const q = questions[idx]; qBox.textContent = q.text; progress.textContent = `第 ${idx+1} 題 / 共 ${questions.length} 題`; fb.textContent=''; input.value=''; input.focus();
  }

  submit.addEventListener('click', ()=>{
    const v = Number(input.value);
    const q = questions[idx];
    if(Number.isNaN(v)){ fb.textContent='請輸入答案！'; fb.className='feedback wrong'; return; }
    if(v === q.answer){ score++; shared.ui.showFirework(qArea); fb.textContent='答對囉！很棒～'; fb.className='feedback correct'; }
    else { shared.ui.showCross(qArea); fb.textContent = `答案是 ${q.answer}，再下一題試試看！`; fb.className='feedback wrong'; }
    // next
    idx++; if(idx < questions.length){ setTimeout(()=> showQ(), 900); } else { setTimeout(()=> showResult(), 800); }
  });

  function showResult(){
    qArea.classList.add('hidden'); const res = document.createElement('div'); res.className='quiz-screen'; res.innerHTML = `<h3>測驗結果</h3><p>得分：${score} / ${questions.length}</p>`;
    const msg = document.createElement('p'); msg.className='result-message'; if(score===questions.length) msg.textContent='太棒了！全部答對！'; else if(score >= Math.ceil(questions.length*0.7)) msg.textContent='不錯！繼續努力！'; else msg.textContent='再試一次就會更進步！'; res.appendChild(msg);
    const again = document.createElement('button'); again.className='btn-primary'; again.textContent='再做一次'; again.addEventListener('click', ()=> location.reload()); res.appendChild(again);
    container.appendChild(res);
    if(onComplete) onComplete({module:'quiz', score});
  }
}

export default { title, start };
