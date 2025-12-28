// 綜合闖關：數學冒險島
// 關卡順序：加法 -> 減法 -> 乘法，每關需要完成指定題數才解鎖下一關

import Add from './addGame.js';
import Sub from './subGame.js';
import Mul from './mulGame.js';

const title = '數學冒險島';

function start(container, shared, onComplete){
  container.innerHTML = '';
  const header = document.createElement('div'); header.className='game-title'; header.textContent = title; container.appendChild(header);

  const map = document.createElement('div'); map.className='map';
  const nodes = ['加法關','減法關','乘法關'].map((t,i)=>{
    const n = document.createElement('div'); n.className='node'; n.innerHTML = `<strong>${t}</strong><div class="node-sub">未解鎖</div>`; if(i>0) n.classList.add('locked'); map.appendChild(n); return n;
  });
  container.appendChild(map);

  const status = document.createElement('div'); status.className='achieve'; status.textContent = '開始冒險：從加法關卡開始'; container.appendChild(status);

  // Flow control
  let current = 0;
  function unlock(i){ nodes[i].classList.remove('locked'); nodes[i].querySelector('.node-sub').textContent='已解鎖'; }

  function runLevel(i){
    const node = nodes[i];
    node.classList.add('active');
    node.querySelector('.node-sub').textContent='進行中...';
    const levelArea = document.createElement('div'); levelArea.style.marginTop='12px'; container.appendChild(levelArea);
    let module;
    if(i===0) module = Add; if(i===1) module = Sub; if(i===2) module = Mul;
    // start module inside levelArea; when completed, unlock next
    module.start(levelArea, shared, (res)=>{
      node.querySelector('.node-sub').textContent='完成！';
      shared.ui.showMessage(container, `${module.title} 完成！`);
      levelArea.remove();
      node.classList.remove('active');
      if(i < nodes.length-1){ unlock(i+1); status.textContent = `完成 ${i+1} 關，前往 ${['減法關','乘法關'][i]}！`; setTimeout(()=> runLevel(i+1), 800); }
      else { shared.ui.showMessage(container, '恭喜通關！取得冒險島成就！'); status.textContent='已通關：恭喜你！'; if(onComplete) onComplete({module:'adventure', result:true}); }
    });
  }

  // start first level
  setTimeout(()=> runLevel(0), 600);
}

export default { title, start };
