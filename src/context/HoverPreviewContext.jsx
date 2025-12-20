// src/context/HoverPreviewContext.jsx
import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";

const HoverPreviewContext = createContext();

export const HoverPreviewProvider = ({ children }) => {
  const [hovered, setHovered] = useState(null);
  const timer = useRef(null);
  const lastPayload = useRef(null);
  const location = useLocation();

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onEnter = useCallback((payload, enterDelay = 500) => {
    lastPayload.current = payload;
    clear();
    timer.current = setTimeout(() => {
      if (lastPayload.current === payload) {
        setHovered(payload);
      }
    }, enterDelay);
  }, []);

  const onLeave = useCallback((leaveDelay = 50) => {
    clear();
    timer.current = setTimeout(() => {
      setHovered(null);
      lastPayload.current = null;
    }, leaveDelay);
  }, []);

  // ✅ Force clear preview khi location thay đổi (navigate)
  useEffect(() => {
    clear();
    setHovered(null);
    lastPayload.current = null;
  }, [location.pathname, location.search]);

  useEffect(() => clear, []);

  return (
    <HoverPreviewContext.Provider value={{ hovered, onEnter, onLeave }}>
      {children}
    </HoverPreviewContext.Provider>
  );
};

export const useHoverPreview = () => useContext(HoverPreviewContext);
