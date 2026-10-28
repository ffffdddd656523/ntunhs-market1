import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_EMAIL = 'admin@ntunhs.edu.tw';

export default function AdminPage({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newUrl, setNewUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setNewUrl(p.image || '');
    setPreviewUrl(p.image || '');
  };

  const handleUrlChange = (val) => {
    setNewUrl(val);
    setPreviewUrl(val);
  };

  const save = async (id) => {
    if (!newUrl.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'products', id), { image: newUrl.trim() });
      setProducts(ps => ps.map(p => p.id === id ? { ...p, image: newUrl.trim() } : p));
      setSaved(id);
      setTimeout(() => setSaved(null), 2000);
      setEditingId(null);
    } catch (e) {
      alert('儲存失敗：' + e.message);
    }
    setSaving(false);
  };

  // 權限檢查
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>無存取權限</p>
        <p style={{ fontSize: 14 }}>此頁面僅限管理員帳號登入後使用</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', borderRadius: 20, padding: '28px 32px', marginBottom: 28, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 36 }}>🛠️</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>管理後台</h1>
            <p style={{ opacity: .7, fontSize: 13 }}>登入身份：{user.email}</p>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>
            {products.length} 件商品
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>商品圖片管理</h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>點選「修改圖片」後貼上圖片網址（Unsplash / Imgur 等），即可更新商品圖片。</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
          <p>載入商品中...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <p>目前 Firestore 沒有商品資料</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {products.map(p => (
            <div
              key={p.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '18px 22px',
                boxShadow: saved === p.id ? '0 0 0 2px #22c55e' : '0 1px 8px rgba(0,0,0,.07)',
                transition: 'box-shadow .3s',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              {/* 縮圖 */}
              <img
                src={editingId === p.id && previewUrl ? previewUrl : (p.image || '')}
                alt={p.title}
                style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1.5px solid #e2e8f0', background: '#f1f5f9' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/88?text=?'; }}
              />

              {/* 資訊 */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{p.title}</span>
                  <span style={{ fontSize: 12, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6 }}>{p.category}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0ea5e9' }}>NT$ {p.price}</span>
                  {saved === p.id && <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>✓ 已儲存</span>}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', wordBreak: 'break-all', marginBottom: editingId === p.id ? 10 : 0 }}>
                  目前圖片：{p.image ? (p.image.length > 70 ? p.image.slice(0, 70) + '…' : p.image) : '（無圖片）'}
                </div>

                {/* 編輯區 */}
                {editingId === p.id && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 6 }}>貼上新圖片網址：</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        value={newUrl}
                        onChange={e => handleUrlChange(e.target.value)}
                        placeholder="https://images.unsplash.com/... 或 https://i.imgur.com/..."
                        autoFocus
                        style={{ flex: 1, minWidth: 260, padding: '9px 12px', border: '1.5px solid #0ea5e9', borderRadius: 8, fontSize: 13, outline: 'none' }}
                      />
                      <button
                        onClick={() => save(p.id)}
                        disabled={saving || !newUrl.trim()}
                        style={{ padding: '9px 20px', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}
                      >{saving ? '儲存中...' : '✓ 儲存'}</button>
                      <button
                        onClick={() => { setEditingId(null); setPreviewUrl(''); }}
                        style={{ padding: '9px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                      >取消</button>
                    </div>
                    {previewUrl && (
                      <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
                        ↑ 左側縮圖為即時預覽
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 編輯按鈕 */}
              {editingId !== p.id && (
                <button
                  onClick={() => startEdit(p)}
                  style={{ padding: '9px 18px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#475569', flexShrink: 0, whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1.5px solid #0ea5e9'; e.currentTarget.style.color = '#0284c7'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid #e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                >✏️ 修改圖片</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
