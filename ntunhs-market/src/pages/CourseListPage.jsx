import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { SearchIcon, ClockIcon, UserIcon } from '../components/Icons';
import { Badge } from '../components/Common';
import { COURSES } from '../data';

export default function CourseListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(items.length > 0 ? items : COURSES);
      } catch {
        setCourses(COURSES);
      }
      setLoading(false);
    };
    fetchCourses();
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
              <div key={c.id} style={{background:"#fff", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 10px rgba(0,0,0,.06)"}}>
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
                {c.description && <p style={{fontSize:13, color:"#64748b", marginBottom:12}}>{c.description}</p>}
                {c.reason && <p style={{fontSize:13, color:"#64748b", marginBottom:12}}>原因：{c.reason}</p>}
                <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, fontSize:13}}>
                  <span style={{display:"flex", gap:6, alignItems:"center", color:"#475569"}}>
                    <UserIcon/>{c.authorName || c.poster}{c.department ? `（${c.department}）` : ""}
                  </span>
                  <span style={{color:"#0284c7", fontWeight:600}}>聯絡：{c.contact}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
