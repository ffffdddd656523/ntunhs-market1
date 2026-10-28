import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { SearchIcon, FilterIcon } from '../components/Icons';
import { ProductCard } from '../components/Common';
import { PRODUCTS } from '../data';

export default function ProductListPage({ favorites, toggleFav, onView }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("latest");
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFirestoreProducts(items);
      } catch {
        // Firestore 讀取失敗時用假資料
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // 合併：Firestore 資料優先，不足時補假資料
  const allProducts = firestoreProducts.length > 0
    ? firestoreProducts
    : PRODUCTS;

  let filtered = allProducts.filter(p => {
    if (cat !== "all" && p.category !== cat) return false;
    if (search && !p.title?.includes(search) && !p.description?.includes(search)) return false;
    if (priceMin && p.price < +priceMin) return false;
    if (priceMax && p.price > +priceMax) return false;
    return true;
  });
  if (sort === "price-low") filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === "price-high") filtered = [...filtered].sort((a,b) => b.price - a.price);

  return (
    <div style={{maxWidth:1200, margin:"0 auto", padding:"32px 20px"}}>
      <h1 style={{fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6}}>商品分類</h1>
      <p style={{color:"#64748b", marginBottom:28}}>瀏覽二手書、彩妝、衣服與生活用品</p>

      <div style={{display:"flex", flexWrap:"wrap", gap:24, alignItems:"flex-start"}}>
        {/* Sidebar Filter */}
        <aside style={{width:220, flexShrink:0, background:"#fff", borderRadius:16, padding:"24px 20px", boxShadow:"0 2px 12px rgba(0,0,0,.06)", position:"sticky", top:84}}>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:20, color:"#1e293b", fontWeight:700}}>
            <FilterIcon/>篩選條件
          </div>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>關鍵字搜尋</label>
          <div style={{position:"relative", marginBottom:18}}>
            <div style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8"}}><SearchIcon/></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋..." style={{width:"100%", padding:"8px 8px 8px 36px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box"}}/>
          </div>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>類別</label>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8, marginBottom:18, fontSize:13, outline:"none"}}>
            <option value="all">全部商品</option>
            <option value="書籍">書籍</option>
            <option value="彩妝">彩妝</option>
            <option value="衣服">衣服</option>
            <option value="生活用品">生活用品</option>
          </select>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>價格區間</label>
          <div style={{display:"flex", gap:8, marginBottom:18}}>
            <input type="number" placeholder="最低" value={priceMin} onChange={e=>setPriceMin(e.target.value)} style={{width:"50%", padding:"8px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none"}}/>
            <input type="number" placeholder="最高" value={priceMax} onChange={e=>setPriceMax(e.target.value)} style={{width:"50%", padding:"8px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none"}}/>
          </div>
          <label style={{fontSize:13, color:"#475569", display:"block", marginBottom:6}}>排序</label>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none"}}>
            <option value="latest">最新</option>
            <option value="price-low">價格低到高</option>
            <option value="price-high">價格高到低</option>
          </select>
        </aside>

        {/* Product Grid */}
        <main style={{flex:1, minWidth:0}}>
          {loading ? (
            <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
              <div style={{fontSize:32, marginBottom:12}}>⏳</div>
              <p>載入中...</p>
            </div>
          ) : (
            <>
              <p style={{color:"#64748b", fontSize:14, marginBottom:16}}>
                找到 <strong>{filtered.length}</strong> 個結果
                {firestoreProducts.length > 0 && <span style={{marginLeft:8, fontSize:12, color:"#0ea5e9"}}>· 即時資料</span>}
              </p>
              {filtered.length === 0 ? (
                <div style={{textAlign:"center", padding:"60px 0", color:"#94a3b8"}}>
                  <SearchIcon/>
                  <p style={{marginTop:12}}>找不到符合條件的商品</p>
                </div>
              ) : (
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:18}}>
                  {filtered.map(p => (
                    <ProductCard key={p.id} product={p} onClick={onView} onFavorite={toggleFav} isFav={favorites.has(p.id)}/>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
