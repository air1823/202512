// math-videos.js
// 實作：點擊縮圖後才插入 iframe 並自動播放（減少初始載入）
// - 支援鍵盤操作（Enter / Space）以提升無障礙性
// - 為簡潔起見，影片 src 放在 .video-thumb 的 data-src 屬性

document.addEventListener('DOMContentLoaded', function(){
  function createIframe(src){
    var iframe = document.createElement('iframe');
    iframe.src = src + (src.indexOf('?') === -1 ? '?rel=0&autoplay=1' : '&rel=0&autoplay=1');
    iframe.setAttribute('title','教學影片');
    iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen','');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.loading = 'lazy';
    return iframe;
  }

  document.querySelectorAll('.video-thumb').forEach(function(thumb){
    function loadAndPlay(){
      var src = thumb.getAttribute('data-src');
      if(!src) return;
      var wrapper = thumb.closest('.video-wrapper');
      if(!wrapper) return;
      // 使用 replace 方式確保容器只有 iframe
      wrapper.innerHTML = '';
      wrapper.appendChild(createIframe(src));
    }

    thumb.addEventListener('click', loadAndPlay);
    thumb.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        loadAndPlay();
      }
    });
  });
});