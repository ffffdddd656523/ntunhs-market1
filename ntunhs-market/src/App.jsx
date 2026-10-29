import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { findOrCreateConversation } from './chatUtils';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import JobListPage from './pages/JobListPage';
import CourseListPage from './pages/CourseListPage';
import CreatePostPage from './pages/CreatePostPage';
import ChatPage from './pages/ChatPage';
import GroupChatPage from './pages/GroupChatPage';
import VisualSearchPage from './pages/VisualSearchPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SeedTool from './pages/SeedTool';

// ── 路由對照表 ──────────────────────────────────────────
const PAGE_TO_PATH = {
  'home':           '/',
  'products':       '/products',
  'product-detail': '/product',
  'jobs':           '/jobs',
  'courses':        '/courses',
  'create':         '/create',
  'chat':           '/chat',
  'group-chat':     '/group-chat',
  'visual-search':  '/visual-search',
  'login':          '/login',
  'register':       '/register',
  'profile':        '/profile',
  'admin':          '/admin',
  'seed':           '/seed',
};

const PATH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([p, u]) => [u, p])
);

// 讀取目前網址決定初始頁面
function getInitialPage() {
  const path = window.location.pathname;
  return PATH_TO_PAGE[path] || 'home';
}

// ────────────────────────────────────────────────────────
export default function App() {
  const [page, setPageState] = useState(getInitialPage);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('ntunhs_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [selectedProduct, setSelectedProduct] = useState(() => {
    // 重新整理時從 sessionStorage 還原商品資訊
    try {
      const s = sessionStorage.getItem('ntunhs_selected_product');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  // 監聽 Firebase 登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() });
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email.split("@")[0] });
          }
        } catch {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email.split("@")[0] });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 監聽瀏覽器的上一頁／下一頁按鈕（← →）
  useEffect(() => {
    const onPopState = (e) => {
      const newPage = e.state?.page || PATH_TO_PAGE[window.location.pathname] || 'home';
      setPageState(newPage);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // navigate：更新 page state 並同步網址列
  const navigate = useCallback((newPage) => {
    const path = PAGE_TO_PATH[newPage] || '/';
    window.history.pushState({ page: newPage }, '', path);
    setPageState(newPage);
    window.scrollTo(0, 0);
  }, []);

  const goBack    = () => window.history.back();
  const goForward = () => window.history.forward();

  const toggleFav = id => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem('ntunhs_favorites', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const onLogin = userData => {
    setUser(userData);
    navigate('home');
  };

  const onLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('home');
  };

  const goToProduct = product => {
    setSelectedProduct(product);
    // 儲存到 sessionStorage，重新整理時可還原
    try { sessionStorage.setItem('ntunhs_selected_product', JSON.stringify(product)); } catch {}
    navigate('product-detail');
  };

  // 聯絡賣家：自動建立對話再跳轉到聊天室
  const goToChat = async () => {
    if (user && selectedProduct) {
      const sellerUid  = selectedProduct.authorId || selectedProduct.userId || selectedProduct.uid;
      const sellerName = selectedProduct.authorName || selectedProduct.sellerName || '賣家';
      const myName     = user.name || user.email?.split('@')[0] || '買家';
      if (sellerUid && sellerUid !== user.uid) {
        try {
          await findOrCreateConversation(user.uid, myName, sellerUid, sellerName);
        } catch (e) {
          console.error('建立對話失敗', e);
        }
      }
    }
    navigate('chat');
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={navigate} onViewProduct={goToProduct} favorites={favorites} toggleFav={toggleFav} />;
      case 'products':
        return (
          <ProductListPage
            setPage={navigate}
            favorites={favorites}
            toggleFav={toggleFav}
            onView={goToProduct}
          />
        );
      case 'seed':
        return <SeedTool />;
      case 'product-detail':
        return selectedProduct
          ? (
            <ProductDetailPage
              product={selectedProduct}
              favorites={favorites}
              toggleFav={toggleFav}
              setPage={navigate}
              onContact={goToChat}
            />
          )
          : <ProductListPage setPage={navigate} favorites={favorites} toggleFav={toggleFav} onView={goToProduct} />;
      case 'jobs':
        return <JobListPage />;
      case 'courses':
        return <CourseListPage />;
      case 'create':
        return <CreatePostPage setPage={navigate} isLoggedIn={!!user} user={user} />;
      case 'chat':
        return <ChatPage user={user} />;
      case 'group-chat':
        return <GroupChatPage user={user} />;
      case 'visual-search':
        return (
          <VisualSearchPage
            setPage={navigate}
            setSelectedProduct={setSelectedProduct}
          />
        );
      case 'login':
        return <LoginPage setPage={navigate} onLogin={onLogin} />;
      case 'register':
        return <RegisterPage setPage={navigate} onLogin={onLogin} />;
      case 'profile':
        return user
          ? (
            <ProfilePage
              user={user}
              onLogout={onLogout}
              favorites={favorites}
              setPage={navigate}
              setSelectedProduct={setSelectedProduct}
            />
          )
          : <LoginPage setPage={navigate} onLogin={onLogin} />;
      case 'admin':
        return user?.email === 'admin@ntunhs.edu.tw'
          ? <AdminPage user={user} />
          : <LoginPage setPage={navigate} onLogin={onLogin} />;
      default:
        return <HomePage setPage={navigate} onViewProduct={goToProduct} favorites={favorites} toggleFav={toggleFav} />;
    }
  };

  return (
    <div style={{minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Noto Sans TC', sans-serif", background:"#f8fafc"}}>
      <Navbar
        page={page}
        setPage={navigate}
        goBack={goBack}
        goForward={goForward}
        canGoForward={false}
        user={user}
        isLoggedIn={!!user}
        favoriteCount={favorites.size}
      />
      <main style={{flex:1, paddingTop:72}}>
        {renderPage()}
      </main>
      <Footer setPage={navigate} />
    </div>
  );
}
