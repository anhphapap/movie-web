import { motion, AnimatePresence } from "framer-motion";
import logo_full from "../assets/images/logo_full_940.png";
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false); // load xong
  const [shine, setShine] = useState(false); // bắt đầu ánh sáng
  const [fade, setFade] = useState(false); // bắt đầu fade-out
  const [visible, setVisible] = useState(true); // kiểm soát unmount

  useEffect(() => {
    // Thanh load chạy chậm dần
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 99) {
          clearInterval(timer);
          setTimeout(() => setDone(true), 300);
          return 100;
        }
        return p + (100 - p) * 0.08;
      });
    }, 70);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (done) {
      setShine(true);
      // Sau khi ánh sáng chạy xong (~1.4s) → bắt đầu fade
      const t1 = setTimeout(() => setFade(true), 1000);
      // Sau khi fade xong (~1.2s) → unmount splash + báo App
      const t2 = setTimeout(() => {
        setVisible(false);
        onFinish?.();
      }, 1000 + 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [done]);

  if (!visible) return null; // ✅ unmount thật sự khỏi DOM

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className={`fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999] ${
          fade ? "pointer-events-none" : ""
        }`}
        initial={{ opacity: 1 }}
        animate={{ opacity: fade ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* LOGO */}
        <motion.div
          className="relative inline-block w-fit overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img
            src={logo_full}
            alt="Needflex Logo"
            className="w-64 md:w-80 relative z-10 select-none pointer-events-none"
            draggable={false}
          />

          {/* ÁNH SÁNG QUÉT — chỉ chạy sau khi load xong */}
          {shine && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[6px] skew-x-[20deg]"
              initial={{ x: "-150%" }}
              animate={{ x: "150%" }}
              transition={{
                duration: 1,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>

        {/* THANH LOAD */}
        <motion.div
          className="mt-8 w-40 h-1 bg-gray-700 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="h-full bg-red-600 rounded-full origin-left"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
