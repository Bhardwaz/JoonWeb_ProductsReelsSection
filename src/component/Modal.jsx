import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import "./Modal.css"
import ModalCard from "./ModalCard";

const Modal = () => {
    const { thumbAt, prevThumb, nextThumb, setThumb } = useThumb()
    const { items } = useItems();

    const prev = thumbAt - 1 < 0 ? null : thumbAt - 1;
    const next = thumbAt + 1 >= items.length ? null : thumbAt + 1;
    
    return (
        <div className="modal-container">

            <div className="arrow-btn left-arrow" onClick={prevThumb}>
                ‹
            </div>

            {
              prev !== null && <div className="prev-thumb" onClick={() => setThumb(prev)}>
                    <img src={items?.[prev]?.thumbnailUrl} />
                </div>
            }
            <ModalCard />
            {
                next !== null &&
                <div className="next-thumb" onClick={() => setThumb(next)}>
                    <img src={items?.[next]?.thumbnailUrl} />
                </div>
            }
            <div className="arrow-btn right-arrow" onClick={nextThumb}>
                ›
            </div>
        </div>
    )
}

export default Modal;