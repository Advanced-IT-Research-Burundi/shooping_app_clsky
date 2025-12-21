export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  exchangeRate: number;
  convertedPrice: number;
  type: 'food' | 'electronics' | 'clothing' | 'other';
  packaging: 'unit' | 'carton' | 'other';
  piecesPerCarton?: number;
  numberOfCartons?: number;
  photo: string;
  date: string;
}
