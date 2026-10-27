import { ClockIcon, MessageCircleIcon, HeartIcon, MailIcon } from '../components/Icons';
import { CategoryBadge, Avatar } from '../components/Common';

export default function ProductDetailPage({ product, favorites, toggleFav, setPage, onContact }) {
  if (!product) return null;
  const isFav = favorites.has(product.id);

  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"32px 20px"}}>
      {/* Breadcrumb */}
      <div style={{fontSize:13, color:"#64748b", marginBottom:20}}>
        <button onClick={()=>setPage("home")} style={{border:"none",background:"none",color:"#64748b",cursor:"pointer",padding:0}}>首頁</button>
        <span style={{margin:"0 8px"}}>/</span>
        <button onClick={()=>setPage("products")} style={{border:"none",background:"none",color:"#64748b",cursor:"pointer",padding:0}}>商品分類</button>
        <span style={{margin:"0 8px"}}>/</span>
        <span style={{color:"#1e293b"}}>{product.title}</span>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:28}}>
        {/* Left: Image + Description */}
        <div>
          <div style={{borderRadius:18, overflow:"hidden", background:"#f1f5f9", marginBottom:24}}>
            <img src={product.image} alt={product.title} style={{width:"100%", aspectRatio:"4/3", objectFit:"cover", display:"block"}}/>
          </div>
          <div style={{background:"#fff", borderRadius:18, padding:"28px", boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
            <div style={{marginBottom:14}}><CategoryBadge cat={product.category}/></div>
            <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:10}}>{product.title}</h1>
            <div style={{fontSize:28, fontWeight:800, color:"#0ea5e9", marginBottom:18}}>NT$ {product.price}</div>
            <div style={{display:"flex", gap:20, fontSize:13, color:"#64748b", paddingBottom:18, borderBottom:"1px solid #f1f5f9", marginBottom:18}}>
              <span style={{display:"flex", alignItems:"center", gap:4}}><ClockIcon/>發布於 2026年3月14日</span>
              <span>瀏覽次數：48</span>
            </div>
            <h2 style={{fontSize:17, fontWeight:700, color:"#1e293b", marginBottom:10}}>商品描述</h2>
            <p style={{color:"#475569", lineHeight:1.9, whiteSpace:"pre-line"}}>{product.description}</p>
            <div style={{display:"flex", gap:12, marginTop:28}}>
              <button
                onClick={() => onContact()}
                style={{flex:1, background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", padding:"13px 0", borderRadius:12, fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8}}
              >
                <MessageCircleIcon/>聯絡賣家
              </button>
              <button
                onClick={() => toggleFav(product.id)}
                style={{padding:"13px 24px", borderRadius:12, border:`2px solid ${isFav?"#ef4444":"#e2e8f0"}`, background:isFav?"#fef2f2":"#fff", color:isFav?"#ef4444":"#475569", cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:6}}
              >
                <HeartIcon filled={isFav}/>{isFav?"已收藏":"加入典藏"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Seller Info */}
        <aside>
          <div style={{background:"#fff", borderRadius:18, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,.06)", position:"sticky", top:84}}>
            <h3 style={{fontSize:16, fontWeight:700, color:"#1e293b", marginBottom:16}}>賣家資訊</h3>
            <div style={{display:"flex", alignItems:"center", gap:12, paddingBottom:16, borderBottom:"1px solid #f1f5f9", marginBottom:16}}>
              <Avatar name={product.seller} color="#0ea5e9" size={54}/>
              <div>
                <div style={{fontWeight:700, color:"#1e293b"}}>{product.seller}</div>
                <div style={{fontSize:13, color:"#64748b"}}>{product.dept}</div>
              </div>
            </div>
            <div style={{fontSize:13, color:"#475569", marginBottom:6, display:"flex", gap:8, alignItems:"flex-start"}}>
              <MailIcon/><span>student@ntunhs.edu.tw</span>
            </div>
            <button
              onClick={() => onContact()}
              style={{width:"100%", marginTop:18, background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", padding:"11px 0", borderRadius:10, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
            >
              <MessageCircleIcon/>開始聊天
            </button>
            <div style={{marginTop:16, background:"#fffbeb", borderRadius:10, padding:"12px 14px"}}>
              <div style={{fontSize:13, fontWeight:700, color:"#b45309", marginBottom:6}}>交易安全提醒</div>
              <ul style={{fontSize:12, color:"#92400e", paddingLeft:16, lineHeight:1.8}}>
                <li>建議面交驗貨</li>
                <li>使用校園安全地點</li>
                <li>確認商品無誤再付款</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
