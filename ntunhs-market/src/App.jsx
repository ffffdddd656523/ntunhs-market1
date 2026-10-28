import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
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

export default function App() {
  const [page, setPage] = useState("home");
  const [history, setHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const navigate = (newPage) => {
    setHistory(prev => [...prev, page]);
    setForwardHistory([]);  // 新導航清空前進 history
    setPage(newPage);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setForwardHistory(f => [page, ...f]);
      setHistory(h => h.slice(0, -1));
      setPage(prev);
    }
  };

  const goForward = () => {
    if (forwardHistory.length > 0) {
      const next = forwardHistory[0];
      setHistory(h => [...h, page]);
      setForwardHistory(f => f.slice(1));
      setPage(next);
    }
  };

  const toggleFav = id => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onLogin = userData => {
    setUser(userData);
    setHistory([]);
    setForwardHistory([]);
    setPage("home");
  };

  const onLogout = async () => {
    await signOut(auth);
    setUser(null);
    setHistory([]);
    setForwardHistory([]);
    setPage("home");
  };

  const goToProduct = product => {
    setSelectedProduct(product);
    navigate("product-detail");
  };

  const goToChat = () => navigate("chat");

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage setPage={navigate} onViewProduct={goToProduct} favorites={favorites} toggleFav={toggleFav} />;
      case "products":
        return (
          <ProductListPage
            setPage={navigate}
            favorites={favorites}
            toggleFav={toggleFav}
            onView={goToProduct}
          />
        );
      case "product-detail":
        return (
          <ProductDetailPage
            product={selectedProduct}
            favorites={favorites}
            toggleFav={toggleFav}
            setPage={navigate}
            onContact={goToChat}
          />
        );
      case "jobs":
        return <JobListPage />;
      case "courses":
        return <CourseListPage />;
      case "create":
        return <CreatePostPage setPage={navigate} isLoggedIn={!!user} user={user} />;
      case "chat":
        return <ChatPage />;
      case "group-chat":
        return <GroupChatPage user={user} />;
      case "visual-search":
        return (
          <VisualSearchPage
            setPage={navigate}
            setSelectedProduct={setSelectedProduct}
          />
        );
      case "login":
        return <LoginPage setPage={navigate} onLogin={onLogin} />;
      case "register":
        return <RegisterPage setPage={navigate} onLogin={onLogin} />;
      case "profile":
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
      case "admin":
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
        goBack={history.length > 0 ? goBack : null}
        goForward={goForward}
        canGoForward={forwardHistory.length > 0}
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
