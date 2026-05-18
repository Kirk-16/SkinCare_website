import { Product, BlogPost } from "./types";

export const CATEGORIES = ["Face", "Eyes", "Lips", "Cheeks", "Skincare", "Brushes"];
export const BRANDS = {
  International: ["MAC Cosmetics", "Sephora", "Clinique", "Fenty Beauty", "Rare Beauty"],
  Local: ["Glow Culture", "Aura Local", "SunKissed Beauty", "Native Flora"]
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Velvet Matte Lipstick",
    brand: "MAC Cosmetics",
    price: 32,
    category: "Lips",
    rating: 4.8,
    reviews: 1250,
    isInternational: true,
    image: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?q=80&w=800&auto=format&fit=crop",
    description: "A long-wearing lipstick with a creamy matte finish. Available in various iconic shades."
  },
  {
    id: "2",
    name: "Radiant Skin Foundation",
    brand: "Fenty Beauty",
    price: 45,
    category: "Face",
    rating: 4.9,
    reviews: 3200,
    isInternational: true,
    image: "https://images.unsplash.com/photo-1596704017254-9b121068fb21?q=80&w=800&auto=format&fit=crop",
    description: "Medium-to-full coverage for all skin types. Pro Filt'r Soft Matte Longwear Foundation."
  },
  {
    id: "3",
    name: "Native Dew Tint",
    brand: "Glow Culture",
    price: 18,
    category: "Face",
    rating: 4.7,
    reviews: 450,
    isInternational: false,
    image: "https://images.unsplash.com/photo-1599733594230-6b823276abcc?q=80&w=800&auto=format&fit=crop",
    description: "A lightweight skin tint made with local botanical extracts for a natural daily glow."
  },
  {
    id: "4",
    name: "Midnight Lash Mascara",
    brand: "SunKissed Beauty",
    price: 15,
    category: "Eyes",
    rating: 4.5,
    reviews: 210,
    isInternational: false,
    image: "https://images.unsplash.com/photo-1631214099434-601e370425c3?q=80&w=800&auto=format&fit=crop",
    description: "Waterproof, volumizing mascara that stays all day without smudging."
  },
  {
    id: "5",
    name: "Soft Pinch Liquid Blush",
    brand: "Rare Beauty",
    price: 23,
    category: "Cheeks",
    rating: 4.9,
    reviews: 5100,
    isInternational: true,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop",
    description: "Weightless, long-lasting liquid blush that blends and builds beautifully for a soft, healthy flush."
  },
  {
    id: "6",
    name: "Aura Serum Booster",
    brand: "Aura Local",
    price: 25,
    category: "Skincare",
    rating: 4.6,
    reviews: 180,
    isInternational: false,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    description: "Revitalizing serum enriched with locally sourced antioxidants and vitamin C."
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "5-Minute Morning Glow Routine",
    excerpt: "Learn how to achieve a fresh, radiant look in under 5 minutes using our favorite local tints.",
    author: "Elena Rose",
    date: "2024-03-15",
    category: "Tutorial",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
    content: "Start with a clean base... use Native Dew Tint... add a touch of Liquid Blush..."
  },
  {
    id: "b2",
    title: "MAC vs Fenty: The Ultimate Foundation Review",
    excerpt: "We put world-renowned foundations to the test to see which one rules the matte finish game.",
    author: "Sarah J.",
    date: "2024-03-10",
    category: "Review",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
    content: "When it comes to coverage, MAC is a classic. But Fenty brings a shade range that changed the industry..."
  }
];
