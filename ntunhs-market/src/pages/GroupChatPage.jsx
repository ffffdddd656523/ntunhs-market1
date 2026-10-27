import { useState, useEffect, useRef } from 'react';
import { SendIcon, UsersIcon } from '../components/Icons';
import { Avatar } from '../components/Common';
import { GROUP_MSGS_INIT } from '../data';

export default function GroupChatPage() {
  const [messages, setMessages] = useState(GROUP_MSGS_INIT);
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);

  const sendMsg = e => {
    e.preventDefault();
    if (!msg.trim()) return;
    const newMsg = {
      id: "g" + Date.now(),
      sender: "我",
      avatar: "我",
      color: "#0ea5e9",
      text: msg,
      time: new Date().toLocaleTimeString("zh-TW", {hour:"2-digit", minute:"2-digit"}),
      isMe: true
    };
    setMessages(m => [...m, newMsg]);
    setMsg("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  }, [messages.length]);

  return (
    <div style={{maxWidth:760, margin:"0 auto", padding:"32px 20px"}}>
      {/* Header */}
      <div style={{background:"#fff", borderRadius:"18px 18px 0 0", padding:"18px 24px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:14, borderBottom:"1px solid #f1f5f9"}}>
        <div style={{width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff"}}>
          <UsersIcon/>
        </div>
        <div>
          <div style={{fontWeight:800, fontSize:16, color:"#1e293b"}}>北護大群</div>
          <div style={{fontSize:12, color:"#64748b"}}>北護 Market 公開討論群組 · 全校學生皆可參與</div>
        </div>
        <div style={{marginLeft:"auto", background:"#dcfce7", color:"#16a34a", fontSize:12, fontWeight:600, padding:"4px 10px", borderRadius:99}}>
          ● 138 人在線
        </div>
      </div>

      {/* Messages */}
      <div style={{background:"#f8fafc", padding:"24px", height:460, overflowY:"auto", display:"flex", flexDirection:"column", gap:16}}>
        <div style={{textAlign:"center"}}>
          <span style={{background:"#e2e8f0", color:"#64748b", fontSize:12, padding:"4px 12px", borderRadius:99}}>今天</span>
        </div>
        {messages.map(m => (
          <div key={m.id} style={{display:"flex", flexDirection:m.isMe?"row-reverse":"row", gap:10, alignItems:"flex-end"}}>
            {!m.isMe && <Avatar name={m.avatar} color={m.color} size={36}/>}
            <div style={{maxWidth:"68%"}}>
              {!m.isMe && <div style={{fontSize:12, color:"#64748b", marginBottom:4, marginLeft:2}}>{m.sender}</div>}
              <div style={{padding:"10px 14px", borderRadius:m.isMe?"16px 16px 4px 16px":"16px 16px 16px 4px", background:m.isMe?"linear-gradient(135deg,#0ea5e9,#0284c7)":"#fff", color:m.isMe?"#fff":"#1e293b", fontSize:14, lineHeight:1.6, boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
                {m.text}
              </div>
              <div style={{fontSize:11, color:"#94a3b8", marginTop:3, textAlign:m.isMe?"right":"left"}}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <form onSubmit={sendMsg} style={{background:"#fff", borderRadius:"0 0 18px 18px", padding:"16px 20px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", gap:10}}>
        <input
          value={msg}
          onChange={e=>setMsg(e.target.value)}
          placeholder="輸入訊息，傳送給北護全體同學..."
          style={{flex:1, padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none"}}
        />
        <button type="submit" style={{background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", padding:"0 20px", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontWeight:600, whiteSpace:"nowrap"}}>
          <SendIcon/>傳送
        </button>
      </form>

      {/* Notice */}
      <div style={{marginTop:14, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#92400e"}}>
        ⚠️ 請遵守北護校規，禁止發布違法或不當內容。
      </div>
    </div>
  );
}
