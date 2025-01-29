import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listCategory,
  listCountry,
  listSortField,
  listType,
} from "../utils/data";

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
