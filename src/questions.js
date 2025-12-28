// questions.js
// 提供共用題庫產生器與抽題功能

export default function Questions(){
  const bank = [];
  // 加法 8 題
  for(let i=0;i<8;i++){ const a=randomInt(0,10); const b=randomInt(0,10); bank.push({type:'add', a,b, answer:a+b, text:`${a} + ${b} = ?`}); }
  // 減法 7 題 (不為負數)
  for(let i=0;i<7;i++){ const a=randomInt(0,10); const b=randomInt(0,a); bank.push({type:'sub', a,b, answer:a-b, text:`${a} - ${b} = ?`}); }
  // 乘法 5 題 (1~5)
  for(let i=0;i<5;i++){ const a=randomInt(1,5); const b=randomInt(1,5); bank.push({type:'mul', a,b, answer:a*b, text:`${a} × ${b} = ?`}); }

  function randomInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min }
  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } }

  return {
    all(){ return bank.slice() },
    pickRandom(n=5, type='mixed'){
      const pool = (type==='mixed')? bank.slice() : bank.filter(q=>q.type===type);
      shuffle(pool);
      return pool.slice(0, Math.min(n,pool.length));
    }
  };
}
