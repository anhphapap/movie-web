import { createContext, useContext, useState, useEffect } from "react";
import ListModal from "../components/ListModal";
import { useNavigate, useLocation } from "react-router-dom";
const ListModalContext = createContext();

export const ListModalProvider = ({ children, allowedPaths = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState("");
  const [nameList, setNameList] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const param = params.get("list");
    const listName = params.get("listName");
    setNameList(listName);
    setParams(param);
    setIsOpen(!!param && !!listName);
  }, [location.search]);

  const openList = ({ nameList, params }) => {
    const p = new URLSearchParams(location.search);
    p.set("list", params);
    p.set("listName", nameList);
    navigate(`${location.pathname}?${p.toString()}`, { replace: false });
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    setNameList(nameList);
    setIsOpen(true);
  };

  const closeList = () => {
    const params = new URLSearchParams(location.search);
    params.delete("list");
    params.delete("listName");
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
    setIsOpen(false);
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "";
  };

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);
  const normalize = (path) => path.replace(/\/+$/, "");
  const canOpen =
    allowedPaths.length === 0 ||
    allowedPaths.some((p) => {
      const allowed = normalize(p);
      const current = normalize(location.pathname);

      if (allowed === "/") return current === "/";

      return current.startsWith(allowed);
    });

  return (
    <ListModalContext.Provider value={{ openList, closeList }}>
      {children}
      {canOpen && isOpen && (
        <ListModal
          isOpen={isOpen}
          onClose={closeList}
          nameList={nameList}
          params={params}
        />
      )}
    </ListModalContext.Provider>
  );
};

export const useListModal = () => useContext(ListModalContext);
