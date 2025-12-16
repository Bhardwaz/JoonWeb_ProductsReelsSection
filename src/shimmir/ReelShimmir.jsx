import { useResize } from '../context/resize';
import './ReelShimmir.css';

const ReelShimmer = () => {
  const { isMobile } = useResize()
  return (
    <div className="reel-shimmer-container">
      <div className="shimmer-top-bar">
        <div className="shimmer-icon-square small"></div>
        <div className="shimmer-icon-square small"></div>
      </div>

      <div className="shimmer-main-body"></div>

      {
        isMobile && <div className="shimmer-footer">

          <div className="shimmer-badge"></div>
          <div className="shimmer-text-line short"></div>

          <div className="shimmer-product-card">
            <div className="shimmer-product-image"></div>
            <div className="shimmer-product-info">
              <div className="shimmer-text-line"></div>
              <div className="shimmer-text-line short"></div>
            </div>
            <div className="shimmer-button"></div>
          </div>
        </div>
      }
    </div>
  );
};

export default ReelShimmer;