import { useEffect, useRef, useState } from "react";
import { useItems } from "../context/api";
import "./Card.css";
import { useModal } from "../context/modal";
import Modal from "./Modal";
import { useThumb } from "../context/thumb";
import { useZoom } from "../hooks/useZoom";

const zoom15 = {
  "width": "30rem"
}

const Card = () => {
  const { allGroups, visibleReels, setActiveGroupId, activeGroupId } = useItems() || {};

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { openModal, handleOpenModal } = useModal();
  const { setThumb } = useThumb()
  const ref = useRef()
  const [loaded, setLoaded] = useState(false)
  const zoom = useZoom()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const obs = new IntersectionObserver((entries) => {
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
    <div className="card-parent">
      <div className="group-tab-row">
        <button
          className={`group-tab ${activeGroupId === null ? "active" : ""}`}
          onClick={() => setActiveGroupId(null)}
        >
          All
        </button>

        {allGroups.map(group => (
          <button
            key={group._id}
            className={`group-tab ${activeGroupId === group._id ? "active" : ""}`}
            onClick={() => setActiveGroupId(group._id)}
          >
            {group.name}
          </button>
        ))}
      </div>


      <div ref={ref}>
        {
          loaded ? (
            <div className="card-container">
              {visibleReels?.map((item, idx) => (
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
    </div>
  );
};

export default Card;