import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const DEPTS = ["護理學系","物理治療學系","職業治療學系","語言治療與聽力學系","醫學影像暨放射科學系","口腔衛生學系","健康照護管理學系","嬰幼兒保育系","文化事業發展學系","資訊管理系"];

export function LoginPage({ setPage, onLogin }) {
  const [form, setForm] = useState({email:"", password:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email.endsWith("@ntunhs.edu.tw")) {
      setError("請使用北護學校信箱（@ntunhs.edu.tw）登入");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, form.email, form.password);
      const u = result.user;
      onLogin({ uid: u.uid, email: u.email, name: u.displayName || u.email.split("@")[0] });
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("信箱或密碼錯誤，請重新輸入");
      } else if (err.code === "auth/too-many-requests") {
        setError("登入失敗次數過多，請稍後再試");
      } else {
        setError("登入失敗：" + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px"}}>
      <div style={{width:"100%", maxWidth:440, background:"#fff", borderRadius:20, padding:"40px 36px", boxShadow:"0 4px 24px rgba(0,0,0,.09)"}}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#0ea5e9,#0284c7)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:22, marginBottom:12}}>市</div>
          <h2 style={{fontSize:22, fontWeight:800, color:"#1e293b"}}>歡迎回來</h2>
          <p style={{color:"#64748b", fontSize:14}}>登入北護 Market 帳號</p>
        </div>

        {error && (
          <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", marginBottom:16, color:"#dc2626", fontSize:13}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>學校信箱</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              placeholder="s123456789@ntunhs.edu.tw"
              style={{width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="#0ea5e9"}
              onBlur={e=>e.target.style.borderColor="#e2e8f0"}
            />
          </div>

          <div style={{marginBottom:22}}>
            <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>密碼</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})}
              placeholder="請輸入密碼"
              style={{width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="#0ea5e9"}
              onBlur={e=>e.target.style.borderColor="#e2e8f0"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{width:"100%", padding:"13px 0", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:16, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1}}
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <div style={{textAlign:"center", marginTop:20, color:"#64748b", fontSize:13}}>
          還沒有帳號？{" "}
          <button
            onClick={() => setPage("register")}
            style={{border:"none", background:"none", color:"#0284c7", fontWeight:600, cursor:"pointer", fontSize:13}}
          >
            立即註冊
          </button>
        </div>

        <div style={{marginTop:20, background:"#f0f9ff", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#0284c7"}}>
          💡 僅限北護大學在學學生使用，請使用學校電子信箱（@ntunhs.edu.tw）註冊。
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({ setPage, onLogin }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:"", email:"", dept:"", year:"", password:"", confirm:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStep1 = e => {
    e.preventDefault();
    if (!form.email.endsWith("@ntunhs.edu.tw")) {
      setError("請使用北護學校信箱（@ntunhs.edu.tw）");
      return;
    }
    if (!form.name.trim()) {
      setError("請輸入姓名");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("兩次輸入的密碼不一致");
      return;
    }
    if (form.password.length < 6) {
      setError("密碼至少需要 6 個字元");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const u = result.user;
      // 設定顯示名稱
      await updateProfile(u, { displayName: form.name });
      // 儲存用戶資料到 Firestore
      await setDoc(doc(db, "users", u.uid), {
        name: form.name,
        email: form.email,
        dept: form.dept,
        year: form.year,
        createdAt: new Date().toISOString()
      });
      onLogin({ uid: u.uid, email: u.email, name: form.name, dept: form.dept, year: form.year });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("此信箱已被註冊，請直接登入");
      } else if (err.code === "auth/weak-password") {
        setError("密碼強度不足，請使用至少 6 個字元");
      } else {
        setError("註冊失敗：" + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px"}}>
      <div style={{width:"100%", maxWidth:460, background:"#fff", borderRadius:20, padding:"40px 36px", boxShadow:"0 4px 24px rgba(0,0,0,.09)"}}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:6}}>
          <div style={{width:50, height:50, borderRadius:12, background:"linear-gradient(135deg,#0ea5e9,#0284c7)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:20, marginBottom:10}}>市</div>
          <h2 style={{fontSize:22, fontWeight:800, color:"#1e293b"}}>加入北護 Market</h2>
        </div>

        {/* Step Indicator */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:24}}>
          {[1,2].map(s => (
            <div key={s} style={{display:"flex", alignItems:"center", gap:8}}>
              <div style={{width:28, height:28, borderRadius:"50%", background:step>=s?"linear-gradient(135deg,#0ea5e9,#0284c7)":"#e2e8f0", color:step>=s?"#fff":"#94a3b8", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center"}}>
                {s}
              </div>
              {s === 1 && <div style={{width:48, height:2, background:step>1?"#0ea5e9":"#e2e8f0"}}/>}
            </div>
          ))}
        </div>

        {error && (
          <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", marginBottom:16, color:"#dc2626", fontSize:13}}>
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <p style={{color:"#64748b", fontSize:13, marginBottom:20, textAlign:"center"}}>步驟 1：基本資料</p>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>姓名 *</label>
              <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="請輸入真實姓名" style={{width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>學校信箱 *</label>
              <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="s123456789@ntunhs.edu.tw" style={{width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20}}>
              <div>
                <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>科系 *</label>
                <select required value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} style={{width:"100%", padding:"11px 10px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none"}}>
                  <option value="">請選擇</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>年級 *</label>
                <select required value={form.year} onChange={e=>setForm({...form,year:e.target.value})} style={{width:"100%", padding:"11px 10px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, outline:"none"}}>
                  <option value="">請選擇</option>
                  <option>大一</option><option>大二</option><option>大三</option><option>大四</option><option>研究生</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{width:"100%", padding:"13px 0", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:15, cursor:"pointer"}}>
              下一步
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <p style={{color:"#64748b", fontSize:13, marginBottom:20, textAlign:"center"}}>步驟 2：設定密碼</p>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>設定密碼 *</label>
              <input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="至少 6 個字元" style={{width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:14, fontWeight:600, color:"#374151", display:"block", marginBottom:6}}>確認密碼 *</label>
              <input required type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="再輸入一次密碼" style={{width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex", gap:10}}>
              <button type="button" onClick={()=>{setStep(1);setError("");}} style={{flex:1, padding:"13px 0", border:"1.5px solid #e2e8f0", background:"#fff", borderRadius:12, fontWeight:600, cursor:"pointer", color:"#475569"}}>
                上一步
              </button>
              <button type="submit" disabled={loading} style={{flex:2, padding:"13px 0", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1}}>
                {loading ? "註冊中..." : "完成註冊"}
              </button>
            </div>
          </form>
        )}

        <div style={{textAlign:"center", marginTop:18, color:"#64748b", fontSize:13}}>
          已有帳號？{" "}
          <button onClick={() => setPage("login")} style={{border:"none", background:"none", color:"#0284c7", fontWeight:600, cursor:"pointer", fontSize:13}}>
            立即登入
          </button>
        </div>
      </div>
    </div>
  );
}
