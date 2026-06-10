import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { animalStatuses } from '../data/mockData';
import {
  ChevronLeft,
  ArrowRightLeft,
  Edit,
  HeartHandshake,
  Scissors,
  Syringe,
  Pill,
  Stethoscope,
  Calendar,
  Building2,
  PawPrint,
  Plus,
  Save,
  Activity,
  FileText,
  X,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('basic');
  const [editMode, setEditMode] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showDewormingModal, setShowDewormingModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showHealthEventModal, setShowHealthEventModal] = useState(false);
  const [healthFilter, setHealthFilter] = useState('all');
  const [vaccineForm, setVaccineForm] = useState({ name: '', date: '', nextDate: '' });
  const [dewormingForm, setDewormingForm] = useState({ type: '体内', date: '' });
  const [treatmentForm, setTreatmentForm] = useState({ date: '', description: '', result: '' });
  const [healthEventForm, setHealthEventForm] = useState({ type: 'vaccination', name: '', date: '', nextDate: '', notes: '' });

  const animal = state.animals.find(a => a.id === id);
  const getStatusInfo = (key) => animalStatuses.find(s => s.key === key) || { label: key, color: 'bg-gray-100 text-gray-600' };
  const getStationName = (sid) => state.stations.find(s => s.id === sid)?.name || '未知';

  const [form, setForm] = useState(animal || {});

  const adoption = state.adoptions.find(a => a.animalId === id && a.status === 'completed');

  if (!animal) {
    return (
      <div className="space-y-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800" onClick={() => navigate('/animals')}>
          <ChevronLeft className="w-5 h-5" /> 返回列表
        </button>
        <div className="card text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">未找到该动物档案</div>
        </div>
      </div>
    );
  }

  const handleStatusChange = () => {
    if (!newStatus) return;
    if (animal?.status === 'archived') {
      alert('该动物档案已归档，无法变更状态');
      return;
    }
    dispatch({ type: 'CHANGE_ANIMAL_STATUS', payload: { id, status: newStatus } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'task', message: `动物${animal.name}状态已变更为${getStatusInfo(newStatus).label}` } });
    setShowStatusModal(false);
    setNewStatus('');
  };

  const handleSaveVaccine = () => {
    if (animal?.status === 'archived') {
      alert('该动物档案已归档，无法添加记录');
      return;
    }
    if (!vaccineForm.name || !vaccineForm.date) { alert('请填写完整信息'); return; }
    dispatch({ type: 'ADD_VACCINATION', payload: { animalId: id, vaccination: vaccineForm } });
    setShowVaccineModal(false);
    setVaccineForm({ name: '', date: '', nextDate: '' });
  };

  const handleSaveDeworming = () => {
    if (animal?.status === 'archived') {
      alert('该动物档案已归档，无法添加记录');
      return;
    }
    if (!dewormingForm.date) { alert('请填写日期'); return; }
    dispatch({ type: 'ADD_DEWORMING', payload: { animalId: id, deworming: dewormingForm } });
    setShowDewormingModal(false);
    setDewormingForm({ type: '体内', date: '' });
  };

  const handleSaveTreatment = () => {
    if (animal?.status === 'archived') {
      alert('该动物档案已归档，无法添加记录');
      return;
    }
    if (!treatmentForm.date || !treatmentForm.description) { alert('请填写完整信息'); return; }
    dispatch({ type: 'ADD_TREATMENT', payload: { animalId: id, treatment: treatmentForm } });
    setShowTreatmentModal(false);
    setTreatmentForm({ date: '', description: '', result: '' });
  };

  const handleSaveHealthEvent = () => {
    if (animal?.status === 'archived') {
      alert('该动物档案已归档，无法添加记录');
      return;
    }
    if (!healthEventForm.name || !healthEventForm.date) { alert('请填写事件名称和日期'); return; }
    dispatch({ type: 'ADD_HEALTH_EVENT', payload: { animalId: id, event: healthEventForm } });
    if (healthEventForm.type === 'sterilization') {
      dispatch({ type: 'SET_STERILIZED', payload: { animalId: id, sterilized: true } });
    }
    setShowHealthEventModal(false);
    setHealthEventForm({ type: 'vaccination', name: '', date: '', nextDate: '', notes: '' });
  };

  const status = getStatusInfo(animal.status);
  const isArchived = animal.status === 'archived';

  const canAdopt = animal.status === 'adoptable';

  const tabs = [
    { key: 'basic', label: '基础档案', icon: FileText },
    { key: 'health', label: '健康事件', icon: Activity },
    { key: 'timeline', label: '状态流转', icon: ArrowRightLeft },
  ];

  const healthEventConfig = {
    vaccination: { label: '疫苗接种', icon: Syringe, color: 'primary' },
    deworming: { label: '驱虫', icon: Pill, color: 'blue' },
    sterilization: { label: '绝育手术', icon: Scissors, color: 'pink' },
    checkup: { label: '体检', icon: Stethoscope, color: 'indigo' },
    surgery: { label: '手术/治疗', icon: Activity, color: 'red' },
  };

  const currentAnimal = state.animals.find(a => a.id === id);
  const display = editMode ? form : currentAnimal;

  const allHealthEvents = useMemo(() => {
    if (!currentAnimal) return [];
    const events = currentAnimal.healthEvents || [];
    if (healthFilter === 'all') return events;
    return events.filter(e => e.type === healthFilter);
  }, [currentAnimal, healthFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate('/animals')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            {currentAnimal.name} <span className="text-sm font-normal text-gray-400">#{currentAnimal.id}</span>
            <span className={`status-badge ${status.color}`}>{status.label}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {getStationName(currentAnimal.stationId)}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 入站：{currentAnimal.rescueDate}</span>
          </p>
        </div>
        {!isArchived && (
          <button className="btn-secondary flex items-center gap-2" onClick={() => setEditMode(!editMode)}>
            {editMode ? <><Check className="w-4 h-4" /> 完成</> : <><Edit className="w-4 h-4" /> 编辑</>}
          </button>
        )}
        {!isArchived && (
          <button className="btn-secondary flex items-center gap-2" onClick={() => setShowStatusModal(true)}>
            <ArrowRightLeft className="w-4 h-4" /> 变更状态
          </button>
        )}
        {canAdopt && !isArchived && (
          <button className="btn-primary flex items-center gap-2" onClick={() => navigate(`/adoptions/apply/${id}`)}>
            <HeartHandshake className="w-4 h-4" /> 发起领养申请
          </button>
        )}
        {isArchived && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" /> 档案已归档，不可修改
          </div>
        )}
      </div>

      {/* Header Info Card */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex">
          <div className="w-72 flex-shrink-0 bg-gray-100">
            <img src={currentAnimal.photo} alt={currentAnimal.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-6">
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: '物种', value: currentAnimal.species, icon: PawPrint },
                { label: '品种', value: currentAnimal.breed, icon: PawPrint },
                { label: '性别', value: currentAnimal.gender, icon: PawPrint },
                { label: '估龄', value: currentAnimal.ageEstimate < 1 ? `${Math.round(currentAnimal.ageEstimate * 12)}个月` : `${currentAnimal.ageEstimate}岁`, icon: Calendar },
                { label: '毛色', value: currentAnimal.color, icon: PawPrint },
                { label: '体重', value: `${currentAnimal.weight} kg`, icon: PawPrint },
                { label: '绝育', value: currentAnimal.sterilized ? '已绝育' : '未绝育', icon: Scissors, highlight: !currentAnimal.sterilized },
                { label: '健康档案', value: `${currentAnimal.vaccinations.length}针疫苗 / ${currentAnimal.treatments.length}次治疗`, icon: Stethoscope },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className={`font-medium flex items-center gap-1.5 ${item.highlight ? 'text-warm-600' : 'text-gray-800'}`}>
                      <Icon className="w-4 h-4 opacity-60" />
                      {item.value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500 mb-1.5">性格描述</div>
                <div className="text-sm text-gray-700 leading-relaxed">{currentAnimal.personality || '暂无评估'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1.5">行为评估</div>
                <div className="text-sm text-gray-700 leading-relaxed">{currentAnimal.behaviorNotes || '暂无记录'}</div>
              </div>
            </div>

            {adoption && (
              <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5" /> 领养信息
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">领养人：</span><b>{adoption.applicantName}</b></div>
                  <div><span className="text-gray-500">领养日期：</span><b>{adoption.signedDate}</b></div>
                  <div>
                    <Link to={`/adoptions/${adoption.id}`} className="text-purple-600 hover:underline">查看领养详情 →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  active ? 'text-primary-600 border-primary-600 bg-primary-50/50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {tab === 'basic' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-primary-500" /> 基本资料
                  {!editMode && !isArchived && <button className="ml-auto text-sm text-primary-600 hover:underline" onClick={() => setEditMode(true)}>编辑资料</button>}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { k: 'name', l: '名字' }, { k: 'breed', l: '品种' }, { k: 'color', l: '毛色' },
                    { k: 'species', l: '物种', type: 'select', options: ['犬', '猫', '其他'] },
                    { k: 'gender', l: '性别', type: 'select', options: ['公', '母', '未知'] },
                    { k: 'ageEstimate', l: '估龄（岁）', type: 'number' },
                    { k: 'weight', l: '体重（kg）', type: 'number' },
                    { k: 'rescueDate', l: '入站日期', type: 'date' },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="label-field">{f.l}</label>
                      {editMode ? (
                        f.type === 'select' ? (
                          <select className="input-field" value={form[f.k]} onChange={e => {
                            setForm(p => ({ ...p, [f.k]: e.target.value }));
                            dispatch({ type: 'UPDATE_ANIMAL', payload: { id, data: { [f.k]: e.target.value } } });
                          }}>
                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={f.type || 'text'}
                            className="input-field"
                            value={form[f.k] ?? ''}
                            onChange={e => {
                              const v = f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                              setForm(p => ({ ...p, [f.k]: v }));
                              dispatch({ type: 'UPDATE_ANIMAL', payload: { id, data: { [f.k]: v } } });
                            }}
                          />
                        )
                      ) : (
                        <div className="input-field !cursor-default !bg-gray-50">{display[f.k] ?? '-'}</div>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="label-field">绝育状态</label>
                    {editMode ? (
                      <select className="input-field" value={form.sterilized ? '1' : '0'} onChange={e => {
                        const v = e.target.value === '1';
                        setForm(p => ({ ...p, sterilized: v }));
                        dispatch({ type: 'UPDATE_ANIMAL', payload: { id, data: { sterilized: v } } });
                      }}>
                        <option value="0">未绝育</option>
                        <option value="1">已绝育</option>
                      </select>
                    ) : (
                      <div className={`input-field !cursor-default !bg-gray-50 ${display.sterilized ? 'text-primary-700' : 'text-warm-600'}`}>
                        {display.sterilized ? '✅ 已绝育' : '⚠️ 未绝育'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4">行为与健康备注</h4>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { k: 'personality', l: '性格描述' },
                    { k: 'behaviorNotes', l: '行为评估/训练' },
                    { k: 'healthRecord', l: '健康记录摘要' },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="label-field">{f.l}</label>
                      {editMode ? (
                        <textarea
                          className="input-field min-h-[80px]"
                          value={form[f.k] || ''}
                          onChange={e => {
                            setForm(p => ({ ...p, [f.k]: e.target.value }));
                            dispatch({ type: 'UPDATE_ANIMAL', payload: { id, data: { [f.k]: e.target.value } } });
                          }}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 min-h-[80px] leading-relaxed">
                          {display[f.k] || '暂无记录'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'health' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-500" /> 健康事件时间线
                    <span className="text-xs text-gray-400 font-normal">共 {allHealthEvents.length} 条记录</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">完整记录疫苗、驱虫、体检、手术等所有医疗健康事项</p>
                </div>
                {!isArchived && (
                  <button className="btn-primary flex items-center gap-2" onClick={() => setShowHealthEventModal(true)}>
                    <Plus className="w-4 h-4" /> 记录健康事件
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'vaccination', label: '疫苗', icon: Syringe },
                  { key: 'deworming', label: '驱虫', icon: Pill },
                  { key: 'checkup', label: '体检', icon: Stethoscope },
                  { key: 'sterilization', label: '绝育', icon: Scissors },
                  { key: 'surgery', label: '治疗', icon: Activity },
                ].map(f => {
                  const Icon = f.icon;
                  const active = healthFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setHealthFilter(f.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        active ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {allHealthEvents.length === 0 ? (
                <div className="p-12 bg-gray-50 rounded-xl text-center">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto" />
                  <div className="text-gray-500 mt-3">暂无健康事件记录</div>
                  {!isArchived && <div className="text-xs text-gray-400 mt-1">点击右上角按钮开始记录</div>}
                </div>
              ) : (
                <div className="space-y-3">
                  {[...allHealthEvents].sort((a, b) => new Date(b.date) - new Date(a.date)).map((event) => {
                    const cfg = healthEventConfig[event.type] || healthEventConfig.surgery;
                    const Icon = cfg.icon;
                    const colorMap = {
                      primary: { bg: 'bg-primary-50', border: 'border-primary-100', text: 'text-primary-600', badge: 'bg-primary-100 text-primary-700' },
                      blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
                      pink: { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' },
                      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
                      red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
                    };
                    const cm = colorMap[cfg.color] || colorMap.primary;
                    const today = new Date('2026-06-10');
                    const isExpiring = event.nextDate && new Date(event.nextDate) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) && new Date(event.nextDate) >= today;
                    const isExpired = event.nextDate && new Date(event.nextDate) < today;
                    return (
                      <div key={event.id} className={`${cm.bg} ${cm.border} border rounded-xl p-4 hover:shadow-sm transition-shadow`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 ${cm.badge} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${cm.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-semibold text-gray-800">{event.name}</h5>
                              <span className={`status-badge ${cm.badge}`}>{cfg.label}</span>
                              {isExpiring && event.nextDate && (
                                <span className="status-badge bg-warm-100 text-warm-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> 即将到期
                                </span>
                              )}
                              {isExpired && event.nextDate && (
                                <span className="status-badge bg-red-100 text-red-700 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> 已超期
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> 发生日期：{event.date}
                              </span>
                              {event.nextDate && (
                                <span className={`flex items-center gap-1 ${isExpired ? 'text-red-600 font-medium' : isExpiring ? 'text-warm-600 font-medium' : ''}`}>
                                  <Clock className="w-3.5 h-3.5" /> 下次到期：{event.nextDate}
                                </span>
                              )}
                            </div>
                            {event.notes && (
                              <div className="mt-2 text-sm text-gray-600 bg-white/50 rounded-lg p-2.5">
                                {event.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'timeline' && (
            <div className="max-w-2xl">
              <div className="space-y-0">
                {[
                  { date: currentAnimal.rescueDate, title: '救助入站', desc: `收容至${getStationName(currentAnimal.stationId)}`, status: 'sheltering', done: true },
                  { date: currentAnimal.status === 'treating' ? '进行中' : currentAnimal.status === 'adoptable' ? '已完成' : '待触发', title: '医疗检查与必要治疗', desc: '体检、驱虫、疫苗接种、疾病治疗', status: 'treating', done: currentAnimal.status !== 'sheltering' && currentAnimal.status !== 'treating' || currentAnimal.treatments.length > 0 || currentAnimal.vaccinations.length > 0 },
                  { date: currentAnimal.status === 'recovering' ? '进行中' : currentAnimal.status !== 'sheltering' && currentAnimal.status !== 'treating' && currentAnimal.status !== 'recovering' ? '已完成' : '待触发', title: '康复期护理', desc: '术后恢复、营养调理、行为评估', status: 'recovering', done: ['adoptable', 'adopted', 'followup', 'archived'].includes(currentAnimal.status) },
                  { date: currentAnimal.status === 'adoptable' ? '已激活' : currentAnimal.status !== 'sheltering' && currentAnimal.status !== 'treating' && currentAnimal.status !== 'recovering' ? '已激活' : '待激活', title: '开放领养', desc: '对外展示，接受领养申请', status: 'adoptable', done: ['adopted', 'followup', 'archived'].includes(currentAnimal.status) || currentAnimal.status === 'adoptable' },
                  { date: adoption?.signedDate || (currentAnimal.status === 'adopted' ? '已领养' : (currentAnimal.status === 'followup' ? '已领养' : '待领养')), title: '成功领养', desc: adoption ? `领养人：${adoption.applicantName}` : '等待有缘人', status: 'adopted', done: ['adopted', 'followup', 'archived'].includes(currentAnimal.status) },
                  { date: adoption?.signedDate ? `${adoption.signedDate}起一年回访期` : '待进行', title: '领养后回访', desc: '第7/30/90天、半年、一年回访', status: 'followup', done: currentAnimal.status === 'followup' || currentAnimal.status === 'archived' },
                ].map((item, idx) => {
                  const st = getStatusInfo(item.status);
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          item.done ? `bg-white border-primary-400 ${st.color.replace('bg-', '!bg-').replace('text-', '!text-')}` : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}>
                          {idx + 1}
                        </div>
                        {idx < 5 && <div className={`w-0.5 flex-1 my-1 ${item.done ? 'bg-primary-300' : 'bg-gray-200'}`} />}
                      </div>
                      <div className={`flex-1 pb-8 ${idx === 5 ? 'pb-0' : ''}`}>
                        <div className="flex items-center gap-3">
                          <h5 className={`font-semibold ${item.done ? 'text-gray-800' : 'text-gray-400'}`}>{item.title}</h5>
                          {item.done && <span className={`status-badge ${st.color}`}>{st.label}</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{item.date}</div>
                        <div className={`text-sm mt-2 ${item.done ? 'text-gray-600' : 'text-gray-400'}`}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <Modal title="变更动物状态" onClose={() => setShowStatusModal(false)}>
          <p className="text-sm text-gray-500 mb-4">当前状态：<b className="text-gray-800">{status.label}</b></p>
          <div className="space-y-2">
            {animalStatuses.map(s => (
              <button
                key={s.key}
                className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                  newStatus === s.key ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setNewStatus(s.key)}
              >
                <div>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {s.key === 'sheltering' && '刚入站，尚未完成体检'}
                    {s.key === 'treating' && '正在接受医疗治疗'}
                    {s.key === 'recovering' && '治疗后恢复阶段'}
                    {s.key === 'adoptable' && '健康就绪，可接受领养'}
                    {s.key === 'adopted' && '已完成领养手续'}
                    {s.key === 'followup' && '领养后回访跟踪期'}
                    {s.key === 'archived' && '档案已归档，不再追踪'}
                  </div>
                </div>
                <span className={`status-badge ${s.color}`}>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>取消</button>
            <button className="btn-primary" onClick={handleStatusChange} disabled={!newStatus}>确认变更</button>
          </div>
        </Modal>
      )}

      {showVaccineModal && (
        <Modal title="添加疫苗记录" onClose={() => setShowVaccineModal(false)}>
          <div className="space-y-4">
            <div><label className="label-field">疫苗名称 <span className="text-red-500">*</span></label>
              <select className="input-field" value={vaccineForm.name} onChange={e => setVaccineForm(p => ({ ...p, name: e.target.value }))}>
                <option value="">请选择</option>
                <option>狂犬疫苗</option><option>猫三联</option><option>六联疫苗</option>
                <option>八联疫苗</option><option>猫四联</option><option>其他</option>
              </select>
            </div>
            <div><label className="label-field">接种日期 <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" value={vaccineForm.date} onChange={e => setVaccineForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div><label className="label-field">下次加强接种日期</label>
              <input type="date" className="input-field" value={vaccineForm.nextDate} onChange={e => setVaccineForm(p => ({ ...p, nextDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowVaccineModal(false)}>取消</button>
            <button className="btn-primary flex items-center gap-1" onClick={handleSaveVaccine}><Save className="w-4 h-4" /> 保存</button>
          </div>
        </Modal>
      )}

      {showDewormingModal && (
        <Modal title="添加驱虫记录" onClose={() => setShowDewormingModal(false)}>
          <div className="space-y-4">
            <div><label className="label-field">驱虫类型</label>
              <div className="flex gap-3">
                {['体内', '体外', '体内外同驱'].map(t => (
                  <label key={t} className="flex-1">
                    <input type="radio" className="sr-only peer" checked={dewormingForm.type === t} onChange={() => setDewormingForm(p => ({ ...p, type: t }))} />
                    <div className="p-3 rounded-xl border-2 text-center cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 border-gray-200 text-sm">{t}</div>
                  </label>
                ))}
              </div>
            </div>
            <div><label className="label-field">执行日期 <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" value={dewormingForm.date} onChange={e => setDewormingForm(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowDewormingModal(false)}>取消</button>
            <button className="btn-primary flex items-center gap-1" onClick={handleSaveDeworming}><Save className="w-4 h-4" /> 保存</button>
          </div>
        </Modal>
      )}

      {showTreatmentModal && (
        <Modal title="添加治疗记录" onClose={() => setShowTreatmentModal(false)}>
          <div className="space-y-4">
            <div><label className="label-field">治疗日期 <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" value={treatmentForm.date} onChange={e => setTreatmentForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div><label className="label-field">治疗描述 <span className="text-red-500">*</span></label>
              <textarea className="input-field min-h-[80px]" value={treatmentForm.description} onChange={e => setTreatmentForm(p => ({ ...p, description: e.target.value }))} placeholder="如：外伤清创、骨折内固定手术、皮肤病治疗..." />
            </div>
            <div><label className="label-field">治疗结果/当前状况</label>
              <input className="input-field" value={treatmentForm.result} onChange={e => setTreatmentForm(p => ({ ...p, result: e.target.value }))} placeholder="如：已愈合、恢复中、治疗完成..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowTreatmentModal(false)}>取消</button>
            <button className="btn-primary flex items-center gap-1" onClick={handleSaveTreatment}><Save className="w-4 h-4" /> 保存</button>
          </div>
        </Modal>
      )}

      {showHealthEventModal && (
        <Modal title="记录健康事件" onClose={() => setShowHealthEventModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label-field">事件类型 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(healthEventConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const selected = healthEventForm.type === key;
                  return (
                    <label key={key} className="cursor-pointer">
                      <input type="radio" name="healthType" className="sr-only peer" checked={selected} onChange={() => {
                        setHealthEventForm(p => ({ ...p, type: key }));
                        if (key === 'sterilization') {
                          setHealthEventForm(p => ({ ...p, name: '绝育手术', nextDate: '' }));
                        } else if (key === 'checkup') {
                          setHealthEventForm(p => ({ ...p, name: '年度体检' }));
                        }
                      }} />
                      <div className={`p-3 rounded-xl border-2 text-center transition-colors flex items-center justify-center gap-2 ${
                        selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{cfg.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="label-field">事件名称 <span className="text-red-500">*</span></label>
              <input
                className="input-field"
                value={healthEventForm.name}
                onChange={e => setHealthEventForm(p => ({ ...p, name: e.target.value }))}
                placeholder="如：狂犬疫苗、体内驱虫、年度体检..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">发生日期 <span className="text-red-500">*</span></label>
                <input type="date" className="input-field" value={healthEventForm.date} onChange={e => setHealthEventForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="label-field">下次到期日期</label>
                <input type="date" className="input-field" value={healthEventForm.nextDate} onChange={e => setHealthEventForm(p => ({ ...p, nextDate: e.target.value }))} placeholder="如为周期性事项请填写" />
              </div>
            </div>
            <div>
              <label className="label-field">备注说明</label>
              <textarea
                className="input-field min-h-[80px]"
                value={healthEventForm.notes}
                onChange={e => setHealthEventForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="记录详情，如：具体项目、结果、注意事项等..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowHealthEventModal(false)}>取消</button>
            <button className="btn-primary flex items-center gap-1" onClick={handleSaveHealthEvent}><Save className="w-4 h-4" /> 保存记录</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
