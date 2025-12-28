import Questions from './questions.js';
import UI from './ui.js';
import AddGame from './modules/addGame.js';
import SubGame from './modules/subGame.js';
import MulGame from './modules/mulGame.js';
import Adventure from './modules/adventure.js';
import QuizGame from './modules/quizGame.js';

// 主控：管理模組啟動、共享資源
const shared = {
  questions: Questions(),
  ui: UI,
};

document.addEventListener('DOMContentLoaded', () => {
  const appArea = document.querySelector('.app-area');
  if(!appArea){
    // create area if missing
    const main = document.querySelector('.container');
    const area = document.createElement('div');
    area.className = 'app-area';
    main.insertBefore(area, document.getElementById('modal-videos'));
  }

  const area = document.querySelector('.app-area');
  // add small header (簡化版：移除快速連結區塊)
  area.innerHTML = `<div class="game-header"><div class="game-title">請選擇一個遊戲開始</div><div><button id="home-reset" class="small-btn">回首頁</button></div></div><div class="game-body">歡迎來到數學小課堂！從上方三個按鈕選擇功能。</div>`;

  // wire top buttons
  document.getElementById('btn-videos').addEventListener('click', () => {
    document.getElementById('modal-videos').classList.remove('hidden');
  });
  document.getElementById('btn-play').addEventListener('click', () => {
    document.getElementById('modal-play').classList.remove('hidden');
  });
  document.getElementById('btn-quiz').addEventListener('click', () => {
    // show modal; actual start will be triggered by the modal's start button
    document.getElementById('modal-quiz').classList.remove('hidden');
  });

  // wire quiz modal start button to run quiz inside the modal (no navigation to main area)
  const quizStartBtn = document.getElementById('quiz-start');
  if(quizStartBtn){
    quizStartBtn.addEventListener('click', ()=>{
      const type = document.getElementById('quiz-type')?.value || 'mixed';
      // start quiz inside modal using shared.questions
      beginModalQuiz(type);
    });
  }

  // --- Modal-based quiz logic ---
  function beginModalQuiz(type){
    const intro = document.getElementById('quiz-intro');
    const qScreen = document.getElementById('quiz-question');
    const qBox = document.getElementById('question-box');
    const answerInput = document.getElementById('answer-input');
    const answerSubmit = document.getElementById('answer-submit');
    const feedback = document.getElementById('feedback');
    const curNum = document.getElementById('current-num');
    const totNum = document.getElementById('total-num');
    const resultScreen = document.getElementById('quiz-result');
    const resultScore = document.getElementById('result-score');
    const resultMessage = document.getElementById('result-message');
    const retryBtn = document.getElementById('quiz-retry');

    if(!qScreen || !qBox) return; // safety

    const QUIZ_N = 5;
    let questions = shared.questions.pickRandom(QUIZ_N, type);
    let idx = 0; let score = 0;

    totNum.textContent = String(questions.length);

    function showQ(){
      const q = questions[idx];
      qBox.textContent = q.text;
      curNum.textContent = String(idx+1);
      feedback.textContent = '';
      feedback.className = 'feedback';
      answerInput.value = '';
      setTimeout(()=> answerInput.focus(), 50);
    }

    // override submit handler
    answerSubmit.onclick = () => {
      const v = Number(answerInput.value);
      const q = questions[idx];
      if(Number.isNaN(v)){
        feedback.textContent = '請輸入答案！'; feedback.className='feedback wrong'; return;
      }
      if(v === q.answer){ score++; shared.ui.showFirework(document.getElementById('modal-quiz') || document.body); feedback.textContent='答對囉！'; feedback.className='feedback correct'; }
      else { shared.ui.showCross(document.getElementById('modal-quiz') || document.body); feedback.textContent = `答案是 ${q.answer}`; feedback.className='feedback wrong'; }
      idx++;
      if(idx < questions.length){ setTimeout(()=> showQ(), 900); }
      else { setTimeout(()=> showResult(), 800); }
    };

    function showResult(){
      qScreen.classList.add('hidden');
      resultScreen.classList.remove('hidden');
      resultScore.textContent = `${score} / ${questions.length}`;
      if(score === questions.length) resultMessage.textContent = '太棒了！全部答對！';
      else if(score >= Math.ceil(questions.length*0.7)) resultMessage.textContent = '不錯！繼續努力！';
      else resultMessage.textContent = '再試一次就會更進步！';
    }

    retryBtn.onclick = () => {
      // return to intro screen
      resultScreen.classList.add('hidden');
      qScreen.classList.add('hidden');
      intro.classList.remove('hidden');
    };

    // initial UI swap
    intro.classList.add('hidden');
    resultScreen.classList.add('hidden');
    qScreen.classList.remove('hidden');
    idx = 0; score = 0; showQ();
  }

  // option buttons in modals route to modules
  document.querySelectorAll('#modal-play .option-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const t = btn.dataset.type;
      if(t==='add') startModule(AddGame);
      if(t==='sub') startModule(SubGame);
      if(t==='mul') startModule(MulGame);
      if(t==='adventure') startModule(Adventure);
      document.getElementById('modal-play').classList.add('hidden');
    });
  });

  // video options (placeholder handlers)
  document.querySelectorAll('#modal-videos .option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.type;
      // placeholder: show simple alert / message; later can embed video player
      document.querySelectorAll('#modal-videos .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
      const t = btn.dataset.type;

    // 👉 呼叫真正的影片顯示函式
    showPlaceholderVideo(t);
      });
    });

    });
  });

  // close buttons for all modals
  document.querySelectorAll('.close-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if(modal) modal.classList.add('hidden');
    });
  });

  // main selector
  function startModule(mod, options){
    area.innerHTML = '';
    const header = document.createElement('div'); header.className='game-header';
    header.innerHTML = `<div class="game-title">${mod.title}</div><div><button id="back-home" class="small-btn">回首頁</button></div>`;
    area.appendChild(header);
    const container = document.createElement('div'); container.className='game-container';
    area.appendChild(container);
    // start module
    // pass options through to modules that accept them (e.g., quiz)
    if(typeof mod.start === 'function') mod.start(container, shared, onComplete, options);
    document.getElementById('back-home').addEventListener('click', () => location.reload());
    const homeReset = document.getElementById('home-reset');
    if(homeReset) homeReset.addEventListener('click', ()=> location.reload());
  }

  function onComplete(result){
    // called by modules on success (used by adventure)
    console.log('module complete:', result);
  }

});
