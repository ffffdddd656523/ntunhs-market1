/**
 * SeedTool.jsx — 一鍵種入展示資料
 *
 * 使用步驟：
 * 1. 把這個檔案放到 src/pages/SeedTool.jsx
 * 2. 在 App.jsx 加入：  import SeedTool from './pages/SeedTool';
 *    並在路由加一個 case 'seed': return <SeedTool />;
 * 3. 在網址列輸入 /seed，點「開始種入資料」按鈕
 * 4. 看到「✅ 完成！」之後把這個檔案和 App.jsx 裡的兩行刪掉
 */

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// ─── 種子商品資料 ──────────────────────────────────────────
const PRODUCTS = [
  { title:"護理師國考考古題全套（109-113年）", category:"書籍教材", price:350, condition:"良好", description:"五年份考古題，附詳解，很多筆記，對國考非常有幫助。", contact:"IG: nurs_exam_books", location:"護理館附近" },
  { title:"Littmann Classic III 聽診器（黑色）", category:"醫療器材", price:1200, condition:"9成新", description:"只用過一學期實習，附原廠收納袋，輕微使用痕跡。正常售價3000以上。", contact:"LINE: stethoscope_sell", location:"宿舍棟一樓" },
  { title:"解剖學原文書 Tortora 16th Edition", category:"書籍教材", price:500, condition:"良好", description:"英文版解剖學，有部分螢光筆畫線，不影響閱讀。護理/物治生必備。", contact:"FB Messenger 私訊", location:"圖書館對面" },
  { title:"白色護士鞋 Crocs（23.5cm）", category:"服裝配件", price:180, condition:"普通", description:"實習穿的 Crocs 護士鞋，洗過仍有些微污漬，但很舒適，腳寬的人很適合。", contact:"IG: crocs_nurse_shoes", location:"女宿舍" },
  { title:"HP 計算機（考試用，全新未拆）", category:"文具用品", price:90, condition:"全新", description:"買兩個只用一個，另一個全新未拆，適合統計學考試使用。", contact:"LINE: hp_calc_sell", location:"校本部" },
  { title:"iPad Air 5th（含 Apple Pencil）", category:"3C電子", price:14500, condition:"9成新", description:"護理紀錄、看片、做筆記都很方便，換新機所以出售。附鍵盤保護套。", contact:"IG: ipad_ntunhs", location:"捷運站附近面交" },
  { title:"實習白袍 M 號（北護專用）", category:"服裝配件", price:280, condition:"良好", description:"北護實習專用白袍，M號，洗過乾淨，有繡學號可遮掉。", contact:"LINE: whiteshirt_sell", location:"護理館2樓" },
  { title:"醫護英文單字書（全套3冊）", category:"書籍教材", price:200, condition:"良好", description:"含醫護英文基礎、進階和會話三冊，很多字都查過，適合備考英文課。", contact:"FB: 醫護英文二手書", location:"校內可面交" },
  { title:"MacBook Air M1（8GB/256GB，太空灰）", category:"3C電子", price:22000, condition:"9成新", description:"2021年購入，電池健康度94%，附充電器，效能超好跑 VSCode/Xcode 毫無壓力。", contact:"IG: macbook_ntunhs_sell", location:"捷運站面交" },
  { title:"骨骼模型（半身，實習練習用）", category:"醫療器材", price:600, condition:"良好", description:"解剖學練習用半身骨骼模型，可拆組，適合期末考前複習。", contact:"LINE: bones_model_sell", location:"護理館地下室" },
  { title:"Garmin Vivofit 4 智慧手環", category:"3C電子", price:400, condition:"8成新", description:"記步、睡眠監測，電池壽命超長（一年以上），換新款所以出售。", contact:"IG: garmin_sell", location:"宿舍可面交" },
  { title:"護理學原理與實務（中文版，最新版）", category:"書籍教材", price:420, condition:"良好", description:"最新版護理學教科書，有筆記和重點標示，考試前很有用。", contact:"LINE: nursing_book", location:"圖書館門口" },
];

