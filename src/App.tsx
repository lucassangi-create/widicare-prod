/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Settings2, 
  Percent, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ChevronRight,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency, formatPercent } from './lib/utils';
import { Product, Kit, GlobalCosts, FixedCosts, Coupon, MarginAnalysis } from './types';

// --- Mock Data ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Camiseta Básica Algodão', sku: 'CAM-001', cogs: 25.00, price: 59.90 },
  { id: '2', name: 'Calça Jeans Premium', sku: 'CAL-002', cogs: 65.00, price: 189.90 },
  { id: '3', name: 'Moletom Canguru', sku: 'MOL-003', cogs: 45.00, price: 129.90 },
  { id: '4', name: 'Tênis Casual White', sku: 'TEN-004', cogs: 80.00, price: 249.90 },
];

const INITIAL_KITS: Kit[] = [
  { 
    id: 'k1', 
    name: 'Kit 3 Camisetas Básicas', 
    products: [{ productId: '1', quantity: 3 }], 
    price: 149.90 
  },
  { 
    id: 'k2', 
    name: 'Look Completo (Jeans + Camiseta)', 
    products: [{ productId: '1', quantity: 1 }, { productId: '2', quantity: 1 }], 
    price: 219.90 
  },
];

const INITIAL_GLOBAL_COSTS: GlobalCosts = {
  taxRate: 12,
  marketplaceFee: 16,
  fixedMarketplaceFee: 5.00,
  averageShipping: 15.00,
  otherVariableCosts: 2,
};

const INITIAL_FIXED_COSTS: FixedCosts[] = [
  { id: 'f1', name: 'Aluguel Escritório', value: 2500 },
  { id: 'f2', name: 'Salários', value: 8000 },
  { id: 'f3', name: 'Software / ERP', value: 450 },
  { id: 'f4', name: 'Marketing (Fixo)', value: 3000 },
];

const INITIAL_COUPONS: Coupon[] = [
  { id: 'c1', name: 'BEMVINDO10', type: 'percentage', value: 10 },
  { id: 'c2', name: 'FRETEGRATIS', type: 'fixed', value: 15 },
];

// --- Components ---

