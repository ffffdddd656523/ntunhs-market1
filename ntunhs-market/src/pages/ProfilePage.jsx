import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { HeartIcon, EditIcon, Trash2Icon } from '../components/Icons';
import { Avatar, ProductCard } from '../components/Common';
import { PRODUCTS } from '../data';

export default function ProfilePage({ user, onLogout, favorites, setPage, setSelectedProduct }) {
  const [tab, setTab] = useState("posts");
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const favProducts = PRODUCTS.filter(p => favorites.has(p.id));

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const fetchMyPosts = async () => {
      try {
        const results = [];
        for (const col of ["products", "jobs", "courses"]) {
          const q = query(collection(db, col), where("authorId", "==", user.uid));
          const snap = await getDocs(q);
          snap.docs.forEach(d => results.push({ id: d.id, _col: col, ...d.data() }));
        }
        results.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setMyPosts(results);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchMyPosts();
  }, [user]);

  const deletePost = async (id, col) => {
    if (!window.confirm("確定要刪除這篇貼文嗎？")) return;
    try {
      await deleteDoc(doc(db, col, id));
      setMyPosts(ps => ps.filter(p => p.id !== id));
    } catch (err) {
      alert("刪除失敗：" + err.message);
    }
  };

  const typeLabel = { products: "商品", jobs: "打工", courses: "換課" };
  const statusColor = { "上架中":"#16a34a", "招募中":"#0284c7", "尋找中":"#d97706" };
  const statusBg   = { "上架中":"#dcfce7", "招募中":"#e0f2fe", "尋找中":"#fef3c7" };

  const getStatus = (p) => {
    if (p._col === "products") return "上架中";
    if (p._col === "jobs") return "招募中";
    return "尋找中";
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return iso.slice(0, 10);
  };

  return (
    <div style={{maxWidth:960, margin:"0 auto", padding:"32px 20px"}}>
      {/* Profile Header */}
      <div style={{background:"linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius:20, padding:"32px 32px 28px", color:"#fff", marginBottom:28, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-30, right:-30, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.08)"}}/>
        <div style={{position:"absolute", bottom:-40, right:60, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,.05)"}}/>
        <div style={{display:"flex", alignItems:"center", gap:20, position:"relative"}}>
          <Avatar name={user?.name || "我"} color="#fff" size={72} textColor="#0284c7"/>
          <div>
            <h2 style={{fontSize:24, fontWeight:800, marginBottom:4}}>{user?.name || "同學"}</h2>
            <p style={{opacity:.85, fontSize:14}}>{user?.email || "student@ntunhs.edu.tw"}</p>
            {user?.dept && <p style={{opacity:.7, fontSize:13, marginTop:2}}>{user.dept} · {user.year}</p>}
          </div>
          <button
            onClick={onLogout}
            style={{marginLeft:"auto", background:"rgba(255,255,255,.2)", color:"#fff", border:"1px solid rgba(255,255,255,.4)", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontWeight:600, backdropFilter:"blur(4px)"}}
          >
            登出
          </button>
        </div>
        <div style={{display:"flex", gap:24, marginTop:24, position:"relative"}}>
          {[["我的貼文", myPosts.length, "篇"], ["收藏商品", favProducts.length, "件"]].map(([l,n,u]) => (
            <div key={l}>
              <div style={{fontSize:22, fontWeight:800}}>{n}</div>
              <div style={{opacity:.8, fontSize:13}}>{l}（{u}）</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex", gap:4, background:"#f1f5f9", borderRadius:12, padding:4, marginBottom:24, width:"fit-content"}}>
        {[["posts","我的貼文"],["favorites","收藏商品"]].map(([v,l]) => (
          <button
            key={v}
            onClick={()=>setTab(v)}
            style={{padding:"9px 22px", borderRadius:9, border:"none", background:tab===v?"#fff":"transparent", color:tab===v?"#0284c7":"#64748b", fontWeight:tab===v?700:500, cursor:"pointer", fontSize:14, boxShadow:tab===v?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .15s"}}
          >
            {l}
          </button>
        ))}
      </div>

      {/* My Posts Tab */}
      {tab === "posts" && (
        <div>
          {loading ? (
            <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
              <div style={{fontSize:32, marginBottom:12}}>⏳</div>
              <p>載入貼文中...</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
              <div style={{fontSize:48, marginBottom:12}}>📭</div>
              <p style={{fontSize:16, fontWeight:600}}>還沒有任何貼文</p>
              <button onClick={()=>setPage("create")} style={{marginTop:16, padding:"11px 24px", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600}}>發布第一篇貼文</button>
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:14}}>
              {myPosts.map(p => {
                const status = getStatus(p);
                return (
                  <div key={p.id} style={{background:"#fff", borderRadius:14, padding:"18px 22px", boxShadow:"0 1px 8px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap"}}>
                    <div style={{flex:1, minWidth:180}}>
                      <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:6}}>
                        <span style={{background:statusBg[status], color:statusColor[status], fontSize:12, fontWeight:600, padding:"3px 8px", borderRadius:6}}>● {status}</span>
                        <span style={{background:"#f1f5f9", color:"#64748b", fontSize:12, padding:"3px 8px", borderRadius:6}}>{typeLabel[p._col]}</span>
                        {p.category && <span style={{background:"#f1f5f9", color:"#64748b", fontSize:12, padding:"3px 8px", borderRadius:6}}>{p.category}</span>}
                      </div>
                      <div style={{fontWeight:700, color:"#1e293b", fontSize:15}}>{p.title}</div>
                      <div style={{fontSize:12, color:"#94a3b8", marginTop:4}}>發布於 {formatDate(p.createdAt)}</div>
                    </div>
                    {p.price != null && <div style={{fontWeight:700, color:"#0ea5e9", fontSize:16}}>NT$ {p.price}</div>}
                    <div style={{display:"flex", gap:8}}>
                      <button
                        onClick={() => deletePost(p.id, p._col)}
                        style={{padding:"8px 14px", border:"1.5px solid #fecaca", borderRadius:8, background:"#fef2f2", cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#ef4444", fontWeight:600}}
                      >
                        <Trash2Icon/>刪除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {tab === "favorites" && (
        <div>
          {favProducts.length === 0 ? (
            <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
              <div style={{fontSize:48, marginBottom:12}}>🤍</div>
              <p style={{fontSize:16, fontWeight:600}}>還沒有收藏任何商品</p>
              <button onClick={()=>setPage("products")} style={{marginTop:16, padding:"11px 24px", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600}}>瀏覽商品</button>
            </div>
          ) : (
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:20}}>
              {favProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => { setSelectedProduct(p); setPage("product-detail"); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
