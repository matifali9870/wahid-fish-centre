import { useMemo, useState } from 'react';
import './App.css';
import { products, type Product } from './products';

// WhatsApp number in international format.
const WHATSAPP_NUMBER = '919717785423';

const categories = [
  'All',
  'Fish & Seafood',
  'Chicken',
  'Mutton',
  'Kabab',
] as const;

type Category = (typeof categories)[number];

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN').format(Math.round(price));
}

// Quantity options for products sold by kg
const kgOptions = [
  { label: '500g', value: 0.5 },
  { label: '1 kg', value: 1 },
  { label: '2 kg', value: 2 },
  { label: 'More than 2 kg', value: 0 },
];

// Quantity options for products sold by piece
const pieceOptions = [
  { label: '1 Piece', value: 1 },
  { label: '2 Pieces', value: 2 },
  { label: '3 Pieces', value: 3 },
  { label: '5 Pieces', value: 5 },
];

type QuantityOption = {
  label: string;
  value: number;
};

type CartItem = {
  id: string;
  product: Product;
  weightLabel: string;
  quantityValue: number;
  price: number;
};

type ModalAction = 'details' | 'cart' | 'order';

function App() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<Product | null>(null);

  const [selectedWeight, setSelectedWeight] =
    useState<QuantityOption | null>(null);

  const [customQuantity, setCustomQuantity] = useState('');

  const [modalAction, setModalAction] =
    useState<ModalAction>('details');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product: Product) => {
      const matchesCategory =
        category === 'All' || product.category === category;

      const matchesSearch =
        !q || product.name.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  // ------------------------------------------
  // MODAL
  // ------------------------------------------

  const openModal = (
    product: Product,
    action: ModalAction = 'details'
  ) => {
    setSelected(product);
    setModalAction(action);
    setCustomQuantity('');

    if (product.unit === 'kg') {
      setSelectedWeight(kgOptions[3]);
    } else {
      setSelectedWeight(pieceOptions[0]);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setSelectedWeight(null);
    setCustomQuantity('');
    setModalAction('details');
  };

  // ------------------------------------------
  // QUANTITY
  // ------------------------------------------

  const isCustomQuantity =
    selected?.unit === 'kg' &&
    selectedWeight?.label === 'More than 2 kg';

  const getQuantityValue = () => {
    if (!selectedWeight) return 0;

    if (isCustomQuantity) {
      const customValue = Number(customQuantity);

      if (!customValue || customValue <= 2) {
        return 0;
      }

      return customValue;
    }

    return selectedWeight.value;
  };

  const getQuantityLabel = () => {
    if (!selectedWeight) return '';

    if (isCustomQuantity) {
      const customValue = Number(customQuantity);

      if (!customValue || customValue <= 2) {
        return 'More than 2 kg';
      }

      return `${customValue} kg`;
    }

    return selectedWeight.label;
  };

  const getSelectedPrice = () => {
    if (!selected) return 0;

    const quantity = getQuantityValue();

    return selected.price * quantity;
  };

  // ------------------------------------------
  // CART
  // ------------------------------------------

  const addSelectedToCart = () => {
    if (!selected || !selectedWeight) return;

    const quantityValue = getQuantityValue();

    if (!quantityValue) {
      alert('Please select a valid quantity.');
      return;
    }

    if (isCustomQuantity && quantityValue <= 2) {
      alert(
        'For More than 2 kg, please enter a quantity above 2 kg.'
      );
      return;
    }

    const newItem: CartItem = {
      id: `${selected.id}-${quantityValue}-${Date.now()}`,
      product: selected,
      weightLabel: getQuantityLabel(),
      quantityValue,
      price: selected.price * quantityValue,
    };

    setCart((previousCart) => [
      ...previousCart,
      newItem,
    ]);

    closeModal();
  };

  const removeFromCart = (idToRemove: string) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== idToRemove
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  // ------------------------------------------
  // WHATSAPP
  // ------------------------------------------

  const openWhatsApp = (message: string) => {
    const encodedMessage =
      encodeURIComponent(message);

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      window.location.href =
        `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
    } else {
      window.open(
        `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`,
        '_blank'
      );
    }
  };

  const sendDirectOrderToWhatsApp = () => {
    if (!selected || !selectedWeight) return;

    const quantityValue = getQuantityValue();

    if (!quantityValue) {
      alert('Please select a valid quantity.');
      return;
    }

    if (isCustomQuantity && quantityValue <= 2) {
      alert('Please enter more than 2 kg.');
      return;
    }

    
    let message =
      'Hello Wahid Fish Centre! 🐟\n' +
      'I would like to order:\n\n';

    message += `Item: ${selected.name} (₹${formatPrice(
      selected.price
    )}/${selected.unit})\n`;
    message += `Quantity: ${getQuantityLabel()}\n\n`;
    message += 'Please confirm delivery time. Thanks!';

    openWhatsApp(message);

    closeModal();
  };

  const sendCartToWhatsApp = () => {
    if (cart.length === 0) return;

    let message =
      'Hello Wahid Fish Centre! 🐟\n' +
      'I would like to order:\n\n';

    let totalAmount = 0;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Quantity: ${item.weightLabel}\n`;

      message += `   Rate shown on website: ₹${formatPrice(
        item.product.price
      )}/${item.product.unit}\n`;

      message += `   Estimated Price: ₹${formatPrice(
        item.price
      )}\n\n`;

      totalAmount += item.price;
    });

    message += `Estimated Total: ₹${formatPrice(
      totalAmount
    )}\n\n`;

    message += 'Delivery: FREE in Delhi NCR\n\n';

    message +=
      'Please confirm the latest market price, availability, exact weight and final price.';

    openWhatsApp(message);
  };

  const handleModalPrimaryAction = () => {
    if (modalAction === 'order') {
      sendDirectOrderToWhatsApp();
      return;
    }

    addSelectedToCart();
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  // ------------------------------------------
  // UI
  // ------------------------------------------

  return (
    <div className="site-shell">

      {/* ======================================
          STICKY HEADER
      ====================================== */}

      <header
        className="header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#0a0a0a',
        }}
      >
        <div className="container header-inner">

          <a
            className="brand"
            href="#top"
            aria-label="Wahid Fish Centre home"
          >
            <span className="brand-mark">
              W
            </span>

            <span>
              <strong>
                Wahid Fish Centre
              </strong>

              <small>
                Fresh • Quality • Direct Order
              </small>
            </span>
          </a>

          <a
            href="tel:+919717785423"
            aria-label="Call Wahid Fish Centre"
            style={{
              color: '#22c55e',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              marginLeft: '14px',
            }}
          >
            📞 +91 9717785423
          </a>

          <nav
            className="nav"
            aria-label="Main navigation"
          >
            <a href="#products">
              Products
            </a>

            <a href="#about">
              About
            </a>

            <a href="#contact">
              Contact
            </a>
          </nav>

          <a
            className="header-order"
            href="#products"
          >
            View Products
          </a>

        </div>
      </header>

      <main id="top">

        {/* ======================================
            HERO
        ====================================== */}

        <section className="hero">
          <div className="container hero-grid">

            <div className="hero-copy">

              <span className="eyebrow">
                Wahid Fish Centre
              </span>

              <h1>
                Fresh seafood, chicken, mutton & kabab.
              </h1>

              <p>
                Browse our current catalogue, select your
                quantity, add products to your cart, or order
                directly on WhatsApp. No online payment required.
              </p>

              <div className="hero-actions">

                <a
                  className="btn btn-primary"
                  href="#products"
                >
                  Browse Catalogue
                </a>

                <a
                  className="btn btn-secondary"
                  href="#contact"
                >
                  Contact Us
                </a>

              </div>

              <div className="hero-points">
                <span>✓ Product catalogue</span>
                <span>✓ Multi-item cart</span>
                <span>✓ WhatsApp ordering</span>
                <span>✓ FREE Delhi NCR delivery</span>
              </div>

            </div>

            <div className="hero-panel">

              <div className="hero-panel-glow" />

              <div className="hero-card">

                <span className="hero-card-label">
                  TODAY'S CATALOGUE
                </span>

                <strong>
                  {products.length} products
                </strong>

                <span>
                  Fish & Seafood · Chicken · Mutton · Kabab
                </span>

                <strong
                  style={{
                    marginTop: '10px',
                    color: '#22c55e',
                  }}
                >
                  FREE Delivery in Delhi NCR
                </strong>

                <a href="#products">
                  Explore →
                </a>

              </div>

            </div>

          </div>
        </section>

        {/* ======================================
            TRUST HIGHLIGHTS
        ====================================== */}

        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            padding: '30px 20px',
            flexWrap: 'wrap',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#111',
              borderRadius: '8px',
              border: '1px solid #333',
            }}
          >
            <span style={{ fontSize: '20px' }}>
              🐟
            </span>

            <strong>
              Fresh & Frozen Selection
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#111',
              borderRadius: '8px',
              border: '1px solid #333',
            }}
          >
            <span style={{ fontSize: '20px' }}>
              ⚖️
            </span>

            <strong>
              Weight-Based Pricing
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#111',
              borderRadius: '8px',
              border: '1px solid #333',
            }}
          >
            <span style={{ fontSize: '20px' }}>
              📱
            </span>

            <strong>
              Direct WhatsApp Ordering
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#111',
              borderRadius: '8px',
              border: '1px solid #333',
            }}
          >
            <span style={{ fontSize: '20px' }}>
              🚚
            </span>

            <strong>
              FREE Delhi NCR Delivery
            </strong>
          </div>

        </div>

        {/* ======================================
            CATALOGUE
        ====================================== */}

        <section
          className="catalogue container"
          id="products"
        >

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                Our Products
              </span>

              <h2>
                Choose what you need
              </h2>

            </div>

            <p>
              Select quantity, add products to your cart,
              or order any single product directly.
              Delivery is free in Delhi NCR.
            </p>

          </div>

          {/* MARKET PRICE NOTICE */}

          <div
            style={{
              marginBottom: '24px',
              padding: '14px 18px',
              borderRadius: '10px',
              backgroundColor: '#171717',
              border: '1px solid #333',
              color: '#bbb',
              lineHeight: 1.6,
              fontSize: '14px',
            }}
          >
            <strong
              style={{
                color: '#fff',
              }}
            >
              Price Notice:
            </strong>{' '}
            Prices shown on the website are indicative and
            may change according to current market rates.
            Please WhatsApp us for the latest price before
            placing your order.
          </div>

          <div className="catalogue-tools">

            <label className="search-box">

              <span aria-hidden="true">
                ⌕
              </span>

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search products..."
                aria-label="Search products"
              />

            </label>

            <div
              className="filters"
              role="tablist"
              aria-label="Product categories"
            >

              {categories.map((item) => (

                <button
                  key={item}
                  className={
                    category === item
                      ? 'filter active'
                      : 'filter'
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                  role="tab"
                  aria-selected={
                    category === item
                  }
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

          <div className="product-count">
            Showing{' '}
            <strong>
              {filteredProducts.length}
            </strong>{' '}
            of {products.length} products
          </div>

          {filteredProducts.length > 0 ? (

            <div className="product-grid">

              {filteredProducts.map((product) => (

                <article
                  className="product-card"
                  key={product.id}
                >

                  {/* PRODUCT IMAGE */}

                  <button
                    className="image-button"
                    onClick={() =>
                      openModal(
                        product,
                        'details'
                      )
                    }
                    aria-label={`View ${product.name}`}
                  >

                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        objectFit: 'cover',
                      }}
                    />

                    <span className="image-badge">
                      {product.category}
                    </span>

                  </button>

                  <div className="product-body">

                    <h3>
                      {product.name}
                    </h3>

                    <div className="price-row">

                      <strong>
                        ₹{formatPrice(product.price)}
                      </strong>

                      <span>
                        /{product.unit}
                      </span>

                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#777',
                        marginTop: '5px',
                      }}
                    >
                      Market price may vary
                    </div>

                    {/* THREE PRODUCT BUTTONS */}

                    <div
                      className="card-actions"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginTop: '12px',
                      }}
                    >

                      <button
                        className="btn btn-outline full"
                        style={{
                          width: '100%',
                        }}
                        onClick={() =>
                          openModal(
                            product,
                            'details'
                          )
                        }
                      >
                        Details
                      </button>

                      <button
                        className="btn btn-primary full"
                        style={{
                          width: '100%',
                        }}
                        onClick={() =>
                          openModal(
                            product,
                            'cart'
                          )
                        }
                      >
                        Add to Cart
                      </button>

                      <button
                        className="btn btn-whatsapp full"
                        style={{
                          width: '100%',
                        }}
                        onClick={() =>
                          openModal(
                            product,
                            'order'
                          )
                        }
                      >
                        Order Now
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="empty-state">
              No products found. Try another search
              or category.
            </div>

          )}

        </section>

        {/* ======================================
            ABOUT
        ====================================== */}

        <section
          className="about container"
          id="about"
        >

          <div className="about-card">

            <span className="eyebrow">
              Why Wahid Fish Centre
            </span>

            <h2>
              A simple catalogue built around
              direct ordering.
            </h2>

            <p>
              Browse the products, select your quantity,
              add multiple items to your cart, or order
              any single product directly through WhatsApp.
              No unnecessary online payment system.
            </p>

            <p
              style={{
                color: '#22c55e',
                fontWeight: 'bold',
              }}
            >
              🚚 FREE Delivery available in Delhi NCR.
            </p>

            <p
              style={{
                color: '#999',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              Product prices shown on this website are
              indicative and may vary according to current
              market rates. Please WhatsApp us for the
              latest price and final order confirmation.
            </p>

          </div>

        </section>

        {/* ======================================
            CONTACT
        ====================================== */}

        <section
          className="contact container"
          id="contact"
        >

          <div className="contact-card">

            <div>

              <span className="eyebrow">
                Order & Contact
              </span>

              <h2>
                Ready to order?
              </h2>

              <p>
                Choose one product and use Order Now,
                or add multiple products to your cart
                and send your complete order directly
                on WhatsApp.
              </p>

              <p
                style={{
                  color: '#22c55e',
                  fontWeight: 'bold',
                }}
              >
                🚚 FREE Delivery in Delhi NCR
              </p>

              <p
                style={{
                  color: '#999',
                  fontSize: '14px',
                  lineHeight: 1.6,
                }}
              >
                Website prices are indicative. Market
                prices can change. WhatsApp us for the
                latest price before ordering.
              </p>

            </div>

            <a
              className="btn btn-primary"
              href="#products"
            >
              View Catalogue
            </a>

          </div>

        </section>

      </main>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer
        className="footer"
        style={{
          backgroundColor: '#111',
          color: '#fff',
          padding: '50px 20px',
          textAlign: 'center',
          marginTop: '60px',
          borderTop: '1px solid #333',
        }}
      >

        <div
          className="container footer-inner"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
          }}
        >

          <h2
            style={{
              color: '#22c55e',
              margin: '0',
            }}
          >
            Wahid Fish Centre
          </h2>

          <p
            style={{
              margin: '0',
              color: '#22c55e',
              fontWeight: 'bold',
              fontSize: '17px',
            }}
          >
            🚚 FREE Delivery in Delhi NCR
          </p>

          <div
            style={{
              marginTop: '10px',
            }}
          >

            <p
              style={{
                margin: '8px 0',
                fontSize: '16px',
              }}
            >
              <strong>
                📍 Address:
              </strong>{' '}
              Block - A, Gazipur Fish Market,
              Delhi - 110002
            </p>

            <p
              style={{
                margin: '8px 0',
                fontSize: '16px',
              }}
            >
              <strong>
                📧 Email:
              </strong>{' '}

              <a
                href="mailto:wahid.fish.center@gmail.com"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                wahid.fish.center@gmail.com
              </a>

            </p>

          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: '#1a1a1a',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '300px',
              marginTop: '10px',
            }}
          >

            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '18px',
                color: '#888',
              }}
            >
              Contact & Orders
            </p>

            <p
              style={{
                margin: '5px 0',
                fontSize: '18px',
              }}
            >

              <a
                href="tel:+919717785423"
                style={{
                  color: '#22c55e',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                +91 9717785423
              </a>{' '}

              (WhatsApp)

            </p>

            <p
              style={{
                margin: '5px 0',
                fontSize: '18px',
              }}
            >

              <a
                href="tel:+919717785423"
                style={{
                  color: '#22c55e',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                +91 9717785423
              </a>{' '}

              (Call)

            </p>

          </div>

          <div
            style={{
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #333',
              width: '100%',
              color: '#666',
              fontSize: '14px',
            }}
          >

            © {new Date().getFullYear()} Wahid Fish Centre
            {' | '}
            Fresh Fish • Chicken • Mutton • Kabab

          </div>

        </div>

      </footer>

      {/* ======================================
          FLOATING CART BUTTON
      ====================================== */}

      {cart.length > 0 && (

        <button
          onClick={() =>
            setIsCartOpen(true)
          }
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 999,
            padding: '15px 25px',
            borderRadius: '50px',
            backgroundColor: '#22c55e',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            boxShadow:
              '0 8px 24px rgba(34, 197, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          🛒 View Cart ({cart.length})
        </button>

      )}

      {/* ======================================
          CART MODAL
      ====================================== */}

      {isCartOpen && (

        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() =>
            setIsCartOpen(false)
          }
        >

          <div
            className="modal"
            style={{
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Your Order Cart"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setIsCartOpen(false)
              }
              aria-label="Close cart"
            >
              ×
            </button>

            <div
              className="modal-content"
              style={{
                padding: '20px',
              }}
            >

              <h2>
                Your Order Cart
              </h2>

              <p
                style={{
                  color: '#22c55e',
                  fontWeight: 'bold',
                }}
              >
                🚚 FREE Delivery in Delhi NCR
              </p>

              <hr
                style={{
                  borderColor: '#333',
                  margin: '20px 0',
                }}
              />

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >

                {cart.map((item) => (

                  <li
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      gap: '15px',
                      marginBottom: '15px',
                      paddingBottom: '15px',
                      borderBottom:
                        '1px solid #222',
                    }}
                  >

                    <div>

                      <strong
                        style={{
                          fontSize: '16px',
                        }}
                      >
                        {item.product.name}
                      </strong>

                      <br />

                      <span
                        style={{
                          color: '#888',
                          fontSize: '14px',
                        }}
                      >
                        {item.weightLabel}
                      </span>

                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                      }}
                    >

                      <strong>
                        ₹{formatPrice(item.price)}
                      </strong>

                      <button
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff4444',
                          fontSize: '20px',
                          cursor: 'pointer',
                        }}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        🗑
                      </button>

                    </div>

                  </li>

                ))}

              </ul>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginTop: '20px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#22c55e',
                }}
              >

                <span>
                  Total Estimate:
                </span>

                <span>
                  ₹{formatPrice(cartTotal)}
                </span>

              </div>

              <p
                style={{
                  fontSize: '12px',
                  color: '#888',
                  marginTop: '10px',
                }}
              >
                *Website prices are indicative.
                Final price may vary according to
                current market rate, exact weight,
                availability and preparation.
              </p>

              <button
                className="btn btn-whatsapp full"
                style={{
                  marginTop: '20px',
                  fontSize: '18px',
                  padding: '15px',
                }}
                onClick={sendCartToWhatsApp}
              >
                Place Order via WhatsApp
              </button>

              <button
                className="btn btn-outline full"
                style={{
                  marginTop: '10px',
                  fontSize: '15px',
                }}
                onClick={clearCart}
              >
                Clear Cart
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ======================================
          PRODUCT DETAILS / QUANTITY MODAL
      ====================================== */}

      {selected && (

        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeModal}
        >

          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >

            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>

            {/* PRODUCT IMAGE */}

            <div
              style={{
                width: '100%',
                minHeight: '220px',
                maxHeight: '60vh',
                backgroundColor: '#050505',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={selected.image}
                alt={selected.name}
                loading="lazy"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div className="modal-content">

              <span className="eyebrow">
                {selected.category}
              </span>

              <h2
                style={{
                  marginBottom: '10px',
                }}
              >
                {selected.name}
              </h2>

              <p className="modal-price">
                ₹{formatPrice(selected.price)}

                <span>
                  /{selected.unit}
                </span>
              </p>

              {/* MARKET PRICE NOTICE */}

              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#171717',
                  borderRadius: '8px',
                  color: '#aaa',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              >
                Website price is indicative and may
                change according to current market rates.
                WhatsApp us for the latest price.
              </div>

              {/* DETAILS MODE */}

              {modalAction === 'details' ? (

                <>

                  <p
                    style={{
                      color: '#aaa',
                      lineHeight: 1.6,
                      marginTop: '15px',
                    }}
                  >
                    Select your required quantity
                    or weight below. The estimated
                    price will be calculated automatically.
                  </p>

                  <div
                    style={{
                      marginTop: '20px',
                      padding: '15px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                    }}
                  >
                    <strong>
                      🚚 FREE Delivery in Delhi NCR
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginTop: '20px',
                    }}
                  >

                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        setModalAction('cart')
                      }
                    >
                      Add to Cart
                    </button>

                    <button
                      className="btn btn-whatsapp"
                      onClick={() =>
                        setModalAction('order')
                      }
                    >
                      Order Now
                    </button>

                  </div>

                  <button
                    className="btn btn-outline full"
                    onClick={closeModal}
                    type="button"
                    style={{
                      marginTop: '10px',
                    }}
                  >
                    ← Back to Products
                  </button>

                </>

              ) : (

                <>

                  {/* QUANTITY SELECTION */}

                  <div
                    style={{
                      margin: '20px 0',
                    }}
                  >

                    <p
                      style={{
                        marginBottom: '10px',
                        color: '#aaa',
                      }}
                    >
                      Select Quantity / Weight:
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >

                      {(selected.unit === 'kg'
                        ? kgOptions
                        : pieceOptions
                      ).map((option) => (

                        <button
                          key={option.label}
                          onClick={() => {
                            setSelectedWeight(option);
                            setCustomQuantity('');
                          }}
                          style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border:
                              selectedWeight?.label ===
                              option.label
                                ? '2px solid #22c55e'
                                : '1px solid #444',
                            backgroundColor:
                              selectedWeight?.label ===
                              option.label
                                ? 'rgba(34, 197, 94, 0.1)'
                                : '#111',
                            color:
                              selectedWeight?.label ===
                              option.label
                                ? '#22c55e'
                                : '#fff',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                        >
                          {option.label}
                        </button>

                      ))}

                    </div>

                    {/* CUSTOM MORE THAN 2 KG */}

                    {isCustomQuantity && (

                      <div
                        style={{
                          marginTop: '15px',
                        }}
                      >

                        <label
                          style={{
                            display: 'block',
                            color: '#aaa',
                            marginBottom: '8px',
                          }}
                        >
                          Enter required quantity in kg:
                        </label>

                        <input
                          type="number"
                          min="2.1"
                          step="0.1"
                          value={customQuantity}
                          onChange={(e) =>
                            setCustomQuantity(
                              e.target.value
                            )
                          }
                          placeholder="Example: 3 kg"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #444',
                            backgroundColor: '#111',
                            color: '#fff',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                          }}
                        />

                        <small
                          style={{
                            display: 'block',
                            color: '#777',
                            marginTop: '6px',
                          }}
                        >
                          You can enter 3 kg, 5 kg,
                          10 kg, etc.
                        </small>

                      </div>

                    )}

                  </div>

                  {/* AUTOMATIC PRICE */}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      marginTop: '20px',
                      marginBottom: '20px',
                      padding: '15px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                    }}
                  >

                    <span
                      style={{
                        fontSize: '16px',
                        color: '#aaa',
                      }}
                    >
                      Item Total:
                    </span>

                    <strong
                      style={{
                        fontSize: '22px',
                      }}
                    >
                      ₹{formatPrice(
                        getSelectedPrice()
                      )}
                    </strong>

                  </div>

                  <p
                    style={{
                      color: '#22c55e',
                      fontWeight: 'bold',
                      marginBottom: '15px',
                    }}
                  >
                    🚚 FREE Delivery in Delhi NCR
                  </p>

                  <button
                    className={
                      modalAction === 'order'
                        ? 'btn btn-whatsapp full'
                        : 'btn btn-primary full'
                    }
                    onClick={
                      handleModalPrimaryAction
                    }
                    style={{
                      fontSize: '17px',
                      padding: '14px',
                    }}
                  >
                    {modalAction === 'order'
                      ? 'Order Now on WhatsApp'
                      : 'Add to Cart'}
                  </button>

                  <button
                    className="btn btn-outline full"
                    onClick={() => setModalAction('details')}
                    type="button"
                    style={{
                      marginTop: '10px',
                      fontSize: '15px',
                      padding: '12px',
                    }}
                  >
                    ← Back to Details
                  </button>

                </>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;