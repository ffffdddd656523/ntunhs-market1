import { useState } from 'react';
import { PRODUCTS } from '../data';
import { SearchIcon, FilterIcon } from '../components/Icons';
import { ProductCard } from '../components/Common';
import { PRODUCTS } from '../data';

export default function ProductListPage({ favorites, toggleFav, onView }) {  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("latest");

  let filtered = PRODUCTS.filter(p => {
    if (cat !== "all" && p.category !== cat) return false;
    if (search && !p.title.includes(search) && !p.description.includes(search)) return false;
    if (priceMin && p.price < +priceMin) return false;
    if (priceMax && p.price > +priceMax) return false;
    return true;
  });
  if (sort === "price-low") filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === "price-high") filtered = [...filtered].sort((a,b) => b.price - a.price);

  return (
    <div style={{maxWidth:1200, margin:"0 auto", padding:"32px 20px"}}>
      <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6}}>????</h1>
      <p style={{color:"#64748b", marginBottom:28}}>?汗鈭??詻蔗憒﹝???暑?典?</p>

      <div style={{display:"flex", flexWrap:"wrap", gap:24, alignItems:"flex-start"}}>
        {/* Sidebar Filter */}
        <aside style={{width:220, flexShrink:0, background:"#fff", borderRadius:16, padding:"24px 20px", boxShadow:"0 2px 12px rgba(0,0,0,.06)", position:"sticky", top:84}}>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:20, color:"#1e293b", fontWeight:700}}>
            <FilterIcon/>蝭拚璇辣
          </div>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>?摮?撠?/label>
          <div style={{position:"relative", marginBottom:18}}>
            <div style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8"}}><SearchIcon/></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="??..." style={{width:"100%", padding:"8px 8px 8px 36px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box"}}/>
          </div>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>憿</label>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8, marginBottom:18, fontSize:13, outline:"none"}}>
            <option value="all">?券??</option>
            <option value="?貊?">?貊?</option>
            <option value="敶拙?">敶拙?</option>
            <option value="銵??">銵??</option>
            <option value="?暑?典?">?暑?典?</option>
          </select>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>?寞???/label>
          <div style={{display:"flex", gap:8, marginBottom:18}}>
            <input type="number" placeholder="?雿? value={priceMin} onChange={e=>setPriceMin(e.target.value)} style={{width:"50%", padding:"8px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none"}}/>
            <input type="number" placeholder="?擃? value={priceMax} onChange={e=>setPriceMax(e.target.value)} style={{width:"50%", padding:"8px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none"}}/>
          </div>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>??</label>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none"}}>
            <option value="latest">???/option>
            <option value="price-low">?寞雿擃?/option>
            <option value="price-high">?寞擃雿?/option>
          </select>
        </aside>

        {/* Product Grid */}
        <main style={{flex:1, minWidth:0}}>
          <p style={{color:"#64748b", fontSize:14, marginBottom:16}}>?曉 <strong>{filtered.length}</strong> ????/p>
          {filtered.length === 0 ? (
            <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
              <SearchIcon/>
              <p style={{marginTop:12}}>?曆??啁泵??隞嗥???</p>
            </div>
          ) : (
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:18}}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onClick={onView} onFavorite={toggleFav} isFav={favorites.has(p.id)}/>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

