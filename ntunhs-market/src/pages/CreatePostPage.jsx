import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { XIcon, UploadIcon } from '../components/Icons';

export default function CreatePostPage({ setPage, isLoggedIn, user }) {
  const [form, setForm] = useState({type:"product", title:"", category:"", price:"", description:"", contact:""});
  const [img, setImg] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState("product");
  const [countdown, setCountdown] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 發布成功後 3 秒自動跳轉
  useEffect(() => {
    if (!submitted) return;
    const dest = submittedType === "product" ? "products" : submittedType === "job" ? "jobs" : "courses";
    if (countdown <= 0) { setPage(dest); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [submitted, countdown, submittedType, setPage]);

  const handleImg = e => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onloadend = () => setImg(r.result);
      r.readAsDataURL(f);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const collectionName = form.type === "product" ? "products" : form.type === "job" ? "jobs" : "courses";
      await addDoc(collection(db, collectionName), {
        title: form.title,
        category: form.category,
        price: form.type === "product" ? Number(form.price) : null,
        description: form.description,
        contact: form.contact,
        type: form.type,
        image: img || null,
        authorId: user?.uid || "",
        authorName: user?.name || "",
        authorEmail: user?.email || "",
        createdAt: new Date().toISOString(),
        likes: 0,
      });
      setSubmittedType(form.type);
      setSubmitted(true);
    } catch (err) {
      setError("發布失敗，請再試一次：" + err.message);
    }
    setLoading(false);
  };

  if (!isLoggedIn) return (
    <div style={{maxWidth:500, margin:"80px auto", textAlign:"center", padding:"0 20px"}}>
      <div style={{fontSize:60, marginBottom:16}}>🔒</div>
      <h2 style={{fontSize:22, fontWeight:800, color:"#1e293b", marginBottom:10}}>請先登入</h2>
      <p style={{color:"#64748b", marginBottom:24}}>發布貼文需要登入帳號</p>
      <button onClick={()=>setPage("login")} style={{background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", padding:"13px 32px", borderRadius:12, cursor:"pointer", fontWeight:700, fontSize:16}}>
        立即登入
      </button>
    </div>
  );

  if (submitted) {
    const dest = submittedType === "product" ? "products" : submittedType === "job" ? "jobs" : "courses";
    const destLabel = submittedType === "product" ? "瀏覽商品" : submittedType === "job" ? "打工資訊" : "換課資訊";
    return (
      <div style={{maxWidth:500, margin:"80px auto", textAlign:"center", padding:"0 20px"}}>
        <div style={{fontSize:60, marginBottom:16}}>🎉</div>
        <h2 style={{fontSize:22, fontWeight:800, color:"#1e293b", marginBottom:10}}>貼文發布成功！</h2>
        <p style={{color:"#64748b", marginBottom:8}}>你的貼文已成功發布，等待大家聯絡。</p>
        <p style={{color:"#94a3b8", fontSize:13, marginBottom:24}}>{countdown} 秒後自動跳轉…</p>
        <div style={{display:"flex", gap:12, justifyContent:"center"}}>
          <button onClick={()=>setPage(dest)} style={{background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", padding:"12px 24px", borderRadius:10, cursor:"pointer", fontWeight:700}}>
            {destLabel}
          </button>
          <button onClick={()=>{setForm({type:"product",title:"",category:"",price:"",description:"",contact:""});setImg(null);setSubmitted(false);setCountdown(3)}} style={{background:"#f1f5f9", color:"#475569", border:"none", padding:"12px 24px", borderRadius:10, cursor:"pointer", fontWeight:600}}>
            再發一篇
          </button>
        </div>
      </div>
    );
  }

  const catOptions = form.type==="product"
    ? ["書籍","彩妝","衣服","生活用品"]
    : form.type==="job"
    ? ["校內工讀","校外兼職","實習機會"]
    : ["必修課程","選修課程"];

  return (
    <div style={{maxWidth:680, margin:"0 auto", padding:"32px 20px"}}>
      <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6}}>發布貼文</h1>
      <p style={{color:"#64748b", marginBottom:28}}>分享你的商品、打工資訊或換課需求</p>

      <form onSubmit={handleSubmit} style={{background:"#fff", borderRadius:18, padding:"32px 28px", boxShadow:"0 2px 14px rgba(0,0,0,.07)"}}>
        {/* Type Selector */}
        <div style={{marginBottom:22}}>
          <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:8}}>貼文類型 *</label>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
            {[["product","商品販售"],["job","打工資訊"],["course","換課資訊"]].map(([v,l]) => (
              <button
                type="button"
                key={v}
                onClick={() => setForm({...form, type:v, category:""})}
                style={{padding:"12px 0", borderRadius:10, border:`2px solid ${form.type===v?"#0ea5e9":"#e2e8f0"}`, background:form.type===v?"#e0f2fe":"#fff", color:form.type===v?"#0284c7":"#475569", fontWeight:600, cursor:"pointer", fontSize:14, transition:"all .15s"}}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{marginBottom:18}}>
          <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>標題 *</label>
          <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="請輸入標題" style={{width:"100%", padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
        </div>

        {/* Category */}
        <div style={{marginBottom:18}}>
          <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>類別 *</label>
          <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:"100%", padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none"}}>
            <option value="">請選擇類別</option>
            {catOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Price (product only) */}
        {form.type === "product" && (
          <div style={{marginBottom:18}}>
            <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>價格 (NT$) *</label>
            <input required type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="請輸入價格" style={{width:"100%", padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
          </div>
        )}

        {/* Description */}
        <div style={{marginBottom:18}}>
          <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>詳細描述 *</label>
          <textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="請詳細描述商品狀況..." rows={5} style={{width:"100%", padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", resize:"vertical", boxSizing:"border-box"}}/>
        </div>

        {/* Image Upload */}
        <div style={{marginBottom:18}}>
          <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>上傳圖片</label>
          {img ? (
            <div style={{position:"relative"}}>
              <img src={img} alt="preview" style={{width:"100%", height:200, objectFit:"cover", borderRadius:10}}/>
              <button type="button" onClick={()=>setImg(null)} style={{position:"absolute", top:10, right:10, width:30, height:30, borderRadius:"50%", background:"#ef4444", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>
                <XIcon/>
              </button>
            </div>
          ) : (
            <label
              style={{display:"block", border:"2px dashed #e2e8f0", borderRadius:12, padding:"32px", textAlign:"center", cursor:"pointer", transition:"border-color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#0ea5e9"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}
            >
              <input type="file" accept="image/*" onChange={handleImg} style={{display:"none"}}/>
              <div style={{color:"#94a3b8", margin:"0 auto 8px", width:40, height:40}}><UploadIcon/></div>
              <p style={{color:"#64748b", fontSize:14}}>點擊上傳圖片</p>
              <p style={{color:"#94a3b8", fontSize:12, marginTop:4}}>支援 JPG、PNG 格式</p>
            </label>
          )}
        </div>

        {/* Contact */}
        <div style={{marginBottom:24}}>
          <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>聯絡方式 *</label>
          <input required value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="例如：Email、手機號碼、Line ID" style={{width:"100%", padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
        </div>

        {error && (
          <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", marginBottom:16, color:"#dc2626", fontSize:13}}>
            {error}
          </div>
        )}

        <div style={{display:"flex", gap:12}}>
          <button type="submit" disabled={loading} style={{flex:1, background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", padding:"13px 0", borderRadius:12, fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1}}>
            {loading ? "發布中..." : "發布貼文"}
          </button>
          <button type="button" onClick={()=>setForm({type:"product",title:"",category:"",price:"",description:"",contact:""})} style={{padding:"13px 24px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", cursor:"pointer", fontWeight:600}}>
            重設
          </button>
        </div>
      </form>
    </div>
  );
}
