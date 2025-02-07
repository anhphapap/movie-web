import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listCategory,
  listCountry,
  listSortField,
  listType,
} from "../utils/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function FilterNavbar({ type_slug }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
      className={`lg:flex-row flex-col flex lg:items-center justify-between py-3 transition-all duration-500 ease-linear text-white ${
        isScrolled || showMenu ? "bg-[#141414]" : "bg-transparent"
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
            id="sortField"
            className="px-1 pr-4 py-[1px] mt-1 border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
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
            id="type"
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
            defaultValue={type_slug}
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
            id="category"
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
          >
            <option value="">Thể loại</option>
            {listCategory.map((cate, index) => {
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
            id="country"
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
          >
            <option value="">Quốc gia</option>
            {listCountry.map((ct, index) => {
              return (
                <option
                  key={index + ct.value}
                  value={ct.value}
                  className="bg-black"
                >
                  {ct.name}
                </option>
              );
            })}
          </select>
          <select
            id="year"
            className="px-1 pr-4 py-[1px] border-white border-[1px] bg-black cursor-pointer hover:bg-white/10 transition-all ease-linear"
          >
            <option value="">Năm</option>
            {[...Array(2025 - 2010 + 1)].map((_, index) => {
              var year = 2025 - index;
              return (
                <option key={year} value={year} className="bg-black">
                  {year}
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
