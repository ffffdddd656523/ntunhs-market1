import { HeartIcon, ClockIcon } from './Icons';

// ============================================================
// AVATAR
// ============================================================
export function Avatar({ name, color, size=40 }) {
  const initials = name ? name[0] : "?";
  return (
    <div style={{width:size, height:size, borderRadius:"50%", background:color||"#0EA5E9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
      <span style={{color:"#fff", fontSize:size*0.38, fontWeight:700}}>{initials}</span>
    </div>
  );
}

// ============================================================
// BADGE
// ============================================================
export function Badge({ children, color="#0EA5E9", bg="#e0f2fe" }) {
  return (
    <span style={{display:"inline-block", padding:"2px 10px", borderRadius:99, background:bg, color, fontSize:12, fontWeight:600}}>
      {children}
    </span>
  );
}

// ============================================================
// CATEGORY BADGE
// ============================================================
export function CategoryBadge({ cat }) {
  const map = {
    "書籍":["#1d4ed8","#dbeafe"],
    "彩妝":["#be185d","#fce7f3"],
    "衣服":["#7c3aed","#ede9fe"],
    "生活用品":["#065f46","#d1fae5"],
    "打工資訊":["#c2410c","#ffedd5"],
    "換課資訊":["#15803d","#dcfce7"]
  };
  const [c, b] = map[cat] || ["#374151","#f3f4f6"];
  return <Badge color={c} bg={b}>{cat}</Badge>;
}

// ============================================================
// PRODUCT CARD
// ============================================================
export function ProductCard({ product, onClick, onFavorite, isFav }) {
  return (
    <div
      onClick={() => onClick(product)}
      style={{background:"#fff", borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,.07)", overflow:"hidden", cursor:"pointer", transition:"transform .18s, box-shadow .18s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.13)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,.07)"}}
    >
      <div style={{position:"relative", aspectRatio:"4/3", overflow:"hidden", background:"#f1f5f9"}}>
        <img src={product.image} alt={product.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
        <button
          onClick={e=>{e.stopPropagation();onFavorite(product.id)}}
          style={{position:"absolute", top:10, right:10, width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}
        >
          <HeartIcon filled={isFav}/>
        </button>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
          <CategoryBadge cat={product.category}/>
          <span style={{fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:3}}>
            <ClockIcon/>{product.date}
          </span>
        </div>
        <h3 style={{margin:"0 0 6px", fontSize:15, fontWeight:600, color:"#1e293b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{product.title}</h3>
        <p style={{margin:"0 0 10px", fontSize:13, color:"#64748b", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{product.description}</p>
        {product.price && <div style={{fontSize:18, fontWeight:700, color:"#0ea5e9"}}>NT$ {product.price}</div>}
      </div>
    </div>
  );
}
