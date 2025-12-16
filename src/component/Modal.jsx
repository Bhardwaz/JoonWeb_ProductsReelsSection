import React, { Suspense } from "react";
import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import "./Modal.css"

const Reels = React.lazy(() => import("./ModalCard"))

const Modal = () => {
    const { thumbAt, prevThumb, nextThumb, setThumb } = useThumb()
    const { allItems, appendNext } = useItems()
    const { handleCloseModal } = useModal();

    const prev = (thumbAt - 1 + allItems.length) % allItems.length;
    const next =  (thumbAt + 1) % allItems.length;
    
    const handleNext = () => { 
        appendNext()
        nextThumb(allItems?.length)
    }

    const handlePrev = () => { 
        prevThumb(allItems?.length)
    }

    return (
        <div className="modal-container">
            
            <div className="arrow-btn left-arrow" onClick={() => handlePrev()}>
                ←
            </div>
            {
                prev !== null && <div className="prev-thumb" onClick={() => setThumb(prev)}>
                    <img src={allItems?.[prev]?.thumbnailUrl} />
                </div>
            }
            <Suspense>   
                <Reels />
            </Suspense>

            {
                next !== null &&
                <div className="next-thumb" onClick={() => setThumb(next)}>
                    <img src={allItems?.[next]?.thumbnailUrl} />
                </div>
            }
            <div className="arrow-btn right-arrow" onClick={() => handleNext()}>
                →
            </div>
          {<button className="close-button" onClick={handleCloseModal}> &times; </button> }
        </div>
    )
}

export default Modal;