import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, OrderStatus } from '../types';
import { AdminProductModal } from './AdminProductModal';
import {
  Package,
  Boxes,
  TrendingUp,
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Trash2,
  QrCode,
  Download,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Truck,
  Upload,
} from 'lucide-react';

type AdminTab = 'inventory' | 'orders' | 'analytics' | 'settings';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    deleteProduct,
    adjustStock,
    orders,
    updateOrderStatus,
    markPaymentVerified,
    settings,
    updateSettings,
    formatPrice,
    setViewMode,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Order filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Tracking update modal state
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingCarrierInput, setTrackingCarrierInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Store settings form state
  const [settingsForm, setSettingsForm] = useState(settings);

  // Analytics computations
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const lowStockProducts = products.filter((p) => p.stock <= (p.lowStockThreshold || 3));
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  const handleEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setProductModalOpen(true);
  };

  const handleCreateNewProduct = () => {
    setProductToEdit(null);
    setProductModalOpen(true);
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    updateOrderStatus(trackingModalOrder.id, 'shipped', {
      carrier: trackingCarrierInput || 'Express Courier',
      number: trackingNumberInput || 'AWB-' + Date.now().toString().slice(-6),
    });
    setTrackingModalOrder(null);
    setTrackingCarrierInput('');
    setTrackingNumberInput('');
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setSettingsForm((prev) => ({ ...prev, upiQrImage: result }));
        updateSettings({ upiQrImage: result });
        showToast('New UPI QR Code uploaded successfully.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  const handleExportOrdersCSV = () => {
    if (orders.length === 0) {
      showToast('No orders to export.', 'info');
      return;
    }

    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'City', 'Total', 'Payment Method', 'Status'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customer.fullName}"`,
      o.customer.email,
      `"${o.customer.phone}"`,
      `"${o.customer.city}"`,
      o.total,
      o.paymentMethod,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `saatvic_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] pb-16">
      {/* Top Admin Header */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('store')}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>
            <div className="h-4 w-px bg-stone-700" />
            <div>
              <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                <span>Merchant Studio Console</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  ACTIVE
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 text-xs text-stone-300">
            <div>
              <span className="text-stone-400 block text-[10px]">TOTAL REVENUE</span>
              <span className="font-mono-nums font-semibold text-white">
                {formatPrice(totalRevenue)}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">ORDERS</span>
              <span className="font-mono-nums font-semibold text-white">{totalOrdersCount}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">STOCK ALERTS</span>
              <span className="font-mono-nums font-semibold text-amber-400">
                {lowStockProducts.length} low
              </span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 border-t border-stone-800 pt-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-300 bg-stone-800/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Product Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-400 text-amber-300 bg-stone-800/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order Management ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-amber-400 text-amber-300 bg-stone-800/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics & Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-300 bg-stone-800/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Store & UPI QR Setup</span>
          </button>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= TAB 1: PRODUCT INVENTORY ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Catalog & Stock Control</h2>
                <p className="text-xs text-stone-500">
                  Manage product details, real-time inventory counts, and upload new piece photos.
                </p>
              </div>

              <button
                onClick={handleCreateNewProduct}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Product</span>
              </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#fafaf8] border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">SKU / Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Inventory Stock</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((product) => {
                      const isSoldOut = product.stock <= 0;
                      const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 3);

                      return (
                        <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                                <img
                                  src={product.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <span className="font-semibold text-stone-900 block">
                                  {product.name}
                                </span>
                                {product.featured && (
                                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono-nums">
                            <span className="font-semibold text-stone-800 block">{product.sku}</span>
                            <span className="text-stone-500 text-[11px]">{product.category}</span>
                          </td>

                          <td className="py-3 px-4 font-mono-nums font-semibold text-stone-900">
                            {formatPrice(product.price)}
                          </td>

                          {/* Interactive Stock Adjuster */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => adjustStock(product.id, product.stock - 1)}
                                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs"
                                title="Decrease stock"
                              >
                                -
                              </button>
                              <span className="font-mono-nums font-bold text-stone-900 w-8 text-center">
                                {product.stock}
                              </span>
                              <button
                                onClick={() => adjustStock(product.id, product.stock + 1)}
                                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs"
                                title="Increase stock"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Status badge */}
                          <td className="py-3 px-4">
                            {isSoldOut ? (
                              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                Sold Out
                              </span>
                            ) : isLowStock ? (
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 w-max">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Low ({product.stock} left)</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                In Stock
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-md transition-colors"
                                title="Edit product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${product.name}" from catalog?`)) {
                                    deleteProduct(product.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDER MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Order Management & Fulfillment</h2>
                <p className="text-xs text-stone-500">
                  Review customer orders, verify UPI transactions, dispatch parcels, and generate tracking numbers.
                </p>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 overflow-x-auto">
                {(['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                        orderStatusFilter === st
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-stone-200 text-xs text-stone-500">
                  No orders found under &ldquo;{orderStatusFilter}&rdquo; status.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs transition-all hover:border-stone-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono-nums font-bold text-sm text-stone-900">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'shipped'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : order.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-stone-400 text-xs font-mono-nums">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-stone-800">{order.customer.fullName}</span>
                          <span>·</span>
                          <span>{order.customer.phone}</span>
                          <span>·</span>
                          <span className="text-stone-500">{order.customer.city}, {order.customer.state}</span>
                        </div>
                      </div>

                      {/* Payment info & status */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-stone-400 uppercase font-medium block">
                            Payment ({order.paymentMethod.toUpperCase()})
                          </span>
                          <span className="font-mono-nums font-bold text-stone-900">
                            {formatPrice(order.total)}
                          </span>
                          {order.upiTransactionRef && (
                            <span className="block text-[11px] font-mono-nums text-stone-500">
                              Ref: {order.upiTransactionRef}
                            </span>
                          )}
                        </div>

                        {/* Payment verify action */}
                        {order.paymentStatus !== 'verified' && order.paymentMethod === 'upi_qr' && (
                          <button
                            onClick={() => markPaymentVerified(order.id)}
                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-xs font-medium hover:bg-emerald-100 transition-colors"
                          >
                            Verify UPI Payment
                          </button>
                        )}

                        {/* Status dropdown */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              const newSt = e.target.value as OrderStatus;
                              if (newSt === 'shipped') {
                                setTrackingModalOrder(order);
                              } else {
                                updateOrderStatus(order.id, newSt);
                              }
                            }}
                            className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 font-medium focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Order items preview & Shipping details */}
                    <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 flex-wrap">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-stone-100 overflow-hidden border border-stone-200">
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-stone-800">
                              {item.name} <strong className="font-mono-nums text-stone-500">×{item.quantity}</strong>
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.trackingNumber && (
                        <div className="text-stone-600 bg-stone-50 px-3 py-1.5 rounded border border-stone-200 text-xs">
                          <span>Carrier: <strong>{order.trackingCarrier}</strong></span>
                          <span className="mx-2">·</span>
                          <span className="font-mono-nums">AWB: {order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SALES & ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Sales Reports & Studio Metrics</h2>
                <p className="text-xs text-stone-500">
                  Performance insights, inventory depletion rates, and revenue exports.
                </p>
              </div>

              <button
                onClick={handleExportOrdersCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Orders to CSV</span>
              </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                  Gross Revenue
                </span>
                <span className="text-2xl font-mono-nums font-bold text-stone-900">
                  {formatPrice(totalRevenue)}
                </span>
                <span className="text-[11px] text-emerald-700 block mt-1">From confirmed orders</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                  Total Orders Placed
                </span>
                <span className="text-2xl font-mono-nums font-bold text-stone-900">
                  {totalOrdersCount}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">Across all payment channels</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                  Average Order Value (AOV)
                </span>
                <span className="text-2xl font-mono-nums font-bold text-stone-900">
                  {formatPrice(averageOrderValue)}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">Per transaction basket</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                  Inventory Depletion Alerts
                </span>
                <span className="text-2xl font-mono-nums font-bold text-amber-600">
                  {lowStockProducts.length}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">Items at or below threshold</span>
              </div>
            </div>

            {/* Low stock alerts table */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Immediate Restock Attention Needed</span>
                </h3>
                <div className="divide-y divide-stone-100 text-xs">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-stone-100 overflow-hidden border border-stone-200">
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">{p.name}</p>
                          <p className="text-stone-400 font-mono-nums">{p.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-nums font-bold text-rose-600">
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} units left`}
                        </span>
                        <button
                          onClick={() => adjustStock(p.id, p.stock + 10)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium"
                        >
                          +10 Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: STORE & PAYMENT SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Store Profile & Payment QR Configuration</h2>
              <p className="text-xs text-stone-500">
                Customize your store name, currency, contact details, and upload your custom UPI QR code for seamless buyer checkout.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6 text-xs text-stone-700">
              {/* UPI & Payment Integration Box */}
              <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-stone-800" />
                  <span>Your Merchant UPI & QR Code Settings</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Buyers scan this QR code on checkout to pay directly into your account using PhonePe, Google Pay, Paytm, or BHIM.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Current QR Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-32 h-32 bg-white p-2 rounded-lg border border-stone-300 shadow-xs overflow-hidden flex items-center justify-center">
                      <img
                        src={settingsForm.upiQrImage}
                        alt="Merchant QR"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <label className="cursor-pointer text-[11px] font-medium text-stone-800 bg-white border border-stone-300 px-3 py-1 rounded hover:bg-stone-100 transition-colors flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload My QR Code</span>
                      <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <label className="block text-stone-800 font-medium mb-1">Your UPI ID (VPA) *</label>
                      <input
                        type="text"
                        value={settingsForm.upiId}
                        onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                        required
                        placeholder="e.g. yourname@okaxis or business@upi"
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 font-mono-nums focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-800 font-medium mb-1">Merchant Display Name</label>
                      <input
                        type="text"
                        value={settingsForm.upiName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, upiName: e.target.value })}
                        placeholder="Saatvic Dairy and Agro"
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods Available */}
                <div className="pt-3 border-t border-stone-200 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableCod}
                      onChange={(e) => setSettingsForm({ ...settingsForm, enableCod: e.target.checked })}
                      className="rounded text-stone-900 focus:ring-0"
                    />
                    <span className="font-medium text-stone-800">Enable Cash on Delivery (COD)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableCardGateway}
                      onChange={(e) => setSettingsForm({ ...settingsForm, enableCardGateway: e.target.checked })}
                      className="rounded text-stone-900 focus:ring-0"
                    />
                    <span className="font-medium text-stone-800">Enable Card / Payment Gateway Checkout</span>
                  </label>
                </div>
              </div>

              {/* General Store Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-800 font-medium mb-1">Store / Business Name *</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    required
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-medium mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-medium mb-1">Currency</label>
                  <select
                    value={settingsForm.currency}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const syms: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
                      setSettingsForm({
                        ...settingsForm,
                        currency: val,
                        currencySymbol: syms[val] || '₹',
                      });
                    }}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                  >
                    <option value="INR">Indian Rupee (₹ INR)</option>
                    <option value="USD">US Dollar ($ USD)</option>
                    <option value="EUR">Euro (€ EUR)</option>
                    <option value="GBP">British Pound (£ GBP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-800 font-medium mb-1">Free Shipping Threshold</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono-nums focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-medium mb-1">Standard Shipping Fee</label>
                  <input
                    type="number"
                    value={settingsForm.standardShippingFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, standardShippingFee: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono-nums focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-medium mb-1">Studio Address</label>
                  <input
                    type="text"
                    value={settingsForm.storeAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ann-check"
                    checked={settingsForm.showAnnouncement}
                    onChange={(e) => setSettingsForm({ ...settingsForm, showAnnouncement: e.target.checked })}
                    className="rounded text-stone-900 focus:ring-0"
                  />
                  <label htmlFor="ann-check" className="font-medium text-stone-800 cursor-pointer">
                    Show top announcement banner on storefront
                  </label>
                </div>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  placeholder="e.g. Free shipping across India on orders above ₹2000"
                  className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors shadow-xs"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Product Upload / Edit Modal */}
      <AdminProductModal
        productToEdit={productToEdit}
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setProductToEdit(null);
        }}
      />

      {/* Shipped Tracking Assignment Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
            <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-stone-800" />
              <span>Mark Order #{trackingModalOrder.orderNumber} as Dispatched</span>
            </h3>
            <p className="text-xs text-stone-500">
              Provide courier details so the buyer can track their package on the live timeline.
            </p>

            <form onSubmit={handleSaveTracking} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Courier / Carrier Name</label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart, Delhivery, DTDC"
                  value={trackingCarrierInput}
                  onChange={(e) => setTrackingCarrierInput(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Tracking Number / AWB</label>
                <input
                  type="text"
                  placeholder="e.g. BD-84920194"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 font-mono-nums focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg font-medium"
                >
                  Confirm Shipment & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
