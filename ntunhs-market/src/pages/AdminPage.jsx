import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_EMAIL = 'admin@ntunhs.edu.tw';

const STATUS_LABELS = {
  products: { sold: '已售出', active: '在售中',  toggleLabel: '✅ 標記售出',  unToggleLabel: '↩️ 取消售出' },
  jobs:     { sold: '已填滿', active: '招募中',   toggleLabel: '✅ 標記填滿',  unToggleLabel: '↩️ 取消填滿' },
  courses:  { sold: '已換課', active: '尋找中',   toggleLabel: '✅ 標記換課',  unToggleLabel: '↩️ 取消換課' },
};

// ─── 示範資料 ───────────────────────────────────────────
const SEED_PRODUCTS = [
  { image:"https://images.unsplash.com/photo-1544717305-2782549b5136?w=600", title:"護理學原理 第八版", price:350, category:"書籍", description:"九成新，無畫記，適合大一使用", authorName:"王小明", authorDept:"護理系" },
  { image:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", title:"MAC 口紅套組", price:800, category:"彩妝", description:"全新未拆封，朋友送的用不到", authorName:"林小芳", authorDept:"護理系" },
  { image:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600", title:"Uniqlo 白色襯衫", price:200, category:"衣服", description:"M號，實習用只穿過3次", authorName:"張大明", authorDept:"資訊管理系" },
  { image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", title:"宿舍小電扇", price:150, category:"生活用品", description:"功能正常，搬家出清", authorName:"陳小美", authorDept:"高齡健康照護系" },
  { image:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600", title:"解剖學講義", price:250, category:"書籍", description:"含筆記整理，八成新", authorName:"王小明", authorDept:"護理系" },
  { image:"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", title:"開架彩妝組", price:300, category:"彩妝", description:"眼影盤、腮紅，9成新", authorName:"李小華", authorDept:"護理系" },
  { image:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600", title:"實習白褲", price:180, category:"衣服", description:"L號，洗過兩次，幾乎全新", authorName:"陳小美", authorDept:"高齡健康照護系" },
  { image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", title:"桌上型檯燈", price:200, category:"生活用品", description:"LED護眼檯燈，宿舍用", authorName:"張大明", authorDept:"資訊管理系" },
];

const SEED_JOBS = [
  { title:"徵咖啡廳工讀生", category:"校內工讀", location:"學生餐廳旁", salary:"時薪 NT$ 190", hours:"彈性排班", description:"校內咖啡廳徵工讀生，工作內容包含飲料製作、收銀、環境整理。", contact:"Line: cafe123", authorName:"學生餐廳" },
  { title:"圖書館助理", category:"校內工讀", location:"圖書館", salary:"時薪 NT$ 185", hours:"週一至週五 14:00-17:00", description:"協助圖書上架、整理、借還書作業。", contact:"Email: library@ntunhs.edu.tw", authorName:"圖書館" },
  { title:"家教老師（數學、英文）", category:"校外兼職", location:"北投區", salary:"時薪 NT$ 500-800", hours:"週末或平日晚上", description:"徵國中數學、英文家教老師，需有耐心，可長期配合。", contact:"手機：0912-345-678", authorName:"家長" },
  { title:"飲料店工讀生", category:"校外兼職", location:"石牌捷運站附近", salary:"時薪 NT$ 190", hours:"排班制，可配合課表", description:"手搖飲料店徵工讀生，需站立工作，會教學。", contact:"Line: drink2024", authorName:"飲料店" },
  { title:"實驗室助理", category:"實習機會", location:"護理系實驗室", salary:"月薪 NT$ 8,000", hours:"每週 10 小時", description:"協助教授進行研究，整理實驗數據，適合對研究有興趣的學生。", contact:"Email: prof.wang@ntunhs.edu.tw", authorName:"王教授" },
  { title:"便利商店大夜班", category:"校外兼職", location:"學校附近7-11", salary:"時薪 NT$ 220", hours:"23:00-07:00", description:"徵夜班工讀生，工作環境單純，適合夜貓子。", contact:"手機：0987-654-321", authorName:"便利商店" },
];

const SEED_COURSES = [
  { title:"週三2-4換週五2-4", category:"必修課程", courseName:"解剖學", currentTime:"週三 13:10-15:00", desiredTime:"週五 13:10-15:00", reason:"週三有其他事情無法上課", contact:"Line: student123", authorName:"李小華", authorDept:"護理系" },
  { title:"生理學換時段", category:"必修課程", courseName:"生理學", currentTime:"週一 10:10-12:00", desiredTime:"週二或週四同時段", reason:"想調整課表，配合打工時間", contact:"Email: student002@ntunhs.edu.tw", authorName:"張大明", authorDept:"護理系" },
  { title:"週四選修課換週二", category:"選修課程", courseName:"健康促進", currentTime:"週四 15:10-17:00", desiredTime:"週二 15:10-17:00", reason:"週四需要實習，希望換到週二", contact:"手機：0912-345-678", authorName:"王小美", authorDept:"健康事業管理系" },
  { title:"藥理學時段交換", category:"必修課程", courseName:"藥理學", currentTime:"週五 08:10-10:00", desiredTime:"週三 08:10-10:00", reason:"週五早上無法到校", contact:"Line: course2024", authorName:"陳小明", authorDept:"護理系" },
  { title:"通識課程換時段", category:"選修課程", courseName:"音樂欣賞", currentTime:"週三 18:30-20:20", desiredTime:"週一或週二晚上", reason:"週三晚上有社團活動", contact:"Email: student005@ntunhs.edu.tw", authorName:"林小芳", authorDept:"高齡健康照護系" },
];
// ────────────────────────────────────────────────────────

export default function AdminPage({ user }) {
  const [tab, setTab] = useState('products');
  const [data, setData] = useState({ products: [], jobs: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editImage, setEditImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    const loadAll = async () => {
      try {
        const [prodSnap, jobSnap, courseSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'jobs')),
          getDocs(collection(db, 'courses')),
        ]);
        setData({
          products: prodSnap.docs.map(d => ({ id: d.id, _col: 'products', ...d.data() })),
          jobs:     jobSnap.docs.map(d  => ({ id: d.id, _col: 'jobs',     ...d.data() })),
          courses:  courseSnap.docs.map(d=> ({ id: d.id, _col: 'courses',  ...d.data() })),
        });
      } catch (e) {
        console.error('載入失敗', e);
        setError(e.message);
      }
      setLoading(false);
    };
    loadAll();
  }, [user]);

  const handleSeedData = async () => {
    if (!window.confirm(`確定要匯入示範資料嗎？\n這會新增：\n• ${SEED_PRODUCTS.length} 筆商品\n• ${SEED_JOBS.length} 筆打工\n• ${SEED_COURSES.length} 筆換課\n（不會刪除現有資料）`)) return;
    setSeedLoading(true);
    try {
      const now = serverTimestamp();
      const prodDocs = await Promise.all(
        SEED_PRODUCTS.map(p => addDoc(collection(db, 'products'), { ...p, createdAt: now }))
      );
      const jobDocs = await Promise.all(
        SEED_JOBS.map(j => addDoc(collection(db, 'jobs'), { ...j, createdAt: now }))
      );
      const courseDocs = await Promise.all(
        SEED_COURSES.map(c => addDoc(collection(db, 'courses'), { ...c, createdAt: now }))
      );
      // 更新本地狀態
      setData(prev => ({
        products: [
          ...SEED_PRODUCTS.map((p, i) => ({ id: prodDocs[i].id, _col: 'products', ...p })),
          ...prev.products,
        ],
        jobs: [
          ...SEED_JOBS.map((j, i) => ({ id: jobDocs[i].id, _col: 'jobs', ...j })),
          ...prev.jobs,
        ],
        courses: [
          ...SEED_COURSES.map((c, i) => ({ id: courseDocs[i].id, _col: 'courses', ...c })),
          ...prev.courses,
        ],
      }));
      setSeedDone(true);
      setTimeout(() => setSeedDone(false), 4000);
    } catch (e) {
      alert('匯入失敗：' + e.message);
    }
    setSeedLoading(false);
  };

  const handleDelete = async (item) => {
    try {
      await deleteDoc(doc(db, item._col, item.id));
      setData(prev => ({
        ...prev,
        [item._col]: prev[item._col].filter(p => p.id !== item.id),
      }));
      setConfirmDelete(null);
    } catch (e) {
      alert('刪除失敗：' + e.message);
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'sold' ? null : 'sold';
    setToggling(item.id);
    try {
      await updateDoc(doc(db, item._col, item.id), { status: newStatus });
      setData(prev => ({
        ...prev,
        [item._col]: prev[item._col].map(p =>
          p.id === item.id ? { ...p, status: newStatus } : p
        ),
      }));
    } catch (e) {
      alert('更新狀態失敗：' + e.message);
    }
    setToggling(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditImage(item.image || '');
  };

  const saveEdit = async (item) => {
    if (!editImage.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, item._col, item.id), { image: editImage.trim() });
      setData(prev => ({
        ...prev,
        [item._col]: prev[item._col].map(p =>
          p.id === item.id ? { ...p, image: editImage.trim() } : p
        ),
      }));
      setSaved(item.id);
      setTimeout(() => setSaved(null), 2000);
      setEditingId(null);
    } catch (e) {
      alert('儲存失敗：' + e.message);
    }
    setSaving(false);
  };

  const fmtDate = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0, 10);
    if (v && v.seconds) return new Date(v.seconds * 1000).toLocaleDateString('zh-TW');
    return '';
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ textAlign:'center', padding:'80px 20px', color:'#94a3b8' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
        <p style={{ fontSize:18, fontWeight:700, color:'#1e293b', marginBottom:8 }}>無存取權限</p>
        <p style={{ fontSize:14 }}>此頁面僅限管理員帳號登入後使用</p>
        <p style={{ fontSize:12, marginTop:8, color:'#cbd5e1' }}>目前登入：{user ? user.email : '未登入'}</p>
      </div>
    );
  }

  const TABS = [
    { key:'products', label:'商品',   emoji:'🛍️' },
    { key:'jobs',     label:'打工資訊', emoji:'💼' },
    { key:'courses',  label:'換課資訊', emoji:'📚' },
  ];

  const currentItems = data[tab] || [];
  const total = data.products.length + data.jobs.length + data.courses.length;
  const sl = STATUS_LABELS[tab];

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 20px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e293b,#334155)', borderRadius:20, padding:'28px 32px', marginBottom:20, color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div style={{ fontSize:36 }}>🛠️</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>管理後台</h1>
            <p style={{ opacity:.7, fontSize:13 }}>登入身份：{user.email}</p>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <div style={{ background:'rgba(255,255,255,.12)', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:600 }}>
              共 {total} 筆貼文
            </div>
            <button
              onClick={handleSeedData}
              disabled={seedLoading}
              style={{
                padding:'8px 16px', background: seedDone ? '#22c55e' : 'rgba(255,255,255,.18)',
                border:'1.5px solid rgba(255,255,255,.35)', borderRadius:10, color:'#fff',
                cursor:'pointer', fontWeight:700, fontSize:13, transition:'all .2s',
              }}
            >
              {seedLoading ? '匯入中...' : seedDone ? '✓ 匯入完成！' : '📥 匯入示範資料'}
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:12, padding:'16px 20px', marginBottom:20, color:'#dc2626', fontSize:13, fontWeight:600 }}>
          ⚠️ 載入錯誤：{error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setEditingId(null); }}
            style={{
              padding:'10px 20px', borderRadius:10, border:'none', cursor:'pointer',
              background: tab===t.key ? '#0ea5e9' : '#f1f5f9',
              color: tab===t.key ? '#fff' : '#475569',
              fontWeight:700, fontSize:14,
            }}
          >
            {t.emoji} {t.label}（{data[t.key].length}）
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>
          <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>
          <p>載入中...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8', background:'#fff', borderRadius:16, boxShadow:'0 1px 8px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <p style={{ fontWeight:600, color:'#1e293b', marginBottom:6 }}>此分類目前沒有貼文</p>
          <p style={{ fontSize:13 }}>點右上角「📥 匯入示範資料」或由用戶發布貼文</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {currentItems.map(item => {
            const isSold = item.status === 'sold';
            return (
              <div
                key={item.id}
                style={{
                  background:'#fff', borderRadius:14, padding:'18px 22px',
                  boxShadow: saved===item.id ? '0 0 0 2px #22c55e' : '0 1px 8px rgba(0,0,0,.07)',
                  display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap',
                  borderLeft: isSold ? '4px solid #ef4444' : '4px solid transparent',
                  opacity: isSold ? 0.85 : 1,
                }}
              >
                {item.image && (
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <img
                      src={editingId===item.id && editImage ? editImage : item.image}
                      alt={item.title || ''}
                      style={{ width:80, height:80, objectFit:'cover', borderRadius:10, border:'1.5px solid #e2e8f0' }}
                      onError={e => { e.target.style.display='none'; }}
                    />
                    {isSold && (
                      <div style={{ position:'absolute', inset:0, borderRadius:10, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ color:'#fff', fontSize:10, fontWeight:800 }}>{sl.sold}</span>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:15, color:'#1e293b' }}>{item.title}</span>
                    {item.price && <span style={{ fontSize:13, fontWeight:700, color: isSold ? '#94a3b8' : '#0ea5e9', textDecoration: isSold ? 'line-through' : 'none' }}>NT$ {item.price}</span>}
                    {item.category && <span style={{ fontSize:11, background:'#f1f5f9', color:'#64748b', padding:'2px 8px', borderRadius:6 }}>{item.category}</span>}
                    {isSold && (
                      <span style={{ fontSize:11, background:'#fef2f2', color:'#ef4444', fontWeight:700, padding:'2px 8px', borderRadius:6 }}>{sl.sold}</span>
                    )}
                    {saved===item.id && <span style={{ fontSize:12, color:'#22c55e', fontWeight:600 }}>✓ 已儲存</span>}
                  </div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>
                    發布者：{item.authorName || item.poster || '—'}
                    {item.authorDept && <span style={{ marginLeft:4 }}>· {item.authorDept}</span>}
                    {fmtDate(item.createdAt || item.date) && <span style={{ marginLeft:4 }}>· {fmtDate(item.createdAt || item.date)}</span>}
                  </div>
                  {item.description && (
                    <p style={{ fontSize:13, color:'#64748b', marginBottom:8, lineHeight:1.5 }}>
                      {item.description.length > 80 ? item.description.slice(0,80)+'…' : item.description}
                    </p>
                  )}
                  {editingId===item.id && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ fontSize:12, color:'#475569', fontWeight:600, marginBottom:6 }}>修改圖片網址：</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <input
                          value={editImage}
                          onChange={e => setEditImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          autoFocus
                          style={{ flex:1, minWidth:240, padding:'8px 12px', border:'1.5px solid #0ea5e9', borderRadius:8, fontSize:13, outline:'none' }}
                        />
                        <button
                          onClick={() => saveEdit(item)}
                          disabled={saving || !editImage.trim()}
                          style={{ padding:'8px 18px', background:'linear-gradient(135deg,#0ea5e9,#0284c7)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13 }}
                        >{saving ? '儲存中...' : '✓ 儲存'}</button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ padding:'8px 12px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}
                        >取消</button>
                      </div>
                    </div>
                  )}
                </div>
                {editingId!==item.id && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      disabled={toggling === item.id}
                      style={{
                        padding:'8px 14px', border:'none', borderRadius:8, cursor:'pointer',
                        fontWeight:600, fontSize:13,
                        background: isSold ? '#fff7ed' : '#f0fdf4',
                        color: isSold ? '#ea580c' : '#16a34a',
                      }}
                    >
                      {toggling === item.id ? '更新中...' : (isSold ? sl.unToggleLabel : sl.toggleLabel)}
                    </button>
                    <div style={{ display:'flex', gap:8 }}>
                      <button
                        onClick={() => startEdit(item)}
                        style={{ flex:1, padding:'8px 10px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:12, color:'#475569' }}
                      >✏️ 修改圖片</button>
                      <button
                        onClick={() => setConfirmDelete(item)}
                        style={{ flex:1, padding:'8px 10px', background:'#fff1f2', border:'1.5px solid #fecdd3', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:12, color:'#e11d48' }}
                      >🗑️ 刪除</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div
          onClick={() => setConfirmDelete(null)}
          style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:20, padding:'36px 32px', maxWidth:380, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.18)', textAlign:'center' }}
          >
            <div style={{ fontSize:48, marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontSize:18, fontWeight:800, color:'#1e293b', marginBottom:8 }}>確認刪除這則貼文？</h3>
            <p style={{ fontSize:14, color:'#64748b', marginBottom:8, fontWeight:600 }}>「{confirmDelete.title}」</p>
            <p style={{ fontSize:13, color:'#94a3b8', marginBottom:28 }}>刪除後無法復原，確定要繼續嗎？</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ padding:'11px 28px', background:'#f1f5f9', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600, color:'#475569', fontSize:14 }}
              >取消</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{ padding:'11px 28px', background:'linear-gradient(135deg,#e11d48,#be123c)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 }}
              >確認刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
