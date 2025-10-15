import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LazyImage from "./LazyImage";
import { useMovieModal } from "../context/MovieModalContext";
import { useHoverPreview } from "../context/HoverPreviewContext";
import { createPortal } from "react-dom";
export default function HoverPreview() {
  const { hovered, onEnter, onLeave } = useHoverPreview();
  const navigate = useNavigate();
  const { openModal } = useMovieModal();

  const handleOpenModal = (slug) => {
    openModal(slug);
    onLeave();
  };

  if (!hovered || !hovered.rect) return null;
  const { item, rect, index, typeList, firstVisible, lastVisible } = hovered;

  const content = (
    <AnimatePresence mode="wait">
      <motion.div
        key={item._id || item.slug}
        className="absolute z-[10000] shadow-xl shadow-black/80 rounded hidden lg:block pointer-events-auto"
        style={{
          top: rect.top - rect.height / (typeList === "top" ? 2.75 : 1.25),
          left:
            index === firstVisible
              ? rect.left
              : index === lastVisible
              ? rect.left - rect.width / 2
              : rect.left - rect.width / 4,
          width: rect.width,
        }}
        onMouseEnter={() => onEnter(hovered)}
        onMouseLeave={onLeave}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: 0.9,
          y: 15,
          transition: { duration: 0.15, ease: "easeInOut" },
        }}
        transition={{
          opacity: { duration: 0.25, ease: "easeOut" },
          scale: { duration: 0.25, ease: "easeOut" },
          y: { duration: 0.25, ease: "easeOut" },
        }}
        onClick={() => handleOpenModal(item.slug)}
      >
        <div className="bg-[#141414] rounded origin-top w-[150%] cursor-pointer overflow-hidden">
          <div className="relative w-full aspect-video rounded-t overflow-hidden">
            <div className="w-full h-full">
              <LazyImage
                src={item.poster_url}
                alt={item.name}
                sizes="24vw"
                priority={true}
              />
            </div>
            {/* <div className="bg-gradient-to-t from-[#141414] to-transparent absolute w-full h-[40%] -bottom-[2px] left-0 z-10"></div> */}
          </div>

          <div className="px-4 py-4 flex flex-col gap-2">
            <div className="flex justify-between px-1">
              <div
                className="bg-white rounded-full pl-[2px] h-[40px] w-[40px] flex items-center justify-center hover:bg-white/80 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/watch/${item.slug}?svr=${0}&ep=${0}`);
                }}
              >
                <FontAwesomeIcon icon="fa-solid fa-play" size="sm" />
              </div>
              <div
                className="text-white border-2 cursor-pointer border-white/40 bg-black/10 rounded-full h-[40px] w-[40px] flex items-center justify-center hover:border-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(item.slug);
                }}
              >
                <FontAwesomeIcon icon="fa-solid fa-chevron-down" size="sm" />
              </div>
            </div>

            <h3 className="font-bold truncate text-base text-white">
              {item.name}
            </h3>

            <div className="flex space-x-2 items-center text-white/80 text-sm">
              <span className="lowercase">{item.year}</span>
              <span className="hidden lg:block">
                {item.episode_current.toLowerCase().includes("hoàn tất")
                  ? "Hoàn tất"
                  : item.episode_current}
              </span>
              <span className="px-1 border rounded font-bold uppercase h-[20px] flex items-center justify-center">
                {item.quality}
              </span>
            </div>

            <div className="text-white/80 text-sm flex items-center gap-2 flex-wrap">
              {item.category.slice(0, 3).map((cat, idx) => (
                <>
                  {idx !== 0 && (
                    <FontAwesomeIcon
                      icon="fa-solid fa-circle"
                      size="2xs"
                      className="opacity-50 scale-50"
                    />
                  )}
                  <span key={cat.name}>{cat.name}</span>
                </>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
