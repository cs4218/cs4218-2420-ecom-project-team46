// similar to auth.js, added in import React here, which is required because AuthProvider is a React component.
import React, { useState, useContext, createContext } from "react";

const SearchContext = createContext();

// changed the state variable from auth/setAuth to search/setSearch to avoid confusion, contributing to readability and maintainability
const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState({
    keyword: "",
    results: [],
  });

  return (
    <SearchContext.Provider value={[search, setSearch]}>
      {children}
    </SearchContext.Provider>
  );
};

// custom hook
const useSearch = () => useContext(SearchContext);

export { useSearch, SearchProvider };