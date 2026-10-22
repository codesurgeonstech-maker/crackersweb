import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { getShopOrders, updateOrderStatus } from '../../services/orderService';
import { getShopById } from '../../services/shopService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import {
  ShoppingBag,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  CheckCheck,
  XCircle,
  Phone,
  MapPin,
  FileText,
  Search,
  X,
  Filter,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  Truck,
  Store
} from 'lucide-react';

function isOrderInDateRange(orderCreatedAt, range) {
  if (range === 'all') return true;
  if (!orderCreatedAt) return false;

  let orderDate;
  if (typeof orderCreatedAt.toDate === 'function') {
    orderDate = orderCreatedAt.toDate();
  } else if (orderCreatedAt instanceof Date) {
    orderDate = orderCreatedAt;
  } else {
    orderDate = new Date(orderCreatedAt);
  }

  if (isNaN(orderDate.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (range === 'today') {
    return orderDate >= startOfToday;
  }
  if (range === 'yesterday') {
    return orderDate >= startOfYesterday && orderDate < startOfToday;
  }
  if (range === 'week') {
    return orderDate >= startOfWeek;
  }
  if (range === 'month') {
    return orderDate >= startOfMonth;
  }
  return true;
}

export default function AdminOrders() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { showToast } = useToast();

  const loadOrders = async (isManualRefresh = false) => {
    if (!currentShopId) {
      setLoading(false);
      return;
    }
    if (isManualRefresh) setRefreshing(true);
    try {
      const [ords, shopData] = await Promise.all([
        getShopOrders(currentShopId),
        getShopById(currentShopId)
      ]);
      setOrders(ords);
      setShop(shopData);
      if (isManualRefresh) {
        showToast('Orders refreshed successfully', 'success');
      }
    } catch {
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentShopId]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(currentShopId, orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Order marked as ${newStatus}`, 'success');
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setOrderTypeFilter('all');
    setDateFilter('all');
    setSortFilter('newest');
    setSearchQuery('');
  };

  const hasActiveFilters =
    statusFilter !== 'all' ||
    orderTypeFilter !== 'all' ||
    dateFilter !== 'all' ||
    sortFilter !== 'newest' ||
    Boolean(searchQuery.trim());

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }

        // Order Type filter
        if (orderTypeFilter !== 'all') {
          const type = (order.orderType || 'Shop Pickup').toLowerCase();
          if (type !== orderTypeFilter.toLowerCase()) {
            return false;
          }
        }

        // Date filter
        if (!isOrderInDateRange(order.createdAt, dateFilter)) {
          return false;
        }

        // Mobile Number / Search Query filter
        if (searchQuery.trim()) {
          const rawQuery = searchQuery.trim().toLowerCase();
          const queryDigits = searchQuery.replace(/\D/g, '');
          const customerMobile = order.customerMobile ? String(order.customerMobile) : '';
          const mobileDigits = customerMobile.replace(/\D/g, '');

          // Check if digits match mobile number
          const matchesMobile = queryDigits
            ? mobileDigits.includes(queryDigits)
            : customerMobile.toLowerCase().includes(rawQuery);

          // Also match customer name, order reference, or address
          const matchesName = order.customerName && order.customerName.toLowerCase().includes(rawQuery);
          const matchesRef = order.orderReference && order.orderReference.toLowerCase().includes(rawQuery);
          const matchesAddress = order.address && order.address.toLowerCase().includes(rawQuery);

          if (!matchesMobile && !matchesName && !matchesRef && !matchesAddress) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const getDate = (item) => {
          if (!item.createdAt) return 0;
          if (typeof item.createdAt.toDate === 'function') return item.createdAt.toDate().getTime();
          if (item.createdAt instanceof Date) return item.createdAt.getTime();
          return new Date(item.createdAt).getTime() || 0;
        };

        if (sortFilter === 'newest') {
          return getDate(b) - getDate(a);
        }
        if (sortFilter === 'oldest') {
          return getDate(a) - getDate(b);
        }
        if (sortFilter === 'amount_high') {
          return (Number(b.total) || 0) - (Number(a.total) || 0);
        }
        if (sortFilter === 'amount_low') {
          return (Number(a.total) || 0) - (Number(b.total) || 0);
        }
        return 0;
      });
  }, [orders, statusFilter, orderTypeFilter, dateFilter, searchQuery, sortFilter]);

  const getStatusBadgeVariant = (st) => {
    switch (st) {
      case 'confirmed': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
                Orders & Enquiries
              </h1>
              <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary-200">
                {orders.length} Total
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Review WhatsApp orders, search customer mobile numbers, and manage fulfillment.
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={RotateCcw}
            isLoading={refreshing}
            onClick={() => loadOrders(true)}
            className="self-start sm:self-auto text-xs"
          >
            Refresh Orders
          </Button>
        </div>

        {/* Search Bar & Filters Card */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-surface-border shadow-subtle space-y-4">
          {/* Mobile Number & General Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-500">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Customer Mobile Number (e.g. 98765...), name, or order ID..."
              className="w-full pl-10 pr-10 py-2.5 bg-surface-secondary/60 hover:bg-surface-secondary focus:bg-white rounded-2xl border border-surface-border text-xs sm:text-sm text-surface-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-gray-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-gray-100">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
              { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
              { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
              { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-primary-500 text-white shadow-xs'
                    : 'bg-surface-secondary text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Secondary Filters: Order Type, Date, Sort & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Order Type Filter */}
              <div className="flex items-center gap-1.5 bg-surface-secondary px-2.5 py-1.5 rounded-xl border border-surface-border text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 font-medium hidden sm:inline">Type:</span>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Types</option>
                  <option value="Shop Pickup">Shop Pickup</option>
                  <option value="Delivery">Home Delivery</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5 bg-surface-secondary px-2.5 py-1.5 rounded-xl border border-surface-border text-xs">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 font-medium hidden sm:inline">Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-1.5 bg-surface-secondary px-2.5 py-1.5 rounded-xl border border-surface-border text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="newest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_high">Total: High to Low</option>
                  <option value="amount_low">Total: Low to High</option>
                </select>
              </div>
            </div>

            {/* Results count & Clear Filters */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">
                Showing <strong className="text-surface-text">{filteredOrders.length}</strong> of {orders.length}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold hover:underline bg-primary-50 px-2 py-1 rounded-lg border border-primary-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-surface-text">No orders found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? `No orders match your mobile search "${searchQuery}" or selected filters.`
                    : 'No orders have been received yet for this shop.'}
                </p>
                {hasActiveFilters && (
                  <Button size="sm" variant="outline" onClick={handleResetFilters}>
                    Reset Search & Filters
                  </Button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-sm min-w-[850px]">
                <thead className="bg-surface-secondary text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Order Ref</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Customer & Mobile</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Items Summary</th>
                    <th className="px-5 py-3">Order Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const itemCount = order.items ? order.items.reduce((s, it) => s + it.quantity, 0) : 0;
                    const cleanMobile = (order.customerMobile || '').replace(/\D/g, '');
                    const isDelivery = (order.orderType || '').toLowerCase() === 'delivery';

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-surface-text">
                          {order.orderReference}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-bold text-xs text-surface-text">{order.customerName}</p>
                          <a
                            href={`tel:${cleanMobile}`}
                            className="inline-flex items-center gap-1 text-[11px] text-primary-600 hover:text-primary-700 font-mono font-semibold mt-0.5 hover:underline"
                            title="Call customer"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{String(order.customerMobile || '').replace(/^\+/, '')}</span>
                          </a>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isDelivery
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {isDelivery ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                            <span>{order.orderType || 'Shop Pickup'}</span>
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">{itemCount} items</span>
                          <span className="text-gray-400 block text-[11px] max-w-xs truncate">
                            {order.items?.map(it => it.name).slice(0, 2).join(', ')}
                            {order.items?.length > 2 ? '...' : ''}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 font-extrabold text-sm text-primary-600 whitespace-nowrap">
                          {formatCurrency(order.total)}
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <a
                              href={`https://wa.me/${cleanMobile}?text=${encodeURIComponent(`Hello ${order.customerName}! We have received your crackers order ${order.orderReference} at ${shop?.name || 'our shop'}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Reply via WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 text-[#25D366]" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <Modal
            isOpen={Boolean(selectedOrder)}
            onClose={() => setSelectedOrder(null)}
            title={`Order: ${selectedOrder.orderReference}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 pt-2">
              {/* Customer & Type Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-surface-secondary rounded-2xl text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Customer:</span>
                  <span className="font-bold text-surface-text">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Mobile Number:</span>
                  <a
                    href={`tel:${(selectedOrder.customerMobile || '').replace(/\D/g, '')}`}
                    className="font-mono font-bold text-primary-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{String(selectedOrder.customerMobile || '').replace(/^\+/, '')}</span>
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Order Type:</span>
                  <span className="font-bold text-surface-text">{selectedOrder.orderType || 'Shop Pickup'}</span>
                </div>
              </div>

              {selectedOrder.address && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-700 border border-gray-100">
                  <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                  <span><strong>Delivery Address:</strong> {selectedOrder.address}</span>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-700 border border-gray-100">
                  <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span><strong>Customer Note:</strong> {selectedOrder.notes}</span>
                </div>
              )}

              {/* Items Snapshot Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Items Ordered (Historical Snapshot)
                </h4>
                <div className="border border-surface-border rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold">
                      <tr>
                        <th className="px-3.5 py-2">Item</th>
                        <th className="px-3.5 py-2">Price</th>
                        <th className="px-3.5 py-2 text-center">Qty</th>
                        <th className="px-3.5 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3.5 py-2.5 font-bold text-surface-text">
                            {it.name}
                          </td>
                          <td className="px-3.5 py-2.5 text-gray-600">
                            {formatCurrency(it.price)}
                          </td>
                          <td className="px-3.5 py-2.5 text-center font-bold">
                            {it.quantity}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-extrabold text-primary-600">
                            {formatCurrency(it.subtotal || it.price * it.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50/80 font-bold">
                      <tr>
                        <td colSpan="3" className="px-3.5 py-2.5 text-right text-gray-600">
                          Total Amount:
                        </td>
                        <td className="px-3.5 py-2.5 text-right text-base text-primary-600 font-extrabold">
                          {formatCurrency(selectedOrder.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Update Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-surface-border text-xs font-bold bg-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <a
                  href={`https://wa.me/${(selectedOrder.customerMobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedOrder.customerName}! Your order ${selectedOrder.orderReference} at ${shop?.name || 'our shop'} is ${selectedOrder.status.toUpperCase()}. Thank you!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                  <span>Send Update on WhatsApp</span>
                </a>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
