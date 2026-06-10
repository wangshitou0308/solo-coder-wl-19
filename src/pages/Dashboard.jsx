import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { animalStatuses } from '../data/mockData';
import {
  PawPrint,
  MapPin,
  HeartHandshake,
  Users,
  TrendingUp,
  Activity,
  Syringe,
  Pill,
  Stethoscope,
  Scissors,
  Clock,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { healthEventTypes } from '../data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState('all');

  const getStationName = (id) => state.stations.find(s => s.id === id)?.name || '未知';

  const stats = useMemo(() => {
    const animals = selectedStation === 'all'
      ? state.animals
      : state.animals.filter(a => a.stationId === selectedStation);

    const now = new Date('2026-06-09');
    const monthStart = new Date('2026-06-01');

    const thisMonthRescued = animals.filter(a => {
      const d = new Date(a.rescueDate);
      return d >= monthStart && d <= now;
    }).length;

    const thisMonthAdopted = state.adoptions.filter(a => {
      if (a.status !== 'completed') return false;
      if (selectedStation !== 'all') {
        const animal = state.animals.find(x => x.id === a.animalId);
        if (!animal || animal.stationId !== selectedStation) return false;
      }
      const d = new Date(a.signedDate);
      return d >= monthStart && d <= now;
    }).length;

    const inShelter = animals.filter(a =>
      ['sheltering', 'treating', 'recovering', 'adoptable'].includes(a.status)
    ).length;

    const sterilizedCount = animals.filter(a => a.sterilized).length;
    const sterilizationRate = animals.length > 0
      ? Math.round((sterilizedCount / animals.length) * 100) : 0;

    const vaccinatedCount = animals.filter(a =>
      a.vaccinations.some(v => v.name.includes('狂犬') || v.name.includes('联'))
    ).length;
    const vaccinationRate = animals.length > 0
      ? Math.round((vaccinatedCount / animals.length) * 100) : 0;

    const adoptedAnimals = state.animals.filter(a => {
      if (selectedStation !== 'all' && a.stationId !== selectedStation) return false;
      return ['adopted', 'followup', 'archived'].includes(a.status);
    });

    let totalDays = 0;
    let count = 0;
    adoptedAnimals.forEach(a => {
      if (a.rescueDate && a.adoptionDate) {
        const rd = new Date(a.rescueDate);
        const ad = new Date(a.adoptionDate);
        const days = Math.round((ad - rd) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          totalDays += days;
          count++;
        }
      }
    });
    const avgTurnover = count > 0 ? Math.round(totalDays / count) : 0;

    const overdueFollowups = state.adoptions.reduce((acc, a) =>
      acc + a.followups.filter(f => f.status === 'overdue').length, 0);

    const pendingClues = state.clues.filter(c => c.status === 'pending').length;
    const pendingAdoptions = state.adoptions.filter(a => a.status === 'reviewing').length;

    return {
      thisMonthRescued,
      thisMonthAdopted,
      inShelter,
      sterilizationRate,
      vaccinationRate,
      avgTurnover,
      overdueFollowups,
      pendingClues,
      pendingAdoptions,
    };
  }, [state, selectedStation]);

  const statusDist = useMemo(() => {
    const animals = selectedStation === 'all'
      ? state.animals
      : state.animals.filter(a => a.stationId === selectedStation);

    return animalStatuses.map(s => ({
      name: s.label,
      value: animals.filter(a => a.status === s.key).length,
      color: s.color,
    })).filter(d => d.value > 0);
  }, [state, selectedStation]);

  const stationData = useMemo(() => {
    return state.stations.map(s => {
      const animals = state.animals.filter(a => a.stationId === s.id);
      return {
        name: s.name.length > 6 ? s.name.slice(0, 6) + '...' : s.name,
        fullName: s.name,
        救助: animals.length,
        待领养: animals.filter(a => a.status === 'adoptable').length,
        已领养: animals.filter(a => ['adopted', 'followup', 'archived'].includes(a.status)).length,
      };
    });
  }, [state]);

  const monthlyTrend = useMemo(() => {
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
    return months.map(m => {
      const [year, month] = m.split('-').map(Number);
      const rescued = state.animals.filter(a => {
        if (selectedStation !== 'all' && a.stationId !== selectedStation) return false;
        const d = new Date(a.rescueDate);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }).length;
      const adopted = state.adoptions.filter(a => {
        if (a.status !== 'completed') return false;
        if (selectedStation !== 'all') {
          const animal = state.animals.find(x => x.id === a.animalId);
          if (!animal || animal.stationId !== selectedStation) return false;
        }
        const d = new Date(a.signedDate);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }).length;
      return {
        month: `${month}月`,
        救助数: rescued,
        领养数: adopted,
      };
    });
  }, [state, selectedStation]);

  const speciesDist = useMemo(() => {
    const animals = selectedStation === 'all'
      ? state.animals
      : state.animals.filter(a => a.stationId === selectedStation);
    const dogs = animals.filter(a => a.species === '犬').length;
    const cats = animals.filter(a => a.species === '猫').length;
    const others = animals.length - dogs - cats;
    const arr = [];
    if (dogs > 0) arr.push({ name: '犬类', value: dogs, color: '#3b82f6' });
    if (cats > 0) arr.push({ name: '猫类', value: cats, color: '#f59e0b' });
    if (others > 0) arr.push({ name: '其他', value: others, color: '#6b7280' });
    return arr;
  }, [state, selectedStation]);

  const upcomingHealthEvents = useMemo(() => {
    const today = new Date('2026-06-10');
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const animals = selectedStation === 'all'
      ? state.animals
      : state.animals.filter(a => a.stationId === selectedStation);
    const events = [];
    animals.forEach(animal => {
      (animal.healthEvents || []).forEach(event => {
        if (!event.nextDate) return;
        const next = new Date(event.nextDate);
        if (next <= in30Days) {
          events.push({
            ...event,
            animalId: animal.id,
            animalName: animal.name,
            animalPhoto: animal.photo,
            daysLeft: Math.ceil((next - today) / (24 * 60 * 60 * 1000)),
            isOverdue: next < today,
          });
        }
      });
    });
    return events.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [state, selectedStation]);

  const recentAdoptions = state.adoptions.slice(0, 5);
  const recentClues = state.clues.slice(0, 5);

  const iconMap = { Syringe, Pill, Scissors, Stethoscope, Activity };
  const colorMap = {
    primary: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
  };

  const PIE_COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#6366f1', '#6b7280'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">运营数据仪表盘</h1>
          <p className="text-sm text-gray-500 mt-1">救助与领养全链路运营概览 · 数据截至 {new Date().toLocaleDateString('zh-CN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">救助站筛选：</label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">全部救助站</option>
            {state.stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">本月救助数</div>
              <div className="text-3xl font-bold text-gray-800 mt-2">{stats.thisMonthRescued}</div>
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />较上月 +12%
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card !p-5 bg-gradient-to-br from-green-50 to-white border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">本月领养完成数</div>
              <div className="text-3xl font-bold text-gray-800 mt-2">{stats.thisMonthAdopted}</div>
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />领养率 68%
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card !p-5 bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">在站收容数</div>
              <div className="text-3xl font-bold text-gray-800 mt-2">{stats.inShelter}</div>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Activity className="w-3 h-3" />容量使用率 62%
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card !p-5 bg-gradient-to-br from-warm-50 to-white border-warm-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">平均周转天数</div>
              <div className="text-3xl font-bold text-gray-800 mt-2">{stats.avgTurnover} <span className="text-lg font-normal">天</span></div>
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />较上月 -8天
              </div>
            </div>
            <div className="w-12 h-12 bg-warm-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-warm-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingClues > 0 || stats.pendingAdoptions > 0 || stats.overdueFollowups > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.pendingClues > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-red-100/50 transition-colors" onClick={() => navigate('/clues')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-red-800">{stats.pendingClues} 条待分配线索</div>
                  <div className="text-xs text-red-600">请及时处理</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </div>
          )}
          {stats.pendingAdoptions > 0 && (
            <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-warm-100/50 transition-colors" onClick={() => navigate('/adoptions')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warm-100 rounded-lg flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-warm-600" />
                </div>
                <div>
                  <div className="font-medium text-warm-800">{stats.pendingAdoptions} 个领养申请待审核</div>
                  <div className="text-xs text-warm-600">请尽快安排回访</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-warm-400" />
            </div>
          )}
          {stats.overdueFollowups > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-indigo-100/50 transition-colors" onClick={() => navigate('/adoptions')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-indigo-800">{stats.overdueFollowups} 个回访超期</div>
                  <div className="text-xs text-indigo-600">需人工跟进</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-400" />
            </div>
          )}
        </div>
      )}

      {/* Health Events Reminder */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" /> 健康事项到期提醒
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">未来30天内到期的疫苗、体检、驱虫等事项</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" /> 已超期 {upcomingHealthEvents.filter(e => e.isOverdue).length}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-warm-500" /> 即将到期 {upcomingHealthEvents.filter(e => !e.isOverdue).length}
            </span>
          </div>
        </div>
        {upcomingHealthEvents.length === 0 ? (
          <div className="p-8 bg-green-50 rounded-xl text-center">
            <Syringe className="w-10 h-10 text-green-400 mx-auto" />
            <div className="text-green-700 font-medium mt-2">暂无即将到期的健康事项</div>
            <div className="text-xs text-green-600 mt-1">所有动物健康状况良好</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {upcomingHealthEvents.map((event) => {
              const cfg = healthEventTypes.find(t => t.key === event.type) || healthEventTypes[0];
              const Icon = iconMap[cfg.icon] || Activity;
              const cm = colorMap[cfg.color] || colorMap.primary;
              return (
                <div
                  key={`${event.animalId}-${event.id}`}
                  className={`${cm.bg} ${cm.border} border rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer`}
                  onClick={() => navigate(`/animals/${event.animalId}`)}
                >
                  <img src={event.animalPhoto} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className={`w-9 h-9 ${cm.bg} ${cm.border} border rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${cm.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 truncate">{event.animalName}</span>
                      <span className={`status-badge ${event.isOverdue ? 'bg-red-100 text-red-700' : 'bg-warm-100 text-warm-700'} text-xs`}>
                        {event.isOverdue ? `已超期 ${Math.abs(event.daysLeft)} 天` : `还剩 ${event.daysLeft} 天`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{event.name} · 到期日 {event.nextDate}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">绝育率</h3>
            <Syringe className="w-5 h-5 text-pink-500" />
          </div>
          <div className="text-4xl font-bold text-gray-800">{stats.sterilizationRate}%</div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${stats.sterilizationRate}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-2">建议目标 ≥ 85%</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">疫苗覆盖率</h3>
            <Syringe className="w-5 h-5 text-primary-500" />
          </div>
          <div className="text-4xl font-bold text-gray-800">{stats.vaccinationRate}%</div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${stats.vaccinationRate}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-2">核心疫苗接种覆盖</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">志愿者规模</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-4xl font-bold text-gray-800">{state.volunteers.length}</div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <div>活跃 {state.volunteers.filter(v => v.status === 'active').length}</div>
            <span className="text-gray-300">|</span>
            <div>本月任务 {state.tasks.filter(t => t.status !== 'open').length}</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">人均评分 {(state.volunteers.reduce((a, v) => a + v.rating, 0) / state.volunteers.length).toFixed(1)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">月度救助/领养趋势</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="救助数" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="领养数" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">各救助站运营对比</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="救助" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="待领养" fill="#86efac" radius={[4, 4, 0, 0]} />
              <Bar dataKey="已领养" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">动物状态分布</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusDist}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {statusDist.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">物种分布</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={speciesDist}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                label={({ name, value, percent }) => `${name} ${value}只 (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {speciesDist.map((_, idx) => (
                  <Cell key={idx} fill={speciesDist[idx]?.color || PIE_COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">最近领养记录</h3>
            <button className="text-sm text-primary-600 hover:underline" onClick={() => navigate('/adoptions')}>查看全部 →</button>
          </div>
          <div className="space-y-3">
            {recentAdoptions.map((ad) => {
              const animal = state.animals.find(a => a.id === ad.animalId);
              const statusMap = {
                reviewing: { label: '审核中', color: 'bg-warm-100 text-warm-700' },
                completed: { label: '已完成', color: 'bg-primary-100 text-primary-700' },
              };
              const st = statusMap[ad.status] || { label: ad.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={ad.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => navigate(`/adoptions/${ad.id}`)}>
                  {animal && <img src={animal.photo} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800">{ad.animalName} → {ad.applicantName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{ad.applyTime} 申请</div>
                  </div>
                  <span className={`status-badge ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">最新救助线索</h3>
            <button className="text-sm text-primary-600 hover:underline" onClick={() => navigate('/clues')}>查看全部 →</button>
          </div>
          <div className="space-y-3">
            {recentClues.map((c) => {
              const statusMap = {
                pending: { label: '待分配', color: 'bg-red-100 text-red-700' },
                assigned: { label: '已分配', color: 'bg-blue-100 text-blue-700' },
                rescued: { label: '已救援', color: 'bg-primary-100 text-primary-700' },
              };
              const st = statusMap[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={c.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/clues')}>
                  <img src={c.photo} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{c.location}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.species} · {c.reporterName} · {c.reportTime}</div>
                  </div>
                  <span className={`status-badge ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
