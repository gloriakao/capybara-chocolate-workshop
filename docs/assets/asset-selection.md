# Kenney 素材初選紀錄

**狀態：** 三包素材已下載並保留授權檔；MVP 首版已選定並載入必要圖像。  
**來源：** Kenney 官方素材頁；三包頁面均標示 Creative Commons CC0，壓縮檔內也保留了各自的 `License.txt`。

## 已放入專案

| 素材包 | 專案位置 | 預覽 | 檔案類型 | 初選評估 |
|---|---|---|---|---|
| [Animal Pack Remastered](https://kenney.nl/assets/animal-pack-remastered) | `public/assets/kenney/animal-pack-remastered/` | [Preview.png](../../public/assets/kenney/animal-pack-remastered/Preview.png) | PNG、SVG、SWF、XML、DB、URL、TXT | 可愛的動物頭像與多種造型。已檢視圖檔名稱，沒有水豚素材；不拿其他動物代替水豚店長，可留作之後的顧客角色候選。 |
| [Platformer Art Candy](https://kenney.nl/assets/platformer-art-candy) | `public/assets/kenney/platformer-art-candy/` | [preview.png](../../public/assets/kenney/platformer-art-candy/preview.png) | PNG、SVG、SWF、TXT | 有蛋糕造型平台、糖果和棒棒糖等甜點圖像，適合少量工坊裝飾；它是平台遊戲圖塊，不是完整的巧克力工坊素材。 |
| [UI Pack](https://kenney.nl/assets/ui-pack) | `public/assets/kenney/ui-pack/` | [Preview.png](../../public/assets/kenney/ui-pack/Preview.png) | PNG、SVG、OGG、TTF、URL、TXT | 有按鈕、面板、滑桿等元件，提供多種顏色資料夾；MVP 使用 Yellow Default 按鈕。 |

## MVP 實際採用

- 水豚店長：[capybara.svg](../../public/assets/custom/capybara.svg)，專案原創向量圖，穿廚師帽與圍裙。
- 工坊裝飾：Candy 包的 `Tiles/choco.png`、`Tiles/candyRed.png`、`Tiles/lollipopWhiteGreen.png`；分別用於頁首巧克力圖示、巧克力裝飾和訂單畫面點綴。
- 主要按鈕：UI Pack 的 `PNG/Yellow/Default/button_rectangle_depth_flat.png`，以 Phaser 九切片顯示。
- 幾何巧克力模板和面板由 Phaser 圖形繪製；長方形維持 6:4 外觀比例，三角形維持 3:4:5 直角三角形，避免把平台圖塊誤當數學模板。
- Animal Pack Remastered 已檢視但沒有放入 MVP；其中找不到水豚圖檔。

## 未採用素材與取捨

- Animal Pack Remastered 暫不加入 MVP；其中沒有水豚，且目前核心流程不需要顧客角色。
- Candy 包的蛋糕平台圖塊不拿來當幾何模板；巧克力形狀由 Phaser 幾何圖形繪製，確保尺寸比例準確。
- UI Pack 目前只使用黃色主要按鈕；面板與輸入欄位由 Phaser 繪製，以維持尺寸標示清楚。

## 後續素材工作

1. 試玩首版後，再決定是否替水豚製作表情變化或補上工坊背景。
2. 若視覺回饋顯示 UI Pack 按鈕與 Candy 裝飾風格不一致，改以簡潔的原創色塊和幾何形狀統一畫面。
3. 迭代時每次只載入實際使用的圖像，不整包載入。

