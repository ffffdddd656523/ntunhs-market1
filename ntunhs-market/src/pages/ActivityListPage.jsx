import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { SearchIcon, ClockIcon, MapPinIcon, XIcon } from '../components/Icons';
import { Badge } from '../components/Common';

const CAT_COLOR = {
  "揪吃飯": ["#b45309","#fef3c7"],
  "揪讀書": ["#1d4ed8","#dbeafe"],
  "揪運動": ["#15803d","#dcfce7"],
  "揪出遊": ["#7c3aed","#ede9fe"],
  "其他":   ["#475569","#f1f5f9"],
};

function fmtDate(ts) {
  if (!ts) return '';
  if (typeof ts === 'string') return ts.slice(0, 10);
  if (ts.toDate) return ts.toDate().toLocaleDateString('zh-TW');
  return '';
}

function ActivityModal({ activity, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  if (!activity) return null;

  const cat = activity.category || '其他';
  const [tc, bc] = CAT_COLOR[cat] || ["#475569","#f1f5f9"];
  const participants = activity.participants || [];
  const maxP = activity.maxParticipants || 0;
  const joined = user && participants.includes(user.uid);
  const isFull = maxP > 0 && participants.length >= maxP;
  const isOwner = user && activity.authorId === user.uid;

  const handleJoin = async () => {
    if (!user || isOwner || joining) return;
    setJoining(true);
    try {
      const ref = doc(db, 'activities', activity.id);
      if (joined) {
        await updateDoc(ref, { participants: arrayRemove(user.uid) });
      } else {
        await updateDoc(ref, { participants: arrayUnion(user.uid) });
      }
    } catch (e) { console.error(e); }
    setJoining(false);
  };

  const copy = () => {
    navigator.clipboard?.writeText(activity.contact || '').then(() => {
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
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,width:32,height:32,borderRadius:"50%",border:"none",background:"#f1f5f9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
          <XIcon/>
        </button>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <Badge color={tc} bg={bc}>{cat}</Badge>
          <span style={{fontSize:12,color:"#94a3b8",display:"flex",alignItems:"center",gap:3}}>
            <ClockIcon/>{activity.activityDate || fmtDate(activity.createdAt)}
          </span>
        </div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#1e293b",marginBottom:20,lineHeight:1.3}}>{activity.title}</h2>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,background:"#f8fafc",borderRadius:14,padding:"16px 18px",marginBottom:20}}>
          {activity.location && (
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>地點</div>
              <div style={{fontSize:14,fontWeight:600,color:"#1e293b",display:"flex",alignItems:"center",gap:4}}><MapPinIcon/>{activity.location}</div>
            </div>
          )}
          {activity.activityTime && (
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>時間</div>
              <div style={{fontSize:14,fontWeight:600,color:"#1e293b",display:"flex",alignItems:"center",gap:4}}><ClockIcon/>{activity.activityTime}</div>
            </div>
          )}
          <div>
            <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>參加人數</div>
            <div style={{fontSize:14,fontWeight:600,color: isFull?"#ef4444":"#16a34a"}}>
              {participants.length}{maxP > 0 ? ` / ${maxP}` : ''} 人{isFull ? '（已滿）' : ''}
            </div>
          </div>
          {activity.authorName && (
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>發起人</div>
              <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{activity.authorName}</div>
            </div>
          )}
        </div>

        {activity.description && (
          <div style={{marginBottom:22}}>
            <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:8}}>活動說明</div>
            <p style={{fontSize:14,color:"#475569",lineHeight:1.8,background:"#f8fafc",borderRadius:10,padding:"14px 16px"}}>{activity.description}</p>
          </div>
        )}

        <div style={{background:"#eff6ff",borderRadius:14,padding:"16px 18px",marginBottom:16}}>
          <div style={{fontSize:12,color:"#3b82f6",fontWeight:600,marginBottom:6}}>聯絡方式</div>
          <div style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:12}}>{activity.contact}</div>
          <button onClick={copy} style={{width:"100%",padding:"11px 0",borderRadius:10,border:"none",background:copied?"#22c55e":"linear-gradient(135deg,#0ea5e9,#0284c7)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
            {copied ? "✓ 已複製！" : "複製聯絡方式"}
          </button>
        </div>

        {user && !isOwner && (
          <button
            onClick={handleJoin}
            disabled={joining || (isFull && !joined)}
            style={{
              width:"100%",padding:"13px 0",borderRadius:12,border:"none",
              background: joined ? "#f1f5f9" : isFull ? "#e2e8f0" : "linear-gradient(135deg,#f59e0b,#d97706)",
              color: joined ? "#475569" : isFull ? "#94a3b8" : "#fff",
              fontWeight:700,fontSize:15,cursor: (isFull && !joined) ? "not-allowed" : "pointer",
              transition:"all .15s",
            }}
          >
            {joining ? "處理中…" : joined ? "✓ 已報名（點擊取消）" : isFull ? "名額已滿" : "🙌 我要參加！"}
          </button>
        )}
        {isOwner && (
          <div style={{textAlign:"center",fontSize:13,color:"#94a3b8",padding:"12px 0"}}>這是你發起的活動</div>
        )}
      </div>
    </div>
  );
}

export default function ActivityListPage({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q,
      snap => { setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => { setActivities([]); setLoading(false); }
    );
    return () => unsub();
  }, []);

  // sync selected with live data
  useEffect(() => {
    if (!selected) return;
    const updated = activities.find(a => a.id === selected.id);
    if (updated) setSelected(updated);
  }, [activities]);

  const filtered = activities.filter(a => {
    if (cat !== "all" && a.category !== cat) return false;
    if (search && !a.title?.includes(search) && !a.description?.includes(search)) return false;
    return true;
  });

  const cats = ["all","揪吃飯","揪讀書","揪運動","揪出遊","其他"];

  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 20px"}}>
      <h1 style={{fontSize:26,fontWeight:800,color:"#1e293b",marginBottom:6}}>揪友平台</h1>
      <p style={{color:"#64748b",marginBottom:24}}>找人一起吃飯、讀書、運動、出遊</p>

      <div style={{display:"flex",gap:12,marginBottom:28,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8"}}><SearchIcon/></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋活動..." style={{width:"100%",padding:"10px 10px 10px 40px",border:"1px solid #e2e8f0",borderRadius:10,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {cats.map(c => (
          <button key={c} onClick={()=>setCat(c)} style={{padding:"10px 16px",borderRadius:10,border:`1.5px solid ${cat===c?"#f59e0b":"#e2e8f0"}`,background:cat===c?"#fef3c7":"#fff",color:cat===c?"#b45309":"#64748b",cursor:"pointer",fontWeight:600,fontSize:14}}>
            {c==="all"?"全部":c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}>
          <div style={{fontSize:32,marginBottom:12}}>⏳</div><p>載入中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}>
          <div style={{fontSize:48,marginBottom:12}}>🤝</div>
          <p>還沒有揪友活動，去發布第一個吧！</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {filtered.map(a => {
            const c = a.category || '其他';
            const [tc, bc] = CAT_COLOR[c] || ["#475569","#f1f5f9"];
            const parts = a.participants || [];
            const maxP = a.maxParticipants || 0;
            const isFull = maxP > 0 && parts.length >= maxP;
            const joined = user && parts.includes(user.uid);
            return (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                style={{background:"#fff",borderRadius:16,padding:"22px 24px",boxShadow:"0 2px 10px rgba(0,0,0,.06)",display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start",cursor:"pointer",transition:"box-shadow .15s,transform .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,.11)";e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.06)";e.currentTarget.style.transform="none";}}
              >
                <div style={{flex:1,minWidth:220}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <Badge color={tc} bg={bc}>{c}</Badge>
                    {a.activityDate && <span style={{fontSize:12,color:"#94a3b8",display:"flex",alignItems:"center",gap:3}}><ClockIcon/>{a.activityDate}</span>}
                  </div>
                  <h3 style={{fontSize:17,fontWeight:700,color:"#1e293b",marginBottom:8}}>{a.title}</h3>
                  <p style={{fontSize:13,color:"#64748b",marginBottom:12,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.description}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:12,fontSize:13,color:"#475569"}}>
                    {a.location && <span style={{display:"flex",gap:4,alignItems:"center"}}><MapPinIcon/>{a.location}</span>}
                    {a.activityTime && <span style={{display:"flex",gap:4,alignItems:"center"}}><ClockIcon/>{a.activityTime}</span>}
                  </div>
                </div>
                <div style={{background:"#f8fafc",borderRadius:12,padding:"14px 16px",minWidth:160,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:isFull?"#ef4444":"#16a34a",marginBottom:4}}>
                    {parts.length}{maxP>0?` / ${maxP}`:''}
                  </div>
                  <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>參加人數{isFull?"（已滿）":""}</div>
                  <div style={{
                    fontSize:13,fontWeight:700,padding:"8px 12px",borderRadius:8,
                    background: joined?"#dcfce7":isFull?"#f1f5f9":"linear-gradient(135deg,#f59e0b,#d97706)",
                    color: joined?"#16a34a":isFull?"#94a3b8":"#fff",
                  }}>
                    {joined ? "✓ 已報名" : isFull ? "名額已滿" : "我要參加"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ActivityModal activity={selected} onClose={()=>setSelected(null)} user={user}/>
    </div>
  );
}
