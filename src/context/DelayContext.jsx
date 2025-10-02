import { useState, useRef } from "react";

export default function useHoverDelay(enterDelay = 300, leaveDelay = 50) {
  const [hovered, setHovered] = useState(null);
  const timer = useRef(null);

  const onEnter = (payload) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setHovered(payload);
    }, enterDelay);
  };

  const onLeave = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setHovered(null);
    }, leaveDelay);
  };

  return { hovered, onEnter, onLeave };
}
