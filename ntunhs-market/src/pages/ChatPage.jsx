import { useState, useEffect, useRef } from 'react';
import { SearchIcon, SendIcon } from '../components/Icons';
import { Avatar } from '../components/Common';
import { CHATS_INIT } from '../data';

export default function ChatPage() {
  const [chats, setChats] = useState(CHATS_INIT);
  const [selected, setSelected] = useState("1");
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);
  const currentChat = chats.find(c => c.id === selected);

  const sendMsg = e => {
    e.preventDefault();
    if (!msg.trim()) return;
    const newMsg = {
      id: "m" + Date.now(),
      sender: "me",
      text: msg,
      time: new Date().toLocaleTimeString("zh-TW", {hour:"2-digit", minute:"2-digit"})
    };
    setChats(cs => cs.map(c =>
      c.id === selected
        ? {...c, messages:[...c.messages, newMsg], lastMessage:msg, unread:0}
        : c
    ));
    setMsg("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  }, [currentChat?.messages?.length]);

  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"32px 20px"}}>
      <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6}}>聊天室</h1>
      <p style={{color:"#64748b", marginBottom:20}}>與賣家私訊聊天</p>

      <div style={{background:"#fff", borderRadius:18, boxShadow:"0 2px 14px rgba(0,0,0,.07)", overflow:"hidden", display:"grid", gridTemplateColumns:"280px 1fr", height:520}}>
        {/* Chat List */}
        <div style={{borderRight:"1px solid #f1f5f9", display:"flex", flexDirection:"column"}}>
          <div style={{padding:"14px 16px", borderBottom:"1px solid #f1f5f9"}}>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8"}}><SearchIcon/></div>
              <input placeholder="搜尋聊天室..." style={{width:"100%", padding:"8px 8px 8px 36px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{overflowY:"auto", flex:1}}>
            {chats.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelected(c.id);
                  setChats(cs => cs.map(x => x.id===c.id ? {...x, unread:0} : x));
                }}
                style={{width:"100%", padding:"14px 16px", border:"none", background:selected===c.id?"#f0f9ff":"#fff", cursor:"pointer", textAlign:"left", borderBottom:"1px solid #f8fafc", display:"flex", gap:10, alignItems:"center"}}
              >
                <Avatar name={c.name} color={c.color} size={42}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                    <span style={{fontWeight:600, fontSize:14, color:"#1e293b"}}>{c.name}</span>
                    <span style={{fontSize:11, color:"#94a3b8"}}>{c.time}</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <p style={{fontSize:12, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120}}>{c.lastMessage}</p>
                    {c.unread > 0 && (
                      <span style={{minWidth:18, height:18, background:"#ef4444", color:"#fff", borderRadius:99, fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px"}}>
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{display:"flex", flexDirection:"column"}}>
          <div style={{padding:"14px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12}}>
            <Avatar name={currentChat?.name} color={currentChat?.color} size={38}/>
            <div>
              <div style={{fontWeight:600, color:"#1e293b"}}>{currentChat?.name}</div>
              <div style={{fontSize:12, color:"#22c55e"}}>● 線上</div>
            </div>
          </div>
          <div style={{flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:12}}>
            {currentChat?.messages.map(m => (
              <div key={m.id} style={{display:"flex", justifyContent:m.sender==="me"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"65%"}}>
                  <div style={{padding:"10px 14px", borderRadius:m.sender==="me"?"16px 16px 4px 16px":"16px 16px 16px 4px", background:m.sender==="me"?"linear-gradient(135deg,#0ea5e9,#0284c7)":"#f1f5f9", color:m.sender==="me"?"#fff":"#1e293b", fontSize:14, lineHeight:1.5}}>
                    {m.text}
                  </div>
                  <div style={{fontSize:11, color:"#94a3b8", marginTop:4, textAlign:m.sender==="me"?"right":"left"}}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>
          <form onSubmit={sendMsg} style={{padding:"14px 20px", borderTop:"1px solid #f1f5f9", display:"flex", gap:10}}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="輸入訊息..." style={{flex:1, padding:"11px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none"}}/>
            <button type="submit" style={{background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", padding:"0 20px", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontWeight:600}}>
              <SendIcon/>傳送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
