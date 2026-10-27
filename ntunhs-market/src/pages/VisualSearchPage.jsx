import { useState } from 'react';
import { UploadIcon, SearchIcon, XIcon } from '../components/Icons';
import { ProductCard } from '../components/Common';
import { PRODUCTS } from '../data';

export default function VisualSearchPage({ setPage, setSelectedProduct }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handleImg = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => {
      setImgSrc(r.result);
      setResults(null);
    };
    r.readAsDataURL(f);
  };

  const runSearch = () => {
    if (!imgSrc) return;
    setSearching(true);
    setResults(null);
    // Simulate AI image search with a delay
    setTimeout(() => {
      setSearching(false);
      const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5).slice(0, 4);
      setResults(shuffled);
    }, 2200);
  };

  return (
    <div style={{maxWidth:900, margin:"0 auto", padding:"32px 20px"}}>
      <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6}}>圖片搜尋</h1>
      <p style={{color:"#64748b", marginBottom:28}}>上傳圖片，AI 自動找相似商品</p>

      <div style={{background:"#fff", borderRadius:18, padding:"36px 32px", boxShadow:"0 2px 14px rgba(0,0,0,.07)", marginBottom:28}}>
        {imgSrc ? (
          <div style={{position:"relative", marginBottom:24}}>
            <img src={imgSrc} alt="uploaded" style={{width:"100%", maxHeight:320, objectFit:"contain", borderRadius:14, background:"#f8fafc"}}/>
            <button
              onClick={() => { setImgSrc(null); setResults(null); }}
              style={{position:"absolute", top:10, right:10, width:32, height:32, borderRadius:"50%", background:"#ef4444", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}
            >
              <XIcon/>
            </button>
          </div>
        ) : (
          <label
            style={{display:"block", border:"2px dashed #cbd5e1", borderRadius:16, padding:"52px 24px", textAlign:"center", cursor:"pointer", marginBottom:24, transition:"border-color .15s, background .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#0ea5e9";e.currentTarget.style.background="#f0f9ff";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#cbd5e1";e.currentTarget.style.background="#fff";}}
          >
            <input type="file" accept="image/*" onChange={handleImg} style={{display:"none"}}/>
            <div style={{width:56, height:56, margin:"0 auto 14px", color:"#94a3b8"}}><UploadIcon/></div>
            <p style={{fontWeight:600, color:"#374151", fontSize:16, marginBottom:4}}>點擊或拖曳圖片到此</p>
            <p style={{color:"#94a3b8", fontSize:13}}>支援 JPG、PNG、WEBP 格式</p>
          </label>
        )}

        <button
          onClick={runSearch}
          disabled={!imgSrc || searching}
          style={{width:"100%", padding:"14px 0", borderRadius:12, border:"none", background:imgSrc && !searching?"linear-gradient(135deg,#0ea5e9,#0284c7)":"#e2e8f0", color:imgSrc && !searching?"#fff":"#94a3b8", fontWeight:700, fontSize:16, cursor:imgSrc && !searching?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .2s"}}
        >
          {searching ? (
            <>
              <span style={{display:"inline-block", width:18, height:18, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite"}}/>
              AI 分析圖片中…
            </>
          ) : (
            <><SearchIcon/>開始搜尋相似商品</>
          )}
        </button>
      </div>

      {searching && (
        <div style={{textAlign:"center", color:"#0284c7", fontSize:15, padding:"20px 0"}}>
          <div style={{marginBottom:12}}>🔍 正在比對商品資料庫...</div>
          <div style={{color:"#64748b", fontSize:13}}>AI 圖像辨識需要幾秒鐘，請稍候</div>
        </div>
      )}

      {results && (
        <div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:20}}>
            <div style={{width:6, height:22, background:"linear-gradient(#0ea5e9,#0284c7)", borderRadius:3}}/>
            <h2 style={{fontSize:18, fontWeight:700, color:"#1e293b"}}>搜尋結果（找到 {results.length} 件相似商品）</h2>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:20}}>
            {results.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onView={() => { setSelectedProduct(p); setPage("product-detail"); }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
