import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api';

const STATUS_MAP = {
  new: { label: 'Новый', color: '#0067B8' },
  processing: { label: 'В обработке', color: '#F59E0B' },
  shipped: { label: 'Отправлен', color: '#8B5CF6' },
  delivered: { label: 'Доставлен', color: '#16A34A' },
  cancelled: { label: 'Отменён', color: '#DC2626' },
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

function formatCurrency(amount) {
  return Number(amount).toLocaleString('ru-RU') + ' \u20BD';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const data = await ordersApi.getById(id);
        setOrder(data);
        setSelectedStatus(data.status);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Не удалось загрузить заказ');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    try {
      setUpdating(true);
      setError('');
      const updated = await ordersApi.updateStatus(order.order_id, {
        status: selectedStatus,
      });
      setOrder(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    try {
      setUpdating(true);
      setError('');
      const updated = await ordersApi.cancel(order.order_id);
      setOrder(updated);
      setSelectedStatus(updated.status);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setError(err instanceof Error ? err.message : 'Не удалось отменить заказ');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#6C7685', fontSize: 15 }}>
        Загрузка заказа...
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 0',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#0067B8',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 18 }}>&larr;</span>
          Назад к заказам
        </button>
        <p style={{ color: '#6C7685', fontSize: 15 }}>{error || 'Заказ не найден'}</p>
      </div>
    );
  }

  const currentStatus = STATUS_MAP[order.status] || STATUS_MAP.new;
  const items = order.items || [];

  const deliveryMethodLabels = {
    delivery: 'Доставка',
    pickup: 'Самовывоз',
    courier: 'Курьер',
  };
  const paymentMethodLabels = {
    card: 'Банковская карта',
    cash: 'Наличные',
    sbp: 'СБП',
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/orders')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 0',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#0067B8',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 18 }}>&larr;</span>
        Назад к заказам
      </button>

      {/* Order Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#1B1F24',
              margin: 0,
              marginBottom: 6,
            }}
          >
            Заказ #{order.order_id}
          </h1>
          <p style={{ margin: 0, color: '#6C7685', fontSize: 14 }}>
            от {formatDateTime(order.sale_date)}
          </p>
        </div>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 8,
            backgroundColor: currentStatus.color + '26',
            color: currentStatus.color,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {currentStatus.label}
        </span>
      </div>

      {/* Status Management */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E8EDF4',
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#1B1F24',
          }}
        >
          Изменить статус:
        </span>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
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
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleStatusUpdate}
          disabled={updating || selectedStatus === order.status}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            backgroundColor:
              updating || selectedStatus === order.status ? '#B0BEC5' : '#0067B8',
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            cursor:
              updating || selectedStatus === order.status
                ? 'not-allowed'
                : 'pointer',
            opacity:
              updating || selectedStatus === order.status ? 0.6 : 1,
            transition: 'all 0.15s',
          }}
        >
          {updating ? 'Обновление...' : 'Обновить статус'}
        </button>
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button
            onClick={handleCancel}
            disabled={updating}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid #DC2626',
              backgroundColor: 'transparent',
              color: '#DC2626',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: updating ? 'not-allowed' : 'pointer',
              opacity: updating ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!updating) {
                e.currentTarget.style.backgroundColor = '#DC2626';
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#DC2626';
            }}
          >
            Отменить заказ
          </button>
        )}
        {error && (
          <span style={{ color: '#DC2626', fontSize: 13, marginLeft: 4 }}>
            {error}
          </span>
        )}
      </div>

      {/* Info Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Order Info Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E8EDF4',
            padding: '24px',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1B1F24',
              margin: '0 0 20px 0',
            }}
          >
            Информация о заказе
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InfoRow
              label="Клиент"
              value={`#${order.client_id}`}
            />
            <InfoRow
              label="Адрес доставки"
              value={order.delivery_address || '—'}
            />
            <InfoRow
              label="Способ доставки"
              value={
                deliveryMethodLabels[order.delivery_method] ||
                order.delivery_method ||
                '—'
              }
            />
            <InfoRow
              label="Способ оплаты"
              value={
                paymentMethodLabels[order.payment_method] ||
                order.payment_method ||
                '—'
              }
            />
            <InfoRow
              label="Скидка"
              value={
                order.discount_applied
                  ? formatCurrency(order.discount_applied)
                  : 'Нет'
              }
            />
            {order.delivery_date && (
              <InfoRow
                label="Дата доставки"
                value={formatDate(order.delivery_date)}
              />
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 14,
                borderTop: '1px solid #E8EDF4',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: '#6C7685',
                }}
              >
                Итого
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#0067B8',
                }}
              >
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E8EDF4',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1B1F24',
              margin: '0 0 20px 0',
            }}
          >
            Состав заказа
          </h2>
          {items.length === 0 ? (
            <p
              style={{
                color: '#6C7685',
                fontSize: 14,
                textAlign: 'center',
                padding: '24px 0',
              }}
            >
              Нет товаров
            </p>
          ) : (
            <>
              {/* Items Table Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 100px 100px',
                  gap: 8,
                  paddingBottom: 10,
                  borderBottom: '1px solid #E8EDF4',
                  marginBottom: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6C7685',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <span>Товар</span>
                <span style={{ textAlign: 'center' }}>Кол-во</span>
                <span style={{ textAlign: 'right' }}>Цена</span>
                <span style={{ textAlign: 'right' }}>Сумма</span>
              </div>

              {/* Items Rows */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item) => (
                  <div
                    key={item.order_item_id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px 100px 100px',
                      gap: 8,
                      padding: '8px 0',
                      fontSize: 14,
                      color: '#1B1F24',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={item.product_name}
                    >
                      {item.product_name}
                    </span>
                    <span style={{ textAlign: 'center', color: '#6C7685' }}>
                      {item.quantity}
                    </span>
                    <span style={{ textAlign: 'right', color: '#6C7685' }}>
                      {formatCurrency(item.price_at_sale)}
                    </span>
                    <span
                      style={{ textAlign: 'right', fontWeight: 600 }}
                    >
                      {formatCurrency(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Items Footer Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 14,
                  marginTop: 8,
                  borderTop: '1px solid #E8EDF4',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1B1F24',
                  }}
                >
                  Итого
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#0067B8',
                  }}
                >
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          fontSize: 14,
          color: '#6C7685',
          flexShrink: 0,
          marginRight: 16,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#1B1F24',
          textAlign: 'right',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
}