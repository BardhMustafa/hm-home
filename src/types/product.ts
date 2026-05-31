export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  image_url: string;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  sku: string | null;
  stock: number | null;
  featured: boolean;
  category_id: string | null;
  images: ProductImage[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
