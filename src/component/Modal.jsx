import React, { Suspense } from "react";
import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import "./Modal.css"
import ReelShimmer from "./ReelShimmir";

const Reels = React.lazy(() => import("./ModalCard"))

const Modal = () => {
    const { thumbAt, prevThumb, nextThumb, setThumb } = useThumb()
    const { allItems, appendNext } = useItems()
    const { handleCloseModal, isIframeReady } = useModal();

    const prev = thumbAt - 1 < 0 ? null : thumbAt - 1;
    const next = thumbAt + 1 >= allItems.length ? null : thumbAt + 1;
    
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
          { isIframeReady &&  <button className="close-button" onClick={handleCloseModal}> &times; </button> }
        </div>
    )
}

export default Modal;