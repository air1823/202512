// 簡單共用 UI 函式
const UI = {
  showMessage(container, text, type='info'){
    const msg = document.createElement('div');
    msg.className = 'achieve';
    msg.textContent = text;
    container.prepend(msg);
    setTimeout(()=> msg.remove(), 2200);
  },
  showInlineFeedback(targetEl, text, ok=true){
    targetEl.textContent = text;
    targetEl.className = ok? 'feedback correct' : 'feedback wrong';
  }
  ,
  // 顯示簡單煙火特效（在 container 中間）
  showFirework(container){
    const wrap = document.createElement('div'); wrap.className = 'firework';
    const colors = ['#ffd27f','#ff9fb6','#7fd3ff','#86f3a9','#ffd1f0'];
    for(let i=0;i<18;i++){
      const s = document.createElement('div'); s.className='spark';
      s.style.background = colors[i % colors.length];
      // random position inside circle
      const angle = Math.random()*Math.PI*2; const r = 40 + Math.random()*80;
      s.style.left = `${120 + Math.cos(angle)*r}px`;
      s.style.top = `${120 + Math.sin(angle)*r}px`;
      s.style.animationDelay = `${Math.random()*120}ms`;
      wrap.appendChild(s);
    }
    container.appendChild(wrap);
    setTimeout(()=> wrap.remove(), 1100);
  },
  // 顯示短暫叉叉（錯誤提示）
  showCross(container){
    const x = document.createElement('div'); x.className='x-mark'; x.textContent='✕';
    container.appendChild(x);
    setTimeout(()=> x.remove(), 900);
  }
};

export default UI;

