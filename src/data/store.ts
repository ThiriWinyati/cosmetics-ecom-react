export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  latest?: boolean;
  popular?: boolean;
};

export const products: Product[] = [
  { id: 11, name: "Blur Fudge Tint", category: "Lips", brand: "rom&nd", price: 14, image: "/legacy/products/blur_fudge.jpg", rating: 4.8, reviews: 42, latest: true, popular: true, description: "A smooth, featherlight lip tint with a softly blurred matte finish." },
  { id: 14, name: "Glasting Color Gloss", category: "Lips", brand: "rom&nd", price: 14, image: "/legacy/products/glasting.webp", rating: 4.7, reviews: 36, latest: true, popular: true, description: "A plump, glass-like gloss with vivid color and comfortable hydration." },
  { id: 15, name: "Zero Cushion", category: "Face", brand: "rom&nd", price: 24, image: "/legacy/products/zerocusion.webp", rating: 4.6, reviews: 28, popular: true, description: "A lightweight semi-matte cushion for a smooth, flawless base." },
  { id: 16, name: "Bare Water Cushion", category: "Face", brand: "rom&nd", price: 16, image: "/legacy/products/watercushion.webp", rating: 4.9, reviews: 51, latest: true, popular: true, description: "A fresh, moisture-rich cushion with a natural skin-like finish." },
  { id: 17, name: "Han All Flat Brow", category: "Brows", brand: "rom&nd", price: 12, image: "/legacy/products/flatbrow.webp", rating: 4.5, reviews: 23, popular: true, description: "A fine flat-tip brow pencil for soft, natural definition." },
  { id: 20, name: "Han All Fix Mascara", category: "Eyes", brand: "rom&nd", price: 15, image: "/legacy/products/mascara.webp", rating: 4.8, reviews: 67, latest: true, popular: true, description: "Water-resistant definition, curl and hold without clumping." },
  { id: 21, name: "Bare Layer Palette", category: "Eyes", brand: "rom&nd", price: 25, image: "/legacy/products/eyeshadow.webp", rating: 4.7, reviews: 31, latest: true, description: "Seven blendable matte and shimmer shades for eyes and cheeks." },
  { id: 23, name: "Secret Garden Palette", category: "Eyes", brand: "rom&nd", price: 26, image: "/legacy/products/palette.webp", rating: 4.9, reviews: 44, latest: true, description: "A versatile ten-shade palette of refined mattes and luminous glitters." },
  { id: 18, name: "Han All Sharp Brow", category: "Brows", brand: "rom&nd", price: 12.5, image: "/uploads/products/brow.webp", rating: 4.6, reviews: 19, popular: true, description: "A precise 1.5 mm pencil with powder and spoolie for naturally defined brows." },
  { id: 19, name: "Twinkle Pen Liner", category: "Eye Liner", brand: "rom&nd", price: 10, image: "/uploads/products/4_58e8de17-a378-4bf6-9cf8-83bc7e2930b6.webp", rating: 4.5, reviews: 21, latest: true, description: "A fine shimmer liner that glides smoothly around the inner corners and lower lash line." },
  { id: 24, name: "Dior Addict Lip Glow Oil", category: "Lip Care", brand: "Dior", price: 40, image: "/uploads/products/lip.jpg", rating: 4.8, reviews: 74, popular: true, description: "A nourishing cherry-oil lip treatment with a glossy mirror-shine finish." },
  { id: 25, name: "Dior Addict Lip Tint", category: "Lips", brand: "Dior", price: 45, image: "/uploads/products/lip.webp", rating: 4.7, reviews: 48, latest: true, popular: true, description: "A comfortable no-transfer tint with semi-matte colour and lasting hydration." },
  { id: 26, name: "Rouge Dior", category: "Lips", brand: "Dior", price: 49, image: "/uploads/products/dior.jpg", rating: 4.9, reviews: 83, description: "An iconic long-wear lipstick with rich colour and a soft, comfortable finish." },
  { id: 27, name: "Dior Forever Skin Glow", category: "Foundation", brand: "Dior", price: 52, image: "/uploads/products/Anya_Yara_1850x2000.webp", rating: 4.8, reviews: 61, latest: true, popular: true, description: "A radiant, serum-like foundation offering smooth coverage and all-day luminosity." },
  { id: 28, name: "Dior Forever Couture Perfect Cushion", category: "Cushion", brand: "Dior", price: 56, image: "/uploads/products/dior (1).webp", rating: 4.7, reviews: 39, latest: true, popular: true, description: "A refillable couture cushion with luminous matte coverage and lasting hydration." },
  { id: 30, name: "Sharp So Simple Waterproof Liner", category: "Eye Liner", brand: "CLIO", price: 11, image: "/uploads/products/f279b55a-55b7-4fdc-a40f-d8ee7fa5085e.webp", rating: 4.5, reviews: 27, description: "A creamy waterproof pencil that defines eyes without smudging or skipping." },
  { id: 31, name: "Zero Matte Lipstick", category: "Lips", brand: "rom&nd", price: 14, image: "/uploads/products/zeromattelipstick_nude.webp", rating: 4.8, reviews: 92, popular: true, description: "A featherlight, velvety lipstick with intense payoff and a true matte texture." },
  { id: 32, name: "Les Beiges Bronzing Cream", category: "Bronzer", brand: "Chanel", price: 48, image: "/uploads/products/chanel_ma2022_24_0050_1_rgbtif_jpeg-haute-definition-LD-571x740.jpg", rating: 4.8, reviews: 46, latest: true, description: "A cream-gel bronzer that creates a naturally sun-kissed, healthy-looking glow." },
  { id: 33, name: "Les Beiges Water-Fresh Tint", category: "Foundation", brand: "Chanel", price: 55, image: "/uploads/products/9533150232606.webp", rating: 4.7, reviews: 35, description: "A water-fresh tint with micro-droplet pigments for luminous, bare-skin coverage." },
  { id: 35, name: "Rouge Coco Baume – Shine", category: "Lips", brand: "Chanel", price: 36, image: "/uploads/products/1732802135042-onepdpeditopushdesktopmobile01974x1298px2jpg_1299x974.webp", rating: 4.6, reviews: 43, latest: true, description: "A buildable tinted balm that hydrates lips while adding fresh, luminous colour." },
  { id: 36, name: "Jeux de Lumières", category: "Eyes", brand: "Chanel", price: 75, image: "/uploads/products/9556751974430.webp", rating: 4.9, reviews: 29, latest: true, description: "A multi-use eyeshadow and highlighter palette for soft-to-luminous looks." },
  { id: 37, name: "M·A·Cximal Silky Matte Lipstick", category: "Lips", brand: "M.A.C", price: 25, image: "/uploads/products/2000736770_170999881_06.avif", rating: 4.8, reviews: 68, latest: true, description: "A silky matte lipstick with full-coverage colour and comfortable moisture." },
  { id: 38, name: "Candy Glow Tinted Butter Balm", category: "Lip Care", brand: "YvesSaintLaurent", price: 40, image: "/uploads/products/ysl-candy-glow-tinted-butter-balm-44b-view.jpg", rating: 4.7, reviews: 54, latest: true, description: "A buttery balm with a personalised flush of colour and all-day lip care." },
  { id: 40, name: "Powder Blush", category: "Blush", brand: "NARS", price: 34, image: "/uploads/products/999NAC0000192_3.jpg", rating: 4.9, reviews: 77, latest: true, description: "A weightless, blendable blush with true-colour payoff and a softly blurred finish." },
];

export const adminResources = [
  { label: "Products", path: "products", count: 24 },
  { label: "Categories", path: "categories", count: 13 },
  { label: "Brands", path: "brands", count: 31 },
  { label: "Orders", path: "orders", count: 104 },
  { label: "Customers", path: "customers", count: 14 },
  { label: "Reviews", path: "reviews", count: 95 },
  { label: "Coupons", path: "coupons", count: 6 },
  { label: "Delivery methods", path: "delivery-methods", count: 6 },
  { label: "Manage deliveries", path: "deliveries", count: 7 },
  { label: "Payment methods", path: "payment-methods", count: 6 },
  { label: "Messages", path: "messages", count: 1 },
  { label: "Live chat", path: "chat", count: 0 },
];
