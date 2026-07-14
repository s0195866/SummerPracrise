import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api';

const STATUS_MAP = {
  new: { label: 'Новый', color: '#0067B8' },
  processing: { label: 'В обработке', color: '#F59E0B' },
  shipped: { label: 'Отправлен', color: '#8B5CF6' },
  delivered: { label: 'Доставлен', color: '#16A34A' },
  cancelled: { label: 'Отменён', color: '#DC2626' },
};

const FILTER_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

function formatCurrency(amount) {
  return amount.toLocaleString('ru-RU') + ' \u20BD';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await ordersApi.list(params);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match = String(order.order_id).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Title */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#1B1F24',
          margin: 0,
          marginBottom: 28,
        }}
      >
        Все заказы
      </h1>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #E8EDF4',
            backgroundColor: '#FFFFFF',
            color: '#1B1F24',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            minWidth: 180,
          }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Поиск по ID заказа..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #E8EDF4',
            backgroundColor: '#FFFFFF',
            color: '#1B1F24',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            width: 260,
          }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#6C7685',
            fontSize: 15,
          }}
        >
          Загрузка заказов...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#6C7685',
            fontSize: 15,
          }}
        >
          {orders.length === 0
            ? 'Заказы не найдены'
            : 'Ни один заказ не соответствует фильтрам'}
        </div>
      )}

      {/* Table */}
      {!loading && filteredOrders.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E8EDF4',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 130px 100px 90px 140px 130px 100px',
              gap: 12,
              padding: '14px 24px',
              backgroundColor: '#F8FAFD',
              borderBottom: '1px solid #E8EDF4',
              alignItems: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#6C7685',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <span>Заказ</span>
            <span>Дата</span>
            <span>Клиент</span>
            <span>Товары</span>
            <span>Сумма</span>
            <span>Статус</span>
            <span style={{ textAlign: 'right' }}>Действие</span>
          </div>

          {/* Table Rows */}
          {filteredOrders.map((order) => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.new;
            const itemsCount = order.items ? order.items.length : 0;

            return (
              <div
                key={order.order_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 130px 100px 90px 140px 130px 100px',
                  gap: 12,
                  padding: '16px 24px',
                  borderBottom: '1px solid #E8EDF4',
                  alignItems: 'center',
                  fontSize: 14,
                  color: '#1B1F24',
                  transition: 'background-color 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F5FB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontWeight: 600, color: '#0067B8' }}>
                  #{order.order_id}
                </span>
                <span style={{ color: '#6C7685' }}>
                  {formatDate(order.sale_date)}
                </span>
                <span>#{order.client_id}</span>
                <span>{itemsCount}</span>
                <span style={{ fontWeight: 600 }}>
                  {formatCurrency(order.total_amount)}
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 8,
                      backgroundColor: status.color + '26',
                      color: status.color,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {status.label}
                  </span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #0067B8',
                      backgroundColor: 'transparent',
                      color: '#0067B8',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0067B8';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#0067B8';
                    }}
                  >
                    Открыть
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}