import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Phone,
  Clock,
  PawPrint,
  ArrowRight,
  CheckCircle,
  Send,
  Building2,
  AlertCircle,
  X,
} from 'lucide-react';

export default function ClueList() {
  const { state, dispatch, findNearestStation } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [selectedClue, setSelectedClue] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStationId, setAssignStationId] = useState('');

  const getStatusInfo = (status) => {
    const map = {
      pending: { label: '待分配', color: 'bg-red-100 text-red-700', icon: AlertCircle },
      assigned: { label: '已分配', color: 'bg-blue-100 text-blue-700', icon: Send },
      rescued: { label: '已救援', color: 'bg-primary-100 text-primary-700', icon: CheckCircle },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
  };

  const filtered = state.clues.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (speciesFilter !== 'all' && c.species !== speciesFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !c.location.toLowerCase().includes(s) &&
        !c.reporterName.toLowerCase().includes(s) &&
        !c.features.toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const getStationName = (id) => state.stations.find(s => s.id === id)?.name || '未分配';

  const handleAssign = (clue) => {
    setSelectedClue(clue);
    let defaultId = state.stations[0].id;
    if (clue.lat && clue.lng) {
      const result = findNearestStation(clue.lat, clue.lng);
      if (result && result.station) defaultId = result.station.id;
    }
    setAssignStationId(defaultId);
    setShowAssignModal(true);
  };

  const confirmAssign = () => {
    if (!assignStationId || !selectedClue) return;
    dispatch({
      type: 'UPDATE_CLUE_STATUS',
      payload: { clueId: selectedClue.id, status: 'assigned', assignedStationId: assignStationId },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'task', message: `线索${selectedClue.id}已分配至${getStationName(assignStationId)}` },
    });
    setShowAssignModal(false);
    setSelectedClue(null);
  };

  const handleCreateAnimal = (clue) => {
    navigate(`/animals/new?clueId=${clue.id}`);
  };

  const stats = {
    total: state.clues.length,
    pending: state.clues.filter(c => c.status === 'pending').length,
    assigned: state.clues.filter(c => c.status === 'assigned').length,
    rescued: state.clues.filter(c => c.status === 'rescued').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">救助线索管理</h1>
          <p className="text-sm text-gray-500 mt-1">市民上报的流浪动物线索，系统自动就近分配救助站</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/clues/submit')}>
          <Plus className="w-4 h-4" /> 模拟市民提交线索
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card !p-4"><div className="text-sm text-gray-500">总线索数</div><div className="text-2xl font-bold mt-1">{stats.total}</div></div>
        <div className="card !p-4 bg-red-50 border-red-100"><div className="text-sm text-gray-500">待分配</div><div className="text-2xl font-bold text-red-600 mt-1">{stats.pending}</div></div>
        <div className="card !p-4 bg-blue-50 border-blue-100"><div className="text-sm text-gray-500">处理中</div><div className="text-2xl font-bold text-blue-600 mt-1">{stats.assigned}</div></div>
        <div className="card !p-4 bg-green-50 border-green-100"><div className="text-sm text-gray-500">已救援</div><div className="text-2xl font-bold text-primary-600 mt-1">{stats.rescued}</div></div>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索位置、联系人、体貌特征..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-36">
              <option value="all">全部状态</option>
              <option value="pending">待分配</option>
              <option value="assigned">已分配</option>
              <option value="rescued">已救援</option>
            </select>
            <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className="input-field w-28">
              <option value="all">全部物种</option>
              <option value="犬">犬</option>
              <option value="猫">猫</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((clue) => {
          const status = getStatusInfo(clue.status);
          const StatusIcon = status.icon;
          return (
            <div key={clue.id} className="card !p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex">
                <div className="w-40 flex-shrink-0 bg-gray-100">
                  <img src={clue.photo} alt="" className="w-full h-full object-cover min-h-[160px]" />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-primary-500" />
                        <span className="font-medium text-gray-800">{clue.species}类线索</span>
                        <span className="text-xs text-gray-400">#{clue.id}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{clue.reportTime}
                      </div>
                    </div>
                    <span className={`status-badge ${status.color} flex items-center gap-1 flex-shrink-0`}>
                      <StatusIcon className="w-3 h-3" />{status.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{clue.location}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{clue.reporterName} · {clue.reporterPhone}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-xs space-y-1">
                    <div><span className="text-gray-500">体貌：</span><span className="text-gray-700">{clue.features}</span></div>
                    <div><span className="text-gray-500">健康：</span><span className="text-gray-700">{clue.healthObserve}</span></div>
                  </div>

                  {clue.assignedStationId && (
                    <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs text-blue-500">处理机构</span>
                        <div className="font-semibold text-blue-800">{getStationName(clue.assignedStationId)}</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                  )}

                  {clue.status === 'pending' && (
                    <div className="mt-3 p-2.5 bg-warm-50 rounded-lg border border-warm-100 flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-warm-600 flex-shrink-0" />
                      <div className="text-xs text-warm-700">
                        暂未分配救助站，请点击下方分配按钮或等待管理员人工处理
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    {clue.status === 'pending' && (
                      <button className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={(e) => { e.stopPropagation(); handleAssign(clue); }}>
                        <Send className="w-3.5 h-3.5" /> 分配救助站
                      </button>
                    )}
                    {clue.status === 'assigned' && !clue.animalId && (
                      <button className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={(e) => { e.stopPropagation(); handleCreateAnimal(clue); }}>
                        <PawPrint className="w-3.5 h-3.5" /> 建立档案
                      </button>
                    )}
                    {clue.animalId && (
                      <button className="btn-secondary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={(e) => { e.stopPropagation(); navigate(`/animals/${clue.animalId}`); }}>
                        查看档案 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">暂无符合条件的救助线索</div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedClue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowAssignModal(false); setSelectedClue(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold">分配救助站</h3>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => { setShowAssignModal(false); setSelectedClue(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                线索位置：{selectedClue.location}
              </div>
              <div>
                <label className="label-field">选择救助站</label>
                <select value={assignStationId} onChange={(e) => setAssignStationId(e.target.value)} className="input-field">
                  <option value="">请选择救助站</option>
                  {state.stations.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - {s.address}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => { setShowAssignModal(false); setSelectedClue(null); }}>取消</button>
              <button className="btn-primary" onClick={confirmAssign} disabled={!assignStationId}>确认分配</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
