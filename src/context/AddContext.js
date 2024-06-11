import React, { createContext, useContext, useState } from "react";

const AddContext = createContext();

export const AddProvider = ({ children }) => {
  const [AddMode, setAddMode] = useState(false);

  return (
    <AddContext.Provider value={{ AddMode, setAddMode}}>
      {children}
    </AddContext.Provider>
  );
};

export const useAdd = () => {
  return useContext(AddContext);
};
