import { Heart } from "lucide-react";
import React, { useState } from "react";

const Footer = () => {
  const [hidden, setHidden] = useState(false);
  return (
    <div
      className="mt-20 flex items-center justify-center text-center text-[#808080] text-sm p-4 gap-1"
      onClick={() => setHidden(!hidden)}
    >
      <span>© 2025 Needflex. Powered by Anh Pha</span>
      <span
        className={`${
          hidden ? "hidden" : "visible"
        } transition-all duration-300 flex items-center justify-center gap-1 `}
      >
        <Heart color="red" size={16} fill="red"></Heart> Bich Ngoc
      </span>
    </div>
  );
};

export default Footer;
