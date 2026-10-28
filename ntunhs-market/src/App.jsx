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

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 監聽 Firebase 登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 從 Firestore 取得完整用戶資料
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

  const toggleFav = id => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onLogin = userData => {
    setUser(userData);
    setPage("home");
  };

  const onLogout = async () => {
    await signOut(auth);
    setUser(null);
    setPage("home");
  };

  const goToProduct = product => {
    setSelectedProduct(product);
    setPage("product-detail");
  };

  const goToChat = () => setPage("chat");

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage setPage={setPage} onViewProduct={goToProduct} favorites={favorites} toggleFav={toggleFav} />;
      case "products":
        return (
          <ProductListPage
            setPage={setPage}
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
            setPage={setPage}
            onContact={goToChat}
          />
        );
      case "jobs":
        return <JobListPage />;
      case "courses":
        return <CourseListPage />;
      case "create":
        return <CreatePostPage setPage={setPage} isLoggedIn={!!user} user={user} />;
      case "chat":
        return <ChatPage />;
      case "group-chat":
        return <GroupChatPage />;
      case "visual-search":
        return (
          <VisualSearchPage
            setPage={setPage}
            setSelectedProduct={setSelectedProduct}
          />
        );
      case "login":
        return <LoginPage setPage={setPage} onLogin={onLogin} />;
      case "register":
        return <RegisterPage setPage={setPage} onLogin={onLogin} />;
      case "profile":
        return user
          ? (
            <ProfilePage
              user={user}
              onLogout={onLogout}
              favorites={favorites}
              setPage={setPage}
              setSelectedProduct={setSelectedProduct}
            />
          )
          : <LoginPage setPage={setPage} onLogin={onLogin} />;
      default:
        return <HomePage setPage={setPage} onViewProduct={goToProduct} favorites={favorites} toggleFav={toggleFav} />;
    }
  };

  return (
    <div style={{minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Noto Sans TC', sans-serif", background:"#f8fafc"}}>
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        isLoggedIn={!!user}
        favoriteCount={favorites.size}
      />
      <main style={{flex:1, paddingTop:72}}>
        {renderPage()}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}
