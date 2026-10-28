import { useState } from 'react';
import { MenuIcon, XIcon, UserIcon, LogInIcon } from './Icons';

function NavArrowBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:32, height:32, borderRadius:"50%", border:"none",
        background: disabled ? "transparent" : "none",
        color: disabled ? "#cbd5e1" : "#475569",
        cursor: disabled ? "default" : "pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"background .15s",
        flexShrink:0,
      }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background="#f1f5f9"; }}
      onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}
    >
      {children}
    </button>
  );
}

export default function Navbar({ page, setPage, goBack, goForward, canGoForward, isLoggedIn }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    {id:"home", label:"首頁"},
    {id:"products", label:"商品分類"},
    {id:"jobs", label:"打工資訊"},
    {id:"courses", label:"換課資訊"},
    {id:"create", label:"發布貼文"},
    {id:"group-chat", label:"北護大群"},
  ];

  return (
    <nav style={{background:"#fff", boxShadow:"0 1px 8px rgba(0,0,0,.06)", position:"sticky", top:0, zIndex:100}}>
      <div style={{maxWidth:1200, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64}}>
        {/* Left: nav arrows + logo */}
        <div style={{display:"flex", alignItems:"center", gap:4}}>
          <NavArrowBtn onClick={goBack} disabled={!goBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </NavArrowBtn>
          <NavArrowBtn onClick={goForward} disabled={!canGoForward}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </NavArrowBtn>
          <div style={{width:1, height:20, background:"#e2e8f0", margin:"0 4px"}}/>
          <button onClick={()=>setPage("home")} style={{display:"flex", alignItems:"center", gap:10, border:"none", background:"none", cursor:"pointer"}}>
          <div style={{width:40, height:40, background:"linear-gradient(135deg, #0ea5e9, #0284c7)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <span style={{color:"#fff", fontSize:18, fontWeight:700}}>市</span>
          </div>
          <span style={{fontSize:16, fontWeight:700, color:"#1e293b"}}>北護 Market</span>
          </button>
        </div>

        {/* Desktop Nav */}
        <div style={{display:"flex", alignItems:"center", gap:8}} className="desktop-nav">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              style={{border:"none", background:"none", cursor:"pointer", padding:"6px 10px", borderRadius:8, color:page===l.id?"#0ea5e9":"#475569", fontWeight:page===l.id?700:500, fontSize:14, transition:"all .15s"}}
            >
              {l.label}
            </button>
          ))}
          {isLoggedIn
            ? <button onClick={()=>setPage("profile")} style={{display:"flex", alignItems:"center", gap:5, border:"none", background:page==="profile"?"#e0f2fe":"none", color:"#0ea5e9", cursor:"pointer", padding:"6px 12px", borderRadius:8, fontWeight:600, fontSize:14}}>
                <UserIcon/>會員中心
              </button>
            : <button onClick={()=>setPage("login")} style={{display:"flex", alignItems:"center", gap:6, background:"#0ea5e9", color:"#fff", border:"none", cursor:"pointer", padding:"8px 16px", borderRadius:8, fontWeight:600, fontSize:14}}>
                <LogInIcon/>登入
              </button>
          }
        </div>

        {/* Mobile Hamburger */}
        <button onClick={()=>setMobileOpen(v=>!v)} style={{display:"none", border:"none", background:"none", cursor:"pointer", padding:8}} className="mobile-menu-btn">
          {mobileOpen ? <XIcon/> : <MenuIcon/>}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{background:"#fff", borderTop:"1px solid #f1f5f9", padding:"8px 20px 16px"}}>
          {links.map(l => (
            <button
              key={l.id}
              onClick={()=>{setPage(l.id);setMobileOpen(false)}}
              style={{display:"block", width:"100%", textAlign:"left", border:"none", background:"none", cursor:"pointer", padding:"10px 0", color:page===l.id?"#0ea5e9":"#475569", fontWeight:600}}
            >
              {l.label}
            </button>
          ))}
          {isLoggedIn
            ? <button onClick={()=>{setPage("profile");setMobileOpen(false)}} style={{display:"block", width:"100%", textAlign:"left", border:"none", background:"none", cursor:"pointer", padding:"10px 0", color:"#0ea5e9", fontWeight:600}}>會員中心</button>
            : <button onClick={()=>{setPage("login");setMobileOpen(false)}} style={{display:"block", width:"100%", textAlign:"left", border:"none", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", cursor:"pointer", padding:"10px 16px", borderRadius:8, fontWeight:600, marginTop:8}}>登入</button>
          }
        </div>
      )}
    </nav>
  );
}
