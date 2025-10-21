import React from "react";

function Tooltip({ content, size = "md", className, color = "stone" }) {
  return (
    <div
      className={`hidden lg:block absolute invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all ease-linear duration-200 bottom-[130%] left-1/2 -translate-x-1/2 ${className}`}
    >
      <div
        className={`rounded relative ${
          color === "stone"
            ? "bg-stone-300 text-black"
            : "bg-black/90 backdrop-blur text-white border border-white/10 "
        } z-20 whitespace-nowrap  ${
          size === "sm" ? "text-xs px-2 py-1" : "text-base px-3 py-2"
        } `}
      >
        {content}
      </div>
      <div
        className={`absolute w-4 aspect-square ${
          color === "stone"
            ? "bg-stone-300"
            : "bg-black/90 backdrop-blur border border-white/10 "
        } left-1/2 bottom-0 rotate-45 -translate-x-1/2 z-10 ${
          size === "sm" ? "w-3" : "w-4"
        }`}
      ></div>
    </div>
  );
}

export default Tooltip;
