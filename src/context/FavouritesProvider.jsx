import { createContext, useContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { UserAuth } from "./AuthContext";
import { toast } from "react-toastify";
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = UserAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFav, setLoadingFav] = useState(true);

  // ⚙️ Lấy cache ban đầu từ sessionStorage (nếu có)
  useEffect(() => {
    const cached = sessionStorage.getItem("favorites");
    if (cached) setFavorites(JSON.parse(cached));
  }, []);

  // 🔹 Khi user đăng nhập, lắng nghe realtime Firestore
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      sessionStorage.removeItem("favorites");
      setLoadingFav(false);
      return;
    }

    const ref = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const saved = snap.data().savedMovies || [];
        setFavorites(saved);
        sessionStorage.setItem("favorites", JSON.stringify(saved)); // ⚡ cache ngay
      }
      setLoadingFav(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Thêm / xóa phim yêu thích
  const toggleFavorite = async (movie) => {
    setLoadingFav(true);
    if (!user) {
      toast.warning("Vui lòng đăng nhập để sử dụng chức năng này.");
      setLoadingFav(false);
      return;
    }
    const ref = doc(db, "users", user.uid);
    const exists = favorites.some((m) => m.slug === movie.slug);

    // Cập nhật UI ngay (optimistic update)
    const updated = exists
      ? favorites.filter((m) => m.slug !== movie.slug)
      : [...favorites, movie];
    setFavorites(updated);
    sessionStorage.setItem("favorites", JSON.stringify(updated));

    // Cập nhật Firestore async
    try {
      if (exists) {
        await updateDoc(ref, { savedMovies: arrayRemove(movie) });
        toast.success("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await updateDoc(ref, { savedMovies: arrayUnion(movie) });
        toast.success("Đã thêm vào danh sách yêu thích.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra vui lòng thử lại sau.");
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, loadingFav }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
