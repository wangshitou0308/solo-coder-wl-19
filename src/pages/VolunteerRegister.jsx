import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { volunteerDirections } from '../data/mockData';
import {
  ChevronLeft,
  Send,
  Users,
  Truck,
  Home,
  FileCheck,
  PenLine,
  Check,
} from 'lucide-react';

const dirIconMap = { transport: Truck, foster: Home, onsite: Users, review: FileCheck, copywriting: PenLine };

export default function VolunteerRegister() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    directions: [],
    skills: '',
    experience: '',
    availableTime: '',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleDir = (label) => {
    const dirLabelMap = { transport: '运输', foster: '临时寄养', onsite: '现场协助', review: '审核', copywriting: '文案' };
    const labelVal = dirLabelMap[label];
    setForm(p => ({
      ...p,
      directions: p.directions.includes(labelVal)
        ? p.directions.filter(x => x !== labelVal)
        : [...p.directions, labelVal]
    }));
  };

  const validate = (s) => {
    if (s === 1 && (!form.name || !form.phone || !form.email)) {
      alert('请填写完整的基本信息');
      return false;
    }
    if (s === 2 && form.directions.length === 0) {
      alert('请至少选择一个参与方向');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate(2)) return;
    dispatch({
      type: 'ADD_VOLUNTEER',
      payload: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        directions: form.directions,
        skills: form.skills.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean),
      },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'task', message: `新志愿者${form.name}注册成功` },
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-6">注册提交成功！</h2>
          <p className="text-gray-500 mt-2">感谢您的爱心，欢迎加入志愿者大家庭</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-800 text-left space-y-2">
            <p>✅ 您的申请已提交，管理员将在3个工作日内完成资质审核</p>
            <p>✅ 审核通过后您将收到短信通知，并可开始认领平台任务</p>
            <p>✅ 首次参与建议先参加线下培训，了解救援安全知识</p>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <button className="btn-secondary" onClick={() => navigate('/volunteers')}>
              <ChevronLeft className="w-4 h-4" /> 返回志愿者列表
            </button>
            <button className="btn-primary" onClick={() => navigate('/tasks')}>
              浏览任务中心 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = ['基本信息', '参与方向', '技能经验'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate('/volunteers')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-500" />
            志愿者注册
          </h1>
          <p className="text-sm text-gray-500 mt-1">加入我们，为流浪动物贡献一份力量</p>
        </div>
      </div>

      <div className="card !p-4">
        <div className="flex items-center justify-between">
          {steps.map((label, idx) => {
            const n = idx + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center gap-3 flex-1 last:flex-none">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 ${
                  done ? 'bg-primary-500 text-white' : active ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300' : 'bg-gray-100 text-gray-500'
                }`}>
                  {done ? '✓' : n}
                </div>
                <div className={`text-sm ${active || done ? 'font-medium text-gray-800' : 'text-gray-400'}`}>{label}</div>
                {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-primary-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 && (
        <div className="card space-y-5">
          <h3 className="font-semibold text-gray-800">填写您的基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">姓名 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="真实姓名" />
            </div>
            <div>
              <label className="label-field">手机号 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="用于接收任务通知" />
            </div>
            <div className="col-span-2">
              <label className="label-field">电子邮箱 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.email} onChange={e => update('email', e.target.value)} placeholder="example@email.com" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button className="btn-primary" onClick={() => validate(1) && setStep(2)}>下一步 →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-5">
          <h3 className="font-semibold text-gray-800">选择您想参与的方向 <span className="text-red-500 text-sm font-normal">（可多选）</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {volunteerDirections.map(d => {
              const Icon = dirIconMap[d.key] || Users;
              const dirLabelMap = { transport: '运输', foster: '临时寄养', onsite: '现场协助', review: '审核', copywriting: '文案' };
              const checked = form.directions.includes(dirLabelMap[d.key]);
              return (
                <label key={d.key} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  checked ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleDir(d.key)} />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${checked ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{d.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {d.key === 'transport' && '负责从发现地点运输动物到救助站，或协助接送就医'}
                      {d.key === 'foster' && '在家中临时收容需要照顾的幼崽、病后恢复期动物'}
                      {d.key === 'onsite' && '到救助站协助日常照料、清洁、遛狗、社会化训练等'}
                      {d.key === 'review' && '审核领养资料、参与电话回访、视频家访等工作'}
                      {d.key === 'copywriting' && '撰写领养推广文案、公众号内容、剪辑视频等'}
                    </div>
                  </div>
                  {checked && <Check className="w-5 h-5 text-primary-600 mt-1" />}
                </label>
              );
            })}
          </div>
          <div className="flex justify-between pt-2">
            <button className="btn-secondary" onClick={() => setStep(1)}>← 上一步</button>
            <button className="btn-primary" onClick={() => validate(2) && setStep(3)}>下一步 →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card space-y-5">
          <h3 className="font-semibold text-gray-800">填写您的技能与经验（选填）</h3>
          <div>
            <label className="label-field">专业技能/特长 <span className="text-xs text-gray-400">（逗号分隔多个）</span></label>
            <textarea
              className="input-field min-h-[80px]"
              value={form.skills}
              onChange={e => update('skills', e.target.value)}
              placeholder="如：持有驾照可运输、宠物美容师资格、兽医专业、摄影、视频剪辑、公众号运营、急救培训合格..."
            />
          </div>
          <div>
            <label className="label-field">相关经验描述</label>
            <textarea
              className="input-field min-h-[100px]"
              value={form.experience}
              onChange={e => update('experience', e.target.value)}
              placeholder="描述您过往参与志愿服务或养宠相关的经历..."
            />
          </div>
          <div>
            <label className="label-field">可参与时间</label>
            <select className="input-field" value={form.availableTime} onChange={e => update('availableTime', e.target.value)}>
              <option value="">请选择</option>
              <option>工作日白天</option>
              <option>工作日晚上</option>
              <option>周末全天</option>
              <option>时间灵活</option>
              <option>仅节假日</option>
            </select>
          </div>
          <div className="flex justify-between pt-2">
            <button className="btn-secondary" onClick={() => setStep(2)}>← 上一步</button>
            <button className="btn-primary flex items-center gap-2" onClick={handleSubmit}>
              <Send className="w-4 h-4" /> 提交申请
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
