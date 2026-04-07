export interface Product {
  id: string;
  name: string;
  sku: string;
  cogs: number; // Cost of Goods Sold
  price: number;
}

export interface KitProduct {
  productId: string;
  quantity: number;
}

export interface Kit {
  id: string;
  name: string;
  products: KitProduct[];
  price: number;
}

export interface GlobalCosts {
  taxRate: number; // e.g., 12%
  marketplaceFee: number; // e.g., 16%
  fixedMarketplaceFee: number; // e.g., R$ 5,00
  averageShipping: number;
  otherVariableCosts: number;
}

export interface FixedCosts {
  id: string;
  name: string;
  value: number;
}

export interface Coupon {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface MarginAnalysis {
  revenue: number;
  cogs: number;
  taxes: number;
  marketplaceFees: number;
  shipping: number;
  otherVariable: number;
  couponDiscount: number;
  contributionMargin: number;
  contributionMarginPercent: number;
}
