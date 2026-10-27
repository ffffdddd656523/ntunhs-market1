import { useState } from 'react';
import { SearchIcon, ClockIcon, MapPinIcon, DollarIcon } from '../components/Icons';
import { Badge } from '../components/Common';
import { JOBS } from '../data';

export default function JobListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const typeColor = {
    "校內工讀": ["#1d4ed8","#dbeafe"],
    "校外兼職": ["#c2410c","#ffedd5"],
    "實習機會": ["#15803d","#dcfce7"]
  };

  const filtered = JOBS.filter(j => {
    if (type !== "all" && j.type !== type) return false;
    if (search && !j.title.includes(search) && !j.description.includes(search)) return false;
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

      {/* Job List */}
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        {filtered.map(j => {
          const [tc, bc] = typeColor[j.type] || ["#374151","#f3f4f6"];
          return (
            <div key={j.id} style={{background:"#fff", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", flexWrap:"wrap", gap:16, alignItems:"flex-start"}}>
              <div style={{flex:1, minWidth:220}}>
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                  <Badge color={tc} bg={bc}>{j.type}</Badge>
                  <span style={{fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:3}}>
                    <ClockIcon/>{j.date}
                  </span>
                </div>
                <h3 style={{fontSize:17, fontWeight:700, color:"#1e293b", marginBottom:8}}>{j.title}</h3>
                <p style={{fontSize:13, color:"#64748b", marginBottom:12, lineHeight:1.6}}>{j.description}</p>
                <div style={{display:"flex", flexWrap:"wrap", gap:12, fontSize:13, color:"#475569"}}>
                  <span style={{display:"flex", gap:4, alignItems:"center"}}><MapPinIcon/>{j.location}</span>
                  <span style={{display:"flex", gap:4, alignItems:"center"}}><DollarIcon/>{j.salary}</span>
                  <span style={{display:"flex", gap:4, alignItems:"center"}}><ClockIcon/>{j.hours}</span>
                </div>
              </div>
              <div style={{background:"#f8fafc", borderRadius:12, padding:"14px 16px", minWidth:180}}>
                <div style={{fontSize:12, color:"#94a3b8", marginBottom:4}}>聯絡方式</div>
                <div style={{fontSize:14, color:"#1e293b", fontWeight:600}}>{j.contact}</div>
                <div style={{fontSize:12, color:"#64748b", marginTop:6}}>發布者：{j.poster}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
