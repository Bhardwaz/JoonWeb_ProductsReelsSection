import "../shimmir/ProductShimmir.css"

const ProductShimmer = () => {
  return (
    <div className="product-shimmer-right">
      {/* 1. Large Product Image Placeholder */}
      <div className="shimmer-image-box"></div>

      <div className="shimmer-content-padding">
        {/* 2. Title and Price */}
        <div className="shimmer-line title-large"></div>
        <div className="shimmer-line price-med"></div>

        {/* 3. Color Selection Dots */}
        <div className="shimmer-label-small"></div>
        <div className="shimmer-dot-row">
          <div className="shimmer-circle-dot"></div>
          <div className="shimmer-circle-dot"></div>
          <div className="shimmer-circle-dot"></div>
        </div>

        {/* 4. Description Lines */}
        <div className="shimmer-label-small"></div>
        <div className="shimmer-list">
          <div className="shimmer-line"></div>
          <div className="shimmer-line"></div>
          <div className="shimmer-line short"></div>
        </div>
      </div>

      {/* 5. Sticky Footer Buttons */}
      <div className="shimmer-footer-btns">
        <div className="shimmer-btn-long"></div>
        <div className="shimmer-btn-square"></div>
      </div>
    </div>
  );
};

export default ProductShimmer;