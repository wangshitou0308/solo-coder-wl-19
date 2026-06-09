import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { volunteerDirections } from '../data/mockData';
import {
  Users,
  Search,
  Star,
  ClipboardList,
  Plus,
  Award,
  TrendingUp,
  UserCheck,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react';

export default function VolunteerList() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return state.volunteers.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (directionFilter !== 'all') {
        const dir = volunteerDirections.find(d => d.key === directionFilter);
        if (!dir || !v.directions.some(x => x.includes(dir.label.slice(0, 2)) || (x === '运输' && dir.key === 'transport') || (x === '现场协助' && dir.key === 'onsite') || (x === '临时寄养' && dir.key === 'foster') || (x === '审核' && dir.key === 'review') || (x === '文案' && dir.key === 'copywriting'))) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        if (!v.name.toLowerCase().includes(s) && !v.phone.includes(s) && !v.email.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [state.volunteers, search, directionFilter, statusFilter]);

  const stats = {
    total: state.volunteers.length,
    active: state.volunteers.filter(v => v.status === 'active').length,
    pending: state.volunteers.filter(v => v.status === 'pending').length,
    totalTasks: state.volunteers.reduce((acc, v) => acc + v.tasksCompleted, 0),
    avgRating: (state.volunteers.filter(v => v.status === 'active').reduce((acc, v) => acc + v.rating, 0) / Math.max(1, state.volunteers.filter(v => v.status === 'active').length)).toFixed(1),
  };

  const openTasks = state.tasks.filter(t => t.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">志愿者管理</h1>
          <p className="text-sm text-gray-500 mt-1">志愿者注册审核、能力标签与贡献记录</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={() => navigate('/tasks')}>
            <ClipboardList className="w-4 h-4" /> 任务中心 <span className="bg-warm-100 text-warm-700 px-2 rounded-full text-xs font-medium">{openTasks}</span>
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/volunteers/register')}>
            <Plus className="w-4 h-4" /> 志愿者注册
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="注册志愿者" value={stats.total} color="blue" />
        <StatCard icon={UserCheck} label="活跃志愿者" value={stats.active} color="green" />
        <StatCard icon={ClipboardList} label="待资质审核" value={stats.pending} color="warm" />
        <StatCard icon={ClipboardList} label="累计完成任务" value={stats.totalTasks} color="purple" />
      </div>

      <div className="card !p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索姓名、电话、邮箱..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={directionFilter} onChange={e => setDirectionFilter(e.target.value)} className="input-field w-40">
            <option value="all">全部参与方向</option>
            {volunteerDirections.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-32">
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => {
          const tasksThisMonth = Math.round(v.tasksCompleted * 0.15);
          const isPending = v.status === 'pending';
          return (
            <div key={v.id} className={`card !p-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${isPending ? 'ring-2 ring-warm-200' : ''}`}>
              <div className={`h-2 ${isPending ? 'bg-gradient-to-r from-warm-400 to-warm-600' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 ${isPending ? 'bg-gradient-to-br from-warm-400 to-warm-600' : 'bg-gradient-to-br from-primary-400 to-primary-600'} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {v.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-gray-800">{v.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {isPending ? '提交申请：' : '自 '}{v.joinDate}{isPending ? '' : ' 加入'}
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${
                    isPending ? 'bg-warm-100 text-warm-700' :
                    v.status === 'active' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {isPending ? '待审核' : v.status === 'active' ? '活跃' : '非活跃'}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{v.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{v.email}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">参与方向</div>
                  <div className="flex flex-wrap gap-1.5">
                    {v.directions.map(d => (
                      <span key={d} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">{d}</span>
                    ))}
                  </div>
                </div>

                {v.skills && v.skills.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">技能标签</div>
                    <div className="flex flex-wrap gap-1">
                      {v.skills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">#{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {isPending ? (
                  <div className="mt-5 pt-4 border-t border-warm-100 space-y-2">
                    <div className="p-3 bg-warm-50 rounded-lg text-xs text-warm-700">
                      等待管理员资质审核通过后，志愿者即可开始认领任务
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary !py-1.5 !px-3 text-sm flex-1 text-red-600 !bg-red-50 !border-red-100" onClick={(e) => {
                        e.stopPropagation();
                        if (!confirm('确认拒绝该志愿者申请？拒绝后该志愿者将无法认领任务')) return;
                        dispatch({ type: 'UPDATE_VOLUNTEER', payload: { id: v.id, data: { status: 'inactive' } } });
                      }}>拒绝</button>
                      <button className="btn-primary !py-1.5 !px-3 text-sm flex-1 flex items-center justify-center gap-1" onClick={(e) => {
                        e.stopPropagation();
                        if (!confirm(`确认审核通过志愿者 ${v.name}？通过后即可开始认领平台任务`)) return;
                        dispatch({ type: 'APPROVE_VOLUNTEER', payload: { volunteerId: v.id } });
                        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'task', message: `志愿者${v.name}资质审核已通过` } });
                      }}>
                        <UserCheck className="w-3.5 h-3.5" /> 审核通过
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-800">{v.tasksCompleted}</div>
                      <div className="text-xs text-gray-500">累计任务</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary-600">{tasksThisMonth}</div>
                      <div className="text-xs text-gray-500">本月任务</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-warm-600 flex items-center justify-center gap-0.5">
                        {v.rating} <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="text-xs text-gray-500">服务评分</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">暂无符合条件的志愿者</div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, suffix }) {
  const colorMap = {
    blue: 'from-blue-50 to-white border-blue-100 text-blue-600 bg-blue-100',
    green: 'from-green-50 to-white border-green-100 text-green-600 bg-green-100',
    purple: 'from-purple-50 to-white border-purple-100 text-purple-600 bg-purple-100',
    warm: 'from-warm-50 to-white border-warm-200 text-warm-600 bg-warm-100',
  };
  const classes = colorMap[color].split(' ');
  return (
    <div className={`card !p-5 bg-gradient-to-br ${classes.slice(0, 3).join(' ')}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className={`text-3xl font-bold mt-2 text-gray-800 flex items-baseline gap-1`}>
            {value}
            {suffix && <span className="text-xl">{suffix}</span>}
          </div>
          <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            本月 +{Math.round(Number(value) * 0.1)}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${classes.slice(5).join(' ')}`}>
          <Icon className={`w-6 h-6 ${classes[4]}`} />
        </div>
      </div>
    </div>
  );
}
