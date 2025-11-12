import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { listSortField, listType } from "../utils/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBannerCache } from "../context/BannerCacheContext";
import axios from "axios";
function FilterNavbar({ open }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract typeSlug from pathname
  const typeSlug = location.pathname.startsWith("/duyet-tim/")
    ? location.pathname.replace("/duyet-tim/", "").split("?")[0]
    : null;
  const [sort_field, setSortField] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [listCountry, setListCountry] = useState([]);
  const [listCategory, setListCategory] = useState([]);
  const [listYear, setListYear] = useState([]);
  const { playing } = useBannerCache();

  // Sync state với URL khi thay đổi
  useEffect(() => {
    setType(typeSlug || "phim-bo");
    setSortField(searchParams.get("sort_field") || "_id");
    setCategory(searchParams.get("category") || "");
    setYear(searchParams.get("year") || "");
    setCountry(searchParams.get("country") || "");
  }, [typeSlug, searchParams, location.pathname]);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const [responseCountry, responseCategory, responseYear] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_API_COUNTRIES}`),
            axios.get(`${import.meta.env.VITE_API_CATEGORIES}`),
            axios.get(`${import.meta.env.VITE_API_YEARS}`),
          ]);
        setListCountry(responseCountry.data.data.items);
        setListCategory(responseCategory.data.data.items);
        setListYear(responseYear.data.data.items);
      };
      fetchData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const handleFilter = () => {
    // Use current type value or typeSlug as fallback
    const currentType = type || typeSlug || "phim-bo";

    // Remove any existing "duyet-tim/" prefix from type to prevent duplication
    const cleanType = currentType.startsWith("duyet-tim/")
      ? currentType.replace("duyet-tim/", "")
      : currentType;

    navigate(
      `/duyet-tim/${cleanType}?sort_field=${sort_field}&category=${category}&country=${country}&year=${year}`
    );
    setShowMenu(false);
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
      className={`lg:flex-row flex-col flex lg:items-center justify-between py-3 transition-all duration-500 ease-linear text-white z-10 ${
        isScrolled || showMenu || open || playing
          ? "bg-[#141414]"
          : "bg-transparent"
      }`}
    >
      <div className="flex lg:inline-block justify-between w-full lg:w-auto pl-[3%]">
        <h1 className="text-2xl font-semibold">Duyệt tìm</h1>
        <div className="flex items-center lg:hidden pr-[3%]">
          <button
            type="button"
            className="relative inline-flex items-center justify-center rounded-md p-2 text-white aspect-square w-8 border-[1px] hover:bg-white/10"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? (
              <FontAwesomeIcon icon="fa-solid fa-xmark" />
            ) : (
              <FontAwesomeIcon icon="fa-solid fa-filter" />
            )}
          </button>
        </div>
      </div>
      <div
        className={`bg-[#141414] lg:bg-transparent ${
          showMenu ? "block" : "hidden"
        } mt-2 lg:flex lg:pr-[3%] lg:items-center lg:gap-2 lg:justify-center`}
        id="mobile-filter"
      >
        <div className="space-y-1 pb-2 px-[3%] lg:px-0 grid sm:grid-cols-2 md:grid-cols-3 gap-2 lg:flex">
          <select
            onChange={(e) => setSortField(e.target.value)}
            className="px-1 pr-4 py-[1px] mt-1 border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
            value={sort_field}
          >
            {listSortField.map((cate, index) => {
              return (
                <option
                  key={index + cate.value}
                  value={cate.value}
                  className="bg-black"
                >
                  {cate.name}
                </option>
              );
            })}
          </select>
          <select
            onChange={(e) => setType(e.target.value)}
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
            value={type || typeSlug || "phim-bo"}
          >
            {listType.map((cate, index) => {
              return (
                <option
                  key={index + cate.value}
                  value={cate.value}
                  className="bg-black"
                >
                  {cate.name}
                </option>
              );
            })}
          </select>
          <select
            onChange={(e) => setCategory(e.target.value)}
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
            value={category}
          >
            <option value="">Thể loại</option>
            {listCategory.map((cate) => {
              return (
                <option key={cate._id} value={cate.slug} className="bg-black">
                  {cate.name}
                </option>
              );
            })}
          </select>
          <select
            onChange={(e) => setCountry(e.target.value)}
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
            value={country}
          >
            <option value="">Quốc gia</option>
            {listCountry.map((ct) => {
              return (
                <option key={ct._id} value={ct.slug} className="bg-black">
                  {ct.name}
                </option>
              );
            })}
          </select>
          <select
            onChange={(e) => setYear(e.target.value)}
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
            value={year}
          >
            <option value="">Năm</option>
            {listYear.map((yearItem) => {
              return (
                <option
                  key={yearItem.year}
                  value={yearItem.year}
                  className="bg-black"
                >
                  {yearItem.year}
                </option>
              );
            })}
          </select>
        </div>
        <div className="text-end px-[3%] lg:px-0">
          <button
            className="bg-black border-[1px] px-4 py-[1px] mb-1 hover:bg-white/10 transition-all ease-linear"
            onClick={handleFilter}
          >
            Lọc
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterNavbar;