// ─── 打工資料 ─────────────────────────────────────────────
const JOBS = [
  { title:"學校圖書館閱覽組工讀生", category:"校內工讀", location:"北護圖書館", salary:"190元/時", hours:"週一至週五 13:00-17:00，共4小時", description:"協助圖書上架、借還書作業、掃描文件等。工作輕鬆，適合想邊讀書邊打工的同學。", contact:"圖書館服務台直接詢問" },
  { title:"社區藥局藥師助理（士林區）", category:"校外兼職", location:"士林區文林路", salary:"200元/時", hours:"週六日 09:00-17:00", description:"協助藥品上架、包裝、客戶服務，需具備基礎醫藥常識，護理/醫管相關科系優先。", contact:"IG: pharmacy_part_time" },
  { title:"養護中心照服員（週末班）", category:"校外兼職", location:"北投區", salary:"220元/時", hours:"週六 08:00-16:00", description:"協助長者日常照護、陪伴、簡單復健活動。長照系、護理系優先，需接受基礎訓練。", contact:"LINE: ltc_weekend_job" },
  { title:"臺北市立聯合醫院 行政實習生", category:"實習機會", location:"中興院區", salary:"依規定給付", hours:"暑假期間，全天", description:"醫院行政部門實習，包含病歷管理、門診掛號支援、資訊系統操作，資管系學生尤其合適。", contact:"聯合醫院官網申請" },
  { title:"連鎖早餐店（北護附近）", category:"校外兼職", location:"石牌路附近", salary:"185元/時", hours:"週一至週五 06:00-09:00（3小時）", description:"早班工作，下午有課的同學很適合。工作內容：點餐、製作飲料、清潔。", contact:"LINE: breakfast_stone_pai" },
  { title:"衛生局健康促進活動工讀", category:"校內工讀", location:"北護校區", salary:"176元/時", hours:"不定期，配合活動", description:"協助衛生局舉辦的健康促進活動，包含擺攤、資料整理、民眾衛教。健康相關科系優先。", contact:"學生事務處公佈欄" },
];

// ─── 換課資料 ─────────────────────────────────────────────
const COURSES = [
  { title:"解剖學 A 班想換 B 班（週三→週五）", category:"必修課程", courseName:"人體解剖學", currentTime:"週三 第3-4節（10:10-12:00）", desiredTime:"週五 第1-2節（08:10-10:00）", description:"因為週三有實習前準備，想換到週五上午班。B班同學如果想換也歡迎！", reason:"週三時段與實習衝突", contact:"IG: anatomy_swap_request", authorName:"護理二年甲" },
  { title:"統計學概論 週一→週三班互換", category:"必修課程", courseName:"統計學概論", currentTime:"週一 第1-2節（08:10-10:00）", desiredTime:"週三 第5-6節（13:10-15:00）", description:"住比較遠，週一第一節要早起很辛苦，想換到週三下午。如有同樣困擾可以互換。", reason:"通勤距離遠，週一早上趕不上", contact:"LINE: stats_swap", authorName:"健管三年" },
  { title:"醫護英文會話 換時段（週五→週二）", category:"選修課程", courseName:"醫護英文會話", currentTime:"週五 第3-4節（10:10-12:00）", desiredTime:"週二 第3-4節（10:10-12:00）", description:"週五班人較少，上課氣氛沒那麼活潑，想換到週二班。有意願的同學私訊！", reason:"想換到人多的班", contact:"FB: med_english_swap", authorName:"語聽二年" },
  { title:"護理實務 換組（第3組→第1組）", category:"必修課程", courseName:"基本護理實務", currentTime:"週四 第5-6節 第3組", desiredTime:"週四 第3-4節 第1組", description:"和同寢的朋友不同組，希望能換到同一組一起練習。第1組同學有意願換的請聯繫。", reason:"想和朋友同組互相練習", contact:"IG: nursing_practice_swap", authorName:"護理一年" },
  { title:"長期照護概論 週二→週四", category:"必修課程", courseName:"長期照護概論", currentTime:"週二 第7-8節（15:10-17:00）", desiredTime:"週四 第5-6節（13:10-15:00）", description:"週二下午有打工，時常遲到，想換到週四下午。如有互換需求歡迎聯絡！", reason:"週二下午有打工", contact:"LINE: ltc_course_swap", authorName:"長照三年" },
];

