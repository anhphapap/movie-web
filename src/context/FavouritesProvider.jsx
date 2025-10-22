import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { UserAuth } from "./AuthContext";
import { toast } from "react-toastify";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = UserAuth();

  // ❤️ Dùng để check nhanh trên UI
  const [favoriteSlugs, setFavoriteSlugs] = useState([]);
  const [loadingFav, setLoadingFav] = useState(true);

  // 📄 Dùng cho trang “Phim yêu thích”
  const [favoritesPage, setFavoritesPage] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);

  // 🪄 Cache slug từ sessionStorage khi load lại web
  useEffect(() => {
    const cached = sessionStorage.getItem("favoriteSlugs");
    if (cached) setFavoriteSlugs(JSON.parse(cached));
  }, []);

  // 🔹 Lắng nghe realtime chỉ để đồng bộ nếu có thay đổi ở thiết bị khác
  useEffect(() => {
    if (!user) {
      setFavoriteSlugs([]);
      setFavoritesPage([]);
      setLoadingFav(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "favorites");
    const unsub = onSnapshot(ref, (snap) => {
      const slugs = snap.docs.map((d) => d.id);
      setFavoriteSlugs(slugs);
      sessionStorage.setItem("favoriteSlugs", JSON.stringify(slugs));
      setLoadingFav(false);
    });

    return () => unsub();
  }, [user]);

  // 🔹 Toggle yêu thích (update local ngay)
  const toggleFavorite = async (movie) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để sử dụng chức năng này.");
      return;
    }

    const ref = doc(db, "users", user.uid, "favorites", movie.slug);
    const isFav = favoriteSlugs.includes(movie.slug);

    try {
      if (isFav) {
        // Xóa khỏi Firestore
        await deleteDoc(ref);
        toast.success("Đã xóa khỏi danh sách yêu thích.");

        // ⚡ Update local ngay
        setFavoriteSlugs((prev) => prev.filter((slug) => slug !== movie.slug));
        setFavoritesPage((prev) => prev.filter((m) => m.slug !== movie.slug));
      } else {
        // Thêm vào Firestore
        await setDoc(ref, { ...movie, addedAt: serverTimestamp() });
        toast.success("Đã thêm vào danh sách yêu thích.");

        // ⚡ Update local ngay
        setFavoriteSlugs((prev) => [...prev, movie.slug]);
        setFavoritesPage((prev) => [{ ...movie }, ...prev]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật danh sách yêu thích.");
    }
  };

  // 🔹 Load từng trang danh sách phim yêu thích (phân trang)
  const loadFavoritesPage = async (pageSize = 12) => {
    if (!user || loadingPage || !hasMore) return;
    setLoadingPage(true);

    try {
      const ref = collection(db, "users", user.uid, "favorites");
      let q = query(ref, orderBy("addedAt", "desc"), limit(pageSize));
      if (lastDoc)
        q = query(
          ref,
          orderBy("addedAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );

      const snap = await getDocs(q);
      const movies = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const lastVisible = snap.docs[snap.docs.length - 1] || null;

      // 🧠 tránh trùng item
      setFavoritesPage((prev) => {
        const existing = new Set(prev.map((m) => m.slug));
        const unique = movies.filter((m) => !existing.has(m.slug));
        return [...prev, ...unique];
      });

      setLastDoc(lastVisible);
      setHasMore(movies.length === pageSize);
    } catch (error) {
      console.error("Lỗi khi load favorites:", error);
      toast.error("Không thể tải danh sách yêu thích.");
    } finally {
      setLoadingPage(false);
    }
  };

  // 🔹 Reset khi user đổi tài khoản
  useEffect(() => {
    setFavoritesPage([]);
    setLastDoc(null);
    setHasMore(true);
  }, [user]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteSlugs,
        toggleFavorite,
        loadingFav,
        favoritesPage,
        loadFavoritesPage,
        loadingPage,
        hasMore,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
