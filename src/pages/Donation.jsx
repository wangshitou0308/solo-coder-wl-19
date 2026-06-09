import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Gift,
  Plus,
  Banknote,
  Package,
  TrendingUp,
  TrendingDown,
  X,
  Send,
  Search,
  Filter,
  Building2,
  HeartHandshake,
  PieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export default function Donation() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [donationType, setDonationType] = useState('money');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const [donateForm, setDonateForm] = useState({
    donorName: '', type: 'money', amount: '', itemName: '', quantity: '', unit: '', purpose: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: '医疗', description: '', amount: '',
  });

  const totalDonations = useMemo(() => state.donations.reduce((acc, d) => {
    if (d.type === 'money') return acc + d.amount;
    return acc;
  }, 0), [state.donations]);

  const totalGoodsValue = state.donations
    .filter(d => d.type === 'goods')
    .reduce((acc, d) => acc + d.quantity, 0);

  const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  const balance = totalDonations - totalExpenses;

  const filteredDonations = useMemo(() => {
    return state.donations.filter(d => filter === 'all' || d.type === filter);
  }, [state.donations, filter]);

  // 月度收支数据
  const monthlyData = useMemo(() => {
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
    return months.map(m => {
      const [y, month] = m.split('-').map(Number);
      const income = state.donations.filter(d => {
        if (d.type !== 'money') return false;
        const dt = new Date(d.date);
        return dt.getFullYear() === y && dt.getMonth() + 1 === month;
      }).reduce((acc, d) => acc + d.amount, 0);
      const expense = state.expenses.filter(e => {
        const dt = new Date(e.date);
        return dt.getFullYear() === y && dt.getMonth() + 1 === month;
      }).reduce((acc, e) => acc + e.amount, 0);
      return { month: `${month}月`, 收入: income, 支出: expense };
    });
  }, [state.donations, state.expenses]);

  // 支出分类数据
  const expenseByCat = useMemo(() => {
    const cats = ['医疗', '口粮', '疫苗', '用品', '设施', '其他'];
    return cats.map(c => ({
      name: c,
      金额: state.expenses.filter(e => e.category === c).reduce((acc, e) => acc + e.amount, 0),
    })).filter(c => c.金额 > 0);
  }, [state.expenses]);

  // 按用途分类捐赠
  const purposeStats = useMemo(() => {
    const map = {};
    state.donations.forEach(d => {
      const p = d.purpose || '通用基金';
      if (!map[p]) map[p] = { money: 0, goods: 0 };
      if (d.type === 'money') map[p].money += d.amount;
      else map[p].goods += d.quantity;
    });
    return Object.entries(map).map(([k, v]) => ({ purpose: k, ...v })).slice(0, 6);
  }, [state.donations]);

  const handleDonate = () => {
    if (!donateForm.donorName || !donateForm.purpose) {
      alert('请填写完整信息');
      return;
    }
    if (donateForm.type === 'money' && !donateForm.amount) {
      alert('请填写捐款金额');
      return;
    }
    if (donateForm.type === 'goods' && (!donateForm.itemName || !donateForm.quantity)) {
      alert('请填写物资名称和数量');
      return;
    }
    dispatch({
      type: 'ADD_DONATION',
      payload: {
        donorName: donateForm.donorName,
        type: donateForm.type,
        amount: donateForm.type === 'money' ? parseFloat(donateForm.amount) : 0,
        itemName: donateForm.itemName,
        quantity: donateForm.type === 'goods' ? parseFloat(donateForm.quantity) : 0,
        unit: donateForm.unit,
        purpose: donateForm.purpose,
      },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'task', message: `收到${donateForm.donorName}的捐赠` },
    });
    setShowDonateModal(false);
    setDonateForm({ donorName: '', type: 'money', amount: '', itemName: '', quantity: '', unit: '', purpose: '' });
  };

  const handleExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      alert('请填写完整信息');
      return;
    }
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        category: expenseForm.category,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
      },
    });
    setShowExpenseModal(false);
    setExpenseForm({ category: '医疗', description: '', amount: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary-500" />
            捐赠管理 & 财务公开
          </h1>
          <p className="text-sm text-gray-500 mt-1">接收捐款与物资捐赠，定期公示收支明细，确保资金透明</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={() => setShowExpenseModal(true)}>
            <TrendingDown className="w-4 h-4" /> 登记支出
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowDonateModal(true)}>
            <Plus className="w-4 h-4" /> 登记捐赠
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card !p-5 bg-gradient-to-br from-green-50 to-white border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">累计捐款收入</div>
              <div className="text-3xl font-bold text-green-600 mt-2">¥{totalDonations.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Banknote className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card !p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">累计物资捐赠</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{totalGoodsValue} <span className="text-lg font-normal">件</span></div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card !p-5 bg-gradient-to-br from-red-50 to-white border-red-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">累计支出</div>
              <div className="text-3xl font-bold text-red-600 mt-2">¥{totalExpenses.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className={`card !p-5 bg-gradient-to-br ${balance >= 0 ? 'from-primary-50 to-white border-primary-100' : 'from-warm-50 to-white border-warm-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">当前结余</div>
              <div className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-primary-600' : 'text-warm-600'}`}>
                ¥{balance.toLocaleString()}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-primary-100' : 'bg-warm-100'}`}>
              <PieChart className={`w-6 h-6 ${balance >= 0 ? 'text-primary-600' : 'text-warm-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-2">
          {[
            { key: 'overview', label: '财务概览', icon: PieChart },
            { key: 'donations', label: '捐赠明细', icon: Gift },
            { key: 'expenses', label: '支出明细', icon: TrendingDown },
            { key: 'public', label: '收支公示', icon: Building2 },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-5 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === t.key ? 'text-primary-600 border-primary-600 bg-primary-50/50' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">月度收支趋势</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="收入" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="支出" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">支出分类统计</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={expenseByCat}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="金额" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">捐赠用途分布</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {purposeStats.map((p, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <HeartHandshake className="w-4 h-4 text-primary-500" />
                        <span className="font-medium text-sm">{p.purpose}</span>
                      </div>
                      <div className="text-xs text-gray-500">捐款</div>
                      <div className="text-lg font-bold text-primary-600">¥{p.money.toLocaleString()}</div>
                      {p.goods > 0 && (
                        <>
                          <div className="text-xs text-gray-500 mt-1">物资</div>
                          <div className="text-lg font-bold text-blue-600">{p.goods} 件</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-36">
                  <option value="all">全部类型</option>
                  <option value="money">捐款</option>
                  <option value="goods">物资</option>
                </select>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-10" placeholder="搜索捐赠人、用途..." />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">日期</th>
                      <th className="px-4 py-3 text-left font-medium">类型</th>
                      <th className="px-4 py-3 text-left font-medium">捐赠人</th>
                      <th className="px-4 py-3 text-left font-medium">明细</th>
                      <th className="px-4 py-3 text-left font-medium">用途</th>
                      <th className="px-4 py-3 text-left font-medium">金额/数量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredDonations.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{d.date}</td>
                        <td className="px-4 py-3">
                          <span className={`status-badge ${d.type === 'money' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} flex items-center gap-1 inline-flex`}>
                            {d.type === 'money' ? <Banknote className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                            {d.type === 'money' ? '捐款' : '物资'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{d.donorName}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {d.type === 'money' ? '现金/转账' : `${d.itemName} × ${d.quantity}${d.unit || ''}`}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.purpose}</td>
                        <td className="px-4 py-3">
                          {d.type === 'money'
                            ? <span className="font-semibold text-green-600">¥{d.amount.toLocaleString()}</span>
                            : <span className="font-semibold text-blue-600">{d.quantity} {d.unit || '件'}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">日期</th>
                    <th className="px-4 py-3 text-left font-medium">分类</th>
                    <th className="px-4 py-3 text-left font-medium">支出说明</th>
                    <th className="px-4 py-3 text-right font-medium">金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {state.expenses.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{e.date}</td>
                      <td className="px-4 py-3">
                        <span className="status-badge bg-warm-100 text-warm-700">{e.category}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{e.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">-¥{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">合计支出：</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 text-lg">-¥{totalExpenses.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {activeTab === 'public' && (
            <div className="space-y-6">
              <div className="p-5 bg-primary-50 rounded-xl border border-primary-100">
                <h4 className="font-semibold text-primary-800 flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5" />
                  2026年6月收支公示（公开可查）
                </h4>
                <p className="text-sm text-primary-700">
                  本公示每月定期更新，所有捐款与支出均接受社会监督。如需查阅详细凭证，可联系救助站申请。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card !p-5 text-center">
                  <div className="text-sm text-gray-500">本月捐款</div>
                  <div className="text-3xl font-bold text-green-600 mt-2">¥{(totalDonations * 0.35).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">同比 +28%</div>
                </div>
                <div className="card !p-5 text-center">
                  <div className="text-sm text-gray-500">本月支出</div>
                  <div className="text-3xl font-bold text-red-600 mt-2">¥{(totalExpenses * 0.4).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">同比 -12%</div>
                </div>
                <div className="card !p-5 text-center">
                  <div className="text-sm text-gray-500">本月物资</div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">42 <span className="text-lg">件</span></div>
                  <div className="text-xs text-gray-400 mt-1">价值 ¥8,500</div>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 font-medium border-b">📢 重大收支事项公示</div>
                <div className="divide-y">
                  {[
                    { t: '收入', text: '收到匿名爱心人士大额捐赠 ¥10,000 元，用于救助站设施升级', date: '2026-06-01', type: 'in' },
                    { t: '支出', text: '支付围栏维修费用 ¥3,000 元，消除安全隐患', date: '2026-06-02', type: 'out' },
                    { t: '支出', text: '6月份常规药品采购 ¥2,500 元', date: '2026-06-05', type: 'out' },
                    { t: '收入', text: '收到宠物之家商城捐赠犬粮 50 袋（价值 ¥5,000）', date: '2026-06-07', type: 'in' },
                    { t: '收入', text: '孙女士定向捐赠 ¥500 元用于动物A003治疗', date: '2026-06-06', type: 'in' },
                  ].map((item, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                      <span className={`status-badge flex-shrink-0 ${item.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.type === 'in' ? '收入' : '支出'}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">{item.text}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDonateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg">登记捐赠</h3>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => setShowDonateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                {[
                  { k: 'money', label: '捐款', icon: Banknote },
                  { k: 'goods', label: '物资', icon: Package },
                ].map(opt => {
                  const Icon = opt.icon;
                  const active = donateForm.type === opt.k;
                  return (
                    <button key={opt.k} type="button" onClick={() => { setDonateForm(p => ({ ...p, type: opt.k })); setDonationType(opt.k); }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${active ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                      <Icon className={`w-8 h-8 mx-auto mb-1 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                      <div className={`font-medium ${active ? 'text-primary-700' : 'text-gray-600'}`}>{opt.label}</div>
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="label-field">捐赠人/单位 <span className="text-red-500">*</span></label>
                <input className="input-field" value={donateForm.donorName} onChange={e => setDonateForm(p => ({ ...p, donorName: e.target.value }))} placeholder="可匿名" />
              </div>
              {donateForm.type === 'money' ? (
                <div>
                  <label className="label-field">捐赠金额（元） <span className="text-red-500">*</span></label>
                  <input type="number" className="input-field" value={donateForm.amount} onChange={e => setDonateForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 200, 500, 1000].map(v => (
                      <button key={v} type="button" className="flex-1 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-colors" onClick={() => setDonateForm(p => ({ ...p, amount: String(v) }))}>
                        ¥{v}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="label-field">物资名称 <span className="text-red-500">*</span></label>
                    <input className="input-field" value={donateForm.itemName} onChange={e => setDonateForm(p => ({ ...p, itemName: e.target.value }))} placeholder="如：犬粮、猫砂、驱虫药..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-field">数量 <span className="text-red-500">*</span></label>
                      <input type="number" className="input-field" value={donateForm.quantity} onChange={e => setDonateForm(p => ({ ...p, quantity: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-field">单位</label>
                      <input className="input-field" value={donateForm.unit} onChange={e => setDonateForm(p => ({ ...p, unit: e.target.value }))} placeholder="袋/盒/个" />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="label-field">指定用途 <span className="text-red-500">*</span></label>
                <select className="input-field" value={donateForm.purpose} onChange={e => setDonateForm(p => ({ ...p, purpose: e.target.value }))}>
                  <option value="">请选择或填写</option>
                  <option value="流浪动物医疗基金">流浪动物医疗基金</option>
                  <option value="日常口粮供应">日常口粮供应</option>
                  <option value="救助站设施升级">救助站设施升级</option>
                  <option value="常规驱虫使用">常规驱虫疫苗</option>
                  <option value="志愿者补贴">志愿者补贴</option>
                  <option value="通用基金">通用基金</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowDonateModal(false)}>取消</button>
              <button className="btn-primary flex items-center gap-1" onClick={handleDonate}><Send className="w-4 h-4" /> 确认登记</button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowExpenseModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg">登记支出</h3>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => setShowExpenseModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-field">支出分类</label>
                <select className="input-field" value={expenseForm.category} onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))}>
                  <option>医疗</option><option>口粮</option><option>疫苗</option>
                  <option>用品</option><option>设施</option><option>其他</option>
                </select>
              </div>
              <div>
                <label className="label-field">支出说明 <span className="text-red-500">*</span></label>
                <input className="input-field" value={expenseForm.description} onChange={e => setExpenseForm(p => ({ ...p, description: e.target.value }))} placeholder="详细说明用途..." />
              </div>
              <div>
                <label className="label-field">金额（元） <span className="text-red-500">*</span></label>
                <input type="number" className="input-field" value={expenseForm.amount} onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowExpenseModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleExpense}>登记支出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
