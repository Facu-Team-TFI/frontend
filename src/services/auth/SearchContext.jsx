import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SearchContext.Provider
      value={{ searchTitle, setSearchTitle, searchOpen, setSearchOpen }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
