import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  PawPrint,
  ChevronLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Building2,
  CheckCircle,
} from 'lucide-react';

const samplePhotos = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500',
  'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=500',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500',
];

export default function AnimalNew() {
  const { state, dispatch, generateId } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clueId = searchParams.get('clueId');
  const clue = state.clues.find(c => c.id === clueId);

  const [form, setForm] = useState({
    name: '',
    species: clue?.species || '犬',
    breed: '',
    color: clue?.features || '',
    gender: '公',
    ageEstimate: 1,
    sterilized: false,
    weight: '',
    status: 'sheltering',
    stationId: clue?.assignedStationId || state.stations[0]?.id || '',
    personality: '',
    behaviorNotes: '',
    rescueDate: new Date().toISOString().split('T')[0],
    photo: clue?.photo || samplePhotos[0],
    healthRecord: '',
  });

  useEffect(() => {
    if (clue?.features) {
      setForm(prev => ({ ...prev, color: clue.features }));
    }
    if (clue?.healthObserve) {
      setForm(prev => ({ ...prev, healthRecord: clue.healthObserve }));
    }
    if (clue?.photo) {
      setForm(prev => ({ ...prev, photo: clue.photo }));
    }
  }, [clueId]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.breed) {
      alert('请填写名字和品种');
      return;
    }
    const newAnimalId = generateId('A');
    dispatch({ type: 'ADD_ANIMAL', payload: { ...form, id: newAnimalId, weight: parseFloat(form.weight) || 0, ageEstimate: parseFloat(form.ageEstimate) || 0 } });

    if (clueId) {
      dispatch({ type: 'UPDATE_CLUE_STATUS', payload: { clueId, status: 'rescued', animalId: newAnimalId } });
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'clue', message: `动物${form.name}档案已创建` } });
    alert('档案创建成功！');
    navigate('/animals');
  };

  const stationName = state.stations.find(s => s.id === form.stationId)?.name || '';
  const clueStationName = state.stations.find(s => s.id === clue?.assignedStationId)?.name || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate('/animals')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">新建动物档案</h1>
          <p className="text-sm text-gray-500 mt-1">{clueId ? `基于线索 #${clueId} 创建` : '录入新收容的流浪动物信息'}</p>
        </div>
      </div>

      {clueId && clueStationName && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 flex-1">
            <div className="font-semibold mb-0.5">线索处理机构已自动关联</div>
            <div>所属救助站：<b>{clueStationName}</b>（来源：线索 #{clueId} 自动就近分配）</div>
          </div>
          <CheckCircle className="w-5 h-5 text-blue-600" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary-500" /> 照片档案
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {samplePhotos.map((url, i) => (
              <button
                key={i}
                type="button"
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                  form.photo === url ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => update('photo', url)}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                {form.photo === url && <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center"><div className="w-7 h-7 bg-primary-500 rounded-full text-white flex items-center justify-center">✓</div></div>}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            <span className="text-sm">点击上传本地照片（演示环境使用示例图）</span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary-500" /> 基本信息
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">名字/代号 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="如：小黄、奶糖" />
            </div>
            <div>
              <label className="label-field">物种 <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.species} onChange={e => update('species', e.target.value)}>
                <option value="犬">犬类</option>
                <option value="猫">猫类</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="label-field">品种 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.breed} onChange={e => update('breed', e.target.value)} placeholder="如：中华田园犬、橘猫、拉布拉多" />
            </div>
            <div>
              <label className="label-field">毛色/体貌特征</label>
              <input className="input-field" value={form.color} onChange={e => update('color', e.target.value)} />
            </div>
            <div>
              <label className="label-field">性别</label>
              <select className="input-field" value={form.gender} onChange={e => update('gender', e.target.value)}>
                <option value="公">公</option>
                <option value="母">母</option>
                <option value="未知">未知</option>
              </select>
            </div>
            <div>
              <label className="label-field">估龄（岁）</label>
              <input type="number" step="0.1" min="0" className="input-field" value={form.ageEstimate} onChange={e => update('ageEstimate', e.target.value)} />
            </div>
            <div>
              <label className="label-field">体重（kg）</label>
              <input type="number" step="0.1" min="0" className="input-field" value={form.weight} onChange={e => update('weight', e.target.value)} />
            </div>
            <div>
              <label className="label-field">救助/入站日期</label>
              <input type="date" className="input-field" value={form.rescueDate} onChange={e => update('rescueDate', e.target.value)} />
            </div>
            <div>
              <label className="label-field">绝育状态</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!form.sterilized} onChange={() => update('sterilized', false)} /> 未绝育
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.sterilized} onChange={() => update('sterilized', true)} /> 已绝育
                </label>
              </div>
            </div>
            <div>
              <label className="label-field">当前状态</label>
              <select className="input-field" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="sheltering">收容中</option>
                <option value="treating">治疗中</option>
                <option value="recovering">康复中</option>
                <option value="adoptable">待领养</option>
                <option value="adopted">已领养</option>
                <option value="followup">回访期</option>
              </select>
            </div>
            <div>
              <label className="label-field">所属救助站</label>
              <select className="input-field" value={form.stationId} onChange={e => update('stationId', e.target.value)}>
                {state.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Behavioral */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">性格与行为评估</h3>
          <div className="space-y-4">
            <div>
              <label className="label-field">性格描述</label>
              <textarea className="input-field min-h-[80px]" value={form.personality} onChange={e => update('personality', e.target.value)} placeholder="如：活泼亲人、安静沉稳、高冷独立..." />
            </div>
            <div>
              <label className="label-field">行为评估/训练情况</label>
              <textarea className="input-field min-h-[80px]" value={form.behaviorNotes} onChange={e => update('behaviorNotes', e.target.value)} placeholder="如厕习惯、与人/其他动物互动、服从指令情况..." />
            </div>
            <div>
              <label className="label-field">健康记录摘要</label>
              <textarea className="input-field min-h-[80px]" value={form.healthRecord} onChange={e => update('healthRecord', e.target.value)} placeholder="整体健康状况、需要特别注意的事项..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate('/animals')}>取消</button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> 创建档案
          </button>
        </div>
      </form>
    </div>
  );
}
