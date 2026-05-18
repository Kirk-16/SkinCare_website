export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  isInternational: boolean;
  ingredients?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  category: string;
  content: string;
}

export interface UserReview {
  id: string;
  productId: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}
