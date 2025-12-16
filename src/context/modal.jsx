import React, { useState } from "react";

const ModalContext = React.createContext();

export const ModalProvider = ({ children }) => {
  const [openModal, setOpenModal] = useState(false);
  const [isIframeReady, setIsIframeReady] = useState(false)

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleShimmirUi = () => setIsIframeReady(true)

  return (
    <ModalContext.Provider value={{ openModal, handleOpenModal, handleCloseModal, handleShimmirUi, isIframeReady }}>
      { children }
    </ModalContext.Provider>
  );
};

export const useModal = () => React.useContext(ModalContext);
