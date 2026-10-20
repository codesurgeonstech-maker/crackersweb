import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';

export default function AdminOrders() {
  const { userProfile, shopId } = useAuth();
  const currentShopId = shopId || userProfile?.shopId;

  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const loadOrders = async () => {
    if (!currentShopId) {
      setLoading(false);
      return;
    }
    try {
      const [ords, shopData] = await Promise.all([
        getShopOrders(currentShopId),
        getShopById(currentShopId)
      ]);
      setOrders(ords);
      setShop(shopData);
    } catch {
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
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

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-text tracking-tight">
              Orders & Enquiries
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Review incoming WhatsApp orders, confirm item availability and manage fulfillment.
            </p>
          </div>
        </div>

        {/* Status Filters Bar */}
        <div className="bg-white p-3 rounded-2xl border border-surface-border shadow-subtle flex flex-wrap gap-2 items-center">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'Pending Confirmation', count: orders.filter(o => o.status === 'pending').length },
            { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
            { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
            { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'bg-surface-secondary text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                No orders found under this status.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-secondary text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Order Ref</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Items Summary</th>
                    <th className="px-5 py-3">Order Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const itemCount = order.items ? order.items.reduce((s, it) => s + it.quantity, 0) : 0;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-surface-text">
                          {order.orderReference}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-bold text-xs text-surface-text">{order.customerName}</p>
                          <p className="text-[11px] text-gray-400 font-mono">+{order.customerMobile}</p>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">{itemCount} items</span>
                          <span className="text-gray-400 block text-[11px]">
                            {order.items?.map(it => it.name).slice(0, 2).join(', ')}
                            {order.items?.length > 2 ? '...' : ''}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 font-extrabold text-sm text-primary-600">
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
                              href={`https://wa.me/${order.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customerName}! We have received your crackers order ${order.orderReference} at ${shop?.name}.`)}`}
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
                  <span className="text-gray-400 block font-medium">Mobile:</span>
                  <span className="font-mono font-bold text-surface-text">{selectedOrder.customerMobile}</span>
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
                  href={`https://wa.me/${selectedOrder.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedOrder.customerName}! Your order ${selectedOrder.orderReference} at ${shop?.name} is ${selectedOrder.status.toUpperCase()}. Thank you!`)}`}
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
