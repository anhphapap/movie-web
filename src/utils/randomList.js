import { listCategory, listCountry } from "../utils/data";

export const randomList = (location) => {
  var listCarousel = new Set([]);
  var type_slug = "phim-moi-cap-nhat";
  if (location == "/phim-bo") type_slug = "phim-bo";
  else type_slug = "phim-le";
  if (location === "/") {
    listCarousel.add({
      typeList: "top",
      type_slug: "phim-bo",
      sort_field: "view",
      year: 2025,
      size: 10,
    });
    listCarousel.add({
      typeList: "top",
      type_slug: "phim-le",
      sort_field: "view",
      year: 2025,
      size: 10,
    });
  } else
    listCarousel.add({
      typeList: "top",
      type_slug: type_slug,
      sort_field: "view",
      year: 2025,
      size: 10,
    });
  for (var i = 1; i <= 15; i++) {
    var category =
      listCategory[Math.ceil(Math.random() * (listCategory.length - 3))].value;
    var country = listCountry[Math.ceil(Math.random() * 10)].value;
    listCarousel.add({
      typeList: "list",
      type_slug: type_slug,
      category: category,
      country: country,
    });
  }
  listCarousel = [...listCarousel];
  if (location === "/") {
    [listCarousel[1], listCarousel[4]] = [listCarousel[4], listCarousel[1]];
  }
  return listCarousel;
};
