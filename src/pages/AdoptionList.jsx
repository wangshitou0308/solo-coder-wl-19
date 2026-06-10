import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  HeartHandshake,
  Search,
  Filter,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

export default function AdoptionList() {
  const { state, filtered: roleFiltered } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusInfo = (s) => {
    const map = {
      reviewing: { label: '审核中', color: 'bg-warm-100 text-warm-700', icon: Clock },
      interviewing: { label: '电话回访', color: 'bg-blue-100 text-blue-700', icon: FileCheck },
      visiting: { label: '家访中', color: 'bg-purple-100 text-purple-700', icon: Eye },
      meeting: { label: '待见面', color: 'bg-indigo-100 text-indigo-700', icon: Eye },
      completed: { label: '已完成', color: 'bg-primary-100 text-primary-700', icon: CheckCircle },
      rejected: { label: '未通过', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    };
    return map[s] || { label: s, color: 'bg-gray-100 text-gray-700', icon: Clock };
  };

  const visibleAdoptions = roleFiltered.adoptions;

  const filtered = useMemo(() => {
    return visibleAdoptions.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !a.applicantName.toLowerCase().includes(s) &&
          !a.animalName.toLowerCase().includes(s) &&
          !a.id.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [visibleAdoptions, search, statusFilter]);

  const pendingFollowupAudits = visibleAdoptions.reduce((acc, a) =>
    acc + a.followups.filter(f => f.status === 'completed' && f.auditStatus === 'pending').length, 0);
  const overdueFollowups = visibleAdoptions.reduce((acc, a) =>
    acc + a.followups.filter(f => f.status === 'overdue').length, 0);

  const stats = {
    total: visibleAdoptions.length,
    reviewing: visibleAdoptions.filter(a => a.status === 'reviewing').length,
    completed: visibleAdoptions.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">领养管理</h1>
        <p className="text-sm text-gray-500 mt-1">领养申请审核、签约管理与回访追踪</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card !p-4"><div className="text-sm text-gray-500">总申请</div><div className="text-2xl font-bold mt-1">{stats.total}</div></div>
        <div className="card !p-4 bg-warm-50 border-warm-200"><div className="text-sm text-gray-500">待审核</div><div className="text-2xl font-bold text-warm-600 mt-1">{stats.reviewing}</div></div>
        <div className="card !p-4 bg-green-50 border-green-100"><div className="text-sm text-gray-500">已完成</div><div className="text-2xl font-bold text-primary-600 mt-1">{stats.completed}</div></div>
        <div className="card !p-4 bg-blue-50 border-blue-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('completed')}>
          <div className="text-sm text-gray-500">回访待审核</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{pendingFollowupAudits}</div>
        </div>
        <div className="card !p-4 bg-red-50 border-red-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('completed')}>
          <div className="text-sm text-gray-500">回访超期</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{overdueFollowups}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索申请人、动物名称、申请编号..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-36">
              <option value="all">全部状态</option>
              <option value="reviewing">审核中</option>
              <option value="interviewing">电话回访</option>
              <option value="visiting">家访中</option>
              <option value="meeting">待见面</option>
              <option value="completed">已完成/回访期</option>
              <option value="rejected">未通过</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((ad) => {
          const animal = state.animals.find(a => a.id === ad.animalId);
          const st = getStatusInfo(ad.status);
          const StatusIcon = st.icon;
          const overdueF = ad.followups.filter(f => f.status === 'overdue').length;
          const pendingFA = ad.followups.filter(f => f.status === 'completed' && f.auditStatus === 'pending').length;
          const totalReleased = ad.followups.reduce((acc, f) => acc + (f.depositReleased || 0), 0);

          return (
            <div key={ad.id} className="card !p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/adoptions/${ad.id}`)}>
              <div className="flex">
                {animal && (
                  <div className="w-36 flex-shrink-0 bg-gray-100">
                    <img src={animal.photo} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                          {ad.applicantName}
                          <span className="text-gray-400 font-normal text-sm">申请领养</span>
                          <HeartHandshake className="w-4 h-4 text-primary-500" />
                          <span className="text-primary-600 font-medium">{ad.animalName}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                          <span>#{ad.id}</span>
                          <span>申请：{ad.applyTime}</span>
                          <span>{ad.applicantPhone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(overdueF > 0 || pendingFA > 0) && (
                        <div className="flex gap-1">
                          {overdueF > 0 && <span className="status-badge bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{overdueF}个超期回访</span>}
                          {pendingFA > 0 && <span className="status-badge bg-blue-100 text-blue-700 flex items-center gap-1"><Clock className="w-3 h-3" />{pendingFA}个待审核回访</span>}
                        </div>
                      )}
                      <span className={`status-badge ${st.color} flex items-center gap-1`}><StatusIcon className="w-3 h-3" />{st.label}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">住房条件</div>
                      <div className="font-medium mt-0.5">{ad.housingType} · {ad.housingArea}㎡</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">家庭成员</div>
                      <div className="font-medium mt-0.5">{ad.familyMembers}人 {ad.hasChildren ? `· 有${ad.childrenAge}小孩` : ''}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">养宠经验</div>
                      <div className="font-medium mt-0.5 truncate" title={ad.petExperience}>{ad.petExperience || '无'}</div>
                    </div>
                    {ad.status === 'completed' && (
                      <div>
                        <div className="text-xs text-gray-500">押金退还进度</div>
                        <div className="font-medium mt-0.5">
                          ¥{totalReleased} / ¥{ad.depositAmount}
                          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: `${Math.round((totalReleased / ad.depositAmount) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center px-4 border-l border-gray-100">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <HeartHandshake className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">暂无符合条件的领养申请</div>
        </div>
      )}
    </div>
  );
}
