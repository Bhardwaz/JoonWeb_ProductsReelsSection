import { useState } from "react";
import { useItems } from "../context/api";
import "./Card.css";
import { useModal } from "../context/modal";
import Modal from "./Modal";
import { useThumb } from "../context/thumb";

const Card = () => {
  const { items } = useItems() || [];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const {openModal, handleOpenModal } = useModal();
  const { setThumb } = useThumb()

  const handleClick = (index) => {
     handleOpenModal()
     setThumb(index)
  }
  return (
   <div>
    <div className="card-container">
      {items.map((item, idx) => (
        <div
          className="card"
          key={item.id ?? idx}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {hoveredIndex === idx ? (
            <img
              className="my-reel"
              src={item.previewAnimationUrl}
              onClick={() => handleClick(idx)}
            />
          ) : (
            <img
              className="thumb" 
              src={item.thumbnailUrl}
              alt={item.title ?? "thumbnail"}
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
    { openModal && <Modal /> }
   </div>
  );
};

export default Card;
