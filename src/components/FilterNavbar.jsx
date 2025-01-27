import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const listCategory = [
  { name: "Hành Động", value: "hanh-dong" },
  { name: "Tình Cảm", value: "tinh-cam" },
  { name: "Hài Hước", value: "hai-huoc" },
  { name: "Cổ Trang", value: "co-trang" },
  { name: "Tâm Lý", value: "tam-ly" },
  { name: "Hình Sự", value: "hinh-su" },
  { name: "Chiến Tranh", value: "chien-tranh" },
  { name: "Thể Thao", value: "the-thao" },
  { name: "Võ Thuật", value: "vo-thuat" },
  { name: "Viễn Tưởng", value: "vien-tuong" },
  { name: "Phiêu Lưu", value: "phieu-luu" },
  { name: "Khoa Học", value: "khoa-hoc" },
  { name: "Kinh Dị", value: "kinh-di" },
  { name: "Âm Nhạc", value: "am-nhac" },
  { name: "Thần Thoại", value: "tai-lieu" },
  { name: "Tài Liệu", value: "than-thoai" },
  { name: "Gia Đình", value: "gia-dinh" },
  { name: "Chính kịch", value: "chinh-kich" },
  { name: "Bí ẩn", value: "bi-an" },
  { name: "Học Đường", value: "hoc-duong" },
  { name: "Kinh Điển", value: "kinh-dien" },
  { name: "Phim 18+", value: "phim-18" },
];

export const listType = [
  { name: "Phim Bộ", value: "phim-bo" },
  { name: "Phim Lẻ", value: "phim-le" },
  { name: "Phim Mới", value: "phim-moi" },
  { name: "TV Shows", value: "tv-shows" },
  { name: "Hoạt Hình", value: "hoat-hinh" },
  { name: "Phim Vietsub", value: "phim-vietsub" },
  { name: "Phim Thuyết Minh", value: "phim-thuyet-minh" },
  { name: "Phim Lồng Tiếng", value: "phim-long-tieng" },
  { name: "Phim Bộ Đang Chiếu", value: "phim-bo-dang-chieu" },
  { name: "Phim Trọn Bộ", value: "phim-bo-hoan-thanh" },
  { name: "Phim Sắp Chiếu", value: "phim-sap-chieu" },
  { name: "Subteam", value: "subteam" },
];

export const listSortField = [
  { name: "Thời gian cập nhật", value: "modified.time" },
  { name: "Thời gian đăng", value: "_id" },
  { name: "Năm sản xuất", value: "year" },
];

export const listCountry = [
  { name: "Hàn Quốc", value: "han-quoc" },
  { name: "Trung Quốc", value: "trung-quoc" },
  { name: "Nhật Bản", value: "nhat-ban" },
  { name: "Thái Lan", value: "thai-lan" },
  { name: "Âu Mỹ", value: "au-my" },
  { name: "Đài Loan", value: "dai-loan" },
  { name: "Hồng Kông", value: "hong-kong" },
  { name: "Ấn Độ", value: "an-do" },
  { name: "Anh", value: "anh" },
  { name: "Pháp", value: "phap" },
  { name: "Canada", value: "canada" },
  { name: "Đức", value: "duc" },
  { name: "Tây Ban Nha", value: "tay-ban-nha" },
  { name: "Thổ Nhĩ Kỳ", value: "tho-nhi-ky" },
  { name: "Hà Lan", value: "ha-lan" },
  { name: "Indonesia", value: "indonesia" },
  { name: "Nga", value: "nga" },
  { name: "Mexico", value: "mexico" },
  { name: "Ba lan", value: "ba-lan" },
  { name: "Úc", value: "uc" },
  { name: "Thụy Điển", value: "thuy-dien" },
  { name: "Malaysia", value: "malaysia" },
  { name: "Brazil", value: "brazil" },
  { name: "Philippines", value: "philippines" },
  { name: "Bồ Đào Nha", value: "bo-dao-nha" },
  { name: "Ý", value: "y" },
  { name: "Đan Mạch", value: "dan-mach" },
  { name: "UAE", value: "uae" },
  { name: "Na Uy", value: "na-uy" },
  { name: "Thụy Sĩ", value: "thuy-si" },
  { name: "Châu Phi", value: "chau-phi" },
  { name: "Nam Phi", value: "nam-phi" },
  { name: "Ukraina", value: "ukraina" },
  { name: "Ả Rập Xê Út", value: "a-rap-xe-ut" },
  { name: "Quốc Gia Khác", value: "quoc-gia-khac" },
];

function FilterNavbar({ type_slug }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const handleFilter = () => {
    const category = document.getElementById("category").value;
    const country = document.getElementById("country").value;
    const year = document.getElementById("year").value;
    const type = document.getElementById("type").value;
    const sortField = document.getElementById("sortField").value;
    navigate(
      `/filter/${type}?sort_field=${sortField}&category=${category}&country=${country}&year=${year}`
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={`flex items-center justify-between py-3 px-[3%] transition-all duration-500 ease-linear text-white ${
        isScrolled ? "bg-[#141414]" : "bg-transparent"
      }`}
    >
      <h1 className="text-3xl font-semibold">Duyệt tìm</h1>
      <div className="flex items-center gap-3">
        <select
          id="sortField"
          className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer"
        >
          {listSortField.map((cate, index) => {
            return (
              <option key={index + cate.value} value={cate.value}>
                {cate.name}
              </option>
            );
          })}
        </select>
        <select
          id="type"
          className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer"
          defaultValue={type_slug}
        >
          {listType.map((cate, index) => {
            return (
              <option key={index + cate.value} value={cate.value}>
                {cate.name}
              </option>
            );
          })}
        </select>
        <select
          id="category"
          className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer"
        >
          <option value="">Thể loại</option>
          {listCategory.map((cate, index) => {
            return (
              <option key={index + cate.value} value={cate.value}>
                {cate.name}
              </option>
            );
          })}
        </select>
        <select
          id="country"
          className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer"
        >
          <option value="">Quốc gia</option>
          {listCountry.map((ct, index) => {
            return (
              <option key={index + ct.value} value={ct.value}>
                {ct.name}
              </option>
            );
          })}
        </select>
        <select
          id="year"
          className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer"
        >
          <option value="">Năm</option>
          {[...Array(2025 - 2010 + 1)].map((_, index) => {
            var year = 2025 - index;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
        <button
          className="bg-black border-[1px] px-4 py-[1px] hover:bg-transparent/15"
          onClick={handleFilter}
        >
          Lọc
        </button>
      </div>
    </div>
  );
}

export default FilterNavbar;
