import { useState, useRef, useEffect } from "react";

export default function useHoverDelay(enterDelay = 500, leaveDelay = 100) {
  const [hovered, setHovered] = useState(null);
  const timer = useRef(null);
  const lastPayload = useRef(null);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onEnter = (payload) => {
    lastPayload.current = payload;
    clear();
    timer.current = setTimeout(() => {
      // chỉ set nếu payload còn là cái cuối cùng
      if (lastPayload.current === payload) {
        setHovered(payload);
      }
    }, enterDelay);
  };

  const onLeave = () => {
    clear();
    timer.current = setTimeout(() => {
      setHovered(null);
      lastPayload.current = null;
    }, leaveDelay);
  };

  // clear khi unmount
  useEffect(() => clear, []);

  return { hovered, onEnter, onLeave };
}
