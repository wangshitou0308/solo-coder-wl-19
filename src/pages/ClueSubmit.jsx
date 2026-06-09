import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  MapPin,
  Upload,
  Camera,
  Send,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Building2,
  Navigation,
} from 'lucide-react';

const presetLocations = [
  { name: '海淀区五道口地铁站附近', lat: 39.9927, lng: 116.3374 },
  { name: '朝阳区国贸CBD商圈', lat: 39.9087, lng: 116.4600 },
  { name: '西城区西单商场后门', lat: 39.9047, lng: 116.3700 },
  { name: '东城区王府井步行街', lat: 39.9087, lng: 116.4174 },
  { name: '丰台区北京西站南广场', lat: 39.8947, lng: 116.3274 },
  { name: '石景山区游乐园附近', lat: 39.9047, lng: 116.2174 },
];

const presetPhotos = [
  'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=500',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=500',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500',
  'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=500',
  'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=500',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500',
];

export default function ClueSubmit() {
  const { state, dispatch, findNearestStation } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    reporterName: '',
    reporterPhone: '',
    species: '',
    location: '',
    lat: null,
    lng: null,
    features: '',
    healthObserve: '',
    photo: '',
  });
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [assignedStation, setAssignedStation] = useState(null);
  const [distance, setDistance] = useState(0);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const autoAssign = (lat, lng) => {
    const result = findNearestStation(lat, lng);
    if (result) {
      setAssignedStation(result.station);
      setDistance(result.distance);
    }
  };

  const handleLocationSelect = (loc) => {
    update('location', loc.name);
    update('lat', loc.lat);
    update('lng', loc.lng);
    autoAssign(loc.lat, loc.lng);
  };

  const handleGetCurrentLocation = () => {
    const loc = presetLocations[Math.floor(Math.random() * presetLocations.length)];
    handleLocationSelect(loc);
  };

  const handlePhotoSelect = (url) => {
    update('photo', url);
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!form.reporterName || !form.reporterPhone || !form.species) {
        alert('请填写完整的联系人和动物种类信息');
        return false;
      }
      return true;
    }
    if (s === 2) {
      if (!form.location) {
        alert('请选择或填写发现位置');
        return false;
      }
      return true;
    }
    if (s === 3) {
      if (!form.features || !form.healthObserve || !form.photo) {
        alert('请填写完整的体貌特征、健康观察并上传照片');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    if (form.lat && form.lng && !assignedStation) {
      const result = findNearestStation(form.lat, form.lng);
      if (result) {
        setAssignedStation(result.station);
        setDistance(result.distance);
      }
    }

    dispatch({
      type: 'ADD_CLUE',
      payload: { ...form },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'clue', message: `收到市民${form.reporterName}上报的救助线索` },
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-6">线索提交成功！</h2>
          <p className="text-gray-500 mt-2">感谢您的爱心，我们会尽快安排救助。</p>

          <div className="mt-8 p-5 bg-blue-50 rounded-xl text-left space-y-3 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              <Building2 className="w-5 h-5" />
              系统已自动就近分配救助站
            </div>
            {assignedStation ? (
              <>
                <div className="ml-7">
                  <div className="font-medium">{assignedStation.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{assignedStation.address}</div>
                  <div className="text-sm text-gray-600">联系电话：{assignedStation.phone}</div>
                  <div className="text-xs text-primary-600 mt-2">
                    距离发现地点约 {distance.toFixed(1)} 公里
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600 ml-7">人工分配中...</div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button className="btn-secondary" onClick={() => navigate('/clues')}>
              <ChevronLeft className="w-4 h-4" /> 返回线索列表
            </button>
            <button className="btn-primary" onClick={() => { setSubmitted(false); setStep(1); setForm({ reporterName: '', reporterPhone: '', species: '', location: '', lat: null, lng: null, features: '', healthObserve: '', photo: '' }); setAssignedStation(null); }}>
              继续提交新线索
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate('/clues')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">市民救助线索提交</h1>
          <p className="text-sm text-gray-500 mt-1">发现流浪动物？请填写信息，我们将就近派遣救助</p>
        </div>
      </div>

      {/* Steps */}
      <div className="card !p-4">
        <div className="flex items-center justify-between">
          {['基本信息', '发现位置', '详情描述'].map((label, idx) => {
            const n = idx + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center gap-3 flex-1 last:flex-none">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 transition-colors ${
                  done ? 'bg-primary-500 text-white' : active ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300' : 'bg-gray-100 text-gray-500'
                }`}>
                  {done ? '✓' : n}
                </div>
                <div className={`text-sm ${active || done ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                  {label}
                </div>
                {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-primary-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">您的姓名 <span className="text-red-500">*</span></label>
                <input className="input-field" value={form.reporterName} onChange={(e) => update('reporterName', e.target.value)} placeholder="如：李明" />
              </div>
              <div>
                <label className="label-field">联系电话 <span className="text-red-500">*</span></label>
                <input className="input-field" value={form.reporterPhone} onChange={(e) => update('reporterPhone', e.target.value)} placeholder="手机号以便核实情况" />
              </div>
            </div>

            <div>
              <label className="label-field">动物种类 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {['犬', '猫', '其他'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`p-4 rounded-xl border-2 transition-all ${
                      form.species === s
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => update('species', s)}
                  >
                    <div className="text-3xl mb-1">{s === '犬' ? '🐕' : s === '猫' ? '🐈' : '🐾'}</div>
                    <div className="font-medium">{s === '其他' ? '其他动物' : s + '类'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-warm-50 rounded-xl flex items-start gap-3 border border-warm-100">
              <AlertCircle className="w-5 h-5 text-warm-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warm-800">
                紧急情况请直接拨打救助热线：<b>400-123-4567</b>，同时请勿直接接触疑似有攻击性的动物。
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn-primary" onClick={() => validateStep(1) && setStep(2)}>下一步 →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-field !mb-0">发现位置 <span className="text-red-500">*</span></label>
                <button className="text-sm text-primary-600 hover:underline flex items-center gap-1" onClick={handleGetCurrentLocation}>
                  <Navigation className="w-4 h-4" /> 使用当前位置
                </button>
              </div>
              <input
                className="input-field"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="手动输入详细地址或选择下方常用位置"
              />
            </div>

            <div>
              <label className="label-field">常用位置（点击快速选择）</label>
              <div className="grid grid-cols-2 gap-2">
                {presetLocations.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    className={`p-3 rounded-lg border text-left text-sm transition-all ${
                      form.location === loc.name
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleLocationSelect(loc)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{loc.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {assignedStation && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-1">
                <div className="font-medium text-green-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  系统推荐最近救助站
                </div>
                <div className="ml-7 text-sm">
                  <div className="font-medium">{assignedStation.name}</div>
                  <div className="text-gray-600">{assignedStation.address}</div>
                  <div className="text-xs text-primary-600 mt-1">距离约 {distance.toFixed(1)} 公里</div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button className="btn-secondary" onClick={() => setStep(1)}>← 上一步</button>
              <button className="btn-primary" onClick={() => validateStep(2) && setStep(3)}>下一步 →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="label-field">体貌特征 <span className="text-red-500">*</span></label>
              <textarea
                className="input-field min-h-[80px]"
                value={form.features}
                onChange={(e) => update('features', e.target.value)}
                placeholder="毛色、体型、明显特征、是否佩戴颈圈等，如：三花母猫，左后腿有明显伤疤"
              />
            </div>

            <div>
              <label className="label-field">健康初步观察 <span className="text-red-500">*</span></label>
              <textarea
                className="input-field min-h-[80px]"
                value={form.healthObserve}
                onChange={(e) => update('healthObserve', e.target.value)}
                placeholder="精神状态、是否受伤、是否跛行、食欲、攻击性等"
              />
            </div>

            <div>
              <label className="label-field">上传现场照片 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {presetPhotos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`aspect-video rounded-xl overflow-hidden border-2 transition-all relative group ${
                      form.photo === url
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePhotoSelect(url)}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {form.photo === url && (
                      <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white">✓</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button type="button" className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-500">
                <Upload className="w-8 h-8" />
                <span className="text-sm">点击上传本地照片（演示环境使用示例图）</span>
              </button>
            </div>

            <div className="flex justify-between pt-2">
              <button className="btn-secondary" onClick={() => setStep(2)}>← 上一步</button>
              <button className="btn-primary flex items-center gap-2" onClick={handleSubmit}>
                <Send className="w-4 h-4" /> 提交线索
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
