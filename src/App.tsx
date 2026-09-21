import { useMemo, useState } from 'react';
import './App.css';
import { products, type Product } from './products';

// IMPORTANT: Replace this with your actual WhatsApp number in international format.
// Example for India: 919876543210 (no +, spaces or dashes).
const WHATSAPP_NUMBER = '919717785423';

const categories = ['All', 'Fish & Seafood', 'Chicken', 'Mutton', 'Kabab'] as const;
type Category = (typeof categories)[number];

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN').format(price);
}

function orderOnWhatsApp(product: Product) {
  const unitText = product.unit === 'kg' ? 'per kg' : 'per piece';
  const message = `Hello Wahid Fish Centre, I want to order ${product.name}. Listed price: ₹${formatPrice(product.price)} ${unitText}. Please confirm availability.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function App() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product: Product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesSearch = !q || product.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  return (
    <div className="site-shell">
      <header className="header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Wahid Fish Centre home">
            <span className="brand-mark">W</span>
            <span>
              <strong>Wahid Fish Centre</strong>
              <small>Fresh • Quality • Direct Order</small>
            </span>
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href="#products">Products</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="header-order" href="#products">View Products</a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Wahid Fish Centre</span>
              <h1>Fresh seafood, chicken, mutton & kabab.</h1>
              <p>Browse our current catalogue and send your order directly on WhatsApp. Simple, fast and no online payment required.</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#products">Browse Catalogue</a>
                <a className="btn btn-secondary" href="#contact">Contact Us</a>
              </div>
              <div className="hero-points">
                <span>✓ Product catalogue</span>
                <span>✓ WhatsApp ordering</span>
                <span>✓ No online payment</span>
              </div>
            </div>
            <div className="hero-panel">
              <div className="hero-panel-glow" />
              <div className="hero-card">
                <span className="hero-card-label">TODAY'S CATALOGUE</span>
                <strong>{products.length} products</strong>
                <span>Fish & Seafood · Chicken · Mutton · Kabab</span>
                <a href="#products">Explore →</a>
              </div>
            </div>
          </div>
        </section>

        <section className="catalogue container" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Our Products</span>
              <h2>Choose what you need</h2>
            </div>
            <p>Prices shown in the catalogue. Please confirm current availability before ordering.</p>
          </div>

          <div className="catalogue-tools">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." aria-label="Search products" />
            </label>
            <div className="filters" role="tablist" aria-label="Product categories">
              {categories.map((item) => (
                <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="product-count">Showing <strong>{filteredProducts.length}</strong> of {products.length} products</div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <button className="image-button" onClick={() => setSelected(product)} aria-label={`View ${product.name}`}>
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <span className="image-badge">{product.category}</span>
                  </button>
                  <div className="product-body">
                    <h3>{product.name}</h3>
                    <div className="price-row">
                      <strong>₹{formatPrice(product.price)}</strong>
                      <span>/{product.unit}</span>
                    </div>
                    <div className="card-actions">
                      <button className="btn btn-outline" onClick={() => setSelected(product)}>Details</button>
                      <button className="btn btn-whatsapp" onClick={() => orderOnWhatsApp(product)}>WhatsApp Order</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">No products found. Try another search or category.</div>
          )}
        </section>

        <section className="about container" id="about">
          <div className="about-card">
            <span className="eyebrow">Why Wahid Fish Centre</span>
            <h2>A simple catalogue built around direct ordering.</h2>
            <p>Browse the products, check the listed price, and contact us directly on WhatsApp. The website is designed to stay focused on products and ordering without an unnecessary checkout system.</p>
            <div className="about-grid">
              <div><strong>31</strong><span>Catalogue products</span></div>
              <div><strong>4</strong><span>Product categories</span></div>
              <div><strong>1</strong><span>Direct order channel</span></div>
            </div>
          </div>
        </section>

        <section className="contact container" id="contact">
          <div className="contact-card">
            <div>
              <span className="eyebrow">Order & Contact</span>
              <h2>Ready to order?</h2>
              <p>Choose a product above and use the WhatsApp Order button. We can confirm availability and order details directly.</p>
            </div>
            <a className="btn btn-primary" href="#products">View Catalogue</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} Wahid Fish Centre</span>
          <span>Fresh Fish • Chicken • Mutton • Kabab</span>
        </div>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <img src={selected.image} alt={selected.name} />
            <div className="modal-content">
              <span className="eyebrow">{selected.category}</span>
              <h2>{selected.name}</h2>
              <p className="modal-price">₹{formatPrice(selected.price)} <span>/{selected.unit}</span></p>
              <p>Listed catalogue price. Availability and final order details can be confirmed on WhatsApp.</p>
              <button className="btn btn-whatsapp full" onClick={() => orderOnWhatsApp(selected)}>Order on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
