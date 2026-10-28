import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { SearchIcon, ClockIcon, MapPinIcon, DollarIcon, XIcon } from '../components/Icons';
import { Badge } from '../components/Common';
import { JOBS } from '../data';

const TYPE_COLOR = {
  "校內工讀": ["#1d4ed8","#dbeafe"],
  "校外兼職": ["#c2410c","#ffedd5"],
  "實習機會": ["#15803d","#dcfce7"]
};

function JobModal({ job, onClose }) {
  if (!job) return null;
  const jobType = job.category || job.type || "校內工讀";
  const [tc, bc] = TYPE_COLOR[jobType] || ["#374151","#f3f4f6"];
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(job.contact || "").then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{background:"#fff",borderRadius:20,padding:"32px 28px",maxWidth:540,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.18)",position:"relative",maxHeight:"85vh",overflowY:"auto"}}
      >
        {/* Close */}
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,width:32,height:32,borderRadius:"50%",border:"none",background:"#f1f5f9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
          <XIcon/>
        </button>

        {/* Header */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <Badge color={tc} bg={bc}>{jobType}</Badge>
          <span style={{fontSize:12,color:"#94a3b8",display:"flex",alignItems:"center",gap:3}}>
            <ClockIcon/>{job.date || (job.createdAt||"").slice(0,10)}
          </span>
        </div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#1e293b",marginBottom:20,lineHeight:1.3}}>{job.title}</h2>

        {/* Info grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,background:"#f8fafc",borderRadius:14,padding:"16px 18px",marginBottom:20}}>
          {job.location && (
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>地點</div>
              <div style={{fontSize:14,fontWeight:600,color:"#1e293b",display:"flex",alignItems:"center",gap:4}}><MapPinIcon/>{job.location}</div>
            </div>
          )}
          {job.salary && (
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>薪資</div>
              <div style={{fontSize:14,fontWeight:600,color:"#16a34a",display:"flex",alignItems:"center",gap:4}}><DollarIcon/>{job.salary}</div>
            </div>
          )}
          {job.hours && (
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>時間</div>
              <div style={{fontSize:14,fontWeight:600,color:"#1e293b",display:"flex",alignItems:"center",gap:4}}><ClockIcon/>{job.hours}</div>
            </div>
          )}
          {(job.authorName||job.poster) && (
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>發布者</div>
              <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{job.authorName||job.poster}</div>
            </div>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <div style={{marginBottom:22}}>
            <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:8}}>職缺說明</div>
            <p style={{fontSize:14,color:"#475569",lineHeight:1.8,background:"#f8fafc",borderRadius:10,padding:"14px 16px"}}>{job.description}</p>
          </div>
        )}

        {/* Contact */}
        <div style={{background:"#eff6ff",borderRadius:14,padding:"16px 18px"}}>
          <div style={{fontSize:12,color:"#3b82f6",fontWeight:600,marginBottom:6}}>聯絡方式</div>
          <div style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:12}}>{job.contact}</div>
          <button
            onClick={copy}
            style={{width:"100%",padding:"11px 0",borderRadius:10,border:"none",background:copied?"#22c55e":"linear-gradient(135deg,#0ea5e9,#0284c7)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",transition:"background .2s"}}
          >
            {copied ? "✓ 已複製！" : "複製聯絡方式"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q,
      snap => { setJobs([...snap.docs.map(d => ({ id: d.id, ...d.data() })), ...JOBS]); setLoading(false); },
      () => { setJobs(JOBS); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const filtered = jobs.filter(j => {
    if (type !== "all" && j.category !== type && j.type !== type) return false;
    if (search && !j.title?.includes(search) && !j.description?.includes(search)) return false;
    return true;
  });

  return (
    <div style={{maxWidth:1000, margin:"0 auto", padding:"32px 20px"}}>
      <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6}}>打工資訊</h1>
      <p style={{color:"#64748b", marginBottom:24}}>校內外工讀、兼職機會</p>

      {/* Filter Bar */}
      <div style={{display:"flex", gap:12, marginBottom:28, flexWrap:"wrap"}}>
        <div style={{position:"relative", flex:1, minWidth:200}}>
          <div style={{position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8"}}><SearchIcon/></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋工作..." style={{width:"100%", padding:"10px 10px 10px 40px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
        </div>
        {["all","校內工讀","校外兼職","實習機會"].map(t => (
          <button key={t} onClick={()=>setType(t)} style={{padding:"10px 16px", borderRadius:10, border:`1.5px solid ${type===t?"#0ea5e9":"#e2e8f0"}`, background:type===t?"#e0f2fe":"#fff", color:type===t?"#0284c7":"#64748b", cursor:"pointer", fontWeight:600, fontSize:14}}>
            {t==="all" ? "全部" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
          <div style={{fontSize:32, marginBottom:12}}>⏳</div><p>載入中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
          <p>找不到符合條件的打工資訊</p>
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          {filtered.map(j => {
            const jobType = j.category || j.type || "校內工讀";
            const [tc, bc] = TYPE_COLOR[jobType] || ["#374151","#f3f4f6"];
            return (
              <div
                key={j.id}
                onClick={() => setSelected(j)}
                style={{background:"#fff", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", flexWrap:"wrap", gap:16, alignItems:"flex-start", cursor:"pointer", transition:"box-shadow .15s, transform .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,.11)"; e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.06)"; e.currentTarget.style.transform="none";}}
              >
                <div style={{flex:1, minWidth:220}}>
                  <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                    <Badge color={tc} bg={bc}>{jobType}</Badge>
                    <span style={{fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:3}}>
                      <ClockIcon/>{j.date || (j.createdAt || "").slice(0,10)}
                    </span>
                  </div>
                  <h3 style={{fontSize:17, fontWeight:700, color:"#1e293b", marginBottom:8}}>{j.title}</h3>
                  <p style={{fontSize:13, color:"#64748b", marginBottom:12, lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{j.description}</p>
                  <div style={{display:"flex", flexWrap:"wrap", gap:12, fontSize:13, color:"#475569"}}>
                    {j.location && <span style={{display:"flex", gap:4, alignItems:"center"}}><MapPinIcon/>{j.location}</span>}
                    {j.salary && <span style={{display:"flex", gap:4, alignItems:"center"}}><DollarIcon/>{j.salary}</span>}
                    {j.hours && <span style={{display:"flex", gap:4, alignItems:"center"}}><ClockIcon/>{j.hours}</span>}
                  </div>
                </div>
                <div style={{background:"#f8fafc", borderRadius:12, padding:"14px 16px", minWidth:180}}>
                  <div style={{fontSize:12, color:"#94a3b8", marginBottom:4}}>聯絡方式</div>
                  <div style={{fontSize:14, color:"#1e293b", fontWeight:600}}>{j.contact}</div>
                  <div style={{fontSize:12, color:"#64748b", marginTop:6}}>發布者：{j.authorName || j.poster}</div>
                  <div style={{marginTop:10, fontSize:12, color:"#0ea5e9", fontWeight:600}}>點擊查看詳情 →</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <JobModal job={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
