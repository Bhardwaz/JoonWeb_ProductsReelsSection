import React, { useState } from "react";

const ModalContext = React.createContext();

export const ModalProvider = ({ children }) => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <ModalContext.Provider value={{ openModal, handleOpenModal, handleCloseModal }}>
      { children }
    </ModalContext.Provider>
  );
};

export const useModal = () => React.useContext(ModalContext);
