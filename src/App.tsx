import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { products, type Product } from './products';
import productPageBg from './assets/products/product-orange-bubbles.webp';

const WHATSAPP_NUMBER = '919717785423';
const PHONE_NUMBER = '+919717785423';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
const CART_STORAGE_KEY = 'wfc-cart';

const categories = ['All', 'Fish & Seafood', 'Chicken', 'Mutton', 'Kabab'] as const;
type Category = (typeof categories)[number];

type QuantityOption = {
  label: string;
  value: number;
};

type ModalAction = 'details' | 'cart' | 'order';

type CartItem = {
  id: string;
  product: Product;
  quantityLabel: string;
  quantityValue: number;
  estimatedPrice: number | null;
};

type Toast = {
  id: number;
  message: string;
};

const categoryIcons: Record<Category, string> = {
  All: '🛍️',
  'Fish & Seafood': '🐟',
  Chicken: '🍗',
  Mutton: '🥩',
  Kabab: '🍢',
};

type ProductDetails = {
  source: string;
  description: string;
  bestFor: string;
};

const productDetails: Record<number, ProductDetails> = {
  1: { source: 'Marine fish — typically supplied through sea-fishing markets; exact source varies by batch.', description: 'Large-size tuna with a firm texture and rich flavour.', bestFor: 'Grilling, steaks, curry and pan-searing.' },
  2: { source: 'Freshwater farmed fish — commonly raised in cold-water aquaculture systems.', description: 'Delicate, mild-flavoured fish with a clean texture.', bestFor: 'Pan-searing, grilling, baking and light sauces.' },
  3: { source: 'Marine fish — commonly supplied through sea-fishing markets; exact source varies by batch.', description: 'Smaller tuna with a firm, meaty texture.', bestFor: 'Curry, frying, grilling and everyday cooking.' },
  4: { source: 'River and coastal fish supply — sourcing region can vary by season and batch.', description: 'Naturally rich and oily fish with a distinctive flavour.', bestFor: 'Traditional curry, steaming and mustard-based preparations.' },
  5: { source: 'Marine/coastal seafood supply — exact catch or farming source varies by batch.', description: 'Crab with sweet meat and a delicate seafood flavour.', bestFor: 'Curries, masala preparations, soups and steaming.' },
  6: { source: 'Processed fresh-fish supply — fish type and source can vary according to market availability.', description: 'Boneless fish prepared for convenient cooking.', bestFor: 'Frying, grilling, curry, kebabs and quick meals.' },
  7: { source: 'Marine fish — commonly supplied through coastal fishing markets; exact source varies by batch.', description: 'Boneless king mackerel with firm meat and a rich seafood taste.', bestFor: 'Frying, grilling, curry and pan-searing.' },
  8: { source: 'Aquaculture/import supply — exact source varies by batch and availability.', description: 'Premium salmon fillet with a rich, buttery texture.', bestFor: 'Grilling, baking, pan-searing and healthy meal preparations.' },
  9: { source: 'Marine/coastal seafood supply — exact catch source varies by batch.', description: 'Large lobster with firm, naturally sweet meat.', bestFor: 'Grilling, butter preparations, curries and special meals.' },
  10: { source: 'Marine fish — commonly supplied through coastal fishing markets; exact source varies by batch.', description: 'Mild white fish fillet with a delicate texture.', bestFor: 'Frying, grilling, baking and light curries.' },
  11: { source: 'Marine fish — commonly supplied through coastal fishing markets; exact source varies by batch.', description: 'Tender sole fillet with a mild flavour.', bestFor: 'Pan-frying, grilling, baking and light sauces.' },
  12: { source: 'Marine fish — commonly supplied through coastal fishing markets; exact source varies by batch.', description: 'Pomfret supplied at approximately 4 pieces per kg.', bestFor: 'Frying, tawa preparation, grilling and curry.' },
  13: { source: 'Coastal aquaculture and seafood supply — exact source varies by batch.', description: 'Medium-size prawns/shrimp with a firm, juicy texture.', bestFor: 'Tawa, biryani, curry, grilling and stir-fry.' },
  14: { source: 'Marine fish — commonly supplied through coastal fishing markets; exact source varies by batch.', description: 'Indian mackerel with a strong, rich seafood flavour.', bestFor: 'Frying, masala, curry and grilling.' },
  15: { source: 'Marine fish — commonly supplied through coastal fishing markets; exact source varies by batch.', description: 'Black snapper with firm white meat and a mild flavour.', bestFor: 'Frying, grilling, curry and tawa cooking.' },
  16: { source: 'Freshwater fish — commonly raised in ponds, farms and inland water systems.', description: 'Rohu is a popular freshwater fish with a firm, mild texture.', bestFor: 'Indian curries, frying and everyday home cooking.' },
  17: { source: 'Freshwater fish — commonly raised in ponds, farms and inland water systems.', description: 'Katla is a popular freshwater fish with a firm texture and rich head meat.', bestFor: 'Curry, frying and traditional Indian preparations.' },
  18: { source: 'Marine seafood — commonly supplied from coastal fishing markets; exact catch source varies by batch.', description: 'Cleaned squid rings prepared for convenient cooking.', bestFor: 'Frying, chilli squid, grilling, stir-fry and seafood curries.' },
  19: { source: 'Farm-raised poultry supply — exact farm and batch can vary.', description: 'Lean boneless chicken breast with a mild flavour.', bestFor: 'Grilling, pan-searing, tikka, meal prep and healthy cooking.' },
  20: { source: 'Farm-raised poultry supply — exact farm and batch can vary.', description: 'Chicken leg pieces with juicy meat and a richer flavour.', bestFor: 'Roasting, grilling, curry, tandoori and frying.' },
  21: { source: 'Farm-raised poultry supply — exact farm and batch can vary.', description: 'Whole chicken supplied at approximately 800 g per piece.', bestFor: 'Roasting, curry, grilling and whole-chicken recipes.' },
  22: { source: 'Farm-raised poultry supply — exact farm and batch can vary.', description: 'Chicken tangri/leg portion with juicy meat.', bestFor: 'Tandoori, grilling, roasting, frying and curry.' },
  23: { source: 'Farm-raised poultry supply — exact farm and batch can vary.', description: 'Chicken cut into convenient curry-size pieces.', bestFor: 'Indian curries, biryani and everyday cooking.' },
  24: { source: 'Farm-raised poultry supply — exact farm and batch can vary.', description: 'Chicken lollipop cut prepared for easy serving and cooking.', bestFor: 'Frying, tandoori, barbecue and party starters.' },
  25: { source: 'Goat/mutton supply from livestock markets and farms — exact source varies by batch.', description: 'Minced mutton/keema with a rich flavour and fine texture.', bestFor: 'Keema curry, kebabs, kofta, samosa filling and stuffed dishes.' },
  26: { source: 'Goat/mutton supply from livestock markets and farms — exact source varies by batch.', description: 'Whole goat leg/raan with substantial meat and a rich texture.', bestFor: 'Raan roast, slow cooking, biryani and special-occasion dishes.' },
  27: { source: 'Goat/mutton supply from livestock markets and farms — exact source varies by batch.', description: 'Whole goat carcass supplied for larger quantity requirements.', bestFor: 'Large gatherings, bulk cooking, curry and traditional preparations.' },
  28: { source: 'Goat/mutton supply from livestock markets and farms — exact source varies by batch.', description: 'Mutton ribs/chops with flavourful meat and bone.', bestFor: 'Grilling, tawa, chops, roasting and curry.' },
};

