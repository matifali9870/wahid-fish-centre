import img1 from './assets/products/tuna-big.webp';
import img2 from './assets/products/rainbow-trout.webp';
import img3 from './assets/products/tuna-small.webp';
import img4 from './assets/products/hilsa.webp';
import img5 from './assets/products/crab.webp';
import img6 from './assets/products/fresh-fish-boneless.webp';
import img7 from './assets/products/king-mackerel-boneless.webp';
import img8 from './assets/products/pacific-salmon-fillet.webp';
import img9 from './assets/products/big-lobster.webp';
import img10 from './assets/products/sole-fish-fillet.webp';
import img11 from './assets/products/sea-sole-fillet.webp';
import img12 from './assets/products/pomfret.webp';
import img13 from './assets/products/prawn-shrimp-medium.webp';
import img14 from './assets/products/indian-mackerel.webp';
import img15 from './assets/products/black-snapper-badam.webp';
import img16 from './assets/products/rohu-fish.webp';
import img17 from './assets/products/katla-fish.webp';
import img18 from './assets/products/squid-calamari.webp';
import img19 from './assets/products/chicken-breast.webp';
import img20 from './assets/products/chicken-legs.webp';
import img21 from './assets/products/full-chicken.webp';
import img22 from './assets/products/chicken-tangri.webp';
import img23 from './assets/products/chicken-curry-cut.webp';
import img24 from './assets/products/chicken-lollipop.webp';
import img25 from './assets/products/mutton-keema.webp';
import img26 from './assets/products/mutton-raan.webp';
import img27 from './assets/products/whole-mutton.webp';
import img28 from './assets/products/mutton-ribs-chops.webp';
import img29 from './assets/products/fish-shami-tikki-kabab.webp';
import img30 from './assets/products/chicken-seekh-kabab.webp';
import img31 from './assets/products/mutton-seekh-kabab.webp';


export type ProductUnit = 'kg' | 'piece';

export type Product = {
  id: number;
  name: string;
  price: number;
  unit: ProductUnit;
  category: 'Fish & Seafood' | 'Chicken' | 'Mutton' | 'Kabab';
  image: string;
};


export const products: Product[] = [
  { id: 1, name: "Tuna Fish (Big Size)", price: 800, unit: "kg", category: "Fish & Seafood", image: img1 },
  { id: 2, name: "Rainbow Trout", price: 1000, unit: "kg", category: "Fish & Seafood", image: img2 },
  { id: 3, name: "Tuna Fish (Small Size)", price: 300, unit: "kg", category: "Fish & Seafood", image: img3 },
  { id: 4, name: "Hilsa Fish", price: 1500, unit: "kg", category: "Fish & Seafood", image: img4 },
  { id: 5, name: "Crab", price: 600, unit: "kg", category: "Fish & Seafood", image: img5 },
  { id: 6, name: "Fresh Fish Boneless", price: 1260, unit: "kg", category: "Fish & Seafood", image: img6 },
  { id: 7, name: "King Mackerel Boneless", price: 1400, unit: "kg", category: "Fish & Seafood", image: img7 },
  { id: 8, name: "Pacific Salmon Fillet", price: 2900, unit: "kg", category: "Fish & Seafood", image: img8 },
  { id: 9, name: "Big Lobster", price: 3500, unit: "kg", category: "Fish & Seafood", image: img9 },
  { id: 10, name: "Sole Fish Fillet", price: 700, unit: "kg", category: "Fish & Seafood", image: img10 },
  { id: 11, name: "Sea Sole Fillet", price: 500, unit: "kg", category: "Fish & Seafood", image: img11 },
  { id: 12, name: "Pomfret (4 Pcs/kg)", price: 1200, unit: "kg", category: "Fish & Seafood", image: img12 },
  { id: 13, name: "Prawn / Shrimp (Medium Size)", price: 800, unit: "kg", category: "Fish & Seafood", image: img13 },
  { id: 14, name: "Indian Mackerel", price: 350, unit: "kg", category: "Fish & Seafood", image: img14 },
  { id: 15, name: "Black Snapper (Badam)", price: 550, unit: "kg", category: "Fish & Seafood", image: img15 },
  { id: 16, name: "Rohu Fish", price: 300, unit: "kg", category: "Fish & Seafood", image: img16 },
  { id: 17, name: "Katla Fish", price: 300, unit: "kg", category: "Fish & Seafood", image: img17 },
  { id: 18, name: "Squid / Calamari Rings (Cleaned)", price: 700, unit: "kg", category: "Fish & Seafood", image: img18 },
  { id: 19, name: "Chicken Breast", price: 300, unit: "kg", category: "Chicken", image: img19 },
  { id: 20, name: "Chicken Legs", price: 280, unit: "kg", category: "Chicken", image: img20 },
  { id: 21, name: "Full Chicken (800 g per Piece)", price: 220, unit: "piece", category: "Chicken", image: img21 },
  { id: 22, name: "Chicken Tangri", price: 280, unit: "kg", category: "Chicken", image: img22 },
  { id: 23, name: "Chicken Curry Cut", price: 280, unit: "kg", category: "Chicken", image: img23 },
  { id: 24, name: "Chicken Lollipop", price: 350, unit: "kg", category: "Chicken", image: img24 },
  { id: 25, name: "Mutton Minced / Keema", price: 900, unit: "kg", category: "Mutton", image: img25 },
  { id: 26, name: "Mutton Raan / Whole Goat Leg", price: 800, unit: "kg", category: "Mutton", image: img26 },
  { id: 27, name: "Whole Mutton / Whole Goat Carcass", price: 650, unit: "kg", category: "Mutton", image: img27 },
  { id: 28, name: "Mutton Ribs / Mutton Chops", price: 750, unit: "kg", category: "Mutton", image: img28 },
  { id: 29, name: "Fish Shami / Tikki Kabab", price: 400, unit: "kg", category: "Kabab", image: img29 },
  { id: 30, name: "Chicken Seekh Kabab", price: 350, unit: "kg", category: "Kabab", image: img30 },
  { id: 31, name: "Mutton Kabab / Mutton Seekh Kabab", price: 900, unit: "kg", category: "Kabab", image: img31 },
];