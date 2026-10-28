import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_EMAIL = 'admin@ntunhs.edu.tw';

export default function AdminPage({ user }) {
  const [tab, setTab] = useState('products');
  const [data, setData] = useState({ products: [], jobs: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editImage, setEditImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saved, setSaved] = useState(null);

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
      }
      setLoading(false);
    };
    loadAll();
  }, [user]);

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

  // 格式化時間
  const fmtDate = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0, 10);
    if (v?.seconds) return new Date(v.seconds * 1000).toLocaleDateString('zh-TW');
    return '';
  };

  // 權限檢查
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ textAlign:'center', padding:'80px 20px', color:'#94a3b8' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
        <p style={{ fontSize:18, fontWeight:700, color:'#1e293b', marginBottom:8 }}>無存取權限</p>
        <p style={{ fontSize:14 }}>此頁面僅限管理員帳號登入後使用</p>
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

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 20px' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e293b,#334155)', borderRadius:20, padding:'28px 32px', marginBottom:28, color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ fontSize:36 }}>🛠️</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>管理後台</h1>
            <p style={{ opacity:.7, fontSize:13 }}>登入身份：{user.email}</p>
          </div>
          <div style={{ marginLeft:'auto', background:'rgba(255,255,255,.12)', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:600 }}>
            共 {total} 筆貼文
          </div>
        </div>
      </div>

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
              fontWeight:700, fontSize:14, transition:'all .15s',
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
          <p style={{ fontSize:13 }}>用戶透過「發布貼文」上傳後會出現在這裡</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {currentItems.map(item => (
            <div
              key={item.id}
              style={{
                background:'#fff', borderRadius:14, padding:'18px 22px',
                boxShadow: saved===item.id ? '0 0 0 2px #22c55e' : '0 1px 8px rgba(0,0,0,.07)',
                transition:'box-shadow .3s',
                display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap',
              }}
            >
              {/* 縮圖 */}
              {item.image && (
                <img
                  src={editingId===item.id && editImage ? editImage : item.image}
                  alt={item.title}
                  style={{ width:80, height:80, objectFit:'cover', borderRadius:10, flexShrink:0, border:'1.5px solid #e2e8f0', background:'#f1f5f9' }}
                  onError={e => { e.target.style.display='none'; }}
                />
              )}

              {/* 資訊 */}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5, flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700, fontSize:15, color:'#1e293b' }}>{item.title}</span>
                  {item.price && <span style={{ fontSize:13, fontWeight:700, color:'#0ea5e9' }}>NT$ {item.price}</span>}
                  {item.category && <span style={{ fontSize:11, background:'#f1f5f9', color:'#64748b', padding:'2px 8px', borderRadius:6 }}>{item.category}</span>}
                  {saved===item.id && <span style={{ fontSize:12, color:'#22c55e', fontWeight:600 }}>✓ 已儲存</span>}
                </div>
                <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>
                  發布者：{item.authorName || item.poster || '—'}
                  {fmtDate(item.createdAt) && <span>　{fmtDate(item.createdAt)}</span>}
                </div>
                {item.description && (
                  <p style={{ fontSize:13, color:'#64748b', marginBottom:8, lineHeight:1.5 }}>
                    {item.description.length > 80 ? item.description.slice(0,80)+'…' : item.description}
                  </p>
                )}

                {/* 編輯區 */}
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
                        style={{ padding:'8px 18px', background:'linear-gradient(135deg,#0ea5e9,#0284c7)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13, whiteSpace:'nowrap' }}
                      >{saving ? '儲存中...' : '✓ 儲存'}</button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ padding:'8px 12px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:8, cursor:'pointer', fontSize:13 }}
                      >取消</button>
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按鈕 */}
              {editingId!==item.id && (
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button
                    onClick={() => startEdit(item)}
                    style={{ padding:'8px 14px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13, color:'#475569', whiteSpace:'nowrap' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='#0ea5e9'; e.currentTarget.style.color='#0284c7'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#475569'; }}
                  >✏️ 修改圖片</button>
                  <button
                    onClick={() => setConfirmDelete(item)}
                    style={{ padding:'8px 14px', background:'#fff1f2', border:'1.5px solid #fecdd3', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13, color:'#e11d48', whiteSpace:'nowrap' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='#ffe4e6'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='#fff1f2'; }}
                  >🗑️ 刪除</button>
                </div>
              )}
            </div>
          ))}
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
