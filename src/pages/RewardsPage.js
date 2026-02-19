import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeroSection } from '../components/IslamicDecor';

export default function RewardsPage() {
  const { user } = useAuth();

  if (user.role === 'teacher') return <TeacherRewards />;
  return <StudentRewards />;
}

function StudentRewards() {
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [myPoints, setMyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('store');
  const [redeeming, setRedeeming] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/rewards'),
      api.get('/rewards/redemptions'),
      api.get('/points/my'),
    ])
      .then(([rewardsRes, redemptionsRes, pointsRes]) => {
        setRewards(rewardsRes.data);
        setRedemptions(redemptionsRes.data);
        setMyPoints(pointsRes.data.totalPoints);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    try {
      await api.post(`/rewards/${rewardId}/redeem`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setRedeeming(null);
    }
  };

  const statusLabels = { pending: 'قيد الانتظار', fulfilled: 'تم التسليم', cancelled: 'مرفوض' };
  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    fulfilled: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HeroSection
        title="متجر المكافآت"
        subtitle={`رصيدك: ${myPoints} نقطة`}
        icon={
          <svg className="w-14 h-14 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        }
      />

      {/* Tabs */}
      <div className="flex bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden mb-6 w-fit animate-fade-in">
        <button
          onClick={() => setTab('store')}
          className={`px-4 py-2 text-sm font-medium transition ${tab === 'store' ? 'gradient-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          المكافآت المتاحة
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 text-sm font-medium transition ${tab === 'history' ? 'gradient-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          سجل الاستبدالات
        </button>
      </div>

      {tab === 'store' ? (
        rewards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center animate-fade-in">
            <p className="text-gray-400 dark:text-gray-500">لا توجد مكافآت متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {rewards.map(reward => {
              const canAfford = myPoints >= reward.pointsCost;
              return (
                <div key={reward.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 card-animated card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{reward.name}</h3>
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">
                      {reward.pointsCost} نقطة
                    </span>
                  </div>
                  {reward.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{reward.description}</p>
                  )}
                  {reward.quantity !== -1 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">متبقي: {reward.quantity}</p>
                  )}
                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford || redeeming === reward.id}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                      canAfford
                        ? 'gradient-primary text-white btn-glow hover:opacity-90'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming === reward.id ? 'جاري...' : canAfford ? 'استبدال' : 'نقاط غير كافية'}
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        redemptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center animate-fade-in">
            <p className="text-gray-400 dark:text-gray-500">لم تقم بأي استبدال بعد</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in-up">
            {redemptions.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center justify-between card-hover">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{r.reward?.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(r.createdAt).toLocaleDateString('ar')} - {r.pointsCost} نقطة</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status]}`}>
                  {statusLabels[r.status]}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function TeacherRewards() {
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rewards');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', pointsCost: '', quantity: '-1' });
  const [editId, setEditId] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/rewards'),
      api.get('/rewards/redemptions'),
    ])
      .then(([rewardsRes, redemptionsRes]) => {
        setRewards(rewardsRes.data);
        setRedemptions(redemptionsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name: form.name, description: form.description, pointsCost: parseInt(form.pointsCost), quantity: parseInt(form.quantity) };
    try {
      if (editId) {
        await api.patch(`/rewards/${editId}`, data);
      } else {
        await api.post('/rewards', data);
      }
      setShowForm(false);
      setForm({ name: '', description: '', pointsCost: '', quantity: '-1' });
      setEditId(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleEdit = (reward) => {
    setForm({ name: reward.name, description: reward.description || '', pointsCost: String(reward.pointsCost), quantity: String(reward.quantity) });
    setEditId(reward.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد إلغاء تفعيل هذه المكافأة؟')) return;
    await api.delete(`/rewards/${id}`);
    loadData();
  };

  const handleRedemptionAction = async (id, status) => {
    await api.patch(`/rewards/redemptions/${id}`, { status });
    loadData();
  };

  const statusLabels = { pending: 'قيد الانتظار', fulfilled: 'تم التسليم', cancelled: 'مرفوض' };
  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    fulfilled: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  if (loading) return <LoadingSpinner />;

  const pendingCount = redemptions.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HeroSection
        title="إدارة المكافآت"
        subtitle="أنشئ مكافآت لتحفيز طلابك"
        icon={
          <svg className="w-14 h-14 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setTab('rewards')}
            className={`px-4 py-2 text-sm font-medium transition ${tab === 'rewards' ? 'gradient-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            المكافآت
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-2 text-sm font-medium transition relative ${tab === 'requests' ? 'gradient-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            الطلبات
            {pendingCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
        {tab === 'rewards' && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '', pointsCost: '', quantity: '-1' }); }}
            className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium btn-glow mr-auto"
          >
            + إضافة مكافأة
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 mb-6 animate-fade-in">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{editId ? 'تعديل المكافأة' : 'مكافأة جديدة'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="اسم المكافأة"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="الوصف (اختياري)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">النقاط المطلوبة</label>
                <input
                  type="number"
                  min="1"
                  value={form.pointsCost}
                  onChange={e => setForm({ ...form, pointsCost: e.target.value })}
                  required
                  className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">الكمية (-1 = لا محدود)</label>
                <input
                  type="number"
                  min="-1"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium btn-glow">
                {editId ? 'حفظ التعديلات' : 'إضافة'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'rewards' ? (
        rewards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center animate-fade-in">
            <p className="text-gray-400 dark:text-gray-500">لم تنشئ أي مكافآت بعد</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in-up">
            {rewards.map(reward => (
              <div key={reward.id} className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center justify-between card-hover ${!reward.isActive ? 'opacity-50' : ''}`}>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{reward.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {reward.pointsCost} نقطة
                    {reward.quantity !== -1 && ` · متبقي: ${reward.quantity}`}
                    {!reward.isActive && ' · غير مفعّلة'}
                  </p>
                </div>
                {reward.isActive && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(reward)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">تعديل</button>
                    <button onClick={() => handleDelete(reward.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline">إلغاء</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        redemptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center animate-fade-in">
            <p className="text-gray-400 dark:text-gray-500">لا توجد طلبات استبدال</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in-up">
            {redemptions.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{r.student?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{r.reward?.name} - {r.pointsCost} نقطة</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(r.createdAt).toLocaleDateString('ar')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleRedemptionAction(r.id, 'fulfilled')}
                          className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => handleRedemptionAction(r.id, 'cancelled')}
                          className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                        >
                          رفض
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
