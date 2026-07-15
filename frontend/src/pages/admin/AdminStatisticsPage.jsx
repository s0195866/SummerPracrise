import { useState, useEffect } from 'react';
import { statsApi, salesApi } from '../../api';

const STATUS_META = {
  new:       { label: 'Новый',      color: '#0067B8' },
  processing:{ label: 'В обработке', color: '#F59E0B' },
  shipped:   { label: 'Отправлен',   color: '#8B5CF6' },
  delivered: { label: 'Доставлен',   color: '#16A34A' },
  cancelled: { label: 'Отменён',    color: '#DC2626' },
};

const fmt = (v) => Number(v).toLocaleString('ru-RU');

function formatCurrency(value) {
  return `${fmt(value)} \u20BD`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: '#6C7685' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        color: meta.color,
        backgroundColor: meta.color + '26',
      }}
    >
      {meta.label}
    </span>
  );
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsApi.get(), salesApi.list()])
      .then(([s, sl]) => {
        setStats(s);
        setSales(Array.isArray(sl) ? sl.slice(0, 20) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadReport = () => {
    if (!stats) return;

    const sep = '═'.repeat(60);
    const thin = '─'.repeat(60);

    const statusLines = Object.entries(STATUS_META).map(([key, meta]) => {
      const count = stats.orders_by_status?.[key] ?? 0;
      return `  ${meta.label.padEnd(16)} ${String(count).padStart(6)}`;
    }).join('\n');

    const salesHeader = '  '.concat(
      ['ID', 'Дата', 'Клиент', 'Сумма', 'Статус'].map((h, i) =>
        h.padEnd(i === 2 ? 24 : i === 4 ? 16 : 14)
      ).join('')
    );

    const salesRows = sales.map((s) =>
      '  '.concat(
        [
          String(s.sale_id ?? '').padEnd(14),
          (s.sale_date ? formatDate(s.sale_date) : '').padEnd(14),
          (s.client_name ?? '').padEnd(24),
          (s.sale_amount != null ? formatCurrency(s.sale_amount) : '').padEnd(14),
          (STATUS_META[s.status]?.label ?? s.status ?? '').padEnd(16),
        ].join('')
      )
    ).join('\n');

    const report = [
      sep,
      '  ФИНАНСОВЫЙ ОТЧЁТ',
      `  Сформирован: ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      sep,
      '',
      '  КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ',
      thin,
      `  Выручка:          ${formatCurrency(stats.total_revenue)}`,
      `  Всего заказов:    ${stats.total_orders}`,
      `  Всего клиентов:   ${stats.total_clients}  (Постоянных: ${stats.regular_clients ?? 0})`,
      `  Средний чек:      ${formatCurrency(stats.average_order_value)}`,
      '',
      '  ЗАКАЗЫ ПО СТАТУСАМ',
      thin,
      statusLines,
      '',
      '  ПОСЛЕДНИЕ ПРОДАЖИ',
      thin,
      salesHeader,
      thin,
      salesRows,
      '',
      sep,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maxStatusCount = stats
    ? Math.max(...Object.values(stats.orders_by_status || {}), 1)
    : 1;

  const cardBase = {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E8EDF4',
    padding: '24px 28px',
  };

  const kpiGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    marginBottom: 32,
  };

  const sectionTitle = {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 20,
    color: '#1B1F24',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '12px 16px',
    color: '#6C7685',
    fontWeight: 500,
    fontSize: 13,
    borderBottom: '2px solid #E8EDF4',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #E8EDF4',
    whiteSpace: 'nowrap',
  };

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 28px',
    backgroundColor: '#0067B8',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'background-color 0.2s',
    marginTop: 36,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6C7685', fontSize: 16, fontFamily: "'Inter, sans-serif" }}>
        <p>Загрузка статистики...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, color: '#1B1F24', fontFamily: "'Inter, sans-serif" }}>
        Финансовая статистика
      </h1>

      {/* KPI Cards */}
      <div style={kpiGridStyle}>
        <div style={{ ...cardBase, borderLeft: '4px solid #16A34A' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6C7685', marginBottom: 8, fontFamily: "'Inter, sans-serif" }}>Выручка</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1B1F24' }}>
            {stats ? formatCurrency(stats.total_revenue) : '—'}
          </p>
        </div>

        <div style={{ ...cardBase, borderLeft: '4px solid #0067B8' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6C7685', marginBottom: 8, fontFamily: "'Inter, sans-serif" }}>Заказы</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1B1F24' }}>
            {stats?.total_orders ?? '—'}
          </p>
        </div>

        <div style={{ ...cardBase, borderLeft: '4px solid #8B5CF6' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6C7685', marginBottom: 8, fontFamily: "'Inter, sans-serif" }}>Клиенты</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1B1F24' }}>
            {stats?.total_clients ?? '—'}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6C7685', fontFamily: "'Inter, sans-serif" }}>
            Постоянных: {stats?.regular_clients ?? 0}
          </p>
        </div>

        <div style={{ ...cardBase, borderLeft: '4px solid #F59E0B' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6C7685', marginBottom: 8, fontFamily: "'Inter, sans-serif" }}>Средний чек</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1B1F24' }}>
            {stats ? formatCurrency(stats.average_order_value) : '—'}
          </p>
        </div>
      </div>

      {/* Orders by Status */}
      <div style={{ ...cardBase, marginBottom: 32 }}>
        <h2 style={{ ...sectionTitle, marginTop: 0 }}>Заказы по статусам</h2>
        {stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = stats.orders_by_status?.[key] ?? 0;
              const pct = (count / maxStatusCount) * 100;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1B1F24', fontFamily: "'Inter, sans-serif" }}>{meta.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1B1F24', fontFamily: "'Inter, sans-serif" }}>{count}</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 10,
                      backgroundColor: '#E8EDF4',
                      borderRadius: 5,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: meta.color,
                        borderRadius: 5,
                        transition: 'width 0.4s ease',
                        minWidth: count > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sales Table */}
      <div style={cardBase}>
        <h2 style={{ ...sectionTitle, marginTop: 0 }}>Последние продажи</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: "'Inter, sans-serif" }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Дата</th>
                <th style={thStyle}>Клиент</th>
                <th style={thStyle}>Сумма</th>
                <th style={thStyle}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#6C7685' }}>
                    Нет данных
                  </td>
                </tr>
              )}
              {sales.map((s) => (
                <tr key={s.sale_id}>
                  <td style={tdStyle}>{s.sale_id}</td>
                  <td style={tdStyle}>{s.sale_date ? formatDate(s.sale_date) : '—'}</td>
                  <td style={tdStyle}>{s.client_name || '—'}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>
                    {s.sale_amount != null ? formatCurrency(s.sale_amount) : '—'}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Report Button */}
      <button
        style={btnStyle}
        onClick={handleDownloadReport}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005A9E')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0067B8')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Сформировать отчёт
      </button>
    </div>
  );
}