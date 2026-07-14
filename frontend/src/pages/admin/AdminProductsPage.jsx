import React, { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const UNIT_OPTIONS = [
  { value: 'шт', label: 'шт' },
  { value: 'кг', label: 'кг' },
  { value: 'л', label: 'л' },
];

const EMPTY_FORM = {
  name: '',
  price: '',
  unit: 'шт',
  description: '',
  stock_quantity: '',
  category: '',
  brand: '',
};

function formatPrice(price) {
  return Number(price).toLocaleString('ru-RU') + ' \u20BD';
}

export default function AdminProductsPage() {
  const { client } = useAuth();
  const isAdmin = client?.role === 'admin';

  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productsApi.list({ limit: 200, offset: 0 });
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match =
        String(product.name).toLowerCase().includes(q) ||
        String(product.category || '').toLowerCase().includes(q) ||
        String(product.brand || '').toLowerCase().includes(q) ||
        String(product.product_id).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // ---------- Handlers ----------

  const handleCreateClick = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setMode('create');
  };

  const handleEditClick = async (product) => {
    setEditingId(product.product_id);
    setFormErrors({});
    try {
      setLoading(true);
      const data = await productsApi.getById(product.product_id);
      setForm({
        name: data.name || '',
        price: data.price != null ? String(data.price) : '',
        unit: data.unit || 'шт',
        description: data.description || '',
        stock_quantity: data.stock_quantity != null ? String(data.stock_quantity) : '',
        category: data.category || '',
        brand: data.brand || '',
      });
      setMode('edit');
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (product) => {
    const confirmed = window.confirm(`Удалить товар «${product.name}»?`);
    if (!confirmed) return;
    try {
      await productsApi.delete(product.product_id);
      setProducts((prev) => prev.filter((p) => p.product_id !== product.product_id));
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleCancel = () => {
    setMode('list');
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Название обязательно';
    if (!form.price || Number(form.price) < 0) errors.price = 'Укажите корректную цену';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      unit: form.unit,
      description: form.description.trim(),
      stock_quantity: Number(form.stock_quantity) || 0,
      category: form.category.trim(),
      brand: form.brand.trim(),
    };

    try {
      setSaving(true);
      if (mode === 'create') {
        const created = await productsApi.create(payload);
        setProducts((prev) => [created, ...prev]);
      } else {
        await productsApi.update(editingId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.product_id === editingId ? { ...p, ...payload } : p))
        );
      }
      handleCancel();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Styles ----------

  const pageStyle = {};

  const titleStyle = {
    fontSize: 28,
    fontWeight: 700,
    color: '#1B1F24',
    margin: 0,
    marginBottom: 28,
  };

  const topBarStyle = {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const searchInputStyle = {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #E8EDF4',
    backgroundColor: '#FFFFFF',
    color: '#1B1F24',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    width: 300,
  };

  const primaryButtonStyle = {
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: '#0067B8',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const primaryButtonHover = {
    backgroundColor: '#005A9E',
  };

  const secondaryButtonStyle = {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #E8EDF4',
    backgroundColor: '#FFFFFF',
    color: '#1B1F24',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const secondaryButtonHover = {
    backgroundColor: '#F0F5FB',
  };

  const dangerButtonStyle = {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #DC2626',
    backgroundColor: 'transparent',
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const dangerButtonHover = {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
  };

  const editButtonStyle = {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #0067B8',
    backgroundColor: 'transparent',
    color: '#0067B8',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const editButtonHover = {
    backgroundColor: '#0067B8',
    color: '#FFFFFF',
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E8EDF4',
    overflow: 'hidden',
  };

  const tableHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 120px 120px 120px 90px 140px',
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
  };

  const formLabelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#1B1F24',
    marginBottom: 6,
  };

  const formInputStyle = {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #E8EDF4',
    backgroundColor: '#FFFFFF',
    color: '#1B1F24',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const formErrorTextStyle = {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  };

  // ---------- Render: List Mode ----------

  const renderList = () => (
    <>
      {/* Top bar */}
      <div style={topBarStyle}>
        <input
          type="text"
          placeholder="Поиск по названию, категории, бренду..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
        />
        {isAdmin && (
          <button
            style={primaryButtonStyle}
            onClick={handleCreateClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = primaryButtonHover.backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primaryButtonStyle.backgroundColor;
            }}
          >
            + Добавить товар
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#6C7685',
            fontSize: 15,
          }}
        >
          Загрузка товаров...
        </div>
      )}

      {/* Empty */}
      {!loading && filteredProducts.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#6C7685',
            fontSize: 15,
          }}
        >
          {products.length === 0
            ? 'Товары не найдены'
            : 'Ни один товар не соответствует поиску'}
        </div>
      )}

      {/* Table */}
      {!loading && filteredProducts.length > 0 && (
        <div style={cardStyle}>
          <div style={tableHeaderStyle}>
            <span>ID</span>
            <span>Название</span>
            <span>Категория</span>
            <span>Бренд</span>
            <span>Цена</span>
            <span>Остаток</span>
            <span style={{ textAlign: 'right' }}>Действия</span>
          </div>

          {filteredProducts.map((product) => (
            <div
              key={product.product_id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 120px 120px 120px 90px 140px',
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
                #{product.product_id}
              </span>
              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.name}
              </span>
              <span style={{ color: '#6C7685' }}>{product.category || '—'}</span>
              <span style={{ color: '#6C7685' }}>{product.brand || '—'}</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(product.price)}</span>
              <span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 8,
                    backgroundColor: product.stock_quantity > 0 ? '#16A34A26' : '#DC262626',
                    color: product.stock_quantity > 0 ? '#16A34A' : '#DC2626',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {product.stock_quantity} {product.unit || 'шт'}
                </span>
              </span>
              <span style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleEditClick(product)}
                  style={editButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = editButtonHover.backgroundColor;
                    e.currentTarget.style.color = editButtonHover.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = editButtonStyle.backgroundColor;
                    e.currentTarget.style.color = editButtonStyle.color;
                  }}
                >
                  Ред.
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteClick(product)}
                    style={dangerButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = dangerButtonHover.backgroundColor;
                      e.currentTarget.style.color = dangerButtonHover.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = dangerButtonStyle.backgroundColor;
                      e.currentTarget.style.color = dangerButtonStyle.color;
                    }}
                  >
                    Удалить
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ---------- Render: Form Mode ----------

  const renderForm = () => {
    const isEdit = mode === 'edit';

    return (
      <div style={cardStyle}>
        <div
          style={{
            padding: '24px 32px 20px',
            borderBottom: '1px solid #E8EDF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1B1F24',
              margin: 0,
            }}
          >
            {isEdit ? 'Редактирование товара' : 'Новый товар'}
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#6C7685',
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: '28px 32px 32px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px 24px',
          }}
        >
          {/* Name */}
          <div>
            <label style={formLabelStyle}>
              Название <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              style={{
                ...formInputStyle,
                borderColor: formErrors.name ? '#DC2626' : '#E8EDF4',
              }}
              placeholder="Введите название"
            />
            {formErrors.name && <div style={formErrorTextStyle}>{formErrors.name}</div>}
          </div>

          {/* Price */}
          <div>
            <label style={formLabelStyle}>
              Цена, ₽ <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
              style={{
                ...formInputStyle,
                borderColor: formErrors.price ? '#DC2626' : '#E8EDF4',
              }}
              placeholder="0"
            />
            {formErrors.price && <div style={formErrorTextStyle}>{formErrors.price}</div>}
          </div>

          {/* Unit */}
          <div>
            <label style={formLabelStyle}>Единица измерения</label>
            <select
              value={form.unit}
              onChange={(e) => handleFormChange('unit', e.target.value)}
              style={formInputStyle}
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div>
            <label style={formLabelStyle}>Остаток на складе</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock_quantity}
              onChange={(e) => handleFormChange('stock_quantity', e.target.value)}
              style={formInputStyle}
              placeholder="0"
            />
          </div>

          {/* Category */}
          <div>
            <label style={formLabelStyle}>Категория</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              style={formInputStyle}
              placeholder="Например: Электроника"
            />
          </div>

          {/* Brand */}
          <div>
            <label style={formLabelStyle}>Бренд</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => handleFormChange('brand', e.target.value)}
              style={formInputStyle}
              placeholder="Например: Samsung"
            />
          </div>

          {/* Description - full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={formLabelStyle}>Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={4}
              placeholder="Описание товара..."
              style={{
                ...formInputStyle,
                resize: 'vertical',
                minHeight: 80,
              }}
            />
          </div>
        </div>

        {/* Form actions */}
        <div
          style={{
            padding: '0 32px 28px',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleCancel}
            style={secondaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = secondaryButtonHover.backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = secondaryButtonStyle.backgroundColor;
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...primaryButtonStyle,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = primaryButtonHover.backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primaryButtonStyle.backgroundColor;
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    );
  };

  // ---------- Main Render ----------

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>
        {mode === 'list'
          ? 'Управление товарами'
          : mode === 'create'
            ? 'Управление товарами / Новый товар'
            : 'Управление товарами / Редактирование'}
      </h1>

      {mode === 'list' ? renderList() : renderForm()}
    </div>
  );
}