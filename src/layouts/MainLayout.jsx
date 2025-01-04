import React, { Children } from "react";
import Banner from "../components/Banner";

const MainLayout = ({ type, type_slug, openModal, children }) => {
  return (
    <>
      <Banner openModal={openModal} type_slug={type_slug} type={type} />
      {children}
    </>
  );
};

export default MainLayout;
