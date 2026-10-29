# 北護校園資訊整合平台 🏥

> **台北護理健康大學（NTUNHS）校園二手交易暨資訊交流平台**

一個專為北護學生打造的校園平台，提供二手商品交易、打工資訊分享、換課協調，以及校園即時通訊等功能。

---

## 🌟 功能特色

| 功能 | 描述 |
|------|------|
| 🛍️ 商品分類 | 瀏覽並搜尋二手商品，支援關鍵字、分類、價格篩選 |
| 🔍 圖片搜尋 | 上傳圖片以 AI 辨識找出相似商品 |
| 💼 打工資訊 | 校內工讀、校外兼職、實習機會一覽 |
| 📅 換課資訊 | 發布及搜尋課程時段交換需求 |
| 💬 私訊聊天 | 與賣家一對一即時聊天 |
| 👥 北護大群 | 全校公開討論群組 |
| 📝 發布貼文 | 發布商品、打工或換課資訊 |
| 👤 會員中心 | 管理我的貼文與收藏商品 |

---

## 🚀 快速開始

### 系統需求

- Node.js ≥ 16
- npm ≥ 8

### 安裝與啟動

```bash
# 1. 複製專案
git clone https://github.com/your-username/ntunhs-market.git
cd ntunhs-market

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm start
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 即可看到網站。

### 建置產品版本

```bash
npm run build
```

建置檔案會輸出到 `build/` 資料夾。

---

## 📁 專案結構

```
ntunhs-market/
├── public/
│   └── index.html          # HTML 入口
├── src/
│   ├── index.js            # React 掛載點
│   ├── index.css           # 全域樣式 & RWD
│   ├── App.jsx             # 主應用 & 路由切換
│   ├── data.js             # 模擬資料（可替換為 Firebase）
│   ├── components/
│   │   ├── Icons.jsx       # SVG 圖示元件
│   │   ├── Common.jsx      # 共用元件（Avatar, Badge, ProductCard）
│   │   ├── Navbar.jsx      # 導覽列（含 RWD 漢堡選單）
│   │   └── Footer.jsx      # 頁尾
│   └── pages/
│       ├── HomePage.jsx         # 首頁
│       ├── ProductListPage.jsx  # 商品列表
│       ├── ProductDetailPage.jsx# 商品詳情
│       ├── JobListPage.jsx      # 打工資訊
│       ├── CourseListPage.jsx   # 換課資訊
│       ├── CreatePostPage.jsx   # 發布貼文
│       ├── ChatPage.jsx         # 私訊聊天
│       ├── GroupChatPage.jsx    # 北護大群
│       ├── VisualSearchPage.jsx # 圖片搜尋
│       ├── AuthPages.jsx        # 登入 / 註冊
│       └── ProfilePage.jsx      # 會員中心
├── .gitignore
└── package.json
```

---

## 🛠️ 技術架構

- **前端框架**：React 18 + Create React App
- **狀態管理**：React Hooks（useState、useEffect、useRef）
- **樣式**：Inline Styles + CSS（無外部 UI 框架，輕量易擴充）
- **資料層**：Mock Data（`src/data.js`）⟶ 可接 Firebase Firestore
- **圖示**：自製 SVG 元件（無 CDN 依賴，可離線使用）
- **響應式**：CSS Media Query（`@media max-width: 768px`）

---

## 🔮 後續擴充計畫

- [ ] 串接 **Firebase Authentication**（真實登入驗證）
- [ ] 串接 **Firebase Firestore**（即時資料庫）
- [ ] 串接 **Firebase Storage**（圖片上傳儲存）
- [ ] 部署到 **Vercel** 或 **Firebase Hosting**（免費）
- [ ] 加入 **Google Vision API**（強化圖片搜尋）
- [ ] 推播通知（新訊息、商品成交）
- [ ] PWA 支援（加到手機主畫面）

---

## 📦 免費部署方式

### Vercel（推薦）

```bash
npm install -g vercel
vercel
```

### GitHub Pages

```bash
# 在 package.json 加入 "homepage": "https://username.github.io/ntunhs-market"
npm run build
npx gh-pages -d build
```

---

## 👩‍💻 開發者

**Linny** — 台北護理健康大學 專題製作  
指導教授：\_\_\_\_\_  
展示日期：**2026 年 11 月 24 日**

---

## 📄 授權

本專案僅供北護大學學術用途使用。  
© 2026 北護校園資訊整合平台。本平台僅限北護大學在學學生使用。
