# Capybara Chocolate Workshop

一款給台灣八、九年級學生玩的雙人數學遊戲。玩家在五分鐘內設計巧克力形狀，練習相似形與邊長比例。

根目錄的 `index.html` 直接載入遊戲，不另外建立網站首頁或主選單頁面；遊戲啟動後由 `GameScene` 開始。

## 開發

- `pnpm dev`：啟動本機開發伺服器
- `pnpm build`：建立部署用檔案
- `pnpm preview`：預覽部署用檔案

## GitHub Pages

GitHub Actions 會在推送到 `main` 分支後建置並發布遊戲。首次設定時，請在 repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。

部署建置會讀取 repository variable `VITE_APPS_SCRIPT_URL`，用來把學習紀錄送到 Apps Script。它是會出現在瀏覽器前端的公開網址，不是密鑰；任何人都可能直接呼叫這個 Apps Script 網址，因此它不能當作身分驗證或防止偽造紀錄的機制。遊戲開始前會告知玩家，學號、作答與提示使用情形會送到教師的課程學習紀錄試算表。若在本機開發，請在未提交的 `.env.local` 中設定同名變數；`.env.local` 已列入 `.gitignore`。

## 專案結構

- `index.html`：遊戲網頁入口與 Phaser 畫布容器
- `src/main.js`：載入樣式並啟動 Phaser
- `src/game/config.js`：遊戲尺寸、縮放方式與初始場景
- `src/game/scenes/`：遊戲場景；主要玩法從 `GameScene.js` 開始
- `src/game/entities/`：角色、敵人、道具等遊戲物件
- `src/game/systems/`：規則、進度、計分等共用系統
- `src/game/ui/`：遊戲內 HUD、提示與互動介面
- `src/game/data/learning/`：學習目標、題目、關卡與評量資料
- `public/assets/`：由 Phaser Loader 載入的圖片、音訊、字型與地圖；路徑會配合本機或 GitHub Pages 的部署位置
- `public/assets/kenney/<pack-slug>/`：每套 Kenney 素材各放一個資料夾，保留原始子資料夾與授權檔
- `docs/learning-design/`：學習目標與遊戲式學習設計紀錄
