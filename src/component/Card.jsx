import { useEffect, useRef, useState } from "react";
import { useItems } from "../context/api";
import "./Card.css";
import { useModal } from "../context/modal";
import Modal from "./Modal";
import { useThumb } from "../context/thumb";

const Card = () => {
  const { allItems } = useItems() || {}; 
  
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { openModal, handleOpenModal } = useModal();
  const { setThumb } = useThumb()
  const ref = useRef()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const obs = new IntersectionObserver((entries) => {
      console.log(entries, "entries")
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setLoaded(true);
          obs.disconnect();
        }
      });
    }, { rootMargin: "0px" });

    obs.observe(element);
    return () => obs.disconnect();
  }, [])

  const handleClick = (index) => {
    handleOpenModal()
    setThumb(index)
  }
  
  return (
    <div ref={ref}> 
      {
        loaded ? (
          <div className="card-container">
            {allItems.map((item, idx) => (
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
        ) : <div> "Loading" </div>
      }
      {openModal && <Modal />}
    </div>
  );
};

export default Card;