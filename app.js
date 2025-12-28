// app.js — SPA control, video panel, simple games & quiz
(function(){
  // helper
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  // sections
  const sections = { home:qs('#home'), videos:qs('#videos'), play:qs('#play'), quiz:qs('#quiz') };
  function showSection(name){ Object.values(sections).forEach(s=>s.classList.remove('active')); sections[name].classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
  // keep track of when homepage is active so background digits only interact there
  function showSection(name){ Object.values(sections).forEach(s=>s.classList.remove('active')); sections[name].classList.add('active');
    document.body.classList.toggle('home-active', name==='home');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // background digits
  const bg = qs('#bg-numbers');
  const digits = '0123456789'.split('');
  for(let i=0;i<20;i++){
    const el = document.createElement('div'); el.className='bg-digit'; el.textContent = digits[Math.floor(Math.random()*digits.length)];
    const left = Math.random()*100; const top = Math.random()*100; const size = 32 + Math.random()*80;
    el.style.left = left+'%'; el.style.top = top+'%'; el.style.fontSize = size+'px'; el.style.animation = `floaty ${6+Math.random()*8}s ease-in-out ${Math.random()*3}s infinite`;
    bg.appendChild(el);
    // click: only trigger when homepage is active; add class to trigger CSS animation, then remove on animationend
    el.addEventListener('click', ()=>{
      if(!document.body.classList.contains('home-active')) return;
      el.classList.add('bg-click');
      el.addEventListener('animationend', ()=> el.classList.remove('bg-click'), {once:true});
    });
    // keyboard accessibility (only act when homepage active)
    el.addEventListener('keydown', e=>{ if((e.key==='Enter' || e.key===' ') && document.body.classList.contains('home-active')){ e.preventDefault(); el.click(); }});
  }

  // nav buttons
  qs('#btn-videos').addEventListener('click', ()=> showSection('videos'));
  qs('#btn-play').addEventListener('click', ()=> showSection('play'));
  qs('#btn-quiz').addEventListener('click', ()=> showSection('quiz'));
  qsa('.back-btn').forEach(b=>b.addEventListener('click', ()=> showSection('home')));

  // Role & progress keys
  const ROLE_KEY = 'math_user_role_v1';
  const PROG_KEY = 'math_student_progress_v1';
  let userRole = localStorage.getItem(ROLE_KEY) || '';
  // progress: { watched: [id], games: {add:false,sub:false,mul:false} }
  function loadProgress(){ try{ return JSON.parse(localStorage.getItem(PROG_KEY))||{watched:[],games:{add:false,sub:false,mul:false}} }catch(e){ return {watched:[],games:{add:false,sub:false,mul:false}} } }
  function saveProgress(p){ localStorage.setItem(PROG_KEY, JSON.stringify(p)); }
  let progress = loadProgress();

  // role modal elements
  const roleModal = qs('#role-modal');
  const roleStudent = qs('#role-student');
  const roleTeacher = qs('#role-teacher');

  function showRoleModal(show){ if(!roleModal) return; roleModal.style.display = show? 'flex' : 'none'; }

  function setRole(r){ userRole = r; localStorage.setItem(ROLE_KEY, r); showRoleModal(false); updateUnlockUI(); }

  if(!userRole){ // first time: show modal
    showRoleModal(true);
  } else {
    showRoleModal(false);
  }

  roleStudent && roleStudent.addEventListener('click', ()=>{ setRole('student'); showSection('home'); if(!progress) progress = loadProgress(); updateUnlockUI(); });
  roleTeacher && roleTeacher.addEventListener('click', ()=>{ setRole('teacher'); showSection('home'); updateUnlockUI(); });

  // reset to start: clear role & progress and show role modal
  const resetBtn = qs('#reset-role');
  function resetToStart(){
    if(!confirm('確定要從頭來過？這會清除目前身分與進度。')) return;
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(PROG_KEY);
    userRole = '';
    progress = {watched:[],games:{add:false,sub:false,mul:false}};
    showRoleModal(true);
    updateUnlockUI();
  }
  if(resetBtn) resetBtn.addEventListener('click', resetToStart);

  // UI helpers for locked buttons
  function setLocked(el, locked){ if(!el) return; if(locked){ el.classList.add('locked'); el.setAttribute('disabled','true'); if(!el.querySelector('.lock-icon')){ const ic=document.createElement('span'); ic.className='lock-icon'; ic.textContent='🔒'; el.appendChild(ic); } } else { el.classList.remove('locked'); el.removeAttribute('disabled'); const ic = el.querySelector('.lock-icon'); if(ic) ic.remove(); } }

  function allGamesComplete(){ return progress.games.add && progress.games.sub && progress.games.mul; }

  function updateUnlockUI(){
    // default: teacher has full access
    const btnPlay = qs('#btn-play'); const btnQuiz = qs('#btn-quiz');
    if(userRole==='teacher'){
      setLocked(btnPlay,false); setLocked(btnQuiz,false);
      qsa('.level-card').forEach(c=> c.classList.remove('locked'));
      return;
    }
    // student
    const watchedCount = (progress.watched||[]).length;
    // before watching 2 videos: lock play & quiz
    if(watchedCount < 2){ setLocked(btnPlay,true); setLocked(btnQuiz,true); qsa('.level-card').forEach(c=> c.classList.add('locked')); }
    else {
      // unlock play, quiz only when all games complete
      setLocked(btnPlay,false);
      if(allGamesComplete()){ setLocked(btnQuiz,false); } else { setLocked(btnQuiz,true); }
      // level-cards unlocked for play
      qsa('.level-card').forEach(c=> c.classList.remove('locked'));
    }
  }

  // record video watch (unique)
  function recordVideoWatch(id){ if(!id) return; progress = loadProgress(); if(!progress.watched) progress.watched = []; if(progress.watched.indexOf(id)===-1){ progress.watched.unshift(id); saveProgress(progress); // if student, check unlock
      if(userRole==='student'){ if(progress.watched.length===2){ // unlocked play
          updateUnlockUI(); showUnlockToast('🎉 已觀看 2 支影片，解鎖「開始遊玩」！'); bigCelebrate(qs('#video-area')||qs('#home'), 20, '解鎖：開始遊玩'); }
        else updateUnlockUI(); }
    }
  }

  // record game completion
  function recordGameComplete(name){ if(!name) return; progress = loadProgress(); if(!progress.games) progress.games = {add:false,sub:false,mul:false}; if(!progress.games[name]){ progress.games[name]=true; saveProgress(progress); if(userRole==='student'){ if(allGamesComplete()){ updateUnlockUI(); showUnlockToast('🎉 恭喜完成所有遊戲，解鎖「隨堂小考」！'); bigCelebrate(qs('#game-area')||qs('#home'), 28, '解鎖：隨堂小考'); } else { updateUnlockUI(); } } } }

  // show small unlock toast
  function showUnlockToast(text){ const t = document.createElement('div'); t.className='unlock-toast'; t.textContent = text || '已解鎖新的內容！'; document.body.appendChild(t); setTimeout(()=> t.style.opacity=1,20); setTimeout(()=> { t.style.opacity=0; setTimeout(()=> t.remove(),400); },2200); }

  // initial UI update
  updateUnlockUI();

  // Videos panel
  const videoData = {
    // 基本分類（數字歌）只保留單一影片（使用指定 YouTube ID）
    basic: [ {id:'T-o5HQfrKyI', title:'數字歌', desc:'數字歌影片'} ],
    sub: [ {id:'nyKtfc2Dw-o', title:'減法趣味教學', desc:'圖像化減法'}, {id:'yXzuadEnJr0', title:'加減複習', desc:'回顧基礎'} ],
    mul: [ {id:'50vbtzMOGeM', title:'乘法概念影片1', desc:'乘法直觀教學'}, {id:'jydiWPCKDC4', title:'乘法練習影片2', desc:'乘法闖關'} ]
  };

  function renderVideos(cat){
    const area = qs('#video-area'); area.innerHTML = '';
    (videoData[cat]||[]).forEach(v=>{
      const card = document.createElement('div'); card.className='vcard';
      const thumb = document.createElement('div'); thumb.className='video-thumb';
      const img = document.createElement('img'); img.src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
      thumb.appendChild(img);
      const overlay = document.createElement('div'); overlay.className='play-overlay'; overlay.textContent='▶'; thumb.appendChild(overlay);
      card.appendChild(thumb);
      const h = document.createElement('h4'); h.textContent = v.title; card.appendChild(h);
      const p = document.createElement('p'); p.textContent = v.desc; card.appendChild(p);
      area.appendChild(card);

      // click to load iframe
      thumb.addEventListener('click', ()=>{
        // record that user actually clicked to watch this video
        try{ recordVideoWatch(v.id); }catch(e){}
        thumb.innerHTML='';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${v.id}?rel=0&autoplay=1`;
        iframe.style.position='absolute'; iframe.style.top=0; iframe.style.left=0; iframe.style.width='100%'; iframe.style.height='100%'; iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'); iframe.allowFullscreen=true;
        thumb.appendChild(iframe);
      });
    });
  }

  qsa('.cat-btn').forEach(b=> b.addEventListener('click', ()=>{
    qsa('.cat-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderVideos(b.dataset.cat);
  }));
  // initial
  renderVideos('basic');

  // Games: simple add/sub/mul levels
  qsa('.level-card').forEach(card=> card.addEventListener('click', ()=> startGame(card.dataset.mode)));

  function startGame(mode){
    const area = qs('#game-area'); area.innerHTML = '';
    const header = document.createElement('div'); header.className='game-header'; header.innerHTML = `<h4>關卡：${mode === 'add' ? '加法' : mode==='sub'?'減法':'乘法'}</h4>`;
    area.appendChild(header);

    // generate question and interactive UI per mode
    if(mode === 'add') buildAddGame(area);
    else if(mode === 'sub') buildSubGame(area);
    else if(mode === 'mul') buildMulGame(area);
    else if(mode === 'challenge') buildChallenge(area);
  }

  // Add game (re-uses toggle candy behaviour)
  function buildAddGame(container){
    const feedback = document.createElement('div'); feedback.className='feedback'; container.appendChild(feedback);
    const hint = document.createElement('div'); hint.className='hint'; container.appendChild(hint);
    const candiesRow = document.createElement('div'); candiesRow.className='candies'; container.appendChild(candiesRow);
    const ctrl = document.createElement('div'); ctrl.className='controls'; ctrl.style.display='flex'; ctrl.style.justifyContent='center'; ctrl.style.gap='12px'; ctrl.style.marginTop='12px';
    const basket = document.createElement('div'); basket.className='basket'; basket.textContent = '已放入 0'; ctrl.appendChild(basket);
    const submit = document.createElement('button'); submit.className='btn-primary'; submit.textContent='提交答案'; ctrl.appendChild(submit);
    const nextBtn = document.createElement('button'); nextBtn.className='btn-secondary'; nextBtn.textContent='下一題'; nextBtn.style.marginLeft='8px'; ctrl.appendChild(nextBtn);
    container.appendChild(ctrl);

    let count = 0; let correct = 0;
    function renderOne(){
      feedback.textContent=''; candiesRow.innerHTML=''; count=0; basket.textContent='已放入 0';
      const a = Math.floor(Math.random()*8)+1; const b = Math.floor(Math.random()*8)+1; correct = a+b; hint.textContent = `請收集 ${a} 顆紅糖果和 ${b} 顆藍糖果`;
      const pool=[]; for(let i=0;i<a;i++) pool.push('red'); for(let i=0;i<b;i++) pool.push('blue'); const extra = Math.floor(Math.random()*4)+1; const colors=['red','blue','yellow']; for(let i=0;i<extra;i++) pool.push(colors[Math.floor(Math.random()*colors.length)]); pool.sort(()=>Math.random()-0.5);
      pool.forEach(col=>{
        const c = document.createElement('div'); c.className='candy '+col; c.tabIndex=0; candiesRow.appendChild(c);
        c.addEventListener('click', ()=> toggleCandy(c)); c.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleCandy(c); }});
      });
    }

    function toggleCandy(el){ const sel = el.classList.toggle('selected'); if(sel) count++; else count = Math.max(0,count-1); basket.textContent=`已放入 ${count}`; }

    submit.addEventListener('click', ()=>{
      if(count===correct){ feedback.textContent='答對了！太棒了～'; feedback.style.color='#2a9d50'; bigCelebrate(container, 20, '答對了！太棒了～'); try{ recordGameComplete('add'); }catch(e){} }
      else{ feedback.textContent=`目前 ${count} 顆，答案是 ${correct} 顆，請再試一次。`; feedback.style.color='#e15241'; }
    });
    nextBtn.addEventListener('click', ()=>{ renderOne(); });

    renderOne();
  }

  function buildSubGame(container){
    const hint = document.createElement('div'); hint.className='hint'; hint.textContent='減法任務：戳破你不想要的氣球，留下目標數量吧！'; container.appendChild(hint);
    const whiteboard = document.createElement('div'); whiteboard.className='whiteboard'; container.appendChild(whiteboard);
    const areaWrap = document.createElement('div'); areaWrap.className='celebrate-area'; container.appendChild(areaWrap);
    const row = document.createElement('div'); row.className='balloon-row'; areaWrap.appendChild(row);

    let target = 0, total = 0;
    function renderBalloons(){
      row.innerHTML = '';
      // generate A - B style: start with A 顆，去掉 B 顆，請留下 A - B 的氣球
      const A = 3 + Math.floor(Math.random()*7); // 3..9
      const B = 1 + Math.floor(Math.random()*Math.min(4, A-1)); // 1..min(4,A-1)
      total = A; target = A - B;
      whiteboard.innerHTML = `<div class="wb-title">題目</div><div class="wb-content">請留下 <strong>${A} - ${B}</strong> 的氣球</div>`;
      for(let i=0;i<total;i++){
        const b = document.createElement('div'); b.className='balloon'; b.textContent = i+1; b.tabIndex=0; row.appendChild(b);
        b.addEventListener('click', ()=>{ b.classList.toggle('popped'); });
        b.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); b.click(); }});
      }
    }
    renderBalloons();

    const ctrl = document.createElement('div'); ctrl.style.textAlign='center'; ctrl.style.marginTop='12px';
    const check = document.createElement('button'); check.className='btn-primary'; check.textContent='檢查答案'; ctrl.appendChild(check);
    const refresh = document.createElement('button'); refresh.className='refresh-btn'; refresh.textContent='重新產生'; refresh.style.marginLeft='8px'; ctrl.appendChild(refresh);
    const nextBtn = document.createElement('button'); nextBtn.className='btn-secondary'; nextBtn.textContent='下一題'; nextBtn.style.marginLeft='8px'; ctrl.appendChild(nextBtn);
    container.appendChild(ctrl);
    const msg = document.createElement('div'); msg.className='encouragement'; container.appendChild(msg);

    check.addEventListener('click', ()=>{
      const remaining = Array.from(row.children).filter(x=>!x.classList.contains('popped')).length;
      if(remaining===target){ msg.textContent='太棒了！你成功留下目標數量！'; msg.style.color='var(--primary)'; bigCelebrate(areaWrap, 28, '太棒了！成功留下 '+target+' 顆！'); try{ recordGameComplete('sub'); }catch(e){} }
      else{ msg.textContent=`再試一次：目標是 ${target} 顆，目前還剩 ${remaining} 顆`; msg.style.color='#e15241'; }
    });

    refresh.addEventListener('click', ()=>{ renderBalloons(); msg.textContent=''; });
    nextBtn.addEventListener('click', ()=>{ renderBalloons(); msg.textContent=''; });
  }

  function buildMulGame(container){
    const hint = document.createElement('div'); hint.className='hint'; container.appendChild(hint);
    const rows = 2 + Math.floor(Math.random()*4); const per = 2 + Math.floor(Math.random()*4);
    const animalPool = ['🐶','🐱','🐭','🐰','🐼','🦊','🐻','🐵'];
    const animal = animalPool[Math.floor(Math.random()*animalPool.length)];
    hint.textContent = `數一數：下面有 ${rows} 列，每列 ${per} 隻，總共有幾隻？`;

    const gridWrap = document.createElement('div'); gridWrap.className='animal-grid-wrap'; gridWrap.style.marginTop='12px'; container.appendChild(gridWrap);
    const grid = document.createElement('div'); grid.className='animal-grid'; grid.style.display='grid'; grid.style.gridTemplateColumns = `repeat(${per}, auto)`; grid.style.gap='8px'; grid.style.justifyContent='center'; gridWrap.appendChild(grid);
    const cells = [];
    for(let i=0;i<rows*per;i++){
      const a = document.createElement('div'); a.className='animal'; a.textContent = animal; a.style.width='52px'; a.style.height='52px'; a.style.borderRadius='8px'; a.style.display='flex'; a.style.alignItems='center'; a.style.justifyContent='center'; a.style.fontSize='26px'; a.style.boxShadow='0 8px 18px rgba(0,0,0,0.06)'; a.style.opacity='0.95'; grid.appendChild(a); cells.push(a);
    }

    // factor slots
    const answerWrap = document.createElement('div'); answerWrap.className='mul-answer'; answerWrap.style.marginTop='14px'; answerWrap.style.textAlign='center';
    answerWrap.innerHTML = `<div class="wb-content">請拖曳兩個數字到空格，表示幾乘幾：</div>`;
    const slots = document.createElement('div'); slots.className='factor-slots'; slots.style.display='inline-flex'; slots.style.gap='8px'; slots.style.marginLeft='8px'; answerWrap.appendChild(slots);
    const slotA = document.createElement('div'); slotA.className='factor-slot'; slotA.textContent='＿'; slotA.style.minWidth='44px'; slotA.style.height='44px'; slotA.style.border='2px dashed #ccc'; slotA.style.display='inline-flex'; slotA.style.alignItems='center'; slotA.style.justifyContent='center'; slotA.style.fontSize='20px'; slotA.style.borderRadius='6px'; slotA.tabIndex=0; slots.appendChild(slotA);
    const times = document.createElement('div'); times.textContent=' × '; times.style.display='inline-flex'; times.style.alignItems='center'; times.style.justifyContent='center'; slots.appendChild(times);
    const slotB = document.createElement('div'); slotB.className='factor-slot'; slotB.textContent='＿'; slotB.style.minWidth='44px'; slotB.style.height='44px'; slotB.style.border='2px dashed #ccc'; slotB.style.display='inline-flex'; slotB.style.alignItems='center'; slotB.style.justifyContent='center'; slotB.style.fontSize='20px'; slotB.style.borderRadius='6px'; slotB.tabIndex=0; slots.appendChild(slotB);
    container.appendChild(answerWrap);

    // digits palette (1-9)
    const palette = document.createElement('div'); palette.className='digit-palette'; palette.style.display='flex'; palette.style.justifyContent='center'; palette.style.gap='8px'; palette.style.marginTop='12px';
    for(let d=1;d<=9;d++){ const dt = document.createElement('div'); dt.className='digit-tile'; dt.textContent = String(d); dt.draggable=true; dt.style.width='36px'; dt.style.height='36px'; dt.style.borderRadius='6px'; dt.style.display='flex'; dt.style.alignItems='center'; dt.style.justifyContent='center'; dt.style.background='#fff'; dt.style.boxShadow='0 6px 14px rgba(0,0,0,0.06)'; dt.style.cursor='grab'; dt.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', String(d)); }); palette.appendChild(dt); }
    container.appendChild(palette);

    [slotA, slotB].forEach(sp=>{
      sp.addEventListener('dragover', e=>{ e.preventDefault(); sp.style.borderColor='var(--primary)'; });
      sp.addEventListener('dragleave', e=>{ sp.style.borderColor='#ccc'; });
      sp.addEventListener('drop', e=>{ e.preventDefault(); sp.style.borderColor='#ccc'; const val = e.dataTransfer.getData('text/plain'); sp.textContent = val; updatePreview(); });
      sp.addEventListener('keydown', e=>{ if(e.key==='Backspace' || e.key==='Delete'){ sp.textContent='＿'; updatePreview(); } });
    });

    function getFactors(){ const a = slotA.textContent.trim(); const b = slotB.textContent.trim(); const na = Number(a)||0; const nb = Number(b)||0; return [na, nb]; }
    function updatePreview(){ const [fa, fb] = getFactors(); const val = (fa>0 && fb>0)? (fa*fb):0; cells.forEach((c,i)=>{ if(i<val) c.style.opacity=1; else c.style.opacity=0.18; }); }

    const ctrl = document.createElement('div'); ctrl.style.textAlign='center'; ctrl.style.marginTop='12px';
    const submit = document.createElement('button'); submit.className='btn-primary'; submit.textContent='提交'; ctrl.appendChild(submit);
    const clear = document.createElement('button'); clear.className='btn-secondary'; clear.textContent='清除'; clear.style.marginLeft='8px'; ctrl.appendChild(clear);
    const nextBtn = document.createElement('button'); nextBtn.className='btn-secondary'; nextBtn.textContent='下一題'; nextBtn.style.marginLeft='8px'; ctrl.appendChild(nextBtn);
    container.appendChild(ctrl);

    function statusMessage(t){ let s = container.querySelector('.mul-status'); if(!s){ s = document.createElement('div'); s.className='mul-status encouragement'; s.style.marginTop='10px'; container.appendChild(s); } s.textContent = t; }

    submit.addEventListener('click', ()=>{
      const [fa, fb] = getFactors(); const correctA = rows; const correctB = per; const correct = rows*per;
      const matched = (fa===correctA && fb===correctB) || (fa===correctB && fb===correctA);
      if(matched){ bigCelebrate(container, 36, '太棒了！答對了！總共有 '+correct+' 隻！'); try{ recordGameComplete('mul'); }catch(e){} }
      else{ statusMessage('再試一次：正確是 '+correct+'（'+correctA+' × '+correctB+'），你輸入 '+(fa||0)+' × '+(fb||0)); }
    });
    clear.addEventListener('click', ()=>{ slotA.textContent='＿'; slotB.textContent='＿'; updatePreview(); });
    nextBtn.addEventListener('click', ()=>{ container.innerHTML=''; buildMulGame(container); });
  }

  // helper: launch confetti pieces inside target (simple)
  function launchConfetti(target, n){
    const wrap = (typeof target === 'string')? qs(target) : target;
    if(!wrap) return;
    wrap.style.position = wrap.style.position || 'relative';
    for(let i=0;i<n;i++){
      const c = document.createElement('div'); c.className='confetti-piece';
      const colors = ['#FF9AA2','#FFD27F','#86D4FF','#BDF2D5','#FFEE93','#C6F6D5'];
      c.style.background = colors[Math.floor(Math.random()*colors.length)];
      const size = 8 + Math.random()*18; c.style.width = size+'px'; c.style.height = size*0.6+'px'; c.style.borderRadius='2px';
      c.style.position='absolute'; c.style.left = (10+Math.random()*80)+'%'; c.style.top = ( -10 + Math.random()*20)+'%'; c.style.opacity = 0.95; c.style.transform = `rotate(${Math.random()*360}deg)`;
      c.style.transition = `transform 900ms ease-out, top 1200ms ease-in, opacity 1200ms ease`; 
      wrap.appendChild(c);
      // animate drop
      requestAnimationFrame(()=>{ c.style.top = (40+Math.random()*50)+'%'; c.style.transform = `translateY(40px) rotate(${Math.random()*720}deg)`; c.style.opacity = 1; });
      setTimeout(()=> c.remove(), 1600 + Math.random()*600);
    }
  }

  // bigger celebration: confetti + big message
  function bigCelebrate(target, count, text){
    const wrap = (typeof target === 'string')? qs(target) : target;
    if(!wrap) return;
    // larger confetti burst
    launchConfetti(wrap, Math.max(20, count));
    launchConfetti(wrap, Math.max(12, Math.floor(count/2)));
    // banner message
    const banner = document.createElement('div'); banner.className='big-banner'; banner.textContent = text || '太棒了！';
    banner.style.position='absolute'; banner.style.left='50%'; banner.style.top='10%'; banner.style.transform='translateX(-50%)'; banner.style.background='linear-gradient(90deg,#FFD27F,#FF9AA2)'; banner.style.padding='12px 20px'; banner.style.borderRadius='12px'; banner.style.boxShadow='0 12px 30px rgba(0,0,0,0.18)'; banner.style.color='#222'; banner.style.fontSize='18px'; banner.style.zIndex=9999; banner.style.opacity=0; wrap.appendChild(banner);
    requestAnimationFrame(()=>{ banner.style.transition='opacity 400ms, transform 400ms'; banner.style.opacity=1; banner.style.transform='translateX(-50%) translateY(0) scale(1)'; });
    setTimeout(()=>{ banner.style.opacity=0; setTimeout(()=> banner.remove(),500); }, 1800);
  }

  // Challenge mode: 三個小遊戲連續挑戰
  function buildChallenge(container){
    const modes = ['add','sub','mul']; let idx=0; let score=0;
    const hdr = document.createElement('div'); hdr.className='challenge-hdr'; hdr.innerHTML=`<h4>闖關賽（共 ${modes.length} 關）</h4>`; container.appendChild(hdr);
    const status = document.createElement('div'); status.className='challenge-status'; status.style.marginBottom='8px'; container.appendChild(status);
    const area = document.createElement('div'); area.className='challenge-area'; container.appendChild(area);

    function next(){
      area.innerHTML=''; status.textContent = `第 ${idx+1} / ${modes.length} 關： ${modes[idx]}`;
      const mode = modes[idx];
      if(mode==='add') renderAddChallenge(area, resultHandler);
      else if(mode==='sub') renderSubChallenge(area, resultHandler);
      else renderMulChallenge(area, resultHandler);
    }
    function resultHandler(correct){ if(correct) score++; idx++; if(idx<modes.length) next(); else finish(); }

    // small add challenge
    function renderAddChallenge(root, cb){
      const feedback = document.createElement('div'); feedback.className='feedback'; root.appendChild(feedback);
      const hint = document.createElement('div'); hint.className='hint'; root.appendChild(hint);
      const poolRow = document.createElement('div'); poolRow.className='candies'; root.appendChild(poolRow);
      const ctrl = document.createElement('div'); ctrl.style.textAlign='center'; ctrl.style.marginTop='10px'; const basket = document.createElement('div'); basket.className='basket'; basket.textContent='已放入 0'; ctrl.appendChild(basket);
      const submit = document.createElement('button'); submit.className='btn-primary'; submit.textContent='完成並下一關'; ctrl.appendChild(submit); root.appendChild(ctrl);
      const a = Math.floor(Math.random()*6)+1; const b = Math.floor(Math.random()*6)+1; const correct = a+b; hint.textContent=`請收集 ${a} 顆紅糖果與 ${b} 顆藍糖果`;
      const pool=[]; for(let i=0;i<a;i++) pool.push('red'); for(let i=0;i<b;i++) pool.push('blue'); for(let i=0;i<Math.floor(Math.random()*3)+1;i++) pool.push('yellow'); pool.sort(()=>Math.random()-0.5);
      let cnt=0; pool.forEach(col=>{ const c=document.createElement('div'); c.className='candy '+col; c.tabIndex=0; poolRow.appendChild(c); c.addEventListener('click', ()=>{ c.classList.toggle('selected'); cnt = Array.from(poolRow.querySelectorAll('.selected')).length; basket.textContent='已放入 '+cnt; }); });
      submit.addEventListener('click', ()=>{ const ok = cnt===correct; if(ok) bigCelebrate(root,22,'太棒了！加法關過關'); else { root.querySelector('.feedback').textContent=`本關答案是 ${correct}`; } cb(ok); });
    }

    // small sub challenge
    function renderSubChallenge(root, cb){
      const white = document.createElement('div'); white.className='whiteboard'; root.appendChild(white);
      const areaWrap = document.createElement('div'); areaWrap.className='celebrate-area'; root.appendChild(areaWrap);
      const row = document.createElement('div'); row.className='balloon-row'; areaWrap.appendChild(row);
      const A = 4 + Math.floor(Math.random()*6); const B = 1 + Math.floor(Math.random()*Math.min(4,A-1)); const total = A; const target = A-B;
      white.innerHTML = `<div class="wb-title">題目</div><div class="wb-content">請留下 <strong>${A} - ${B}</strong> 的氣球</div>`;
      for(let i=0;i<total;i++){ const b=document.createElement('div'); b.className='balloon'; b.textContent=i+1; b.tabIndex=0; row.appendChild(b); b.addEventListener('click', ()=> b.classList.toggle('popped')); }
      const ctrl = document.createElement('div'); ctrl.style.textAlign='center'; ctrl.style.marginTop='10px'; const submit = document.createElement('button'); submit.className='btn-primary'; submit.textContent='完成並下一關'; ctrl.appendChild(submit); root.appendChild(ctrl);
      submit.addEventListener('click', ()=>{ const remaining = Array.from(row.children).filter(x=>!x.classList.contains('popped')).length; const ok = remaining===target; if(ok) bigCelebrate(root,24,'太棒了！減法關過關'); else root.appendChild(Object.assign(document.createElement('div'),{textContent:`本關答案是 ${target}`,className:'feedback'})); cb(ok); });
    }

    // small mul challenge
    function renderMulChallenge(root, cb){
      const rows = 2 + Math.floor(Math.random()*4); const per = 2 + Math.floor(Math.random()*4);
      const animalPool = ['🐶','🐱','🐭','🐰','🐼','🦊','🐻','🐵']; const animal = animalPool[Math.floor(Math.random()*animalPool.length)];
      const hint = document.createElement('div'); hint.className='hint'; hint.textContent=`下面有 ${rows} 列，每列 ${per} 隻，拖曳兩個數字表示幾乘幾`; root.appendChild(hint);
      const grid = document.createElement('div'); grid.className='animal-grid'; grid.style.display='grid'; grid.style.gridTemplateColumns=`repeat(${per}, auto)`; grid.style.gap='8px'; grid.style.justifyContent='center'; root.appendChild(grid);
      const cells=[]; for(let i=0;i<rows*per;i++){ const a=document.createElement('div'); a.className='animal'; a.textContent=animal; a.style.width='44px'; a.style.height='44px'; a.style.display='flex'; a.style.alignItems='center'; a.style.justifyContent='center'; a.style.fontSize='20px'; grid.appendChild(a); cells.push(a); }
      const slotsWrap = document.createElement('div'); slotsWrap.style.textAlign='center'; slotsWrap.style.marginTop='10px'; slotsWrap.innerHTML = `<div class="wb-content">請拖曳兩個數字到空格：</div>`; root.appendChild(slotsWrap);
      const slotA = document.createElement('div'); slotA.className='factor-slot'; slotA.textContent='＿'; slotA.style.display='inline-flex'; slotA.style.minWidth='36px'; slotA.style.height='36px'; slotA.style.border='2px dashed #ccc'; slotA.style.alignItems='center'; slotA.style.justifyContent='center'; slotsWrap.appendChild(slotA);
      const mulx = document.createElement('div'); mulx.textContent=' × '; slotsWrap.appendChild(mulx);
      const slotB = document.createElement('div'); slotB.className='factor-slot'; slotB.textContent='＿'; slotB.style.display='inline-flex'; slotB.style.minWidth='36px'; slotB.style.height='36px'; slotB.style.border='2px dashed #ccc'; slotB.style.alignItems='center'; slotB.style.justifyContent='center'; slotsWrap.appendChild(slotB);
      const palette = document.createElement('div'); palette.style.display='flex'; palette.style.justifyContent='center'; palette.style.gap='6px'; palette.style.marginTop='8px'; for(let d=1;d<=9;d++){ const dt=document.createElement('div'); dt.className='digit-tile'; dt.textContent=d; dt.draggable=true; dt.style.width='30px'; dt.style.height='30px'; dt.style.display='flex'; dt.style.alignItems='center'; dt.style.justifyContent='center'; dt.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', String(d))); palette.appendChild(dt); } root.appendChild(palette);
      [slotA, slotB].forEach(sp=>{ sp.addEventListener('dragover', e=>{ e.preventDefault(); sp.style.borderColor='var(--primary)'; }); sp.addEventListener('drop', e=>{ e.preventDefault(); sp.style.borderColor='#ccc'; sp.textContent = e.dataTransfer.getData('text/plain'); const fa=Number(slotA.textContent)||0; const fb=Number(slotB.textContent)||0; const val=(fa>0 && fb>0)?fa*fb:0; cells.forEach((c,i)=> c.style.opacity = (i<val)?1:0.18); }); });
      const ctrl = document.createElement('div'); ctrl.style.textAlign='center'; ctrl.style.marginTop='10px'; const submit = document.createElement('button'); submit.className='btn-primary'; submit.textContent='完成並下一關'; ctrl.appendChild(submit); root.appendChild(ctrl);
      submit.addEventListener('click', ()=>{ const fa=Number(slotA.textContent)||0; const fb=Number(slotB.textContent)||0; const ok = (fa===rows && fb===per) || (fa===per && fb===rows); if(ok) bigCelebrate(root,26,'太棒了！乘法關過關'); else root.appendChild(Object.assign(document.createElement('div'),{textContent:`本關答案是 ${rows} × ${per}`,className:'feedback'})); cb(ok); });
    }

    function finish(){ area.innerHTML=''; const wrap = document.createElement('div'); wrap.style.textAlign='center'; const title = document.createElement('h3'); title.textContent = `闖關完成 ${score} / ${modes.length}`; wrap.appendChild(title); if(score===modes.length) bigCelebrate(container,48,'恭喜！全部通關！'); else if(score>=2) bigCelebrate(container,28,'不錯！通過多關！'); else bigCelebrate(container,16,'再努力！你做得到！'); const retry = document.createElement('button'); retry.className='btn-primary'; retry.textContent='再挑戰一次'; retry.addEventListener('click', ()=>{ idx=0; score=0; next(); }); wrap.appendChild(retry); area.appendChild(wrap); }

    next();
  }

  // Quiz logic (simple reuse)
  const questionBank = [];
  // build bank
  for(let i=0;i<8;i++){ const a=Math.floor(Math.random()*15); const b=Math.floor(Math.random()*10); questionBank.push({type:'add', a,b, answer:a+b, text:`${a} + ${b} = ?`}); }
  for(let i=0;i<7;i++){ const a=Math.floor(Math.random()*18); const b=Math.floor(Math.random()*(a+1)); questionBank.push({type:'sub', a,b, answer:a-b, text:`${a} - ${b} = ?`}); }
  for(let i=0;i<5;i++){ const a=1+Math.floor(Math.random()*5); const b=1+Math.floor(Math.random()*5); questionBank.push({type:'mul', a,b, answer:a*b, text:`${a} × ${b} = ?`}); }

  let quizPool=[], quizIdx=0, quizScore=0, quizSelected=[];
  let quizStartTime = 0;
  const ATTEMPTS_KEY = 'math_quiz_attempts_v1';

  qs('#quiz-start').addEventListener('click', ()=>{
    const type = qs('#quiz-type').value;
    const pool = (type==='mixed')?questionBank.slice():questionBank.filter(q=>q.type===type);
    pool.sort(()=>Math.random()-0.5); quizSelected = pool.slice(0,5); quizIdx=0; quizScore=0; quizStartTime = Date.now(); renderQuiz(); renderQuizHistory();
  });

  function loadAttempts(){ try{ return JSON.parse(localStorage.getItem(ATTEMPTS_KEY)||'[]'); }catch(e){ return []; } }
  function saveAttempt(score,total,duration){ const list = loadAttempts(); list.unshift({ts:Date.now(),score,total,duration}); localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list.slice(0,10))); renderQuizHistory(); }
  function renderQuizHistory(){ const panel = qs('.quiz-panel'); if(!panel) return; let hist = panel.querySelector('.quiz-history'); if(!hist){ hist = document.createElement('div'); hist.className='quiz-history'; hist.innerHTML='<h4>作答紀錄</h4>'; panel.appendChild(hist); }
    hist.innerHTML = '<h4>作答紀錄</h4>';
    // clear button
    const clearBtn = document.createElement('button'); clearBtn.className = 'btn-secondary'; clearBtn.textContent = '清空紀錄'; clearBtn.style.marginTop = '8px'; clearBtn.addEventListener('click', ()=>{
      if(!confirm('確定要清空所有作答紀錄嗎？')) return;
      localStorage.removeItem(ATTEMPTS_KEY);
      renderQuizHistory();
    });
    hist.appendChild(clearBtn);

    const list = loadAttempts();
    if(!list.length) { hist.appendChild(Object.assign(document.createElement('div'),{textContent:'尚無紀錄'})); clearBtn.disabled = true; return; }
    list.forEach(it=>{ const d = new Date(it.ts); const item = document.createElement('div'); item.className='attempt-item'; item.innerHTML = `<strong>${d.toLocaleString()}</strong><div>得分：${it.score} / ${it.total}</div><small>耗時：${Math.round(it.duration/1000)} 秒</small>`; hist.appendChild(item); }); }

  function renderQuiz(){
    const stage = qs('#quiz-stage'); stage.innerHTML='';
    // ensure absolute overlays in stage work
    stage.style.position = stage.style.position || 'relative';
    if(!quizSelected.length) return;
    const q = quizSelected[quizIdx];
    const qbox = document.createElement('div'); qbox.className='question-box'; qbox.textContent = q.text; stage.appendChild(qbox);
    const ansRow = document.createElement('div'); ansRow.className='answer-row'; const input = document.createElement('input'); input.type='number'; input.style.padding='8px'; ansRow.appendChild(input);
    const btn = document.createElement('button'); btn.className='btn-primary'; btn.textContent='提交'; ansRow.appendChild(btn); stage.appendChild(ansRow);
    const fb = document.createElement('div'); fb.className='feedback'; stage.appendChild(fb);
    btn.addEventListener('click', ()=>{
      const val = input.value.trim(); if(!val){ fb.textContent='請輸入答案喔！'; return; }
      if(Number(val)===q.answer){ quizScore++; fb.textContent='答對了！'; fb.style.color='#2a9d50'; fb.className='encouragement'; const stageEl = qs('#quiz-stage'); launchConfetti(stageEl,12); }
      else{
        fb.textContent=`答案是 ${q.answer}，下題繼續加油！`; fb.style.color='#e15241';
        // show red X mark briefly
        const x = document.createElement('div'); x.className='x-mark'; x.textContent='✕'; stage.appendChild(x); requestAnimationFrame(()=> x.classList.add('show')); setTimeout(()=> x.remove(),900);
      }
      btn.textContent = (quizIdx<quizSelected.length-1)?'下一題':'看結果';
      btn.disabled=true; setTimeout(()=>{ if(quizIdx<quizSelected.length-1){ quizIdx++; renderQuiz(); } else showQuizResult(); },900);
    });
  }
  function showQuizResult(){
    const stage=qs('#quiz-stage'); stage.innerHTML='';
    // ensure stage can contain absolute celebration elements
    stage.style.position = stage.style.position || 'relative';
    const wrap = document.createElement('div'); wrap.style.textAlign='center';
    const title = document.createElement('h3'); title.textContent = `得分：${quizScore} / ${quizSelected.length}`; wrap.appendChild(title);
    const msg = document.createElement('p');
    if(quizScore===quizSelected.length){ msg.textContent='太棒了！全部答對，超級厲害！'; msg.className='encouragement'; }
    else if(quizScore>=Math.ceil(quizSelected.length*0.7)){ msg.textContent='不錯！表現很好，繼續挑戰下一次！'; msg.className='encouragement'; }
    else{ msg.textContent='加油！再多練習就會更棒！'; msg.className='encouragement'; msg.style.color='#e15241'; }
    wrap.appendChild(msg);
    const retry = document.createElement('button'); retry.className='btn-primary'; retry.id='quiz-retry'; retry.textContent='再做一次'; wrap.appendChild(retry);
    stage.appendChild(wrap);
    // save attempt (duration in ms)
    const duration = quizStartTime? (Date.now() - quizStartTime) : 0;
    saveAttempt(quizScore, quizSelected.length, duration);
    // trigger big celebration after element is in DOM so visuals position correctly
    if(quizScore===quizSelected.length) setTimeout(()=> bigCelebrate(stage,60,'太棒了！全部答對，超級厲害！'), 120);
    else if(quizScore>=Math.ceil(quizSelected.length*0.7)) setTimeout(()=> bigCelebrate(stage,36,'不錯！表現很好！'), 120);
    else setTimeout(()=> bigCelebrate(stage,16,'加油，下次更棒！'), 120);
    qs('#quiz-retry').addEventListener('click', ()=>{ quizIdx=0; quizScore=0; quizStartTime = Date.now(); renderQuiz(); });
  }

})();
