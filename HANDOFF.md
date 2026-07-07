# 國二五科複習快測 PWA — HANDOFF

## 任務目標(一句話)
做一個手機優先的單頁 PWA,內建 108 課綱國二(八年級,八上+八下)五科題庫,讓孩子隨時抽 10 題快速測驗並追蹤弱點。

## 範圍
**做:**
- 靜態網頁,無後端。`index.html`(App)+ `data/*.js`(題庫,script tag 載入,離線可用)。
- 五科:國文、英文、數學、自然、社會。每科約 80 題(八上/八下各半,依 108 課綱單元分佈)。
- 測驗模式:選科目(可全選)→ 隨機抽 10 題 → 即時對錯回饋 + 詳解 → 成績結算。
- 錯題本:答錯自動收錄(localStorage),可單獨重測錯題,答對兩次自動移出。
- 進度統計:各科答題數、正確率,弱單元提示。
- PWA:manifest + service worker(cache-first),可加入主畫面、離線可用。
- 手機優先 UI(直式、大按鈕、單手可操作),深色系。

**不做:**
- 不接 Firebase / 登入(之後有需要再加)。
- 不併入 speed-training-base,不做 RPG 系統。
- 不 commit / push(等 Jason 驗收後決定)。

## 題庫資料格式(所有執行者必須遵守)
每科一個檔 `data/<key>.js`(UTF-8,無 BOM),內容:
```js
window.QB = window.QB || {};
window.QB["math"] = {
  key: "math",            // chinese|english|math|science|social
  subject: "數學",
  units: [
    {
      id: "m-8a-1",       // 科別碼-學期(8a=八上,8b=八下)-流水號
      name: "一元一次方程式的應用", // 依 108 課綱該科八年級實際單元命名
      semester: "8a",     // "8a" | "8b"
      questions: [
        {
          q: "題目文字(可含換行)",
          options: ["選項A","選項B","選項C","選項D"], // 恰好 4 個
          a: 2,            // 正解 index 0-3
          exp: "詳解,1-3 句,講清楚為什麼"
        }
      ]
    }
  ]
};
```

## 驗收標準
1. `data/` 五個科目檔各 ≥75 題,單元名稱符合 108 課綱八年級內容,八上/八下皆有覆蓋。
2. 每題恰 4 選項、`a` 在 0-3、有非空 `exp`;答案正確(審核抽查)。
3. 手機瀏覽器打開 index.html:選科 → 抽 10 題 → 作答 → 結算,全流程無 console error。
4. 答錯題進錯題本,重測錯題答對兩次後移出;重整頁面後錯題本仍在(localStorage)。
5. 統計頁顯示各科答題數與正確率。
6. manifest.json + service worker 存在,離線重載可用。
7. 版面在 375px 寬手機視窗無橫向捲動、按鈕可點擊區 ≥44px。

## 狀態(2026-07-07 完成)
- [x] 題庫 ×5:國文 80、英文 80、數學 80、自然 80、社會 81,共 401 題(機器驗證 schema 全過)
- [x] App 外殼:index.html + manifest.json + sw.js,APP_VERSION 1.0.1
- [x] 異質審核:Gemini 3.1 Pro 抽 75 題 + Codex 抽 60 題,內容僅 1 題爭議(秦嶺—淮河線雨量值),App 邏輯抓到 6 項問題
- [x] 仲裁與修正:7 項全修(秦嶺題改寫、錯題 id 改 qhash 穩定化+啟動清理、再測死按鈕、離開測驗 confirm、sw 改 addAll、進度條滿格)
- [x] 實測:375px 手機視窗全流程通過(選科→抽10題→作答→結算、錯題本答對2次移出、重整持久化、SW cache g8review-1.0.1、無 console error、無橫向捲動)

## 驗收標準逐條結果
1. 五科各 ≥75 題、課綱單元、雙學期覆蓋 → 通過
2. 選項/正解/詳解完整且正確 → 通過(雙模型抽查 135 題,1 題修正)
3. 手機全流程無 console error → 通過(實測)
4. 錯題本進出+持久化 → 通過(實測;id 已改 qhash 穩定制)
5. 統計頁 → 通過(實測)
6. manifest+SW 離線 → 通過(addAll precache,cache 名帶版本)
7. 375px 無橫向捲動、點擊區 ≥44px → 通過(實測 scrollWidth=375)

## 遺留事項
- 未 commit / 未部署(等 Jason 決定;建議上 GitHub Pages 新 repo)
- 事故記錄:初版 App 執行者曾用假資料覆蓋 math.js/chinese.js,已由 Codex/Claude 重建
- 秦嶺—淮河線雨量兩岸教材數值不同,題目已改寫為 750~800 區間
- 舊 localStorage(index 型錯題 id)會在啟動時自動清除,首次升級錯題本歸零屬預期
