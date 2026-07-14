import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { adminApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ROLE_STYLES = {
  client: { bg: 'rgba(108, 118, 133, 0.15)', color: '#6C7685', label: 'Клиент' },
  manager: { bg: 'rgba(217, 119, 6, 0.15)', color: '#D97706', label: 'Менеджер' },
  admin: { bg: 'rgba(0, 103, 184, 0.15)', color: '#0067B8', label: 'Админ' },
};

function formatCurrency(amount) {
  return Number(amount).toLocaleString('ru-RU') + ' \u20BD';
}

function formatDate(dateStr) {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

const styles = {
  page: {},
  container: {},
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 24px 0',
    color: '#1B1F24',
  },
  searchWrap: {
    marginBottom: 24,
  },
  searchInput: {
    width: '100%',
    maxWidth: 420,
    padding: '10px 14px',
    fontSize: 15,
    border: '1px solid #E8EDF4',
    borderRadius: 10,
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    color: '#1B1F24',
    background: '#FFFFFF',
    boxSizing: 'border-box',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 0',
    color: '#6C7685',
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 0',
    color: '#6C7685',
    fontSize: 15,
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 14,
    border: '1px solid #E8EDF4',
    padding: '20px 24px',
    marginBottom: 14,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1B1F24',
    margin: 0,
  },
  email: {
    fontSize: 14,
    color: '#6C7685',
    margin: 0,
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  },
  info: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
    fontSize: 13,
    color: '#6C7685',
    marginBottom: 16,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 14,
    borderTop: '1px solid #E8EDF4',
  },
  select: {
    padding: '7px 12px',
    fontSize: 13,
    borderRadius: 8,
    border: '1px solid #E8EDF4',
    fontFamily: 'Inter, sans-serif',
    color: '#1B1F24',
    background: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
  },
  btn: {
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    lineHeight: '20px',
  },
  btnRole: {
    background: '#0067B8',
    color: '#FFFFFF',
    border: 'none',
  },
  btnRoleDisabled: {
    background: '#E8EDF4',
    color: '#6C7685',
    border: 'none',
    cursor: 'not-allowed',
  },
  btnBlock: {
    background: '#FFFFFF',
    color: '#DC2626',
    borderColor: '#DC2626',
  },
  btnUnblock: {
    background: '#FFFFFF',
    color: '#16A34A',
    borderColor: '#16A34A',
  },
  btnDisabled: {
    background: '#F8FAFD',
    color: '#6C7685',
    borderColor: '#E8EDF4',
    cursor: 'not-allowed',
  },
};

export default function AdminUsersPage() {
  const { client: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleSelections, setRoleSelections] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const currentUserId = currentUser?.client_id;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({ limit: 1000, offset: 0 });
      setUsers(data || []);
      const initial = {};
      (data || []).forEach((u) => {
        initial[u.client_id] = u.role;
      });
      setRoleSelections(initial);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleRoleSelect = (userId, newRole) => {
    setRoleSelections((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleChangeRole = async (userId) => {
    const selectedRole = roleSelections[userId];
    if (!selectedRole) return;
    setActionLoading((prev) => ({ ...prev, [`role_${userId}`]: true }));
    try {
      await adminApi.changeRole(userId, selectedRole);
      setUsers((prev) =>
        prev.map((u) => (u.client_id === userId ? { ...u, role: selectedRole } : u))
      );
    } catch (err) {
      console.error('Failed to change role:', err);
      // Revert selection on error
      setUsers((prev) => {
        const user = prev.find((u) => u.client_id === userId);
        if (user) {
          setRoleSelections((s) => ({ ...s, [userId]: user.role }));
        }
        return prev;
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [`role_${userId}`]: false }));
    }
  };

  const handleToggleBlock = async (user) => {
    const action = user.is_blocked ? 'разблокировать' : 'заблокировать';
    const confirmed = window.confirm(
      `Вы уверены, что хотите ${action} пользователя ${user.full_name}?`
    );
    if (!confirmed) return;

    setActionLoading((prev) => ({ ...prev, [`block_${user.client_id}`]: true }));
    try {
      if (user.is_blocked) {
        await adminApi.unblockUser(user.client_id);
      } else {
        await adminApi.blockUser(user.client_id);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.client_id === user.client_id ? { ...u, is_blocked: !u.is_blocked } : u
        )
      );
    } catch (err) {
      console.error('Failed to toggle block:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`block_${user.client_id}`]: false }));
    }
  };

  const isSelf = (userId) => userId === currentUserId;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Пользователи</h1>
          <p style={styles.loading}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Пользователи</h1>

        <div style={styles.searchWrap}>
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <p style={styles.empty}>
            {search.trim() ? 'Ничего не найдено' : 'Список пользователей пуст'}
          </p>
        ) : (
          filteredUsers.map((user) => {
            const rs = ROLE_STYLES[user.role] || ROLE_STYLES.client;
            const disabled = isSelf(user.client_id);
            const roleBusy = actionLoading[`role_${user.client_id}`];
            const blockBusy = actionLoading[`block_${user.client_id}`];

            return (
              <div key={user.client_id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.name}>{user.full_name}</span>
                  <span style={styles.email}>{user.email}</span>
                </div>

                <div style={styles.badges}>
                  <span
                    style={{
                      ...styles.badge,
                      background: rs.bg,
                      color: rs.color,
                    }}
                  >
                    {rs.label}
                  </span>

                  {user.is_blocked && (
                    <span
                      style={{
                        ...styles.badge,
                        background: 'rgba(220, 38, 38, 0.15)',
                        color: '#DC2626',
                      }}
                    >
                      Заблокирован
                    </span>
                  )}

                  {user.is_regular && (
                    <span
                      style={{
                        ...styles.badge,
                        background: 'rgba(22, 163, 74, 0.15)',
                        color: '#16A34A',
                      }}
                    >
                      Постоянный клиент
                    </span>
                  )}
                </div>

                <div style={styles.info}>
                  <span>Тел: {user.phone || '\u2014'}</span>
                  <span>Регистрация: {formatDate(user.reg_date)}</span>
                  <span>Покупки: {formatCurrency(user.total_purchases_amount || 0)}</span>
                </div>

                <div style={styles.actions}>
                  <select
                    value={roleSelections[user.client_id] || user.role}
                    onChange={(e) => handleRoleSelect(user.client_id, e.target.value)}
                    disabled={disabled}
                    style={{
                      ...styles.select,
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <option value="client">Клиент</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Админ</option>
                  </select>

                  <button
                    onClick={() => handleChangeRole(user.client_id)}
                    disabled={disabled || roleBusy}
                    style={{
                      ...styles.btn,
                      ...(disabled ? styles.btnRoleDisabled : styles.btnRole),
                      opacity: roleBusy ? 0.7 : 1,
                    }}
                  >
                    {roleBusy ? '...' : 'Сменить роль'}
                  </button>

                  {!user.is_blocked ? (
                    <button
                      onClick={() => handleToggleBlock(user)}
                      disabled={disabled || blockBusy}
                      style={{
                        ...styles.btn,
                        ...(disabled ? styles.btnDisabled : styles.btnBlock),
                        opacity: blockBusy ? 0.7 : 1,
                      }}
                    >
                      {blockBusy ? '...' : 'Заблокировать'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleBlock(user)}
                      disabled={disabled || blockBusy}
                      style={{
                        ...styles.btn,
                        ...(disabled ? styles.btnDisabled : styles.btnUnblock),
                        opacity: blockBusy ? 0.7 : 1,
                      }}
                    >
                      {blockBusy ? '...' : 'Разблокировать'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}