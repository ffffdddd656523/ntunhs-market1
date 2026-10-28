import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2Icon, ShoppingBagIcon, BriefcaseIcon, RefreshIcon } from '../components/Icons';
import { Avatar, ProductCard } from '../components/Common';
import { PRODUCTS } from '../data';

const POST_TYPE_MAP = { product: "products", job: "jobs", course: "courses" };
const POST_LABEL   = { product: "商品", job: "打工", course: "換課" };
const STATUS_MAP   = { product: "上架中", job: "招募中", course: "尋找中" };
const STATUS_COLOR = { "上架中":"#16a34a", "招募中":"#0284c7", "尋找中":"#d97706" };
const STATUS_BG    = { "上架中":"#dcfce7", "招募中":"#e0f2fe", "尋找中":"#fef3c7" };

function TypeIcon({ type }) {
  if (type === "product") return <ShoppingBagIcon/>;
  if (type === "job")     return <BriefcaseIcon/>;
  return <RefreshIcon/>;
}

export default function ProfilePage({ user, onLogout, favorites, setPage, setSelectedProduct }) {
  const [tab, setTab] = useState("posts");
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const favProducts = PRODUCTS.filter(p => favorites?.has(p.id));

  // Pull user's real posts from all 3 Firestore collections
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const load = async () => {
      try {
        const [s1, s2, s3] = await Promise.all([
          getDocs(query(collection(db, "products"), where("authorId", "==", user.uid))),
          getDocs(query(collection(db, "jobs"),     where("authorId", "==", user.uid))),
          getDocs(query(collection(db, "courses"),  where("authorId", "==", user.uid))),
        ]);
        const posts = [
          ...s1.docs.map(d => ({ id: d.id, ...d.data(), postType: "product" })),
          ...s2.docs.map(d => ({ id: d.id, ...d.data(), postType: "job"     })),
          ...s3.docs.map(d => ({ id: d.id, ...d.data(), postType: "course"  })),
        ].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setMyPosts(posts);
      } catch (e) {
        console.error("Load posts error:", e);
      }
      setLoading(false);
    };
    load();
  }, [user?.uid]);

  const deletePost = async (post) => {
    if (!window.confirm(`確定要刪除「${post.title}」嗎？`)) return;
    setDeletingId(post.id);
    try {
      await deleteDoc(doc(db, POST_TYPE_MAP[post.postType], post.id));
      setMyPosts(ps => ps.filter(p => p.id !== post.id));
    } catch (e) {
      alert("刪除失敗：" + e.message);
    }
    setDeletingId(null);
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
            style={{marginLeft:"auto", background:"rgba(255,255,255,.2)", color:"#fff", border:"1px solid rgba(255,255,255,.4)", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontWeight:600}}
          >登出</button>
        </div>
        <div style={{display:"flex", gap:32, marginTop:24, position:"relative"}}>
          <div>
            <div style={{fontSize:26, fontWeight:800}}>{loading ? "…" : myPosts.length}</div>
            <div style={{opacity:.8, fontSize:13}}>我的貼文</div>
          </div>
          <div>
            <div style={{fontSize:26, fontWeight:800}}>{loading ? "…" : myPosts.filter(p=>p.postType==="product").length}</div>
            <div style={{opacity:.8, fontSize:13}}>商品上架</div>
          </div>
          <div>
            <div style={{fontSize:26, fontWeight:800}}>{favProducts.length}</div>
            <div style={{opacity:.8, fontSize:13}}>收藏商品</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex", gap:4, background:"#f1f5f9", borderRadius:12, padding:4, marginBottom:24, width:"fit-content"}}>
        {[["posts","我的貼文"],["favorites","收藏商品"]].map(([v,l]) => (
          <button key={v} onClick={()=>setTab(v)}
            style={{padding:"9px 22px", borderRadius:9, border:"none", background:tab===v?"#fff":"transparent", color:tab===v?"#0284c7":"#64748b", fontWeight:tab===v?700:500, cursor:"pointer", fontSize:14, boxShadow:tab===v?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .15s"}}
          >{l}</button>
        ))}
      </div>

      {/* My Posts Tab */}
      {tab === "posts" && (
        <div>
          {loading ? (
            <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
              <div style={{fontSize:32, marginBottom:10}}>⏳</div>
              <p>載入貼文中…</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
              <div style={{fontSize:48, marginBottom:12}}>📭</div>
              <p style={{fontSize:16, fontWeight:600, marginBottom:6}}>還沒有任何貼文</p>
              <p style={{fontSize:14, marginBottom:20}}>發布你的第一篇商品、打工或換課資訊吧！</p>
              <button onClick={()=>setPage("create")}
                style={{padding:"11px 28px", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:15}}
              >發布貼文</button>
            </div>
          ) : (
            <>
              <div style={{display:"flex", gap:8, marginBottom:18, flexWrap:"wrap"}}>
                {[["全部", myPosts.length], ["商品", myPosts.filter(p=>p.postType==="product").length], ["打工", myPosts.filter(p=>p.postType==="job").length], ["換課", myPosts.filter(p=>p.postType==="course").length]].map(([label, count]) => (
                  <span key={label} style={{padding:"5px 14px", borderRadius:20, background:"#f1f5f9", fontSize:13, color:"#475569", fontWeight:600}}>
                    {label} {count}
                  </span>
                ))}
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {myPosts.map(p => {
                  const status = STATUS_MAP[p.postType];
                  return (
                    <div key={p.id}
                      style={{background:"#fff", borderRadius:14, padding:"18px 22px", boxShadow:"0 1px 8px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap"}}
                    >
                      <div style={{width:40, height:40, borderRadius:10, background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", flexShrink:0}}>
                        <TypeIcon type={p.postType}/>
                      </div>
                      <div style={{flex:1, minWidth:160}}>
                        <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap"}}>
                          <span style={{background:STATUS_BG[status], color:STATUS_COLOR[status], fontSize:12, fontWeight:600, padding:"3px 8px", borderRadius:6}}>● {status}</span>
                          <span style={{background:"#f1f5f9", color:"#64748b", fontSize:12, padding:"3px 8px", borderRadius:6}}>{POST_LABEL[p.postType]}</span>
                          {p.category && <span style={{background:"#f8fafc", color:"#94a3b8", fontSize:11, padding:"2px 8px", borderRadius:6}}>{p.category}</span>}
                        </div>
                        <div style={{fontWeight:700, color:"#1e293b", fontSize:15}}>{p.title}</div>
                        <div style={{fontSize:12, color:"#94a3b8", marginTop:4}}>
                          發布於 {(p.createdAt||"").slice(0,10) || "—"}
                          {p.contact && <span style={{marginLeft:10}}>聯絡：{p.contact}</span>}
                        </div>
                      </div>
                      {p.price > 0 && <div style={{fontWeight:800, color:"#0ea5e9", fontSize:17, flexShrink:0}}>NT$ {p.price}</div>}
                      <button
                        onClick={() => deletePost(p)}
                        disabled={deletingId === p.id}
                        style={{padding:"8px 14px", border:"1.5px solid #fecaca", borderRadius:8, background:deletingId===p.id?"#f1f5f9":"#fef2f2", cursor:deletingId===p.id?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#ef4444", fontWeight:600, opacity:deletingId===p.id?.5:1, flexShrink:0}}
                      >
                        <Trash2Icon/>{deletingId===p.id?"刪除中…":"刪除"}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={{textAlign:"center", marginTop:24}}>
                <button onClick={()=>setPage("create")}
                  style={{padding:"11px 28px", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14}}
                >+ 再發一篇</button>
              </div>
            </>
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
              <button onClick={()=>setPage("products")}
                style={{marginTop:16, padding:"11px 24px", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600}}
              >瀏覽商品</button>
            </div>
          ) : (
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:20}}>
              {favProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onView={() => { setSelectedProduct(p); setPage("product-detail"); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
