import { createContext, useContext, useState } from "react";

const CinemaContext = createContext();

export const CinemaProvider = ({ children }) => {
  const [cinema, setCinema] = useState(false);

  return (
    <CinemaContext.Provider value={{ cinema, setCinema }}>
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = () => {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error("useCinema must be used within CinemaProvider");
  }
  return context;
};
