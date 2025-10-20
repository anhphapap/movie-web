import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import SEO from "../components/SEO";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const notFoundSEO = {
    titleHead: "Không tìm thấy trang - 404",
    descriptionHead:
      "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Quay lại trang chủ để tiếp tục xem phim.",
    og_type: "website",
    og_url: "404",
    og_image: ["/assets/images/logo_full_940.png"],
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO seoData={notFoundSEO} />
      <div className="text-center space-y-6 max-w-2xl">
        <div className="relative">
          <div className="text-[120px] sm:text-[180px] md:text-[220px] font-black text-white/5 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon
              icon="fa-solid fa-film"
              className="text-6xl sm:text-7xl md:text-8xl text-white/20"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Bạn đi lạc à?
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-md mx-auto">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời
            không khả dụng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={() => navigate("/trang-chu")}
            className="group relative px-8 py-3 bg-white text-black font-semibold rounded-md hover:bg-white/90 transition-all duration-300 flex items-center gap-2"
          >
            <FontAwesomeIcon icon="fa-solid fa-house" />
            <span>Về trang chủ</span>
          </button>
        </div>

        <div className="pt-8 space-y-4">
          <p className="text-sm text-white/50">Có thể bạn quan tâm:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate("/phim-le")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 hover:text-white text-white/20 rounded-full text-sm transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <FontAwesomeIcon icon="fa-solid fa-film" className="mr-2" />
              Phim lẻ
            </button>
            <button
              onClick={() => navigate("/phim-bo")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 hover:text-white text-white/20 rounded-full text-sm transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <FontAwesomeIcon icon="fa-solid fa-tv" className="mr-2" />
              Phim bộ
            </button>
            <button
              onClick={() => navigate("/ung-ho")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 hover:text-white text-white/20 rounded-full text-sm transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <FontAwesomeIcon
                icon="fa-solid fa-circle-dollar-to-slot"
                className="mr-2"
              />
              Donate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
