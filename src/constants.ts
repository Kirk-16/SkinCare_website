import { Product, BlogPost } from "./types";

export const CATEGORIES = ["Face", "Eyes", "Lips", "Cheeks", "Skincare", "Brushes"];
export const BRANDS = {
  International: ["MAC Cosmetics", "Sephora", "Clinique", "Fenty Beauty", "Rare Beauty"],
  Local: ["Glow Culture", "Aura Local", "SunKissed Beauty", "Native Flora"]
};

export const PRODUCTS: Product[] = [];

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
