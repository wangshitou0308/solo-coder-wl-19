import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  ClipboardList,
  Plus,
  MapPin,
  Clock,
  Gift,
  Check,
  UserCheck,
  Truck,
  Home,
  Users,
  FileCheck,
  PenLine,
  Send,
  CalendarRange,
  Filter,
  X,
  PawPrint,
  ArrowRight,
} from 'lucide-react';

const taskTypeConfig = {
  '运输': { icon: Truck, color: 'blue' },
  '临时寄养': { icon: Home, color: 'purple' },
  '现场协助': { icon: Users, color: 'green' },
  '审核': { icon: FileCheck, color: 'indigo' },
  '文案': { icon: PenLine, color: 'warm' },
};

export default function TaskList() {
  const { state, dispatch, filtered: roleFiltered } = useApp();
  const user = state.currentUser;
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: '现场协助', description: '', location: '', deadline: '', reward: 0, stationId: state.stations[0]?.id || '' });

  const visibleTasks = roleFiltered.tasks;

  const filtered = useMemo(() => {
    return visibleTasks.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      return true;
    });
  }, [visibleTasks, statusFilter, typeFilter]);

  const getStatusInfo = (s) => {
    const map = {
      open: { label: '待认领', color: 'bg-warm-100 text-warm-700' },
      claimed: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    };
    return map[s] || { label: s, color: 'bg-gray-100' };
  };

  const getStationName = (id) => state.stations.find(s => s.id === id)?.name || '未知';
  const getVolunteerName = (id) => state.volunteers.find(v => v.id === id)?.name || '未指派';
  const getClue = (clueId) => state.clues.find(c => c.id === clueId);

  const stats = {
    open: visibleTasks.filter(t => t.status === 'open').length,
    claimed: visibleTasks.filter(t => t.status === 'claimed').length,
    completed: visibleTasks.filter(t => t.status === 'completed').length,
  };

  const handleClaim = (taskId) => {
    const task = visibleTasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === 'completed') {
      alert('该任务已完成，不可重复认领');
      return;
    }
    if (task.status === 'claimed') {
      alert('该任务已被其他志愿者认领');
      return;
    }
    if (!confirm('确认认领此任务？')) return;
    dispatch({ type: 'CLAIM_TASK', payload: { taskId, volunteerId: state.volunteers[0]?.id } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'task', message: '任务已认领' } });
  };

  const handleComplete = (taskId) => {
    if (!confirm('确认任务已完成？')) return;
    dispatch({ type: 'COMPLETE_TASK', payload: { taskId } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'task', message: '任务标记完成' } });
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.deadline) {
      alert('请填写完整信息');
      return;
    }
    dispatch({ type: 'ADD_TASK', payload: { ...newTask, reward: parseFloat(newTask.reward) || 0 } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'task', message: `新任务发布：${newTask.title}` } });
    setShowCreateModal(false);
    setNewTask({ title: '', type: '现场协助', description: '', location: '', deadline: '', reward: 0, stationId: state.stations[0]?.id || '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">任务中心</h1>
          <p className="text-sm text-gray-500 mt-1">发布和认领志愿者任务，协作完成救助工作</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" /> 发布新任务
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card !p-5 bg-warm-50 border-warm-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">待认领任务</div>
              <div className="text-3xl font-bold text-warm-600 mt-2">{stats.open}</div>
            </div>
            <div className="w-12 h-12 bg-warm-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-warm-600" />
            </div>
          </div>
        </div>
        <div className="card !p-5 bg-blue-50 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">进行中</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{stats.claimed}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card !p-5 bg-green-50 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">已完成</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card !p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-36">
            <option value="all">全部状态</option>
            <option value="open">待认领</option>
            <option value="claimed">进行中</option>
            <option value="completed">已完成</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-36">
            <option value="all">全部类型</option>
            {Object.keys(taskTypeConfig).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(t => {
          const cfg = taskTypeConfig[t.type] || { icon: ClipboardList, color: 'gray' };
          const Icon = cfg.icon;
          const colorMap = {
            blue: 'border-blue-200 bg-blue-50',
            purple: 'border-purple-200 bg-purple-50',
            green: 'border-green-200 bg-green-50',
            indigo: 'border-indigo-200 bg-indigo-50',
            warm: 'border-warm-200 bg-warm-50',
            gray: 'border-gray-200 bg-gray-50',
          };
          const iconColorMap = {
            blue: 'text-blue-600',
            purple: 'text-purple-600',
            green: 'text-green-600',
            indigo: 'text-indigo-600',
            warm: 'text-warm-600',
            gray: 'text-gray-600',
          };
          const st = getStatusInfo(t.status);

          return (
            <div key={t.id} className="card !p-0 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                <div className={`w-2 flex-shrink-0 ${colorMap[cfg.color].split(' ')[1]}`} />
                <div className={`w-16 flex items-center justify-center flex-shrink-0 ${colorMap[cfg.color].split(' ')[0]}`}>
                  <Icon className={`w-7 h-7 ${iconColorMap[cfg.color]}`} />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-lg text-gray-800">{t.title}</h4>
                        <span className={`status-badge ${st.color}`}>{st.label}</span>
                        <span className="status-badge bg-gray-100 text-gray-600">{t.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1.5">{t.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {t.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 截止：{t.deadline}</span>
                        <span className="flex items-center gap-1"><CalendarRange className="w-3.5 h-3.5" /> 发布：{t.publishTime}</span>
                        <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> {t.status === 'open' ? '等待志愿者认领' : `执行人：${getVolunteerName(t.claimantId)}`}</span>
                        <span className="flex items-center gap-1 text-warm-600 font-medium">
                          <Gift className="w-3.5 h-3.5" /> {t.reward > 0 ? `补贴 ¥${t.reward}` : '公益志愿'}
                        </span>
                      </div>
                      {t.clueId && getClue(t.clueId) && (
                        <div className="mt-3 p-2.5 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-indigo-500">关联救助线索</span>
                            <div className="font-semibold text-indigo-800 truncate">
                              {getClue(t.clueId)?.features} · {getClue(t.clueId)?.location}
                            </div>
                          </div>
                          <button className="text-xs text-indigo-600 hover:underline flex-shrink-0" onClick={() => navigate('/clues')}>查看线索</button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-xs text-gray-400">发布于 {getStationName(t.stationId)}</div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {t.status === 'open' && (
                          <button className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={() => handleClaim(t.id)}>
                            <UserCheck className="w-3.5 h-3.5" /> 认领任务
                          </button>
                        )}
                        {t.status === 'claimed' && (
                          <button className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={() => handleComplete(t.id)}>
                            <Check className="w-3.5 h-3.5" /> 完成
                          </button>
                        )}
                        {t.status === 'completed' && t.clueId && !getClue(t.clueId)?.animalId && (
                          <button className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={() => navigate(`/animals/new?clueId=${t.clueId}&taskId=${t.id}`)}>
                            <PawPrint className="w-3.5 h-3.5" /> 建立动物档案
                          </button>
                        )}
                        {t.status === 'completed' && t.clueId && getClue(t.clueId)?.animalId && (
                          <button className="btn-secondary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={() => navigate(`/animals/${getClue(t.clueId)?.animalId}`)}>
                            查看档案 <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">暂无符合条件的任务</div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg">发布新任务</h3>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div><label className="label-field">任务标题 <span className="text-red-500">*</span></label>
                <input className="input-field" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="如：海淀区五道口救援运输" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-field">任务类型 <span className="text-red-500">*</span></label>
                  <select className="input-field" value={newTask.type} onChange={e => setNewTask(p => ({ ...p, type: e.target.value }))}>
                    {Object.keys(taskTypeConfig).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="label-field">所属救助站</label>
                  <select className="input-field" value={newTask.stationId} onChange={e => setNewTask(p => ({ ...p, stationId: e.target.value }))}>
                    {state.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label-field">任务描述 <span className="text-red-500">*</span></label>
                <textarea className="input-field min-h-[80px]" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="详细描述任务内容和要求..." />
              </div>
              <div><label className="label-field">任务地点</label>
                <input className="input-field" value={newTask.location} onChange={e => setNewTask(p => ({ ...p, location: e.target.value }))} placeholder="集合地址或线上任务" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-field">截止时间 <span className="text-red-500">*</span></label>
                  <input type="datetime-local" className="input-field" value={newTask.deadline} onChange={e => setNewTask(p => ({ ...p, deadline: e.target.value }))} />
                </div>
                <div><label className="label-field">补贴金额（元）</label>
                  <input type="number" className="input-field" value={newTask.reward} onChange={e => setNewTask(p => ({ ...p, reward: e.target.value }))} placeholder="0 表示公益志愿" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>取消</button>
              <button className="btn-primary flex items-center gap-1" onClick={handleCreateTask}><Send className="w-4 h-4" /> 发布任务</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
