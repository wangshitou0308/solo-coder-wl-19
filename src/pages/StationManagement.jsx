import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Building2,
  Phone,
  MapPin,
  Users,
  PawPrint,
  HeartHandshake,
  Activity,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function StationManagement() {
  const { state } = useApp();

  const stationStats = useMemo(() => {
    return state.stations.map(s => {
      const animals = state.animals.filter(a => a.stationId === s.id);
      const inShelter = animals.filter(a => ['sheltering', 'treating', 'recovering', 'adoptable'].includes(a.status)).length;
      const adopted = animals.filter(a => ['adopted', 'followup', 'archived'].includes(a.status)).length;
      const sterilized = animals.filter(a => a.sterilized).length;
      const vaccinated = animals.filter(a => a.vaccinations.length > 0).length;

      let turnover = 0;
      let count = 0;
      animals.filter(a => a.adoptionDate).forEach(a => {
        const rd = new Date(a.rescueDate);
        const ad = new Date(a.adoptionDate);
        const days = Math.round((ad - rd) / 86400000);
        if (days > 0) { turnover += days; count++; }
      });

      const tasks = state.tasks.filter(t => t.stationId === s.id).length;

      return {
        ...s,
        totalAnimals: animals.length,
        inShelter,
        adopted,
        adoptionRate: animals.length > 0 ? Math.round((adopted / (adopted + inShelter || 1)) * 100) : 0,
        sterilizationRate: animals.length > 0 ? Math.round((sterilized / animals.length) * 100) : 0,
        vaccinationRate: animals.length > 0 ? Math.round((vaccinated / animals.length) * 100) : 0,
        avgTurnover: count > 0 ? Math.round(turnover / count) : 0,
        tasks,
      };
    });
  }, [state]);

  const capacityData = stationStats.map(s => ({
    name: s.name.length > 6 ? s.name.slice(0, 6) + '...' : s.name,
    收容: s.inShelter,
    已领养: s.adopted,
  }));

  const pieData = stationStats.slice(0, 5).map(s => ({
    name: s.name.length > 6 ? s.name.slice(0, 6) + '...' : s.name,
    value: s.totalAnimals,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-primary-500" />
          救助站管理
        </h1>
        <p className="text-sm text-gray-500 mt-1">查看各救助站运营数据与能力评估</p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card !p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">救助站总数</div>
              <div className="text-3xl font-bold text-gray-800 mt-2">{state.stations.length}</div>
            </div>
            <Building2 className="w-10 h-10 text-primary-200" />
          </div>
        </div>
        <div className="card !p-5 bg-green-50 border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">总收容能力</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stationStats.reduce((acc, s) => acc + s.inShelter, 0)}</div>
            </div>
            <PawPrint className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="card !p-5 bg-purple-50 border-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">志愿者总数</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">{stationStats.reduce((acc, s) => acc + s.volunteers, 0)}</div>
            </div>
            <Users className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        <div className="card !p-5 bg-warm-50 border-warm-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">平均领养率</div>
              <div className="text-3xl font-bold text-warm-600 mt-2">
                {Math.round(stationStats.reduce((acc, s) => acc + s.adoptionRate, 0) / stationStats.length)}%
              </div>
            </div>
            <HeartHandshake className="w-10 h-10 text-warm-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">各站收容/领养对比</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="收容" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="已领养" fill="#86efac" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">动物分布占比</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                label={({ name, value }) => `${name}:${value}只`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Station Cards */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">各站运营详情</h3>
        <div className="space-y-4">
          {stationStats.map((s) => (
            <div key={s.id} className="card !p-0 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                <div className="w-1.5 flex-shrink-0 bg-gradient-to-b from-primary-400 to-primary-600" />
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-bold text-gray-800">{s.name}</h4>
                        <span className="text-xs text-gray-400">#{s.id}</span>
                        <span className="status-badge bg-primary-100 text-primary-700 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> 认证救助站
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {s.address}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {s.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-500">志愿者</div>
                        <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                          <Users className="w-5 h-5" />{s.volunteers}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">运营任务</div>
                        <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                          <Activity className="w-5 h-5" />{s.tasks}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPI */}
                  <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard label="在站收容" value={s.inShelter} unit="只" icon={PawPrint} color="blue" />
                    <KpiCard label="累计领养" value={s.adopted} unit="只" icon={HeartHandshake} color="green" />
                    <KpiCard label="领养率" value={s.adoptionRate} unit="%" icon={TrendingUp} color="warm" highlight={s.adoptionRate >= 60} />
                    <KpiCard label="平均周转" value={s.avgTurnover || '—'} unit="天" icon={Clock} color="purple" highlight={s.avgTurnover > 0 && s.avgTurnover <= 60} />
                  </div>

                  {/* Rates */}
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">绝育覆盖率</span>
                        <span className="text-sm font-bold text-pink-600">{s.sterilizationRate}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.sterilizationRate >= 85 ? 'bg-green-500' : s.sterilizationRate >= 60 ? 'bg-warm-500' : 'bg-red-500'}`}
                          style={{ width: `${s.sterilizationRate}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {s.sterilizationRate >= 85 ? '达标' : s.sterilizationRate >= 60 ? '建议提升' : '需重点关注'}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">疫苗覆盖率</span>
                        <span className="text-sm font-bold text-primary-600">{s.vaccinationRate}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.vaccinationRate >= 90 ? 'bg-green-500' : s.vaccinationRate >= 70 ? 'bg-primary-500' : 'bg-warm-500'}`}
                          style={{ width: `${s.vaccinationRate}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {s.vaccinationRate >= 90 ? '优秀' : s.vaccinationRate >= 70 ? '良好' : '需加强接种'}
                      </div>
                    </div>
                  </div>

                  {/* Ranking Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-500">综合评价：</span>
                    {s.adoptionRate >= 60 && s.sterilizationRate >= 80 && s.vaccinationRate >= 85 ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">⭐ 优秀救助站</span>
                    ) : s.adoptionRate >= 40 ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">✓ 良好救助站</span>
                    ) : (
                      <span className="px-3 py-1 bg-warm-100 text-warm-700 rounded-full font-medium">⏱ 运营提升中</span>
                    )}
                    {s.avgTurnover > 0 && s.avgTurnover <= 60 && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">🚀 高效周转</span>
                    )}
                    {s.volunteers >= 30 && (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">👥 志愿者之家</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, unit, icon: Icon, color, highlight }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    warm: 'bg-warm-50 text-warm-600 border-warm-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  const classes = colorMap[color].split(' ');
  return (
    <div className={`p-4 rounded-xl border ${classes.slice(2).join(' ')} ${highlight ? 'ring-2 ring-offset-2 ring-green-200' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className={`text-2xl font-bold mt-1 flex items-baseline gap-1 ${classes[1]}`}>
            {value}
            <span className="text-sm font-normal opacity-75">{unit}</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${classes[0]}`}>
          <Icon className={`w-5 h-5 ${classes[1]}`} />
        </div>
      </div>
    </div>
  );
}
