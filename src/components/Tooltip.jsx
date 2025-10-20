import React from "react";

function Tooltip({ content, size = "md" }) {
  return (
    <div
      className={` absolute invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all ease-linear duration-200 bottom-[130%] left-1/2 -translate-x-1/2`}
    >
      <div
        className={`rounded relative bg-stone-300 z-20 whitespace-nowrap text-black ${
          size === "sm" ? "text-xs px-2 py-1" : "text-base px-3 py-2"
        }`}
      >
        {content}
      </div>
      <div
        className={`absolute w-4 aspect-square bg-stone-300 left-1/2 bottom-0 rotate-45 -translate-x-1/2 z-10 ${
          size === "sm" ? "w-3" : "w-4"
        }`}
      ></div>
    </div>
  );
}

export default Tooltip;
