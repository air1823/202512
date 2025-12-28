document.addEventListener('DOMContentLoaded', () => {
  // Buttons
  const btnVideos = document.getElementById('btn-videos');
  const btnPlay = document.getElementById('btn-play');
  const btnQuiz = document.getElementById('btn-quiz');

  const modalVideos = document.getElementById('modal-videos');
  const modalPlay = document.getElementById('modal-play');
  const modalQuiz = document.getElementById('modal-quiz');

  // Quiz elements
  const quizType = document.getElementById('quiz-type');
  const quizStart = document.getElementById('quiz-start');
  const quizIntro = document.getElementById('quiz-intro');
  const quizQuestion = document.getElementById('quiz-question');
  const quizResult = document.getElementById('quiz-result');
  const questionBox = document.getElementById('question-box');
  const answerInput = document.getElementById('answer-input');
  const answerSubmit = document.getElementById('answer-submit');
  const feedbackEl = document.getElementById('feedback');
  const currentNum = document.getElementById('current-num');
  const totalNum = document.getElementById('total-num');
  const resultScore = document.getElementById('result-score');
  const resultMessage = document.getElementById('result-message');
  const quizRetry = document.getElementById('quiz-retry');

  document.querySelectorAll('.close-btn').forEach(b => b.addEventListener('click', () => closeAllModals()));

  document.querySelectorAll('#modal-videos .option-btn').forEach(btn => btn.addEventListener('click', () => showPlaceholderVideo(btn.dataset.type)));
  document.querySelectorAll('#modal-play .option-btn').forEach(btn => btn.addEventListener('click', () => showPlaceholderGame(btn.dataset.type)));

  btnVideos.addEventListener('click', () => openModal(modalVideos));
  btnPlay.addEventListener('click', () => openModal(modalPlay));
  btnQuiz.addEventListener('click', () => openModal(modalQuiz));

  // Quiz flow
  let questionBank = generateQuestionBank();
  let selectedQs = [];
  let currentIndex = 0;
  let score = 0;
  const QUIZ_SIZE = 5;

  quizStart.addEventListener('click', () => startQuiz(quizType.value));
  answerSubmit.addEventListener('click', () => {
    if (answerSubmit.dataset.state === 'answer') submitAnswer();
    else if (answerSubmit.dataset.state === 'next') nextQuestion();
  });
  quizRetry.addEventListener('click', () => resetQuizUI());

  function openModal(modal){ modal.classList.remove('hidden'); }

  function closeAllModals(){
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    resetQuizUI();
    const modalContent = modalVideos.querySelector('.modal-content');
    modalContent.querySelector('.option-list')?.style.removeProperty('display');
    modalContent.querySelector('.modal-note')?.style.removeProperty('display');
  }

  function showPlaceholderVideo(type){
    const titleMap = {basic:'基礎加減法', song:'數字歌', mulfun:'乘法好好玩'};
    const descMap = {
      basic:['淺顯示範加法與減法概念，搭配圖像與動畫。','國小低年級'],
      song:['以歌曲與節奏幫助幼兒記住數字與基礎運算。','幼兒／國小低年級'],
      mulfun:['以趣味與實例示範乘法概念與練習。','國小中年級']
    };

    const modalContent = modalVideos.querySelector('.modal-content');


    modalContent.querySelector('.option-list')?.style.setProperty('display','none');
    modalContent.querySelector('.modal-note')?.style.setProperty('display','none');
    modalContent.querySelector('#modal-videos-body')?.remove();
    const h2 = modalContent.querySelector('#videos-title'); if(h2) h2.textContent = '影片教學 · ' + (titleMap[type] || '教學');

    // 範例影片
    const videosByType = {
      basic: [
        {id:'yXzuadEnJr0', src:'https://www.youtube.com/embed/yXzuadEnJr0', title:'中文基礎加減法教學'},
        {id:'nyKtfc2Dw-o', src:'https://www.youtube.com/embed/nyKtfc2Dw-o', title:'加減趣味教學'}
      ],
      song: [
        {id:'HIxr36qhjRQ', src:'https://www.youtube.com/embed/HIxr36qhjRQ', title:'Chinese for Kids 數學'}
      ],
      mulfun: [
        {id:'50vbtzMOGeM', src:'https://www.youtube.com/embed/50vbtzMOGeM', title:'乘法教學 1'},
        {id:'jydiWPCKDC4', src:'https://www.youtube.com/embed/jydiWPCKDC4', title:'乘法教學 2'}
      ]
    };
    const vids = videosByType[type] || videosByType['basic'];

    const style = `
      <style>
        #modal-videos-body{margin-top:12px}
        .videos{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .video-card{background:#fff;border-radius:8px;padding:8px}
        .video-wrapper{position:relative;padding-top:56.25%;overflow:hidden;border-radius:6px}
        .video-thumb{position:absolute;top:0;left:0;width:100%;height:100%;cursor:pointer}
        .video-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .play-btn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,0.9);border-radius:50%;width:48px;height:48px;border:none;font-size:18px}
        .desc{margin:8px 0 6px;color:#23303F}
        .tag{display:inline-block;background:#D6FFF2;padding:6px 8px;border-radius:999px}
        @media(max-width:640px){.videos{grid-template-columns:1fr}}
      </style>
    `;

    let html = style + '<div id="modal-videos-body"><div class="videos">';
    vids.forEach(v=>{
      const d = descMap[type] || ['教學影片','適合各年齡'];
      html += `
        <article class="video-card">
          <div class="video-wrapper">
            <div class="video-thumb" data-src="${v.src}" tabindex="0" aria-label="載入並播放：${v.title}">
              <img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="${v.title} 縮圖">
              <button class="play-btn" aria-hidden="true">▶</button>
            </div>
          </div>
          <p class="desc">${v.title}</p>
          <span class="tag">${d[1]}</span>
        </article>
      `;
    });
    html += '</div></div>';

    const footer = modalContent.querySelector('.modal-footer');
    if(!footer){ console.error('modal footer not found'); window.location.href='math-videos.html'; return; }
    footer.insertAdjacentHTML('beforebegin', html);
    modalContent.querySelectorAll('.video-thumb').forEach(thumb=>{
      const loadAndPlay = ()=>{
        const src = thumb.dataset.src; if(!src) return; const wrapper = thumb.closest('.video-wrapper'); wrapper.innerHTML = '';
        const iframe = document.createElement('iframe'); iframe.src = src+'?autoplay=1&rel=0'; iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.allowFullscreen = true; iframe.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;border:0;z-index:10'; wrapper.appendChild(iframe);
      };
      thumb.addEventListener('click', loadAndPlay);
      thumb.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){ e.preventDefault(); loadAndPlay(); } });
    });
    openModal(modalVideos);
  }

  function showPlaceholderGame(type){
    const titleMap = {add:'加法遊戲', sub:'減法遊戲', mul:'乘法遊戲'};
      // 取消阻斷式提示，改以非阻斷方式記錄或在 modal 中顯示簡短訊息
      const modalContent = modalPlay.querySelector('.modal-content');
      // 移除先前訊息元件（如有）
      modalContent.querySelector('.play-info')?.remove();
      // 插入簡短提示（非阻斷）並保留選單
      const info = document.createElement('div');
      info.className = 'play-info';
      info.style.marginTop = '8px';
      info.style.color = '#6b6b6b';
      info.textContent = `${titleMap[type] || '遊戲'}：功能將於後續版本加入。`;
      modalContent.querySelector('.modal-footer').insertAdjacentElement('beforebegin', info);
      console.log('showPlaceholderGame:', type);
  }

  // Quiz
  function generateQuestionBank(){
    const bank = [];
    for(let i=0;i<8;i++){ const a=randInt(0,15),b=randInt(0,10); bank.push({type:'add',a,b,answer:a+b,text:`${a} + ${b} = ?`}); }
    for(let i=0;i<7;i++){ const a=randInt(0,18),b=randInt(0,a); bank.push({type:'sub',a,b,answer:a-b,text:`${a} - ${b} = ?`}); }
    for(let i=0;i<5;i++){ const a=randInt(1,5),b=randInt(1,5); bank.push({type:'mul',a,b,answer:a*b,text:`${a} × ${b} = ?`}); }
    return bank;
  }

  function startQuiz(type){
    const pool = type==='mixed'?questionBank.slice():questionBank.filter(q=>q.type===type);
    shuffle(pool);
    selectedQs = pool.slice(0,Math.min(QUIZ_SIZE,pool.length));
    currentIndex=0; score=0; totalNum.textContent=selectedQs.length;
    showQuestion(0); quizIntro.classList.add('hidden'); quizQuestion.classList.remove('hidden');
    quizResult.classList.add('hidden'); answerSubmit.dataset.state='answer';
    feedbackEl.textContent=''; answerInput.value=''; answerInput.focus();
  }

  function showQuestion(i){
    const q=selectedQs[i]; questionBox.textContent=q.text;
    currentNum.textContent=i+1; feedbackEl.textContent=''; answerInput.value='';
    answerSubmit.textContent='提交'; answerSubmit.dataset.state='answer'; answerInput.focus();
  }

  function submitAnswer(){
    const val=answerInput.value.trim(); if(val===''){ feedbackEl.textContent='請輸入答案喔！'; feedbackEl.className='feedback wrong'; return; }
    const num=Number(val); const q=selectedQs[currentIndex];
    if(num===q.answer){ score+=1; feedbackEl.textContent='答對囉！很棒～'; feedbackEl.className='feedback correct'; }
    else{ feedbackEl.textContent=`答案是 ${q.answer}。再接再厲！`; feedbackEl.className='feedback wrong'; }
    answerSubmit.textContent=(currentIndex<selectedQs.length-1)?'下一題':'看結果';
    answerSubmit.dataset.state='next';
  }

  function nextQuestion(){ if(currentIndex<selectedQs.length-1){ currentIndex+=1; showQuestion(currentIndex); } else showResult(); }

  function showResult(){
    quizQuestion.classList.add('hidden'); quizResult.classList.remove('hidden');
    resultScore.textContent=`得分：${score} / ${selectedQs.length}`;
    let msg=''; if(score===selectedQs.length) msg='太棒了！全部答對！';
    else if(score>=Math.ceil(selectedQs.length*0.7)) msg='不錯！繼續加油！'; else msg='再練習就會更好，試著多做幾次！';
    resultMessage.textContent=msg;
  }

  function resetQuizUI(){
    quizIntro.classList.remove('hidden'); quizQuestion.classList.add('hidden'); quizResult.classList.add('hidden');
    feedbackEl.textContent=''; answerInput.value='';
  }

  // ------------------ Utilities ------------------
  function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }

});