function getProductDetails(product: Product): ProductDetails | null {
  if (product.category === 'Kabab') return null;
  return productDetails[product.id] ?? {
    source: 'Market supply source varies by product and batch.',
    description: 'Fresh product prepared according to the selected item.',
    bestFor: 'Cooking according to your preferred recipe.',
  };
}

const kgOptions: QuantityOption[] = [
  { label: '500g', value: 0.5 },
  { label: '1 kg', value: 1 },
  { label: '2 kg', value: 2 },
  { label: 'More than 2 kg', value: 0 },
];

const pieceOptions: QuantityOption[] = [
  { label: '1 Piece', value: 1 },
  { label: '2 Pieces', value: 2 },
  { label: '3 Pieces', value: 3 },
  { label: '5 Pieces', value: 5 },
];


function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN').format(Math.round(price));
}

function isSquid(product: Product) {
  return product.name.toLowerCase().includes('squid');
}

function displayPrice(product: Product) {
  return isSquid(product) ? '₹700–₹1,100' : `₹${formatPrice(product.price)}`;
}

function displayUnit(product: Product) {
  return `/${product.unit}`;
}

function ProductImage({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
      {!loaded && !failed && <div className="image-skeleton absolute inset-0" aria-hidden="true" />}
      {failed ? (
        <div className="grid h-full w-full place-items-center p-5 text-center text-xs font-bold text-zinc-500">
          Image unavailable
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-contain p-2 transition duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

function App() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<QuantityOption | null>(null);
  const [customQuantity, setCustomQuantity] = useState('');
  const [customQuantityError, setCustomQuantityError] = useState('');
  const [modalAction, setModalAction] = useState<ModalAction>('details');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const toastIdRef = useRef(0);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = [4, 8, 9, 19]
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;

      const safeCart = parsed.filter((item): item is CartItem => {
        if (!item || typeof item !== 'object') return false;
        const candidate = item as Partial<CartItem>;
        return (
          typeof candidate.id === 'string' &&
          typeof candidate.quantityLabel === 'string' &&
          typeof candidate.quantityValue === 'number' &&
          candidate.product !== undefined
        );
      });

      setCart(safeCart);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = selected || isCartOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [selected, isCartOpen]);

  const showToast = (message: string) => {
    const id = ++toastIdRef.current;
    setToasts((previous) => [...previous, { id, message }]);

    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 2500);
  };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesSearch = !q || product.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  const getProductCartItems = (productId: number) =>
    cart.filter((item) => item.product.id === productId);

  const getProductCartQuantity = (productId: number) =>
    getProductCartItems(productId).reduce((sum, item) => sum + item.quantityValue, 0);

  const addProductFromCard = (product: Product) => {
    const existing = getProductCartItems(product.id)[0];

    if (existing) {
      updateCartQuantity(existing.id, 1);
      showToast(`Added more ${product.name} to your cart`);
      return;
    }

    openModal(product, 'cart');
  };

  const openModal = (product: Product, action: ModalAction = 'details') => {
    setSelected(product);
    setModalAction(action);
    setCustomQuantity('');
    setCustomQuantityError('');
    setSelectedWeight(product.unit === 'kg' ? kgOptions[1] : pieceOptions[0]);
  };

  const closeModal = () => {
    setSelected(null);
    setSelectedWeight(null);
    setCustomQuantity('');
    setCustomQuantityError('');
    setModalAction('details');
  };

  const isCustomQuantity =
    selected?.unit === 'kg' && selectedWeight?.label === 'More than 2 kg';

  const getQuantityValue = () => {
    if (!selectedWeight) return 0;

    if (isCustomQuantity) {
      const value = Number(customQuantity);
      return Number.isFinite(value) && value > 2 ? value : 0;
    }

    return selectedWeight.value;
  };

  const getQuantityLabel = () => {
    if (!selectedWeight) return '';

    if (isCustomQuantity) {
      const value = Number(customQuantity);
      return Number.isFinite(value) && value > 2 ? `${value} kg` : 'More than 2 kg';
    }

    return selectedWeight.label;
  };

  const getEstimatedPrice = () => {
    if (!selected || isSquid(selected)) return null;

    const quantity = getQuantityValue();
    return quantity > 0 ? selected.price * quantity : null;
  };

  const validateQuantity = () => {
    if (!selectedWeight) return false;

    if (isCustomQuantity && getQuantityValue() <= 2) {
      setCustomQuantityError('Please enter a quantity greater than 2 kg.');
      return false;
    }

    setCustomQuantityError('');
    return getQuantityValue() > 0;
  };

  const formatCartQuantityLabel = (product: Product, quantityValue: number) => {
    if (product.unit === 'kg') {
      const formatted = Number.isInteger(quantityValue) ? quantityValue.toString() : quantityValue.toFixed(1);
      return `${formatted} kg`;
    }

    return `${quantityValue} ${quantityValue === 1 ? 'Piece' : 'Pieces'}`;
  };

  const addSelectedToCart = () => {
    if (!selected || !validateQuantity()) return;

    const quantityValue = getQuantityValue();
    const quantityLabel = getQuantityLabel();

    setCart((previous) => {
      const matchingItem = previous.find(
        (item) => item.product.id === selected.id && item.quantityLabel === quantityLabel,
      );

      if (!matchingItem) {
        const newItem: CartItem = {
          id: `${selected.id}-${quantityValue}-${Date.now()}`,
          product: selected,
          quantityLabel,
          quantityValue,
          estimatedPrice: isSquid(selected) ? null : selected.price * quantityValue,
        };

        return [...previous, newItem];
      }

      const mergedQuantity = matchingItem.quantityValue + quantityValue;
      return previous.map((item) =>
        item.id === matchingItem.id
          ? {
              ...item,
              quantityValue: mergedQuantity,
              quantityLabel: formatCartQuantityLabel(selected, mergedQuantity),
              estimatedPrice: isSquid(selected) ? null : selected.price * mergedQuantity,
            }
          : item,
      );
    });

    showToast(`✅ ${selected.name} added to cart`);
    closeModal();
  };

  const removeFromCart = (id: string) => {
    setCart((previous) => previous.filter((item) => item.id !== id));
    showToast('Removed from cart');
  };

  const updateCartQuantity = (id: string, direction: 1 | -1) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    const step = item.product.unit === 'kg' ? 0.5 : 1;
    const nextQuantity = item.quantityValue + direction * step;

    if (nextQuantity < step) {
      removeFromCart(id);
      return;
    }

    const quantityLabel = formatCartQuantityLabel(item.product, nextQuantity);

    setCart((previous) =>
      previous.map((cartItem) =>
        cartItem.id === id
          ? {
              ...cartItem,
              quantityValue: nextQuantity,
              quantityLabel,
              estimatedPrice: isSquid(cartItem.product)
                ? null
                : cartItem.product.price * nextQuantity,
            }
          : cartItem,
      ),
    );
  };

  const clearCart = () => {
    if (cart.length > 0) showToast('Removed from cart');
    setCart([]);
    setIsCartOpen(false);
  };

  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
    } else {
      window.open(
        `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`,
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  const sendDirectOrderToWhatsApp = () => {
    if (!selected || !validateQuantity()) return;

    const quantity = getQuantityLabel();
    const estimatedPrice = getEstimatedPrice();
    const rateText = isSquid(selected)
      ? '₹700–₹1,100/kg'
      : `₹${formatPrice(selected.price)}/${selected.unit}`;

    let message = 'Hello Wahid Fish Centre! 🐟\nI would like to order:\n\n';
    message += `Item: ${selected.name} (${rateText})\n`;
    message += `Quantity: ${quantity}\n`;
    message += estimatedPrice === null
      ? 'Estimated Price: To be confirmed\n\n'
      : `Estimated Price: ₹${formatPrice(estimatedPrice)}\n\n`;
    message += 'Delivery: FREE in Delhi NCR (no minimum order)\n\n';
    message += 'Please confirm the latest market price, availability, exact weight and final price. Thanks!';

    openWhatsApp(message);
    closeModal();
  };

  const sendCartToWhatsApp = () => {
    if (cart.length === 0) return;

    let message = 'Hello Wahid Fish Centre! 🐟\nI would like to order:\n\n';
    let totalEstimate = 0;
    let hasRangePrice = false;

    cart.forEach((item, index) => {
      const range = isSquid(item.product);
      const rateText = range
        ? '₹700–₹1,100/kg'
        : `₹${formatPrice(item.product.price)}/${item.product.unit}`;

      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Quantity: ${item.quantityLabel}\n`;
      message += `   Rate shown on website: ${rateText}\n`;
      message += range
        ? '   Estimated Price: To be confirmed\n\n'
        : `   Estimated Price: ₹${formatPrice(item.estimatedPrice ?? 0)}\n\n`;

      if (range) {
        hasRangePrice = true;
      } else {
        totalEstimate += item.estimatedPrice ?? 0;
      }
    });

    message += hasRangePrice
      ? 'Estimated Total: To be confirmed\n\n'
      : `Estimated Total: ₹${formatPrice(totalEstimate)}\n\n`;
    message += 'Delivery: FREE in Delhi NCR (no minimum order)\n\n';
    message += 'Please confirm the latest market price, availability, exact weight and final price. Thanks!';

    openWhatsApp(message);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.estimatedPrice ?? 0),
    0,
  );
  const cartHasRangePrice = cart.some((item) => isSquid(item.product));

  const scrollToProducts = () => {
    setIsMenuOpen(false);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const focusSearch = () => {
    setIsMenuOpen(false);
    document
      .getElementById('products')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => searchRef.current?.focus(), 350);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900">
      <div className="bg-zinc-950 px-4 py-2 text-center text-xs font-semibold text-zinc-200 sm:text-sm">
        🐟 Fresh & Frozen Products <span className="mx-2 text-orange-500">•</span>
        Direct WhatsApp Ordering <span className="mx-2 text-orange-500">•</span>
        Delhi NCR
      </div>

      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-8">
          <a
            href="#top"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-500/20">
              W
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight sm:text-lg">
                Wahid Fish Centre
              </span>
              <span className="hidden text-[11px] font-medium text-zinc-600 sm:block">
                Fresh • Quality • Direct Order
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            <a className="text-sm font-semibold text-zinc-700 transition hover:text-orange-600" href="#top">Home</a>
            <a className="text-sm font-semibold text-zinc-700 transition hover:text-orange-600" href="#products">Products</a>
            <a className="text-sm font-semibold text-zinc-700 transition hover:text-orange-600" href="#about">About</a>
            <a className="text-sm font-semibold text-zinc-700 transition hover:text-orange-600" href="#contact">Contact</a>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={focusSearch}
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:border-orange-300 hover:text-orange-600 active:scale-[0.98]"
              aria-label="Search products"
            >
              ⌕
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]"
            >
              WhatsApp Order
            </a>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative grid h-10 min-w-10 place-items-center rounded-xl border border-zinc-200 bg-white px-2 text-sm font-bold text-zinc-800 transition hover:border-orange-300 active:scale-[0.98]"
              aria-label={`Open cart with ${cart.length} items`}
            >
              🛒
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] text-white">
                {cart.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-xs font-black text-white active:scale-[0.98]"
              aria-label="Order on WhatsApp"
            >
              WA
            </a>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white active:scale-[0.98]"
              aria-label={`Open cart with ${cart.length} items`}
            >
              🛒
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] text-white">
                {cart.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-xl active:scale-[0.98]"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? '×' : '☰'}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-zinc-200 bg-white px-4 py-4 shadow-lg sm:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {[
                ['Home', '#top'],
                ['Products', '#products'],
                ['About', '#about'],
                ['Contact', '#contact'],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={focusSearch}
                className="rounded-xl bg-zinc-100 px-4 py-3 text-left text-sm font-bold text-zinc-700 active:scale-[0.98]"
              >
                Search products
              </button>
            </nav>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero-section relative overflow-hidden border-b border-orange-950/40">
          <div className="hero-orange-glow hero-orange-glow-one" aria-hidden="true" />
          <div className="hero-orange-glow hero-orange-glow-two" aria-hidden="true" />

          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-8 lg:py-16">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">Wahid Fish Centre</p>
              <h1 className="mt-3 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">Fresh Fish, Chicken, Mutton & Kabab</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">Browse our current catalogue, choose your quantity and order directly on WhatsApp. Fresh and frozen products available in Delhi NCR.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={scrollToProducts} className="min-h-12 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.98]">Browse Products</button>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="min-h-12 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-center text-sm font-black text-white backdrop-blur transition hover:border-orange-400/60 hover:text-orange-300 active:scale-[0.98]">Order on WhatsApp</a>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-2 sm:max-w-md sm:gap-3">
                <div className="rounded-2xl border border-orange-400/20 bg-white/5 p-3 backdrop-blur">
                  <p className="text-lg font-black text-orange-400">{products.length}</p>
                  <p className="text-[10px] font-bold text-zinc-400">Catalogue items</p>
                </div>
                <div className="rounded-2xl border border-orange-400/20 bg-white/5 p-3 backdrop-blur">
                  <p className="text-lg font-black text-orange-400">4</p>
                  <p className="text-[10px] font-bold text-zinc-400">Categories</p>
                </div>
                <div className="rounded-2xl border border-orange-400/20 bg-white/5 p-3 backdrop-blur">
                  <p className="text-lg font-black text-orange-400">NCR</p>
                  <p className="text-[10px] font-bold text-zinc-400">Delivery area</p>
                </div>
              </div>
            </div>

            <div className="hero-featured-product relative z-10" aria-label="Featured product showcase">
              {heroSlides.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openModal(product, 'details')}
                  className={`hero-featured-slide ${index === heroIndex ? 'hero-featured-slide-active' : ''}`}
                  aria-label={`View details for ${product.name}`}
                  tabIndex={index === heroIndex ? 0 : -1}
                >
                  <ProductImage src={product.image} alt={product.name} eager={index === 0} className="h-full w-full" />
                  <span className="hero-featured-overlay" aria-hidden="true" />
                  <span className="hero-featured-caption">
                    <span>
                      <small>Featured product</small>
                      <strong>{product.name}</strong>
                    </span>
                    <span className="hero-featured-price">
                      {displayPrice(product)}{displayUnit(product)}
                    </span>
                  </span>
                </button>
              ))}

              <div className="hero-featured-controls" aria-label="Hero product slides">
                <span>{heroIndex + 1} / {heroSlides.length}</span>
                <div className="hero-dots">
                  {heroSlides.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setHeroIndex(index)}
                      className={`hero-dot ${index === heroIndex ? 'hero-dot-active' : ''}`}
                      aria-label={`Show ${product.name}`}
                      aria-pressed={index === heroIndex}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
            {[
              ['📱', 'Direct WhatsApp Ordering', 'Order straight through WhatsApp.'],
              ['🚚', 'FREE Delivery in Delhi NCR', 'Delivery available across Delhi NCR.'],
              ['💵', 'No Advance Payment', 'Pay on delivery.'],
              ['📍', 'Direct from Gazipur Fish Market', 'Block-A, Gazipur Fish Market.'],
              ['🕐', 'Fresh & Frozen Selection', 'Fresh and frozen options available.'],
            ].map(([icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <div>
                    <h2 className="text-sm font-extrabold text-zinc-900">{title}</h2>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="products"
          className="products-section scroll-mt-24 bg-zinc-50 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
          style={{ backgroundImage: `linear-gradient(rgba(250, 250, 250, 0.76), rgba(250, 250, 250, 0.84)), url(${productPageBg})` }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Our Products</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Choose what you need</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-zinc-700">
                Browse the catalogue, select a quantity, add multiple products to your cart, or order any single product directly.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-zinc-700">
              <strong className="text-zinc-950">Price Notice:</strong> Prices shown on the website are indicative and may change according to current market rates. Please WhatsApp us for the latest price, availability and final order confirmation.
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 shadow-sm focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 lg:max-w-xl">
                <span className="text-xl text-zinc-500" aria-hidden="true">⌕</span>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search fish, chicken, mutton, kabab..."
                  aria-label="Search products"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-zinc-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-lg text-zinc-500 hover:text-zinc-800 active:scale-[0.98]"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </label>

              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product categories">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={category === item}
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-extrabold transition active:scale-[0.98] ${
                      category === item
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    {categoryIcons[item]} {item}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-zinc-600">
              Showing <span className="text-zinc-950">{filteredProducts.length}</span> of {products.length} products
            </p>

            {filteredProducts.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={() => openModal(product, 'details')}
                      className="relative aspect-square overflow-hidden bg-zinc-100 text-left"
                      aria-label={`View ${product.name}`}
                    >
                      <ProductImage src={product.image} alt={product.name} className="h-full w-full" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-700 shadow-sm">
                        {product.category}
                      </span>
                    </button>

                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <h3 className="min-h-[42px] text-sm font-extrabold leading-5 text-zinc-900 sm:text-base">
                        {product.name}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-lg font-black text-orange-600 sm:text-xl">{displayPrice(product)}</span>
                        <span className="text-xs font-bold text-zinc-600">{displayUnit(product)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-zinc-600">Market price may vary</p>

                      <div className="mt-4 grid gap-2">
                        {getProductCartItems(product.id).length > 0 ? (
                          <div className="rounded-xl border border-orange-200 bg-orange-50 p-2.5">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-orange-700">✓ You chose this</span>
                              <span className="text-[11px] font-bold text-zinc-600">
                                {getProductCartQuantity(product.id)} {product.unit === 'kg' ? 'kg' : 'pcs'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-white">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(getProductCartItems(product.id)[0].id, -1)}
                                className="grid h-10 w-11 place-items-center text-lg font-black text-zinc-700 hover:bg-orange-50 active:scale-[0.98]"
                                aria-label={`Decrease ${product.name} quantity`}
                              >
                                −
                              </button>
                              <span className="text-xs font-black text-zinc-900">Adjust quantity</span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(getProductCartItems(product.id)[0].id, 1)}
                                className="grid h-10 w-11 place-items-center text-lg font-black text-orange-600 hover:bg-orange-50 active:scale-[0.98]"
                                aria-label={`Increase ${product.name} quantity`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addProductFromCard(product)}
                            className="min-h-10 rounded-xl bg-orange-500 px-3 text-xs font-extrabold text-white transition hover:bg-orange-600 active:scale-[0.98]"
                          >
                            Add to Cart
                          </button>
                        )}
                        {getProductCartItems(product.id).length === 0 && (
                          <button
                            type="button"
                            onClick={() => openModal(product, 'details')}
                            className="min-h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-extrabold text-zinc-700 transition hover:border-orange-300 hover:text-orange-600 active:scale-[0.98]"
                          >
                            Details
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openModal(product, 'order')}
                          className="min-h-10 rounded-xl border border-orange-200 bg-orange-50 px-3 text-xs font-extrabold text-orange-700 transition hover:bg-orange-100 active:scale-[0.98]"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
                <div className="text-3xl">🔎</div>
                <h3 className="mt-3 text-lg font-black text-zinc-900">No products found</h3>
                <p className="mt-1 text-sm text-zinc-600">Try another search or category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setCategory('All');
                  }}
                  className="mt-4 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white active:scale-[0.98]"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="about" className="scroll-mt-24 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">About</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Wahid Fish Centre</h2>
              <div className="mt-5 max-w-2xl space-y-3 text-sm leading-7 text-zinc-700 sm:text-base">
                <p>Block-A, Gazipur Fish Market, Delhi-110096.</p>
                <p>We provide fresh fish, seafood, chicken, mutton and kabab directly from the market.</p>
                <p>Order on WhatsApp and get FREE delivery in Delhi NCR.</p>
                <p>No advance payment. Transparent market rates.</p>
                <p className="font-bold text-zinc-950">Your trust is our identity.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['01', 'Browse products', 'Explore the current catalogue and search by product name.'],
                ['02', 'Select quantity', 'Choose 500g, 1 kg, 2 kg or more than 2 kg for kg products.'],
                ['03', 'Build your order', 'Add one or multiple products to the cart.'],
                ['04', 'Confirm on WhatsApp', 'Send the order and confirm current price, availability and final weight.'],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <span className="text-xs font-black text-orange-500">{number}</span>
                  <h3 className="mt-2 font-extrabold text-zinc-900">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-zinc-950 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Order & Contact</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Ready to order?</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
                Choose one product and use Order Now, or add multiple products to your cart and send your complete order directly on WhatsApp.
              </p>
              <p className="mt-4 text-sm font-bold text-orange-300">FREE Delivery in Delhi NCR</p>
              <p className="mt-3 text-xs leading-5 text-zinc-400">
                Prices shown on the website are indicative and may change according to current market rates. Please WhatsApp us for the latest price, availability and final order confirmation.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-black text-white">Wahid Fish Centre</p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Block-A, Gazipur Fish Market,<br />Delhi-110096
              </p>
              <a href={`tel:${PHONE_NUMBER}`} className="mt-4 block text-sm font-bold text-orange-300 hover:text-orange-200">
                +91 97177 85423
              </a>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a href={`tel:${PHONE_NUMBER}`} className="rounded-xl bg-white px-4 py-3 text-center text-sm font-extrabold text-zinc-900 active:scale-[0.98]">
                  Call
                </a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-extrabold text-white hover:bg-orange-600 active:scale-[0.98]">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 px-4 pb-8 pt-12 text-zinc-300 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-lg font-black text-white">Wahid Fish Centre</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Fresh fish, seafood, chicken, mutton and kabab with direct WhatsApp ordering.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Products</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.slice(1).map((item) => (
                <li key={item}><a href="#products" className="hover:text-orange-400">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#top" className="hover:text-orange-400">Home</a></li>
              <li><a href="#products" className="hover:text-orange-400">Products</a></li>
              <li><a href="#about" className="hover:text-orange-400">About</a></li>
              <li><a href="#contact" className="hover:text-orange-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Contact</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Block-A, Gazipur Fish Market,<br />Delhi-110096</p>
            <a href={`tel:${PHONE_NUMBER}`} className="mt-2 block text-sm font-bold text-white hover:text-orange-400">+91 97177 85423</a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-zinc-400 hover:text-orange-400">WhatsApp</a>
            <a href="https://wahidfish.com/" className="mt-1 block text-sm text-zinc-400 hover:text-orange-400">wahidfish.com</a>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col gap-2 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Wahid Fish Centre. All rights reserved.</span>
          <span>Fresh Fish • Chicken • Mutton • Kabab</span>
        </div>
      </footer>

      {cart.length > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-2xl shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.98] sm:bottom-6 sm:right-6"
        >
          🛒 Cart
          <span className="rounded-full bg-white/20 px-2 py-0.5">{cart.length}</span>
        </button>
      )}

      {isCartOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          role="presentation"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="cart-panel fixed bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:bottom-4 sm:left-auto sm:right-4 sm:top-4 sm:max-h-none sm:w-[460px] sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label="Your order cart"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-orange-600">Your Order</p>
                <h2 className="text-xl font-black">Cart ({cart.length})</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 text-xl text-zinc-600 active:scale-[0.98]"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              {cart.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-5xl">🛒</div>
                  <h3 className="mt-4 text-xl font-black text-zinc-900">Your cart is empty</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-600">
                    Add fresh fish, chicken, mutton or kabab and order on WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      scrollToProducts();
                    }}
                    className="mt-6 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white hover:bg-orange-600 active:scale-[0.98]"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item flex gap-3 rounded-2xl border border-zinc-200 p-3">
                        <ProductImage
                          src={item.product.image}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-xl"
                        />

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-extrabold text-zinc-900">{item.product.name}</h3>
                          <p className="mt-1 text-xs text-zinc-600">{item.quantityLabel}</p>
                          <p className="mt-1 text-xs font-bold text-orange-600">
                            {isSquid(item.product)
                              ? '₹700–₹1,100/kg'
                              : `₹${formatPrice(item.product.price)}/${item.product.unit}`}
                          </p>

                          <div className="mt-2 inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="grid h-8 w-8 place-items-center text-lg font-black text-zinc-700 hover:bg-zinc-100 active:scale-[0.98]"
                              aria-label={`Decrease ${item.product.name} quantity`}
                            >
                              −
                            </button>
                            <span className="min-w-14 text-center text-xs font-black text-zinc-800">{item.quantityLabel}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="grid h-8 w-8 place-items-center text-lg font-black text-zinc-700 hover:bg-zinc-100 active:scale-[0.98]"
                              aria-label={`Increase ${item.product.name} quantity`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end justify-between">
                          <span className="text-sm font-black text-zinc-900">
                            {isSquid(item.product)
                              ? 'Confirm on WhatsApp'
                              : `₹${formatPrice(item.estimatedPrice ?? 0)}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 active:scale-[0.98]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-zinc-700">Estimated total</span>
                      <strong className="text-right text-xl font-black text-zinc-950">
                        {cartHasRangePrice ? 'Confirm on WhatsApp' : `₹${formatPrice(cartTotal)}`}
                      </strong>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                      Prices are indicative. Final price depends on current market rate, availability and exact weight.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={sendCartToWhatsApp}
                    className="mt-4 min-h-12 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-600 active:scale-[0.98]"
                  >
                    Place Order via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="mt-2 min-h-11 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    Clear Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop fixed inset-0 z-[80] overflow-y-auto bg-black/70 backdrop-blur-sm sm:grid sm:place-items-center sm:px-3 sm:py-4"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="modal-card min-h-screen max-h-screen w-full overflow-y-auto rounded-none bg-white shadow-2xl sm:my-auto sm:max-h-[94vh] sm:min-h-0 sm:max-w-2xl sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
              {modalAction !== 'details' ? (
                <button
                  type="button"
                  onClick={() => setModalAction('details')}
                  className="text-sm font-extrabold text-zinc-700 hover:text-orange-600 active:scale-[0.98]"
                >
                  ← Back to Details
                </button>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Details</span>
              )}
              <button
                type="button"
                onClick={closeModal}
                className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 text-xl text-zinc-600 active:scale-[0.98]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid lg:grid-cols-2">
              <ProductImage
                src={selected.image}
                alt={selected.name}
                className="aspect-square lg:aspect-auto lg:min-h-[430px]"
              />

              <div className="p-5 sm:p-7">
                <p className="text-xs font-black uppercase tracking-wider text-orange-600">{selected.category}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">{selected.name}</h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-orange-600">{displayPrice(selected)}</span>
                  <span className="text-sm font-bold text-zinc-600">{displayUnit(selected)}</span>
                </div>

                {selected.category !== 'Kabab' && (
                  <div className="product-details-panel mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div><p className="text-[10px] font-black uppercase tracking-wider text-orange-600">Source / Supply</p><p className="mt-1 text-xs leading-5 text-zinc-700">{getProductDetails(selected)?.source}</p></div>
                      <div><p className="text-[10px] font-black uppercase tracking-wider text-orange-600">About</p><p className="mt-1 text-xs leading-5 text-zinc-700">{getProductDetails(selected)?.description}</p></div>
                      <div><p className="text-[10px] font-black uppercase tracking-wider text-orange-600">Best For</p><p className="mt-1 text-xs leading-5 text-zinc-700">{getProductDetails(selected)?.bestFor}</p></div>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-zinc-700">
                  Prices shown are indicative and may change according to current market rates. Please WhatsApp us for the latest price, availability and final order confirmation.
                </div>

                {modalAction === 'details' ? (
                  <div className="mt-6 space-y-4">
                    <p className="text-sm leading-6 text-zinc-700">
                      Choose your required quantity below. You can add this product to your cart or order it directly through WhatsApp.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModalAction('cart')}
                        className="min-h-12 rounded-2xl bg-orange-500 px-4 text-sm font-black text-white hover:bg-orange-600 active:scale-[0.98]"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalAction('order')}
                        className="min-h-12 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-black text-orange-700 hover:bg-orange-100 active:scale-[0.98]"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-sm font-extrabold text-zinc-900">Select Quantity / Weight</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(selected.unit === 'kg' ? kgOptions : pieceOptions).map((option) => {
                        const active = selectedWeight?.label === option.label;

                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => {
                              setSelectedWeight(option);
                              setCustomQuantity('');
                              setCustomQuantityError('');
                            }}
                            className={`min-h-11 rounded-xl border px-2 text-xs font-extrabold transition active:scale-[0.98] ${
                              active
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-orange-300 hover:text-orange-600'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    {isCustomQuantity && (
                      <div className="mt-4">
                        <label className="text-xs font-bold text-zinc-700" htmlFor="custom-quantity">
                          Enter required quantity in kg
                        </label>
                        <input
                          id="custom-quantity"
                          type="number"
                          min="2.1"
                          step="0.1"
                          value={customQuantity}
                          onChange={(event) => {
                            setCustomQuantity(event.target.value);
                            setCustomQuantityError('');
                          }}
                          placeholder="Example: 3"
                          aria-invalid={Boolean(customQuantityError)}
                          className={`mt-2 min-h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-4 ${
                            customQuantityError
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                              : 'border-zinc-200 focus:border-orange-400 focus:ring-orange-500/10'
                          }`}
                        />
                        {customQuantityError ? (
                          <p className="mt-1 text-[11px] font-bold text-red-600">{customQuantityError}</p>
                        ) : (
                          <p className="mt-1 text-[11px] text-zinc-600">Enter a quantity greater than 2 kg.</p>
                        )}
                      </div>
                    )}

                    <div className="mt-5 rounded-2xl bg-zinc-950 p-4 text-white">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-zinc-400">{getQuantityLabel() || 'Quantity'}</span>
                        <strong className="text-right text-xl font-black">
                          {getEstimatedPrice() === null
                            ? 'Confirm on WhatsApp'
                            : `₹${formatPrice(getEstimatedPrice() ?? 0)}`}
                        </strong>
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-zinc-600">FREE Delivery in Delhi NCR</p>

                    <button
                      type="button"
                      onClick={modalAction === 'order' ? sendDirectOrderToWhatsApp : addSelectedToCart}
                      className={`mt-4 min-h-12 w-full rounded-2xl px-4 py-3 text-sm font-black active:scale-[0.98] ${
                        modalAction === 'order'
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-zinc-950 text-white hover:bg-zinc-800'
                      }`}
                    >
                      {modalAction === 'order' ? 'Order Now on WhatsApp' : 'Add to Cart'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-card">
            <span>{toast.message}</span>
            {toast.message.includes('added to cart') && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="toast-action active:scale-[0.98]"
              >
                View Cart
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
