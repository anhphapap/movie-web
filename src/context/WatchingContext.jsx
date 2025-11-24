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

  // 🪄 Cache slug và watchingPage từ sessionStorage khi load lại web
  useEffect(() => {
    const cachedSlugs = sessionStorage.getItem("watchingSlugs");
    const cachedPage = sessionStorage.getItem("watchingPage");
    if (cachedSlugs) setWatchingSlugs(JSON.parse(cachedSlugs));
    if (cachedPage) {
      const parsedPage = JSON.parse(cachedPage);
      // ✅ Sort cache theo lastWatched (mới nhất lên đầu)
      const sortedCache = parsedPage.sort((a, b) => {
        const timeA = a.lastWatched || 0;
        const timeB = b.lastWatched || 0;
        return timeB - timeA; // DESC: mới nhất trên đầu
      });
      setWatchingPage(sortedCache);
    }
  }, []);

  // 🔹 Lắng nghe realtime để đồng bộ cả slugs và data
  useEffect(() => {
    if (!user) {
      setWatchingSlugs([]);
      setWatchingPage([]);
      sessionStorage.removeItem("watchingSlugs");
      sessionStorage.removeItem("watchingPage");
      setLoadingWatching(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "watching");
    const unsub = onSnapshot(ref, (snap) => {
      const slugs = snap.docs.map((d) => d.id);
      const watchingData = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Convert Firestore Timestamp to number for sessionStorage compatibility
          lastWatched: data.lastWatched?.toMillis?.() || Date.now(),
          addedAt: data.addedAt?.toMillis?.() || Date.now(),
        };
      });

      // ✅ Sort theo lastWatched (mới nhất lên đầu)
      const sortedWatchingData = watchingData.sort((a, b) => {
        return b.lastWatched - a.lastWatched; // DESC: mới nhất trên đầu
      });

      setWatchingSlugs(slugs);
      setWatchingPage(sortedWatchingData);

      sessionStorage.setItem("watchingSlugs", JSON.stringify(slugs));
      sessionStorage.setItem(
        "watchingPage",
        JSON.stringify(sortedWatchingData)
      );
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
        setWatchingSlugs((prev) => {
          const newSlugs = prev.filter((slug) => slug !== movie.slug);
          sessionStorage.setItem("watchingSlugs", JSON.stringify(newSlugs));
          return newSlugs;
        });
        setWatchingPage((prev) => {
          const newPage = prev.filter((m) => m.slug !== movie.slug);
          sessionStorage.setItem("watchingPage", JSON.stringify(newPage));
          return newPage;
        });
      } else {
        // Thêm vào Firestore
        await setDoc(ref, {
          ...movie,
          addedAt: serverTimestamp(),
          lastWatched: serverTimestamp(),
        });

        // ⚡ Update local ngay với timestamp tạm để sort đúng
        const now = Date.now();
        setWatchingSlugs((prev) => {
          const newSlugs = [...prev, movie.slug];
          sessionStorage.setItem("watchingSlugs", JSON.stringify(newSlugs));
          return newSlugs;
        });
        setWatchingPage((prev) => {
          // Thêm lastWatched tạm cho local state để sort đúng (sẽ được update từ Firestore sau)
          const newMovie = {
            ...movie,
            lastWatched: now, // Number timestamp
            addedAt: now,
          };
          const newPage = [newMovie, ...prev];
          sessionStorage.setItem("watchingPage", JSON.stringify(newPage));
          return newPage;
        });
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
    svr,
    episodeName
  ) => {
    if (!user?.email) {
      return false;
    }

    try {
      const ref = doc(db, "users", user.uid, "watching", movieSlug);
      const progressData = {
        episodeName,
        currentTime,
        duration,
        episode,
        svr,
        lastWatched: serverTimestamp(),
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      };

      await setDoc(ref, progressData, { merge: true });

      // ⚡ Update local ngay và move lên đầu theo lastWatched
      const now = Date.now();
      setWatchingPage((prev) => {
        const updatedMovies = prev.map((movie) =>
          movie.slug === movieSlug
            ? {
                ...movie,
                ...progressData,
                lastWatched: now, // Number timestamp
              }
            : movie
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

        const newWatchingPage = [updatedMovie, ...otherMovies];
        // Cache vào sessionStorage
        sessionStorage.setItem("watchingPage", JSON.stringify(newWatchingPage));
        return newWatchingPage;
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
