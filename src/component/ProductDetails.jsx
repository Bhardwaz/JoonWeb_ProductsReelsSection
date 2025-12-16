import './ProductDetails.css';

import boatAirdopesImage from '../assets/boat-airdopes.jpeg';

const ProductDetail = ({ product }) => {
  return (
    <div className="product-right-container">
      {/* Scrollable Content Area */}
      <div className="product-scroll-area">
        
        {/* 1. Main Product Image */}
        <div className="product-image-wrapper">
          <img 
            src={boatAirdopesImage} 
            alt="Product" 
            className="main-product-img"
          />
        </div>

        {/* 2. Header Info */}
        <div className="product-header-section">
          <h1 className="product-title">{product?.title}</h1>
          <div className="product-price-row">
            <span className="current-price">{product?.price}</span>
            <span className="original-price">$4,490</span>
          </div>
        </div>

        {/* 3. Color Selection */}
        <div className="color-selector-section">
          <p className="section-label">Select Color: <span>Sleek Black</span></p>
          <div className="color-options">
            <button className="color-dot black active"></button>
            <button className="color-dot blue"></button>
            <button className="color-dot green"></button>
          </div>
        </div>

        {/* 4. Description List */}
        <div className="description-section">
          <p className="section-label">Description</p>
          <ul className="specs-list">
            <li><strong>BEAST™ Mode</strong></li>
            <li className="sub-spec">{product?.desc}</li>
            <li>Dual Pairing</li>
            <li>50Hrs Playtime</li>
          </ul>
        </div>
      </div>

      {/* 5. Sticky Footer Actions */}
      <div className="product-actions-footer">
        <button className="add-to-cart-btn">Add to cart</button>
        <button className="cart-icon-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;