// ─── 種入函式 ─────────────────────────────────────────────
async function seedAll(setLog) {
  const log = (msg) => setLog(prev => [...prev, msg]);

  log("▶ 開始種入商品資料...");
  for (const p of PRODUCTS) {
    await addDoc(collection(db, "products"), {
      ...p,
      authorName: ["書書書","小花","阿明","護理小熊","資管Ace"][Math.floor(Math.random()*5)],
      createdAt: serverTimestamp(),
      views: Math.floor(Math.random() * 80 + 5),
      likes: Math.floor(Math.random() * 20),
    });
    log(`  ✓ 商品：${p.title}`);
  }

  log("▶ 開始種入打工資料...");
  for (const j of JOBS) {
    await addDoc(collection(db, "jobs"), {
      ...j,
      authorName: ["學務處","小美","系辦公室","打工達人"][Math.floor(Math.random()*4)],
      createdAt: serverTimestamp(),
    });
    log(`  ✓ 打工：${j.title}`);
  }

  log("▶ 開始種入換課資料...");
  for (const c of COURSES) {
    await addDoc(collection(db, "courses"), {
      ...c,
      createdAt: serverTimestamp(),
    });
    log(`  ✓ 換課：${c.title}`);
  }

  log("✅ 全部完成！共種入：" + PRODUCTS.length + " 件商品、" + JOBS.length + " 則打工、" + COURSES.length + " 則換課");
  log("⚠️  請記得把 SeedTool 從 App.jsx 移除！");
}

// ─── 介面 ────────────────────────────────────────────────
export default function SeedTool() {
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    if (running || done) return;
    setRunning(true);
    try {
      await seedAll(setLog);
      setDone(true);
    } catch (err) {
      setLog(prev => [...prev, "❌ 錯誤：" + err.message]);
    }
    setRunning(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: "0 20px" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>🌱 展示資料種入工具</h2>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
          點擊按鈕將 {PRODUCTS.length} 件商品、{JOBS.length} 則打工、{COURSES.length} 則換課種入 Firestore。<br/>
          <strong style={{ color: "#dc2626" }}>注意：只需點一次！完成後請移除此頁面。</strong>
        </p>

        <button
          onClick={handleSeed}
          disabled={running || done}
          style={{
            padding: "14px 32px",
            background: done ? "#22c55e" : running ? "#94a3b8" : "linear-gradient(135deg,#0ea5e9,#0284c7)",
            color: "#fff", border: "none", borderRadius: 12,
            fontWeight: 700, fontSize: 16,
            cursor: (running || done) ? "not-allowed" : "pointer",
            marginBottom: 24,
          }}
        >
          {done ? "✅ 完成！" : running ? "種入中，請稍候…" : "開始種入資料"}
        </button>

        {log.length > 0 && (
          <div style={{
            background: "#0f172a", borderRadius: 12,
            padding: "16px 18px", fontFamily: "monospace",
            fontSize: 13, color: "#94a3b8",
            maxHeight: 400, overflowY: "auto",
            lineHeight: 1.8,
          }}>
            {log.map((l, i) => (
              <div key={i} style={{
                color: l.startsWith("✅") ? "#22c55e"
                  : l.startsWith("❌") ? "#ef4444"
                  : l.startsWith("▶") ? "#38bdf8"
                  : l.startsWith("⚠️") ? "#fbbf24"
                  : "#94a3b8"
              }}>{l}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
