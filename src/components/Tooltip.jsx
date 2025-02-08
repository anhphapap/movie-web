import React from "react";

function Tooltip({ content }) {
  return (
    <div className=" absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all ease-linear duration-200 bottom-[130%] left-1/2 -translate-x-1/2">
      <div className="px-3 py-2 rounded relative  bg-stone-300 z-20 whitespace-nowrap text-black">
        {content}
      </div>
      <div className="absolute w-4 aspect-square bg-stone-300 left-1/2 bottom-0 rotate-45 -translate-x-1/2 z-10"></div>
    </div>
  );
}

export default Tooltip;
