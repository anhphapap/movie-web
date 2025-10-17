import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import logo_full from "../assets/images/logo_full_940.png";

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 3500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 flex items-center justify-center bg-black z-[9999]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
      >
        <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-6">
          {/* Logo */}
          <motion.img
            src={logo_full}
            alt="Needflex"
            className="w-2/3 sm:w-1/2"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [1.5, 1, 1, 0.5],
            }}
            transition={{
              duration: 3,
              times: [0, 0.3, 0.9, 1],
              ease: "easeInOut",
            }}
          />

          {/* Slogan */}
          <motion.p
            className="text-white/80 text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide text-center w-2/3 sm:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [1.3, 1, 1, 0.1],
            }}
            transition={{
              duration: 3,
              times: [0, 0.3, 0.9, 1],
              ease: "easeInOut",
            }}
          >
            Giải trí đỉnh cao, không tốn đồng nào
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
