import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { SearchIcon, ClockIcon, UserIcon, XIcon } from '../components/Icons';
import { Badge } from '../components/Common';
import { COURSES } from '../data';

function CourseModal({ course, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!course) return null;
  const courseType = course.category || course.type || "必修課程";
  const [tc, bc] = courseType === "必修課程"
    ? ["#1d4ed8","#dbeafe"]
    : ["#7c3aed","#ede9fe"];
  const copy = () => {
    navigator.clipboard?.writeText(course.contact || "").then(() => {
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

        {/* Header badges */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
          <Badge color={tc} bg={bc}>{courseType}</Badge>
          {course.courseName && <Badge color="#15803d" bg="#dcfce7">{course.courseName}</Badge>}
          <span style={{marginLeft:"auto",fontSize:12,color:"#94a3b8",display:"flex",gap:3,alignItems:"center"}}>
            <ClockIcon/>{course.date || (course.createdAt||"").slice(0,10)}
          </span>
        </div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#1e293b",marginBottom:20,lineHeight:1.3}}>{course.title}</h2>

        {/* Time swap grid */}
        {(course.currentTime || course.desiredTime) && (
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",background:"#f8fafc",borderRadius:14,padding:"18px",marginBottom:20}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>現在時段</div>
              <div style={{fontSize:15,fontWeight:700,color:"#1e293b"}}>{course.currentTime || "—"}</div>
            </div>
            <div style={{fontSize:22,color:"#94a3b8",fontWeight:300}}>→</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>希望換到</div>
              <div style={{fontSize:15,fontWeight:700,color:"#0284c7"}}>{course.desiredTime || "—"}</div>
            </div>
          </div>
        )}

        {/* Description */}
        {course.description && (
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:8}}>詳細說明</div>
            <p style={{fontSize:14,color:"#475569",lineHeight:1.8,background:"#f8fafc",borderRadius:10,padding:"14px 16px"}}>{course.description}</p>
          </div>
        )}

        {/* Reason */}
        {course.reason && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:8}}>換課原因</div>
            <p style={{fontSize:14,color:"#475569",lineHeight:1.7,background:"#fffbeb",borderRadius:10,padding:"12px 16px",borderLeft:"3px solid #fbbf24"}}>{course.reason}</p>
          </div>
        )}

        {/* Poster */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,background:"#f8fafc",borderRadius:10,padding:"12px 14px"}}>
          <UserIcon/>
          <div>
            <div style={{fontSize:12,color:"#94a3b8"}}>發布者</div>
            <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{course.authorName || course.poster}{course.department ? `（${course.department}）` : ""}</div>
          </div>
        </div>

        {/* Contact */}
        <div style={{background:"#f0fdf4",borderRadius:14,padding:"16px 18px"}}>
          <div style={{fontSize:12,color:"#16a34a",fontWeight:600,marginBottom:6}}>聯絡方式</div>
          <div style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:12}}>{course.contact}</div>
          <button
            onClick={copy}
            style={{width:"100%",padding:"11px 0",borderRadius:10,border:"none",background:copied?"#22c55e":"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",transition:"background .2s"}}
          >
            {copied ? "✓ 已複製！" : "複製聯絡方式"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q,
      snap => { setCourses([...snap.docs.map(d => ({ id: d.id, ...d.data() })), ...COURSES]); setLoading(false); },
      () => { setCourses(COURSES); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const filtered = courses.filter(c => {
    const courseType = c.category || c.type || "";
    if (type !== "all" && courseType !== type) return false;
    if (search && !c.title?.includes(search) && !c.description?.includes(search)) return false;
    return true;
  });

  return (
    <div style={{maxWidth:1000, margin:"0 auto", padding:"32px 20px"}}>
      <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6}}>換課資訊</h1>
      <p style={{color:"#64748b", marginBottom:24}}>課程時段交換需求</p>

      {/* Filter Bar */}
      <div style={{display:"flex", gap:12, marginBottom:28, flexWrap:"wrap"}}>
        <div style={{position:"relative", flex:1, minWidth:200}}>
          <div style={{position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8"}}><SearchIcon/></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋課程..." style={{width:"100%", padding:"10px 10px 10px 40px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
        </div>
        {["all","必修課程","選修課程"].map(t => (
          <button key={t} onClick={()=>setType(t)} style={{padding:"10px 16px", borderRadius:10, border:`1.5px solid ${type===t?"#22c55e":"#e2e8f0"}`, background:type===t?"#dcfce7":"#fff", color:type===t?"#16a34a":"#64748b", cursor:"pointer", fontWeight:600, fontSize:14}}>
            {t==="all" ? "全部" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
          <div style={{fontSize:32, marginBottom:12}}>⏳</div>
          <p>載入中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
          <p>找不到符合條件的換課資訊</p>
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          {filtered.map(c => {
            const courseType = c.category || c.type || "必修課程";
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{background:"#fff", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", cursor:"pointer", transition:"box-shadow .15s, transform .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,.11)"; e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.06)"; e.currentTarget.style.transform="none";}}
              >
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                  <Badge color={courseType==="必修課程"?"#1d4ed8":"#7c3aed"} bg={courseType==="必修課程"?"#dbeafe":"#ede9fe"}>{courseType}</Badge>
                  {c.courseName && <Badge color="#15803d" bg="#dcfce7">{c.courseName}</Badge>}
                  <span style={{marginLeft:"auto", fontSize:12, color:"#94a3b8", display:"flex", gap:3, alignItems:"center"}}>
                    <ClockIcon/>{c.date || (c.createdAt || "").slice(0,10)}
                  </span>
                </div>
                <h3 style={{fontSize:17, fontWeight:700, color:"#1e293b", marginBottom:12}}>{c.title}</h3>
                {(c.currentTime || c.desiredTime) && (
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, background:"#f8fafc", borderRadius:10, padding:"14px 16px", marginBottom:12}}>
                    {c.currentTime && <div>
                      <div style={{fontSize:12, color:"#94a3b8", marginBottom:3}}>現在時段</div>
                      <div style={{fontSize:14, fontWeight:600, color:"#1e293b"}}>{c.currentTime}</div>
                    </div>}
                    {c.desiredTime && <div>
                      <div style={{fontSize:12, color:"#94a3b8", marginBottom:3}}>希望換到</div>
                      <div style={{fontSize:14, fontWeight:600, color:"#0284c7"}}>{c.desiredTime}</div>
                    </div>}
                  </div>
                )}
                {c.description && <p style={{fontSize:13, color:"#64748b", marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{c.description}</p>}
                <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, fontSize:13}}>
                  <span style={{display:"flex", gap:6, alignItems:"center", color:"#475569"}}>
                    <UserIcon/>{c.authorName || c.poster}{c.department ? `（${c.department}）` : ""}
                  </span>
                  <span style={{color:"#22c55e", fontWeight:600, fontSize:12}}>點擊查看詳情 →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CourseModal course={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
