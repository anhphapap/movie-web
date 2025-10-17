import { motion, AnimatePresence } from "framer-motion";
import logo_full from "../assets/images/logo_full_940.png";
import { useRef } from "react";

export default function SplashScreen() {
  const logoRef = useRef(null);
  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
      >
        <motion.div
          ref={logoRef}
          className="relative inline-block w-fit overflow-x-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        >
          <img
            src={logo_full}
            alt="Needflex Logo"
            className="w-64 md:w-80 relative z-10 select-none pointer-events-none"
            draggable={false}
          />

          {/* Ánh sáng quét khít logo */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-[6px] skew-x-[20deg]"
            initial={{ x: "-150%" }}
            animate={{ x: "150%" }}
            transition={{
              delay: 1.8,
              duration: 1.4,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        <motion.div
          className="mt-8 w-40 h-1 bg-gray-700 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-red-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
