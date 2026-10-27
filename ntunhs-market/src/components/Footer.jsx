export default function Footer({ setPage }) {
  return (
    <footer style={{background:"#1e293b", color:"#94a3b8", padding:"40px 20px 24px", marginTop:60}}>
      <div style={{maxWidth:1200, margin:"0 auto"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:32, marginBottom:32}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
              <div style={{width:36, height:36, background:"#0ea5e9", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center"}}>
                <span style={{color:"#fff", fontWeight:700}}>北</span>
              </div>
              <span style={{color:"#f1f5f9", fontWeight:700, fontSize:15}}>北護 Market</span>
            </div>
            <p style={{fontSize:13, lineHeight:1.8}}>專為臺北護理健康大學學生設計的二手交易與資訊交流平台。</p>
          </div>
          <div>
            <h4 style={{color:"#f1f5f9", marginBottom:12, fontSize:14}}>快速連結</h4>
            {["products","jobs","courses","create"].map((p,i) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{display:"block", background:"none", border:"none", color:"#94a3b8", cursor:"pointer", padding:"3px 0", fontSize:13}}
              >
                {["商品分類","打工資訊","換課資訊","發布貼文"][i]}
              </button>
            ))}
          </div>
          <div>
            <h4 style={{color:"#f1f5f9", marginBottom:12, fontSize:14}}>聯絡我們</h4>
            <p style={{fontSize:13}}>ntunhs.market@ntunhs.edu.tw</p>
            <p style={{fontSize:13, marginTop:6}}>臺北市北投區明德路365號</p>
          </div>
        </div>
        <div style={{borderTop:"1px solid #334155", paddingTop:20, textAlign:"center", fontSize:12}}>
          © 2026 北護 Market。本平台僅限北護大學在學學生使用。
        </div>
      </div>
    </footer>
  );
}
