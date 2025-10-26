import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";

const SEOManagerContext = createContext();

export const SEOManagerProvider = ({ children }) => {
  const [currentSEO, setCurrentSEO] = useState(null);
  const [seoStack, setSeoStack] = useState([]); // Stack để lưu trữ SEO trước đó
  const location = useLocation();

  // Hàm để push SEO mới vào stack và set làm current
  const pushSEO = useCallback((seoData) => {
    setCurrentSEO((prevCurrent) => {
      // Lưu SEO hiện tại vào stack trước khi push SEO mới
      if (prevCurrent) {
        setSeoStack((prev) => [...prev, prevCurrent]);
      }
      return seoData;
    });
  }, []);

  // Hàm để pop SEO từ stack và restore SEO trước đó
  const popSEO = useCallback(() => {
    if (seoStack.length > 0) {
      const previousSEO = seoStack[seoStack.length - 1];
      setSeoStack((prev) => prev.slice(0, -1));
      setCurrentSEO(previousSEO);
    } else {
      setCurrentSEO(null);
    }
  }, [seoStack]);

  // Hàm để clear toàn bộ stack và reset về null
  const clearSEO = useCallback(() => {
    setCurrentSEO(null);
    setSeoStack([]);
  }, []);

  // Reset SEO khi route thay đổi
  useEffect(() => {
    setCurrentSEO(null);
    setSeoStack([]);
  }, [location.pathname]);

  const value = useMemo(
    () => ({
      currentSEO,
      pushSEO,
      popSEO,
      clearSEO,
      hasActiveSEO: !!currentSEO,
      stackLength: seoStack.length,
    }),
    [currentSEO, pushSEO, popSEO, clearSEO, seoStack.length]
  );

  return (
    <SEOManagerContext.Provider value={value}>
      {children}
    </SEOManagerContext.Provider>
  );
};

export const useSEOManager = () => {
  const context = useContext(SEOManagerContext);
  if (!context) {
    throw new Error("useSEOManager must be used within a SEOManagerProvider");
  }
  return context;
};