const Card = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: { 
  title: string, value: string, icon: any, trend?: 'up' | 'down', trendValue?: string, color: string 
}) => (
  <Card className="relative">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <div className={cn(
            "flex items-center mt-2 text-xs font-medium",
            trend === 'up' ? "text-emerald-600" : "text-rose-600"
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className={cn("p-3 rounded-lg", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'kits' | 'costs' | 'coupons'>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [kits, setKits] = useState<Kit[]>(INITIAL_KITS);
  const [globalCosts, setGlobalCosts] = useState<GlobalCosts>(INITIAL_GLOBAL_COSTS);
  const [fixedCosts, setFixedCosts] = useState<FixedCosts[]>(INITIAL_FIXED_COSTS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  // --- Calculations ---

  const calculateMargin = (price: number, cogs: number, coupon?: Coupon): MarginAnalysis => {
    const discount = coupon 
      ? (coupon.type === 'percentage' ? (price * coupon.value / 100) : coupon.value)
      : 0;
    
    const finalPrice = Math.max(0, price - discount);
    const taxes = finalPrice * (globalCosts.taxRate / 100);
    const marketplaceFees = (finalPrice * (globalCosts.marketplaceFee / 100)) + globalCosts.fixedMarketplaceFee;
    const shipping = globalCosts.averageShipping;
    const otherVariable = finalPrice * (globalCosts.otherVariableCosts / 100);
    
    const contributionMargin = finalPrice - cogs - taxes - marketplaceFees - shipping - otherVariable;
    const contributionMarginPercent = finalPrice > 0 ? (contributionMargin / finalPrice) * 100 : 0;

    return {
      revenue: finalPrice,
      cogs,
      taxes,
      marketplaceFees,
      shipping,
      otherVariable,
      couponDiscount: discount,
      contributionMargin,
      contributionMarginPercent
    };
  };

  const productAnalyses = useMemo(() => {
    const coupon = coupons.find(c => c.id === selectedCouponId);
    return products.map(p => ({
      ...p,
      analysis: calculateMargin(p.price, p.cogs, coupon)
    }));
  }, [products, globalCosts, coupons, selectedCouponId]);

  const kitAnalyses = useMemo(() => {
    const coupon = coupons.find(c => c.id === selectedCouponId);
    return kits.map(k => {
      const totalCogs = k.products.reduce((acc, kp) => {
        const product = products.find(p => p.id === kp.productId);
        return acc + (product ? product.cogs * kp.quantity : 0);
      }, 0);
      return {
        ...k,
        analysis: calculateMargin(k.price, totalCogs, coupon)
      };
    });
  }, [kits, products, globalCosts, coupons, selectedCouponId]);

  const totalFixedCosts = useMemo(() => fixedCosts.reduce((acc, fc) => acc + fc.value, 0), [fixedCosts]);

  const dashboardStats = useMemo(() => {
    const allAnalyses = [...productAnalyses, ...kitAnalyses].map(a => a.analysis);
    const avgMargin = allAnalyses.reduce((acc, a) => acc + a.contributionMarginPercent, 0) / allAnalyses.length;
    const avgProfit = allAnalyses.reduce((acc, a) => acc + a.contributionMargin, 0) / allAnalyses.length;
    
    // Break-even point (in revenue)
    // BEP = Fixed Costs / Avg Contribution Margin %
    const breakEvenRevenue = totalFixedCosts / (avgMargin / 100);

    return {
      avgMargin,
      avgProfit,
      breakEvenRevenue,
      totalFixedCosts
    };
  }, [productAnalyses, kitAnalyses, totalFixedCosts]);

  // --- Handlers ---

  const addProduct = () => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Produto',
      sku: 'SKU-' + Math.floor(Math.random() * 1000),
      cogs: 0,
      price: 0
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Margem Média" 
          value={formatPercent(dashboardStats.avgMargin)} 
          icon={TrendingUp} 
          color="bg-blue-600"
          trend={dashboardStats.avgMargin > 20 ? 'up' : 'down'}
          trendValue={dashboardStats.avgMargin > 20 ? "Saudável" : "Baixa"}
        />
        <StatCard 
          title="Lucro Médio/Venda" 
          value={formatCurrency(dashboardStats.avgProfit)} 
          icon={DollarSign} 
          color="bg-emerald-600"
        />
        <StatCard 
          title="Custos Fixos Totais" 
          value={formatCurrency(dashboardStats.totalFixedCosts)} 
          icon={Calculator} 
          color="bg-slate-600"
        />
        <StatCard 
          title="Ponto de Equilíbrio" 
          value={formatCurrency(dashboardStats.breakEvenRevenue)} 
          icon={TrendingUp} 
          color="bg-amber-600"
          trend="up"
          trendValue="Faturamento Alvo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Margem de Contribuição por Produto">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productAnalyses}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar name="Margem (R$)" dataKey="analysis.contributionMargin" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="Custo (COGS)" dataKey="cogs" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Composição de Preço (Média)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Lucro (Margem)', value: dashboardStats.avgProfit },
                    { name: 'Custo Produto', value: productAnalyses[0]?.cogs || 0 },
                    { name: 'Impostos', value: productAnalyses[0]?.analysis.taxes || 0 },
                    { name: 'Marketplace', value: productAnalyses[0]?.analysis.marketplaceFees || 0 },
                    { name: 'Frete', value: globalCosts.averageShipping },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#6366f1" />
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Simulador de Cupons">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <p className="text-sm text-slate-600 mr-2">Selecione um cupom para ver o impacto em tempo real:</p>
          <button 
            onClick={() => setSelectedCouponId(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCouponId === null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Sem Cupom
          </button>
          {coupons.map(coupon => (
            <button 
              key={coupon.id}
              onClick={() => setSelectedCouponId(coupon.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                selectedCouponId === coupon.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {coupon.name} ({coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)})
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Produto/Kit</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Preço Original</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Preço c/ Desc.</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Margem (R$)</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Margem (%)</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...productAnalyses, ...kitAnalyses].map((item: any) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{formatCurrency(item.price)}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600">{formatCurrency(item.analysis.revenue)}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900">{formatCurrency(item.analysis.contributionMargin)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-bold",
                      item.analysis.contributionMarginPercent > 20 ? "bg-emerald-100 text-emerald-700" : 
                      item.analysis.contributionMarginPercent > 10 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {formatPercent(item.analysis.contributionMarginPercent)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {item.analysis.contributionMargin < 0 ? (
                      <div className="flex items-center text-rose-600 text-xs font-bold">
                        <AlertCircle className="w-3 h-3 mr-1" /> PREJUÍZO
                      </div>
                    ) : (
                      <div className="flex items-center text-emerald-600 text-xs font-bold">
                        LUCRO
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderProducts = () => (
    <Card title="Gerenciar Portfólio de Produtos">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-slate-500">Adicione seus produtos e seus respectivos custos de aquisição (COGS).</p>
        <button 
          onClick={addProduct}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Nome</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">SKU</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Custo (R$)</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Preço Venda (R$)</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-slate-50">
                <td className="py-2 px-4">
                  <input 
                    type="text" 
                    value={product.name} 
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium p-0"
                  />
                </td>
                <td className="py-2 px-4">
                  <input 
                    type="text" 
                    value={product.sku} 
                    onChange={(e) => updateProduct(product.id, 'sku', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 text-slate-500"
                  />
                </td>
                <td className="py-2 px-4">
                  <input 
                    type="number" 
                    value={product.cogs} 
                    onChange={(e) => updateProduct(product.id, 'cogs', parseFloat(e.target.value))}
                    className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="py-2 px-4">
                  <input 
                    type="number" 
                    value={product.price} 
                    onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value))}
                    className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-semibold text-blue-600"
                  />
                </td>
                <td className="py-2 px-4">
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderCosts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Custos Variáveis Globais">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Impostos (%)</label>
            <input 
              type="number" 
              value={globalCosts.taxRate} 
              onChange={(e) => setGlobalCosts({...globalCosts, taxRate: parseFloat(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Taxa Marketplace (%)</label>
            <input 
              type="number" 
              value={globalCosts.marketplaceFee} 
              onChange={(e) => setGlobalCosts({...globalCosts, marketplaceFee: parseFloat(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Taxa Fixa Marketplace (R$)</label>
            <input 
              type="number" 
              value={globalCosts.fixedMarketplaceFee} 
              onChange={(e) => setGlobalCosts({...globalCosts, fixedMarketplaceFee: parseFloat(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Frete Médio (R$)</label>
            <input 
              type="number" 
              value={globalCosts.averageShipping} 
              onChange={(e) => setGlobalCosts({...globalCosts, averageShipping: parseFloat(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </Card>

      <Card title="Custos Fixos (DRE)">
        <div className="space-y-4">
          {fixedCosts.map(cost => (
            <div key={cost.id} className="flex items-center gap-3">
              <input 
                type="text" 
                value={cost.name} 
                onChange={(e) => setFixedCosts(fixedCosts.map(c => c.id === cost.id ? {...c, name: e.target.value} : c))}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input 
                type="number" 
                value={cost.value} 
                onChange={(e) => setFixedCosts(fixedCosts.map(c => c.id === cost.id ? {...c, value: parseFloat(e.target.value)} : c))}
                className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
              />
              <button 
                onClick={() => setFixedCosts(fixedCosts.filter(c => c.id !== cost.id))}
                className="p-2 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setFixedCosts([...fixedCosts, { id: Math.random().toString(), name: 'Novo Custo', value: 0 }])}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all text-sm font-medium"
          >
            + Adicionar Custo Fixo
          </button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-white tracking-tight">MargemPro</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
              activeTab === 'dashboard' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
              activeTab === 'products' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Package className="w-4 h-4" /> Portfólio
          </button>
          <button 
            onClick={() => setActiveTab('kits')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
              activeTab === 'kits' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Layers className="w-4 h-4" /> Kits
          </button>
          <button 
            onClick={() => setActiveTab('costs')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
              activeTab === 'costs' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Settings2 className="w-4 h-4" /> Custos & DRE
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suporte</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analise suas margens e otimize seus preços para máxima lucratividade.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Visão Geral'}
              {activeTab === 'products' && 'Meus Produtos'}
              {activeTab === 'kits' && 'Combos & Kits'}
              {activeTab === 'costs' && 'Configurações de Custos'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Bem-vindo ao seu painel de controle financeiro.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Dados Atualizados
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'costs' && renderCosts()}
            {activeTab === 'kits' && (
              <Card title="Gerenciamento de Kits">
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-sm text-slate-500">Combine produtos em kits e defina um preço promocional.</p>
                  <button 
                    onClick={() => setKits([...kits, { id: Math.random().toString(), name: 'Novo Kit', products: [], price: 0 }])}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Novo Kit
                  </button>
                </div>

                <div className="space-y-6">
                  {kits.map(kit => (
                    <div key={kit.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/30">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 mr-4">
                          <input 
                            type="text" 
                            value={kit.name} 
                            onChange={(e) => setKits(kits.map(k => k.id === kit.id ? {...k, name: e.target.value} : k))}
                            className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0 w-full"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Preço do Kit</label>
                            <input 
                              type="number" 
                              value={kit.price} 
                              onChange={(e) => setKits(kits.map(k => k.id === kit.id ? {...k, price: parseFloat(e.target.value)} : k))}
                              className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold text-blue-600"
                            />
                          </div>
                          <button 
                            onClick={() => setKits(kits.filter(k => k.id !== kit.id))}
                            className="p-2 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {kit.products.map((kp, idx) => {
                          const product = products.find(p => p.id === kp.productId);
                          return (
                            <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                              <select 
                                value={kp.productId}
                                onChange={(e) => {
                                  const newProducts = [...kit.products];
                                  newProducts[idx].productId = e.target.value;
                                  setKits(kits.map(k => k.id === kit.id ? {...k, products: newProducts} : k));
                                }}
                                className="flex-1 bg-transparent border-none text-sm focus:ring-0"
                              >
                                <option value="">Selecionar Produto...</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.cogs)})</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Qtd:</span>
                                <input 
                                  type="number" 
                                  value={kp.quantity}
                                  onChange={(e) => {
                                    const newProducts = [...kit.products];
                                    newProducts[idx].quantity = parseInt(e.target.value);
                                    setKits(kits.map(k => k.id === kit.id ? {...k, products: newProducts} : k));
                                  }}
                                  className="w-12 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs text-center"
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  const newProducts = kit.products.filter((_, i) => i !== idx);
                                  setKits(kits.map(k => k.id === kit.id ? {...k, products: newProducts} : k));
                                }}
                                className="p-1 text-slate-300 hover:text-rose-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                        <button 
                          onClick={() => {
                            const newProducts = [...kit.products, { productId: '', quantity: 1 }];
                            setKits(kits.map(k => k.id === kit.id ? {...k, products: newProducts} : k));
                          }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center mt-2"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Adicionar Produto ao Kit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
