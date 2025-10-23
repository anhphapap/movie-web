import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAuth } from "./AuthContext";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-toastify";

const WatchingContext = createContext();

export const useWatching = () => {
  const context = useContext(WatchingContext);
  if (!context) {
    throw new Error("useWatching must be used within a WatchingProvider");
  }
  return context;
};

export const WatchingProvider = ({ children }) => {
  // 📄 Dùng cho trang "Đang xem" với phân trang
  const [watchingPage, setWatchingPage] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);

  // ❤️ Dùng để check nhanh trên UI
  const [watchingSlugs, setWatchingSlugs] = useState([]);
  const [loadingWatching, setLoadingWatching] = useState(true);

  const { user } = UserAuth();

  // 🪄 Cache slug từ sessionStorage khi load lại web
  useEffect(() => {
    const cached = sessionStorage.getItem("watchingSlugs");
    if (cached) setWatchingSlugs(JSON.parse(cached));
  }, []);

  // 🔹 Lắng nghe realtime chỉ để đồng bộ slugs (không load data)
  useEffect(() => {
    if (!user) {
      setWatchingSlugs([]);
      setWatchingPage([]);
      setLoadingWatching(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "watching");
    const unsub = onSnapshot(ref, (snap) => {
      const slugs = snap.docs.map((d) => d.id);
      setWatchingSlugs(slugs);
      sessionStorage.setItem("watchingSlugs", JSON.stringify(slugs));
      setLoadingWatching(false);
    });

    return () => unsub();
  }, [user]);

  // 🔹 Load từng trang danh sách phim đang xem (phân trang)
  const loadWatchingPage = async (pageSize = 12) => {
    if (!user || loadingPage || !hasMore) return;
    setLoadingPage(true);

    try {
      const ref = collection(db, "users", user.uid, "watching");
      let q = query(ref, orderBy("lastWatched", "desc"), limit(pageSize));
      if (lastDoc)
        q = query(
          ref,
          orderBy("lastWatched", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );

      const snap = await getDocs(q);
      const movies = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const lastVisible = snap.docs[snap.docs.length - 1] || null;

      // 🧠 tránh trùng item
      setWatchingPage((prev) => {
        const existing = new Set(prev.map((m) => m.slug));
        const unique = movies.filter((m) => !existing.has(m.slug));
        return [...prev, ...unique];
      });

      setLastDoc(lastVisible);
      setHasMore(movies.length === pageSize);
    } catch (error) {
      console.error("Lỗi khi load watching:", error);
      toast.error("Không thể tải danh sách đang xem.");
    } finally {
      setLoadingPage(false);
    }
  };

  // 🔹 Toggle đang xem (update local ngay)
  const toggleWatching = async (movie) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để sử dụng chức năng này.");
      return;
    }

    const ref = doc(db, "users", user.uid, "watching", movie.slug);
    const isWatching = watchingSlugs.includes(movie.slug);

    try {
      if (isWatching) {
        // Xóa khỏi Firestore
        await deleteDoc(ref);
        toast.success("Đã xóa khỏi danh sách đang xem.");

        // ⚡ Update local ngay
        setWatchingSlugs((prev) => prev.filter((slug) => slug !== movie.slug));
        setWatchingPage((prev) => prev.filter((m) => m.slug !== movie.slug));
      } else {
        // Thêm vào Firestore
        await setDoc(ref, {
          ...movie,
          addedAt: serverTimestamp(),
          lastWatched: serverTimestamp(),
        });

        // ⚡ Update local ngay
        setWatchingSlugs((prev) => [...prev, movie.slug]);
        setWatchingPage((prev) => [{ ...movie }, ...prev]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật danh sách đang xem.");
    }
  };

  // 🔹 Reset khi user đổi tài khoản
  useEffect(() => {
    setWatchingPage([]);
    setLastDoc(null);
    setHasMore(true);
  }, [user]);

  // Update watching progress
  const updateWatchingProgress = async (
    movieSlug,
    currentTime,
    duration,
    episode,
    server,
    episodeName
  ) => {
    if (!user?.email) {
      toast.warning("Vui lòng đăng nhập để sử dụng chức năng này.");
      return false;
    }

    try {
      const ref = doc(db, "users", user.uid, "watching", movieSlug);
      const progressData = {
        episodeName,
        currentTime,
        duration,
        episode,
        server,
        lastWatched: serverTimestamp(),
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      };

      await setDoc(ref, progressData, { merge: true });

      // ⚡ Update local ngay và move lên đầu theo lastWatched
      setWatchingPage((prev) => {
        const updatedMovies = prev.map((movie) =>
          movie.slug === movieSlug ? { ...movie, ...progressData } : movie
        );

        // Tìm phim vừa update và move lên đầu
        const updatedMovie = updatedMovies.find(
          (movie) => movie.slug === movieSlug
        );

        // Nếu không tìm thấy phim, return array gốc
        if (!updatedMovie) {
          return updatedMovies;
        }

        const otherMovies = updatedMovies.filter(
          (movie) => movie.slug !== movieSlug
        );

        return [updatedMovie, ...otherMovies];
      });
      return true;
    } catch (error) {
      console.error("Error updating watching progress:", error);
      return false;
    }
  };

  // Check if movie is in watching list
  const isInWatching = (movieSlug) => {
    return watchingSlugs.includes(movieSlug);
  };

  // Get watching movie data
  const getWatchingMovie = (movieSlug) => {
    return watchingPage.find((movie) => movie.slug === movieSlug);
  };

  const value = {
    // Phân trang
    watchingPage,
    loadWatchingPage,
    hasMore,
    loadingPage,

    // Check nhanh
    watchingSlugs,
    loadingWatching,

    // Functions
    toggleWatching,
    updateWatchingProgress,
    isInWatching,
    getWatchingMovie,
  };

  return (
    <WatchingContext.Provider value={value}>
      {children}
    </WatchingContext.Provider>
  );
};
