# 數學小課堂 — 模組化前端專案（延伸說明）

此檔為延伸說明，說明專案檔案結構、如何執行以及如何擴充模組。

專案檔案（重點）：

- `index.html`：主頁，包含三大功能按鈕（影片 / 開始遊玩 / 隨堂小考），以及一個 `app-area` 作為遊戲展示區。
- `style.css`：視覺樣式，包含遊戲元件（糖果、氣球、動物、地圖）的樣式。
- `src/main.js`：主控腳本，載入並啟動模組，提供 shared 資源給模組。
- `src/questions.js`：共用題庫產生器與抽題 API（pickRandom）。
- `src/ui.js`：簡單的共用 UI 函式（顯示短暫訊息與 inline 回饋）。
- `src/modules/addGame.js`：加法遊戲模組（糖果收集王）。
- `src/modules/subGame.js`：減法遊戲模組（氣球飛走了）。
- `src/modules/mulGame.js`：乘法遊戲模組（排隊小動物）。
- `src/modules/adventure.js`：綜合闖關模組，順序串接加/減/乘模組。
- `src/modules/quizGame.js`：遊戲化隨堂小考，隨機抽 5 題並計分。

如何執行：

1. 以瀏覽器開啟 `index.html`。
2. 或在 PowerShell 中啟動本地伺服器：

```powershell
cd 'C:\Users\USER\Downloads\20251217'
python -m http.server 8000
# 打開 http://localhost:8000
```

如何擴充模組：

- 每個模組放在 `src/modules/` 並 export default { title, start }
- `start(container, shared, onComplete)` 為模組啟動介面：
  - container：dom element，模組應把 UI 寫入此節點
  - shared：主控提供的共用資源（questions, ui 等）
  - onComplete：模組完成時呼叫的 callback，可帶結果物件

可改進項目（建議）：

- 將題庫移到 `questions.json` 或透過後端 API 管理，增加題目難度設定
- 在 `addGame` 中加入拖放支援（Drag & Drop API）提高互動性
- 對遊戲狀態加以 persist（localStorage）保存使用者進度與成就
- 美化介面、加入動畫與音效（使用 `libraries/p5.sound.min.js` 或 CSS/Audio API）

需要我幫忙的下一步：

- 把指定影片連結嵌入到「影片教學」模組（提供 YouTube 連結或檔案）
- 為某一遊戲加入拖放、計時、音效或更豐富的動畫
- 把題庫改成可由老師編輯的 JSON 編輯介面

請告訴我你接下來想優先做哪一項，我會直接實作。 
