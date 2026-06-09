import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { followupSchedule } from '../data/mockData';
import {
  ChevronLeft,
  Phone,
  Video,
  Calendar,
  Check,
  X,
  Save,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  FileCheck,
  Home,
  HeartHandshake,
  AlertCircle,
  StickyNote,
  Eye,
} from 'lucide-react';

export default function AdoptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const adoption = state.adoptions.find(a => a.id === id);
  const animal = state.animals.find(a => a.id === adoption?.animalId);

  const [activeTab, setActiveTab] = useState('review');
  const [reviewStep, setReviewStep] = useState('basic');
  const [phoneForm, setPhoneForm] = useState({ date: adoption?.phoneInterviewDate || '', notes: adoption?.phoneInterviewNotes || '' });
  const [visitForm, setVisitForm] = useState({ date: adoption?.homeVisitDate || '', pass: adoption?.homeVisitPass ?? null, notes: adoption?.homeVisitNotes || '' });
  const [meetDate, setMeetDate] = useState(adoption?.meetDate || '');
  const [signDate, setSignDate] = useState(adoption?.signedDate || '');

  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [followupPhotos, setFollowupPhotos] = useState([]);
  const [followupNotes, setFollowupNotes] = useState('');

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditF, setAuditF] = useState(null);
  const [auditAmount, setAuditAmount] = useState(0);
  const [auditNote, setAuditNote] = useState('');

  if (!adoption) {
    return (
      <div className="space-y-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800" onClick={() => navigate('/adoptions')}>
          <ChevronLeft className="w-5 h-5" /> 返回列表
        </button>
        <div className="card text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">未找到该领养记录</div>
        </div>
      </div>
    );
  }

  const reviewSteps = [
    { key: 'basic', label: '申请资料', icon: FileCheck, done: true },
    { key: 'phone', label: '电话回访', icon: Phone, done: !!adoption.phoneInterviewDate, active: adoption.status === 'reviewing' },
    { key: 'visit', label: '视频家访', icon: Video, done: !!adoption.homeVisitDate, active: adoption.phoneInterviewDate && !adoption.homeVisitDate },
    { key: 'meet', label: '见面确认', icon: Eye, done: !!adoption.meetDate, active: adoption.homeVisitPass && !adoption.meetDate },
    { key: 'sign', label: '签约付款', icon: CheckCircle, done: !!adoption.signedDate, active: adoption.meetDate && !adoption.signedDate },
  ];

  const currentStepIdx = reviewSteps.findIndex(s => s.key === reviewStep);

  const handleSavePhone = () => {
    if (!phoneForm.date || !phoneForm.notes) { alert('请填写日期和回访记录'); return; }
    dispatch({ type: 'UPDATE_ADOPTION', payload: { id, data: { phoneInterviewDate: phoneForm.date, phoneInterviewNotes: phoneForm.notes } } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'adoption', message: `领养${id}电话回访已完成` } });
    alert('电话回访记录已保存');
    setReviewStep('visit');
  };

  const handleSaveVisit = () => {
    if (!visitForm.date || visitForm.pass === null || !visitForm.notes) { alert('请填写完整信息'); return; }
    dispatch({ type: 'UPDATE_ADOPTION', payload: { id, data: { homeVisitDate: visitForm.date, homeVisitPass: visitForm.pass, homeVisitNotes: visitForm.notes } } });
    if (!visitForm.pass) {
      dispatch({ type: 'UPDATE_ADOPTION', payload: { id, data: { status: 'rejected' } } });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'adoption', message: `领养${id}家访未通过` } });
      alert('家访未通过，申请已拒绝');
      return;
    }
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'adoption', message: `领养${id}家访通过` } });
    alert('家访通过，可预约见面');
    setReviewStep('meet');
  };

  const handleSaveMeet = () => {
    if (!meetDate) { alert('请选择见面日期'); return; }
    dispatch({ type: 'UPDATE_ADOPTION', payload: { id, data: { meetDate } } });
    alert('见面日期已确认');
    setReviewStep('sign');
  };

  const handleSignAndAdopt = () => {
    if (!signDate) { alert('请选择签约日期'); return; }
    if (!confirm('确认完成签约并支付押金？此操作将：\n1. 将动物状态变更为回访期\n2. 自动生成5个回访任务\n3. 记录押金支付完成')) return;
    dispatch({ type: 'APPROVE_ADOPTION_AND_SIGN', payload: { adoptionId: id, signedDate: signDate } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'adoption', message: `领养${id}已完成签约，${animal?.name || '动物'}进入回访期` } });
    alert('领养手续已完成！系统已自动生成回访任务');
    setActiveTab('followup');
  };

  const handleOpenFollowup = (f) => {
    setSelectedFollowup(f);
    setFollowupPhotos(f.photos || []);
    setFollowupNotes(f.notes || '');
    setShowFollowupModal(true);
  };

  const handleSubmitFollowup = () => {
    if (!followupNotes || followupPhotos.length === 0) { alert('请上传照片并填写回访记录'); return; }
    dispatch({
      type: 'SUBMIT_FOLLOWUP',
      payload: { adoptionId: id, followupId: selectedFollowup.id, photos: followupPhotos, notes: followupNotes },
    });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'followup', message: `领养${id}第${selectedFollowup.day}天回访待审核` } });
    setShowFollowupModal(false);
    alert('回访已提交，等待救助站审核');
  };

  const handleOpenAudit = (f) => {
    setAuditF(f);
    const percentMap = { 7: 0.25, 30: 0.375, 90: 0.15, 180: 0.125, 365: 0.10 };
    setAuditAmount(Math.round(adoption.depositAmount * (percentMap[f.day] || 0)));
    setAuditNote('');
    setShowAuditModal(true);
  };

  const handleAuditApprove = () => {
    if (!confirm(`确认审核通过并退还押金 ¥${auditAmount}？`)) return;
    dispatch({ type: 'AUDIT_FOLLOWUP', payload: { adoptionId: id, followupId: auditF.id, approved: true, amount: auditAmount } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'followup', message: `第${auditF.day}天回访通过，退还¥${auditAmount}` } });
    setShowAuditModal(false);
  };

  const handleAuditReject = () => {
    dispatch({ type: 'AUDIT_FOLLOWUP', payload: { adoptionId: id, followupId: auditF.id, approved: false, amount: 0 } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'followup', message: `第${auditF.day}天回访未通过，需补充材料` } });
    setShowAuditModal(false);
    alert('已标记不通过');
  };

  const handleMarkOverdue = (f) => {
    if (!confirm('确认标记为超期并触发人工跟进？')) return;
    dispatch({ type: 'MARK_FOLLOWUP_OVERDUE', payload: { adoptionId: id, followupId: f.id } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'followup', message: `领养${id}第${f.day}天回访超期，需人工跟进` } });
  };

  const totalReleased = adoption.followups.reduce((acc, f) => acc + (f.depositReleased || 0), 0);
  const depositProgress = Math.round((totalReleased / adoption.depositAmount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate('/adoptions')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            领养申请 #{id}
            <span className={`status-badge ${
              adoption.status === 'completed' ? 'bg-primary-100 text-primary-700' :
              adoption.status === 'reviewing' ? 'bg-warm-100 text-warm-700' :
              adoption.status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {adoption.status === 'completed' ? '已完成' : adoption.status === 'reviewing' ? '审核中' : adoption.status === 'rejected' ? '未通过' : adoption.status}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {adoption.applicantName} 申请领养
            <Link to={`/animals/${adoption.animalId}`} className="text-primary-600 hover:underline font-medium mx-1">{adoption.animalName}</Link>
            · 申请日期 {adoption.applyTime}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card !p-0 overflow-hidden lg:col-span-2">
          <div className="flex">
            {animal && (
              <div className="w-40 flex-shrink-0 bg-gray-100">
                <img src={animal.photo} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-primary-500" />
                    {adoption.applicantName}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">{adoption.applicantPhone} · {adoption.idCard}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">押金</div>
                  <div className="font-bold text-warm-600">¥{totalReleased} / ¥{adoption.depositAmount}</div>
                  <div className="mt-1 h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${depositProgress}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500">住房</div>
                  <div className="font-medium">{adoption.housingType} {adoption.housingArea}㎡</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">家庭成员</div>
                  <div className="font-medium">{adoption.familyMembers}人{adoption.hasChildren ? `·${adoption.childrenAge}` : ''}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">其他宠物</div>
                  <div className="font-medium">{adoption.hasOtherPets ? '有' : '无'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {['TEL 电话回访', '视频家访', '见面签约'].map((label, i) => {
          const done = [!!adoption.phoneInterviewDate, !!adoption.homeVisitDate, !!adoption.signedDate][i];
          const date = [adoption.phoneInterviewDate, adoption.homeVisitDate, adoption.signedDate][i];
          const icons = [Phone, Video, CheckCircle];
          const Icon = icons[i];
          return (
            <div key={label} className={`card !p-5 ${done ? 'bg-green-50 border-green-100' : ''}`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {done && <Check className="w-5 h-5 text-green-500" />}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-800">{label}</div>
              <div className="text-xs text-gray-500 mt-1">{done ? date : '待进行'}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-2">
          {[
            { key: 'review', label: '审核流程', icon: FileCheck },
            { key: 'followup', label: '回访管理', icon: Calendar, badge: adoption.followups.filter(f => f.status === 'overdue' || (f.status === 'completed' && f.auditStatus === 'pending')).length },
            { key: 'docs', label: '证明材料', icon: Upload },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-5 py-4 font-medium text-sm border-b-2 transition-colors relative ${
                active ? 'text-primary-600 border-primary-600 bg-primary-50/50' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}>
                <Icon className="w-4 h-4" />
                {t.label}
                {t.badge > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{t.badge}</span>}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'review' && (
            <div className="max-w-4xl">
              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 bg-gray-50 rounded-xl p-4">
                {reviewSteps.map((step, i) => {
                  const Icon = step.icon;
                  const done = step.done;
                  const active = reviewStep === step.key;
                  const current = currentStepIdx;
                  return (
                    <div key={step.key} className="flex items-center gap-3 flex-1 last:flex-none">
                      <button
                        onClick={() => setReviewStep(step.key)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          done ? 'bg-green-500 text-white' :
                          active ? 'bg-primary-100 text-primary-700 ring-4 ring-primary-100' :
                          'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </button>
                      <div className="min-w-0">
                        <div className={`text-sm font-medium whitespace-nowrap ${active || done ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </div>
                      </div>
                      {i < reviewSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${i < current || done ? 'bg-green-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Content */}
              {reviewStep === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">申请人资料</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <Info label="姓名" value={adoption.applicantName} />
                      <Info label="电话" value={adoption.applicantPhone} />
                      <Info label="身份证" value={adoption.idCard} />
                      <Info label="申请日期" value={adoption.applyTime} />
                      <Info label="住房类型" value={`${adoption.housingType} · ${adoption.housingArea}㎡`} />
                      <Info label="家庭情况" value={`${adoption.familyMembers}人${adoption.hasChildren ? ` · 有${adoption.childrenAge}小孩` : ' · 无小孩'}`} />
                      <Info label="其他宠物" value={adoption.hasOtherPets ? '有' : '无'} />
                      <Info label="押金金额" value={`¥${adoption.depositAmount}`} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">养宠经验</h4>
                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed">{adoption.petExperience || '未填写'}</div>
                  </div>
                  <div className="flex justify-end">
                    <button className="btn-primary" onClick={() => setReviewStep('phone')}>开始审核流程 →</button>
                  </div>
                </div>
              )}

              {reviewStep === 'phone' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">第1步：电话回访</div>
                      <div>请与申请人进行电话沟通，核实家庭情况、养宠认知等信息，并在下方填写回访记录。</div>
                    </div>
                  </div>
                  <div>
                    <label className="label-field">回访日期 <span className="text-red-500">*</span></label>
                    <input type="date" className="input-field" value={phoneForm.date} onChange={e => setPhoneForm(p => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-field">电话回访记录 <span className="text-red-500">*</span></label>
                    <textarea className="input-field min-h-[120px]" value={phoneForm.notes} onChange={e => setPhoneForm(p => ({ ...p, notes: e.target.value }))} placeholder="记录沟通内容，包括：养宠意愿真实性、对动物品种的了解、是否了解照顾责任等..." />
                  </div>
                  <div className="flex justify-between pt-2">
                    <button className="btn-secondary" onClick={() => setReviewStep('basic')}>← 返回</button>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-red-600 !bg-red-50 !border-red-100" onClick={() => {
                        if (!confirm('确认拒绝此领养申请？')) return;
                        dispatch({ type: 'UPDATE_ADOPTION', payload: { id, data: { status: 'rejected' } } });
                        alert('申请已拒绝');
                      }}>拒绝申请</button>
                      <button className="btn-primary flex items-center gap-2" onClick={handleSavePhone}><Check className="w-4 h-4" />保存并进入家访</button>
                    </div>
                  </div>
                </div>
              )}

              {reviewStep === 'visit' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-3">
                    <Video className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-800">
                      <div className="font-medium mb-1">第2步：视频家访</div>
                      <div>通过视频连线确认申请人住房环境安全：窗户是否封窗、有无安全隐患、是否有宠物活动空间等。</div>
                    </div>
                  </div>
                  <div>
                    <label className="label-field">家访日期 <span className="text-red-500">*</span></label>
                    <input type="date" className="input-field" value={visitForm.date} onChange={e => setVisitForm(p => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-field">家访评估结论 <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="cursor-pointer">
                        <input type="radio" name="visitPass" className="sr-only peer" checked={visitForm.pass === true} onChange={() => setVisitForm(p => ({ ...p, pass: true }))} />
                        <div className="p-4 rounded-xl border-2 text-center peer-checked:border-green-500 peer-checked:bg-green-50 border-gray-200 transition-colors">
                          <Check className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <div className="font-medium text-green-700">环境合格，通过</div>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="visitPass" className="sr-only peer" checked={visitForm.pass === false} onChange={() => setVisitForm(p => ({ ...p, pass: false }))} />
                        <div className="p-4 rounded-xl border-2 text-center peer-checked:border-red-500 peer-checked:bg-red-50 border-gray-200 transition-colors">
                          <X className="w-8 h-8 text-red-500 mx-auto mb-1" />
                          <div className="font-medium text-red-700">存在隐患，不通过</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="label-field">家访详细记录 <span className="text-red-500">*</span></label>
                    <textarea className="input-field min-h-[120px]" value={visitForm.notes} onChange={e => setVisitForm(p => ({ ...p, notes: e.target.value }))} placeholder="记录检查内容：阳台封窗情况、家中潜在危险物品、是否有独立活动空间、家人态度等..." />
                  </div>
                  <div className="flex justify-between pt-2">
                    <button className="btn-secondary" onClick={() => setReviewStep('phone')}>← 返回</button>
                    <button className="btn-primary flex items-center gap-2" onClick={handleSaveVisit}><Save className="w-4 h-4" />保存结果</button>
                  </div>
                </div>
              )}

              {reviewStep === 'meet' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                    <Home className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-800">
                      <div className="font-medium mb-1">第3步：预约到站见面</div>
                      <div>安排申请人到救助站与动物当面互动，确认双方适合后签约。</div>
                    </div>
                  </div>
                  <div>
                    <label className="label-field">见面日期 <span className="text-red-500">*</span></label>
                    <input type="date" className="input-field" value={meetDate} onChange={e => setMeetDate(e.target.value)} />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                    <div className="font-medium text-gray-800">📋 见面确认清单</div>
                    <ul className="text-gray-600 space-y-1 list-disc list-inside">
                      <li>确认申请人带齐身份证原件</li>
                      <li>在工作人员陪同下完成15-30分钟互动</li>
                      <li>观察动物对申请人的反应是否积极</li>
                      <li>再次讲解照顾要点和回访要求</li>
                    </ul>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button className="btn-secondary" onClick={() => setReviewStep('visit')}>← 返回</button>
                    <button className="btn-primary flex items-center gap-2" onClick={handleSaveMeet}><Calendar className="w-4 h-4" />确认并进入签约</button>
                  </div>
                </div>
              )}

              {reviewStep === 'sign' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <div className="font-medium mb-1">第4步：签署协议 & 支付押金</div>
                      <div>所有审核步骤已通过。确认签约后，系统将自动生成回访任务并更新动物状态。</div>
                    </div>
                  </div>
                  <div>
                    <label className="label-field">签约日期 <span className="text-red-500">*</span></label>
                    <input type="date" className="input-field" value={signDate} onChange={e => setSignDate(e.target.value)} />
                  </div>
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium flex items-center gap-2 border-b">
                      <FileCheck className="w-5 h-5 text-primary-500" />
                      电子领养协议（预览）
                    </div>
                    <div className="p-5 text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto space-y-3">
                      <p className="font-medium text-center">《流浪动物领养协议》</p>
                      <p>第一条 领养人 {adoption.applicantName}（身份证号：{adoption.idCard}）自愿向救助站领养 <b>{adoption.animalName}</b>（编号：{adoption.animalId}）。</p>
                      <p>第二条 领养人应科学养宠，按时接种疫苗、驱虫，提供必要的医疗、食物和居住环境。</p>
                      <p>第三条 领养人承诺不弃养、不虐待、不用于繁殖或实验用途。如需转让需经救助站同意。</p>
                      <p>第四条 领养人需配合救助站完成第7、30、90天及半年、一年共5次回访，上传照片供审核。</p>
                      <p>第五条 领养押金 ¥{adoption.depositAmount} 元，将按回访节点分期退还。违反任一条款，救助站有权收回动物并没收押金。</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Info label="押金金额" value={`¥${adoption.depositAmount}`} highlight />
                    <Info label="支付状态" value={adoption.depositPaid ? '已支付' : '待支付'} highlight={adoption.depositPaid} />
                  </div>
                  <div className="flex justify-between pt-2">
                    <button className="btn-secondary" onClick={() => setReviewStep('meet')}>← 返回</button>
                    <button className="btn-primary flex items-center gap-2" onClick={handleSignAndAdopt}><Check className="w-4 h-4" />确认签约并生效</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'followup' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">回访任务计划</h4>
                  <p className="text-xs text-gray-500 mt-1">签约后按自动生成的节点执行；第7/30/90天、半年、一年</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">签约日期：</span>
                  <span className="font-medium">{adoption.signedDate || '未签约'}</span>
                </div>
              </div>

              {adoption.followups.length === 0 ? (
                <div className="p-12 bg-gray-50 rounded-xl text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto" />
                  <div className="text-gray-500 mt-3">尚未生成回访任务，请先完成签约</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {adoption.followups.map((f, idx) => {
                    const percentMap = { 7: 0.25, 30: 0.375, 90: 0.15, 180: 0.125, 365: 0.10 };
                    const deposit = Math.round(adoption.depositAmount * percentMap[f.day]);
                    const isPending = f.status === 'pending';
                    const isCompleted = f.status === 'completed';
                    const isOverdue = f.status === 'overdue';
                    const approved = f.auditStatus === 'approved';
                    const rejected = f.auditStatus === 'rejected';
                    const pendingAudit = isCompleted && f.auditStatus === 'pending';

                    return (
                      <div key={f.id} className={`card !p-0 overflow-hidden ${isOverdue ? 'ring-2 ring-red-200' : pendingAudit ? 'ring-2 ring-blue-200' : ''}`}>
                        <div className={`px-5 py-4 flex items-center justify-between border-b ${
                          approved ? 'bg-green-50' : isOverdue ? 'bg-red-50' : pendingAudit ? 'bg-blue-50' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                              approved ? 'bg-green-500 text-white' :
                              isOverdue ? 'bg-red-500 text-white' :
                              pendingAudit ? 'bg-blue-500 text-white' :
                              isCompleted ? 'bg-primary-100 text-primary-700' :
                              'bg-gray-200 text-gray-500'
                            }`}>
                              {approved ? <Check className="w-5 h-5" /> : isOverdue ? <AlertTriangle className="w-5 h-5" /> : idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                第 {f.day} 天回访
                                {f.day === 180 && <span className="text-xs text-gray-400 font-normal ml-1">（半年）</span>}
                                {f.day === 365 && <span className="text-xs text-gray-400 font-normal ml-1">（一年）</span>}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                截止日期：{f.dueDate}
                                <span className="mx-2">·</span>
                                对应押金：¥{deposit}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPending && (
                              <span className="status-badge bg-gray-100 text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> 待提交</span>
                            )}
                            {isCompleted && !pendingAudit && approved && (
                              <span className="status-badge bg-green-100 text-green-700 flex items-center gap-1"><Check className="w-3 h-3" /> 审核通过 +¥{f.depositReleased}</span>
                            )}
                            {isCompleted && rejected && (
                              <span className="status-badge bg-red-100 text-red-700">需重新提交</span>
                            )}
                            {pendingAudit && (
                              <span className="status-badge bg-blue-100 text-blue-700 flex items-center gap-1"><Clock className="w-3 h-3" /> 审核中</span>
                            )}
                            {isOverdue && (
                              <span className="status-badge bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 已超期</span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          {isCompleted || approved ? (
                            <>
                              {f.photos && f.photos.length > 0 && (
                                <div className="flex gap-2">
                                  {f.photos.map((p, i) => (
                                    <img key={i} src={p} alt="" className="w-20 h-20 rounded-lg object-cover" />
                                  ))}
                                </div>
                              )}
                              <div className="text-sm">
                                <span className="text-gray-500">回访记录：</span>
                                <span className="text-gray-700">{f.notes || '（无）'}</span>
                              </div>
                              {pendingAudit && (
                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                  <button className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={() => handleOpenAudit(f)}>
                                    <FileCheck className="w-4 h-4" /> 审核回访
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 italic">尚未提交回访资料</div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            {(isPending || rejected || isOverdue) && (
                              <button className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1" onClick={() => handleOpenFollowup(f)}>
                                <Upload className="w-4 h-4" /> {isOverdue || rejected ? '重新提交回访' : '提交回访资料'}
                              </button>
                            )}
                            {isOverdue && (
                              <button className="btn-secondary !py-1.5 !px-3 text-sm text-red-600 !bg-red-50 flex items-center gap-1" onClick={() => handleMarkOverdue(f)}>
                                <Send className="w-4 h-4" /> 标记人工跟进
                              </button>
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

          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="w-5 h-5 text-primary-500" />
                  <h4 className="font-semibold">住房证明</h4>
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                  <FileCheck className="w-12 h-12 mb-2" />
                  <div className="text-sm font-medium">{adoption.housingProofUrl}</div>
                  <button className="mt-3 text-sm text-primary-600 hover:underline flex items-center gap-1"><Eye className="w-4 h-4" /> 查看原件</button>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck className="w-5 h-5 text-primary-500" />
                  <h4 className="font-semibold">身份证件</h4>
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                  <FileCheck className="w-12 h-12 mb-2" />
                  <div className="text-sm font-medium">{adoption.idCardUrl}</div>
                  <button className="mt-3 text-sm text-primary-600 hover:underline flex items-center gap-1"><Eye className="w-4 h-4" /> 查看原件</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Followup Submit Modal */}
      {showFollowupModal && selectedFollowup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFollowupModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold">提交第 {selectedFollowup.day} 天回访</h3>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => setShowFollowupModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="label-field">上传近况照片 <span className="text-red-500">*</span>（至少1张）</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[
                    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300',
                    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300',
                    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300',
                    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300',
                  ].map((url, i) => {
                    const selected = followupPhotos.includes(url);
                    return (
                      <button key={i} type="button" className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selected ? 'border-primary-500' : 'border-gray-200'}`} onClick={() => {
                        setFollowupPhotos(prev => prev.includes(url) ? prev.filter(p => p !== url) : [...prev, url]);
                      }}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {selected && <div className="-mt-full h-full bg-primary-500/30 flex items-center justify-center"><div className="w-6 h-6 bg-white rounded-full text-primary-500 flex items-center justify-center font-bold">✓</div></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="label-field">近况描述 <span className="text-red-500">*</span></label>
                <textarea className="input-field min-h-[100px]" value={followupNotes} onChange={e => setFollowupNotes(e.target.value)} placeholder="请描述：饮食、精神、活动量、与人互动情况、是否有异常等..." />
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                <StickyNote className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>审核通过后将退还对应押金：<b>¥{Math.round(adoption.depositAmount * ({ 7: 0.25, 30: 0.375, 90: 0.15, 180: 0.125, 365: 0.10 }[selectedFollowup.day] || 0))}</b></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowFollowupModal(false)}>取消</button>
              <button className="btn-primary flex items-center gap-1" onClick={handleSubmitFollowup}><Send className="w-4 h-4" /> 提交回访</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {showAuditModal && auditF && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAuditModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold">审核第 {auditF.day} 天回访</h3>
            </div>
            <div className="p-6 space-y-4">
              {auditF.photos?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {auditF.photos.map((p, i) => <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover" />)}
                </div>
              )}
              <div className="text-sm"><span className="text-gray-500">领养人描述：</span><span className="text-gray-700">{auditF.notes}</span></div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-sm font-medium text-green-800 mb-1">本次退还押金</div>
                <input type="number" className="input-field mt-2" value={auditAmount} onChange={e => setAuditAmount(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label-field">审核意见</label>
                <textarea className="input-field min-h-[60px]" value={auditNote} onChange={e => setAuditNote(e.target.value)} placeholder="可选" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button className="btn-secondary text-red-600 !bg-red-50" onClick={handleAuditReject}>不通过</button>
              <button className="btn-primary flex items-center gap-1" onClick={handleAuditApprove}><Check className="w-4 h-4" /> 审核通过</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 font-medium ${highlight ? 'text-warm-600' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}
