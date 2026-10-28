import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { SendIcon, UsersIcon } from '../components/Icons';
import { Avatar } from '../components/Common';

const MEMBER_COLORS = [
  "#22c55e","#a855f7","#f43f5e","#f59e0b",
  "#06b6d4","#84cc16","#6366f1","#ec4899","#10b981","#8b5cf6"
];

function getUserColor(uid) {
  if (!uid) return "#0ea5e9";
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

// 假的歷史訊息種子資料 — 首次讀取到空集合時自動寫入 Firestore
const SEED_MSGS = [
  { sender:"張大明",   senderUid:null, color:"#22c55e", text:"大家好！有人要賣生理學課本嗎？九成新就可以",                     time:"08:10", createdAt:"2026-10-28T00:10:00Z" },
  { sender:"葉雅婷",   senderUid:null, color:"#a855f7", text:"張大明 我這裡有一本！等等私訊你 📚",                            time:"08:12", createdAt:"2026-10-28T00:12:00Z" },
  { sender:"陳小美",   senderUid:null, color:"#f43f5e", text:"請問有人要換課嗎？我週四上午的內外科實習想換成週五",            time:"08:45", createdAt:"2026-10-28T00:45:00Z" },
  { sender:"王子豪",   senderUid:null, color:"#f59e0b", text:"我週五那節沒課但我不是護理系的 哈哈",                           time:"08:46", createdAt:"2026-10-28T00:46:00Z" },
  { sender:"林宜蓁",   senderUid:null, color:"#06b6d4", text:"學校旁邊那間早餐店今天沒開，大家要準備自己帶早餐 😅",          time:"09:05", createdAt:"2026-10-28T01:05:00Z" },
  { sender:"黃建宏",   senderUid:null, color:"#84cc16", text:"校內咖啡廳有在徵工讀！月薪17000、排班彈性，有興趣私訊我",      time:"09:30", createdAt:"2026-10-28T01:30:00Z" },
  { sender:"蔡芷瑄",   senderUid:null, color:"#6366f1", text:"工讀！！我要！幾月幾號開始面試？",                             time:"09:32", createdAt:"2026-10-28T01:32:00Z" },
  { sender:"黃建宏",   senderUid:null, color:"#84cc16", text:"下週一可以去面試，記得帶身分證跟學生證",                        time:"09:34", createdAt:"2026-10-28T01:34:00Z" },
  { sender:"吳佳穎",   senderUid:null, color:"#ec4899", text:"有人要買解剖學第三版嗎？全新未拆，定價680現在400賣",           time:"10:00", createdAt:"2026-10-28T02:00:00Z" },
  { sender:"許晨維",   senderUid:null, color:"#10b981", text:"我要！你在哪個宿舍？可以面交",                                  time:"10:02", createdAt:"2026-10-28T02:02:00Z" },
  { sender:"吳佳穎",   senderUid:null, color:"#ec4899", text:"誠愛三樓，今晚下課後可以嗎？大概六點",                         time:"10:04", createdAt:"2026-10-28T02:04:00Z" },
  { sender:"許晨維",   senderUid:null, color:"#10b981", text:"沒問題！待會傳訊息確認一下 👍",                                 time:"10:05", createdAt:"2026-10-28T02:05:00Z" },
  { sender:"林宜蓁",   senderUid:null, color:"#06b6d4", text:"今天圖書館幾點開到？有人知道嗎",                               time:"11:20", createdAt:"2026-10-28T03:20:00Z" },
  { sender:"陳小美",   senderUid:null, color:"#f43f5e", text:"平日晚上10點關，週末8點",                                       time:"11:22", createdAt:"2026-10-28T03:22:00Z" },
  { sender:"張大明",   senderUid:null, color:"#22c55e", text:"有人今晚要去圖書館一起讀書嗎？大考快到了 😤",                  time:"14:00", createdAt:"2026-10-28T06:00:00Z" },
  { sender:"葉雅婷",   senderUid:null, color:"#a855f7", text:"+1 我也要去！六點半見",                                         time:"14:03", createdAt:"2026-10-28T06:03:00Z" },
  { sender:"蔡芷瑄",   senderUid:null, color:"#6366f1", text:"我帶零食去 🍡",                                                 time:"14:05", createdAt:"2026-10-28T06:05:00Z" },
];

export default function GroupChatPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const seededRef = useRef(false);

  useEffect(() => {
    const q = query(collection(db, "groupChat"), orderBy("createdAt", "asc"));

    // 首次進入若集合是空的就種入假訊息
    const seedIfEmpty = async () => {
      if (seededRef.current) return;
      seededRef.current = true;
      try {
        const snap = await getDocs(collection(db, "groupChat"));
        if (snap.empty) {
          for (const m of SEED_MSGS) {
            await addDoc(collection(db, "groupChat"), m);
          }
        }
      } catch (e) {
        console.error("Seed error:", e);
      }
    };
    seedIfEmpty();

    // 即時監聽 Firestore
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 有新訊息時自動捲到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !user) return;
    const text = msg.trim();
    setMsg("");
    const now = new Date();
    await addDoc(collection(db, "groupChat"), {
      sender:    user.name || user.email?.split("@")[0] || "同學",
      senderUid: user.uid,
      color:     getUserColor(user.uid),
      text,
      time:      now.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
      createdAt: now.toISOString(),
    });
  };

  const myUid = user?.uid;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderRadius: "18px 18px 0 0", padding: "18px 24px", boxShadow: "0 2px 10px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <UsersIcon />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>北護大群</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>北護 Market 公開討論群組 · 全校學生皆可參與</div>
        </div>
        <div style={{ marginLeft: "auto", background: "#dcfce7", color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 99 }}>
          ● 138 人在線
        </div>
      </div>

      {/* Messages */}
      <div style={{ background: "#f8fafc", padding: "24px", height: 460, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ background: "#e2e8f0", color: "#64748b", fontSize: 12, padding: "4px 12px", borderRadius: 99 }}>今天</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 32 }}>載入中…</div>
        ) : messages.map(m => {
          const isMe = !!myUid && m.senderUid === myUid;
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
              {!isMe && <Avatar name={m.sender} color={m.color} size={36} />}
              <div style={{ maxWidth: "68%" }}>
                {!isMe && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, marginLeft: 2 }}>{m.sender}</div>}
                <div style={{ padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMe ? "linear-gradient(135deg,#0ea5e9,#0284c7)" : "#fff", color: isMe ? "#fff" : "#1e293b", fontSize: 14, lineHeight: 1.6, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, textAlign: isMe ? "right" : "left" }}>{m.time}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMsg} style={{ background: "#fff", borderRadius: "0 0 18px 18px", padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,.06)", display: "flex", gap: 10 }}>
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder={user ? "輸入訊息，傳送給北護全體同學..." : "請先登入才能傳送訊息"}
          disabled={!user}
          style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", background: user ? "#fff" : "#f8fafc", color: "#1e293b" }}
        />
        <button
          type="submit"
          disabled={!user}
          style={{ background: user ? "linear-gradient(135deg,#0ea5e9,#0284c7)" : "#cbd5e1", color: "#fff", border: "none", padding: "0 20px", borderRadius: 10, cursor: user ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap" }}
        >
          <SendIcon />傳送
        </button>
      </form>

      {/* Login nudge */}
      {!user && (
        <div style={{ marginTop: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#1d4ed8", textAlign: "center" }}>
          💬 登入後即可加入北護大群的討論
        </div>
      )}

      {/* Notice */}
      <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
        ⚠️ 請遵守北護校規，禁止發布違法或不當內容。
      </div>
    </div>
  );
}
