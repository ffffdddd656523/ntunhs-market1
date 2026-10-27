import { useState } from 'react';
import { SearchIcon, ShoppingBagIcon, BriefcaseIcon, RefreshIcon, FilterIcon, MessageCircleIcon, ImageIcon } from '../components/Icons';
import { ProductCard } from '../components/Common';
import { PRODUCTS } from '../data';

export default function HomePage({ setPage, favorites, toggleFav, onViewProduct }) {  const [searchQuery, setSearchQuery] = useState("");

  const featuredCats = [
    {label:"商品分類", icon:<ShoppingBagIcon/>, color:"#0ea5e9", bg:"#e0f2fe", border:"#0ea5e9", page:"products", desc:"二手書、彩妝、衣服、生活用品"},
    {label:"打工資訊", icon:<BriefcaseIcon/>, color:"#f97316", bg:"#ffedd5", border:"#f97316", page:"jobs", desc:"校內外工讀、兼職機會"},
    {label:"換課資訊", icon:<RefreshIcon/>, color:"#22c55e", bg:"#dcfce7", border:"#22c55e", page:"courses", desc:"課程時段交換需求"},
  ];

  const features = [
    {icon:<FilterIcon/>, color:"#0ea5e9", bg:"#e0f2fe", title:"分類清楚", desc:"商品、打工、換課資訊分門別類，一目了然"},
    {icon:<SearchIcon/>, color:"#22c55e", bg:"#dcfce7", title:"搜尋方便", desc:"關鍵字搜尋，快速找到需要的資訊"},
    {icon:<BriefcaseIcon/>, color:"#8b5cf6", bg:"#ede9fe", title:"校園專用", desc:"僅限北護學生使用，安全可靠的交流環境"},
    {icon:<MessageCircleIcon/>, color:"#f59e0b", bg:"#fef3c7", title:"聊天室聯絡", desc:"可直接聯絡賣家，資訊不會被洗掉"},
  ];

  const latest = PRODUCTS.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)", color:"#fff", padding:"72px 20px 100px"}}>
        <div style={{maxWidth:760, margin:"0 auto", textAlign:"center"}}>
          <h1 style={{fontSize:"clamp(24px,4vw,40px)", fontWeight:800, marginBottom:12, letterSpacing:-.5}}>
            讓北護學生更方便交流與交易
          </h1>
          <p style={{fontSize:16, color:"#bae6fd", marginBottom:32}}>
            二手書、彩妝、衣服、打工與換課資訊，一站整合
          </p>
          <div style={{display:"flex", gap:10, maxWidth:540, margin:"0 auto"}}>
            <div style={{flex:1, position:"relative"}}>
              <div style={{position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94a3b8"}}>
                <SearchIcon/>
              </div>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key==="Enter" && setPage("products")}
                placeholder="搜尋商品、打工、換課資訊..."
                style={{width:"100%", padding:"13px 14px 13px 44px", borderRadius:10, border:"none", fontSize:15, outline:"none", boxSizing:"border-box"}}
              />
            </div>
            <button
              onClick={() => setPage("visual-search")}
              style={{background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", color:"#fff", padding:"0 18px", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:600, backdropFilter:"blur(8px)"}}
            >
              <ImageIcon/>以圖搜圖
            </button>
          </div>
          <button
            onClick={() => setPage("products")}
            style={{marginTop:16, background:"rgba(255,255,255,.18)", border:"1px solid rgba(255,255,255,.35)", color:"#fff", padding:"10px 28px", borderRadius:10, cursor:"pointer", fontSize:15, fontWeight:600, backdropFilter:"blur(8px)"}}
          >
            開始瀏覽 →
          </button>
        </div>
      </section>

      {/* Category Cards */}
      <div style={{maxWidth:1200, margin:"-48px auto 0", padding:"0 20px"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap:20}}>
          {featuredCats.map(c => (
            <button
              key={c.page}
              onClick={() => setPage(c.page)}
              style={{background:"#fff", borderRadius:18, padding:"28px 24px", boxShadow:"0 4px 20px rgba(0,0,0,.08)", border:`2px solid ${c.border}`, cursor:"pointer", textAlign:"center", transition:"transform .18s, box-shadow .18s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,.14)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,.08)"}}
            >
              <div style={{width:52, height:52, borderRadius:"50%", background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:c.color}}>
                {c.icon}
              </div>
              <h3 style={{fontSize:17, fontWeight:700, color:"#1e293b", marginBottom:6}}>{c.label}</h3>
              <p style={{fontSize:13, color:"#64748b"}}>{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Latest Products */}
      <section style={{maxWidth:1200, margin:"56px auto 0", padding:"0 20px"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24}}>
          <h2 style={{fontSize:22, fontWeight:800, color:"#1e293b"}}>最新貼文</h2>
          <button onClick={() => setPage("products")} style={{background:"none", border:"none", color:"#0ea5e9", cursor:"pointer", fontWeight:600, fontSize:14}}>
            查看全部 →
          </button>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:20}}>
          {latest.map(p => (
            <ProductCard key={p.id} product={p} onClick={onViewProduct}onFavorite={toggleFav} isFav={favorites.has(p.id)}/>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{maxWidth:1200, margin:"56px auto 0", padding:"0 20px"}}>
        <h2 style={{fontSize:22, fontWeight:800, color:"#1e293b", textAlign:"center", marginBottom:32}}>網站特色</h2>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:20}}>
          {features.map(f => (
            <div key={f.title} style={{background:"#fff", borderRadius:16, padding:"24px 20px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,.05)"}}>
              <div style={{width:48, height:48, borderRadius:"50%", background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:f.color}}>
                {f.icon}
              </div>
              <h3 style={{fontSize:15, fontWeight:700, color:"#1e293b", marginBottom:8}}>{f.title}</h3>
              <p style={{fontSize:13, color:"#64748b", lineHeight:1.7}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
