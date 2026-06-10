import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  ChevronLeft,
  Send,
  PawPrint,
  Home,
  Users,
  Upload,
  AlertCircle,
  HeartHandshake,
} from 'lucide-react';

export default function AdoptionApply() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const animal = state.animals.find(a => a.id === animalId);

  const [form, setForm] = useState({
    applicantName: '',
    applicantPhone: '',
    idCard: '',
    housingType: '自有住房',
    housingArea: '',
    familyMembers: '',
    hasChildren: false,
    childrenAge: '',
    hasOtherPets: false,
    otherPetsDesc: '',
    petExperience: '',
    housingProofUrl: '已上传住房证明.pdf',
    idCardUrl: '已上传身份证.jpg',
    depositAmount: 800,
    agreeTerms: false,
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.applicantName || !form.applicantPhone || !form.idCard || !form.housingArea || !form.familyMembers) {
      alert('请填写必填项');
      return;
    }
    if (!form.agreeTerms) {
      alert('请同意领养协议条款');
      return;
    }

    dispatch({
      type: 'ADD_ADOPTION_APPLICATION',
      payload: {
        animalId,
        applicantName: form.applicantName,
        applicantPhone: form.applicantPhone,
        idCard: form.idCard,
        housingType: form.housingType,
        housingArea: parseInt(form.housingArea) || 0,
        familyMembers: parseInt(form.familyMembers) || 0,
        hasChildren: form.hasChildren,
        childrenAge: form.hasChildren ? form.childrenAge : '',
        hasOtherPets: form.hasOtherPets,
        petExperience: form.petExperience,
        housingProofUrl: form.housingProofUrl,
        idCardUrl: form.idCardUrl,
        depositAmount: form.depositAmount,
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'adoption', message: `收到${form.applicantName}对${animal?.name || ''}的领养申请` },
    });

    alert('领养申请已提交！救助站管理员会在3个工作日内与您联系进行电话回访。');
    navigate('/adoptions');
  };

  if (!animal) {
    return (
      <div className="space-y-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800" onClick={() => navigate('/animals')}>
          <ChevronLeft className="w-5 h-5" /> 返回动物列表
        </button>
        <div className="card text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">未找到指定动物</div>
        </div>
      </div>
    );
  }

  if (animal.status !== 'adoptable') {
    const statusLabel = {
      sheltering: '收容中', treating: '治疗中', recovering: '康复中',
      adopted: '已领养', followup: '回访期', archived: '已归档'
    }[animal.status] || animal.status;
    return (
      <div className="space-y-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800" onClick={() => navigate('/animals')}>
          <ChevronLeft className="w-5 h-5" /> 返回动物列表
        </button>
        <div className="card text-center py-16">
          <AlertCircle className="w-16 h-16 text-warm-400 mx-auto" />
          <div className="text-gray-800 font-medium mt-4">该动物当前不可申请领养</div>
          <div className="text-gray-500 mt-2 text-sm">
            当前状态：<b>{statusLabel}</b>，仅"待领养"状态的动物可发起领养申请
          </div>
          <button className="btn-primary mt-6" onClick={() => navigate('/animals')}>查看可领养动物</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate(`/animals/${animalId}`)}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-primary-500" />
            领养申请
          </h1>
          <p className="text-sm text-gray-500 mt-1">意向领养：<Link to={`/animals/${animalId}`} className="text-primary-600 hover:underline font-medium">{animal.name}</Link>（{animal.breed}）</p>
        </div>
      </div>

      {/* Animal summary */}
      <div className="card !p-4 flex items-center gap-4 bg-gradient-to-r from-primary-50 to-white border-primary-100">
        <img src={animal.photo} alt="" className="w-20 h-20 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="text-xs text-gray-500">您意向领养的小动物</div>
          <div className="font-semibold text-lg">{animal.name}</div>
          <div className="text-sm text-gray-600 mt-0.5">{animal.breed} · {animal.gender} · 约{animal.ageEstimate < 1 ? `${Math.round(animal.ageEstimate * 12)}个月` : `${animal.ageEstimate}岁`} · {animal.weight}kg</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">押金金额</div>
          <div className="text-2xl font-bold text-warm-600">¥{form.depositAmount}</div>
          <div className="text-xs text-gray-500 mt-1">回访通过后分期退还</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 申请人信息 */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" /> 申请人信息
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">姓名 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.applicantName} onChange={e => update('applicantName', e.target.value)} placeholder="真实姓名" />
            </div>
            <div>
              <label className="label-field">联系电话 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.applicantPhone} onChange={e => update('applicantPhone', e.target.value)} placeholder="常用手机号" />
            </div>
            <div className="col-span-2">
              <label className="label-field">身份证号 <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.idCard} onChange={e => update('idCard', e.target.value)} placeholder="用于身份核验，信息严格保密" />
            </div>
          </div>
        </div>

        {/* 住房条件 */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary-500" /> 住房条件
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">住房类型 <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.housingType} onChange={e => update('housingType', e.target.value)}>
                <option>自有住房</option>
                <option>租房</option>
                <option>单位宿舍</option>
                <option>其他</option>
              </select>
            </div>
            <div>
              <label className="label-field">住房面积（㎡） <span className="text-red-500">*</span></label>
              <input type="number" className="input-field" value={form.housingArea} onChange={e => update('housingArea', e.target.value)} />
            </div>
            <div>
              <label className="label-field">家庭成员数 <span className="text-red-500">*</span></label>
              <input type="number" className="input-field" value={form.familyMembers} onChange={e => update('familyMembers', e.target.value)} />
            </div>
            <div>
              <label className="label-field flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hasChildren} onChange={e => update('hasChildren', e.target.checked)} />
                是否有未成年子女
              </label>
              {form.hasChildren && (
                <input className="input-field mt-2" value={form.childrenAge} onChange={e => update('childrenAge', e.target.value)} placeholder="子女年龄" />
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="label-field flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hasOtherPets} onChange={e => update('hasOtherPets', e.target.checked)} />
              是否有其他宠物
            </label>
            {form.hasOtherPets && (
              <input className="input-field mt-2" value={form.otherPetsDesc} onChange={e => update('otherPetsDesc', e.target.value)} placeholder="请描述现有宠物的种类、数量、是否绝育" />
            )}
          </div>
        </div>

        {/* 养宠经验 */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary-500" /> 养宠经验
          </h3>
          <textarea
            className="input-field min-h-[100px]"
            value={form.petExperience}
            onChange={e => update('petExperience', e.target.value)}
            placeholder="请详细描述您的养宠经历，包括：养过哪些宠物、养了多久、目前是否还在饲养、如有过世宠物请说明原因等。这将有助于我们为动物匹配合适的家庭。"
          />
        </div>

        {/* 材料上传 */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-500" /> 证明材料上传
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
              <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium">住房证明 <span className="text-red-500">*</span></div>
              <div className="text-xs text-green-600 mt-1">{form.housingProofUrl}</div>
              <div className="text-xs text-gray-400 mt-1">房产证/购房合同/租赁合同</div>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium">身份证件 <span className="text-red-500">*</span></div>
              <div className="text-xs text-green-600 mt-1">{form.idCardUrl}</div>
              <div className="text-xs text-gray-400 mt-1">身份证正反面照片</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-sm text-blue-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>所有上传材料仅用于领养资质审核，严格保密，审核完成后将按规定处理。</span>
          </div>
        </div>

        {/* 押金说明 */}
        <div className="card !bg-warm-50 !border-warm-200">
          <h3 className="font-semibold text-warm-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> 押金说明
          </h3>
          <div className="text-sm text-warm-700 space-y-2">
            <p>领养押金为 <b>¥{form.depositAmount}</b>，签署领养协议时支付。将按以下回访节点分期退还：</p>
            <div className="grid grid-cols-5 gap-2 pt-2">
              {[
                { day: '第7天', rate: '25%', amount: `¥${Math.round(form.depositAmount * 0.25)}` },
                { day: '第30天', rate: '37.5%', amount: `¥${Math.round(form.depositAmount * 0.375)}` },
                { day: '第90天', rate: '15%', amount: `¥${Math.round(form.depositAmount * 0.15)}` },
                { day: '半年', rate: '12.5%', amount: `¥${Math.round(form.depositAmount * 0.125)}` },
                { day: '一年', rate: '10%', amount: `¥${Math.round(form.depositAmount * 0.10)}` },
              ].map(i => (
                <div key={i.day} className="p-2.5 bg-white/60 rounded-lg text-center border border-warm-100">
                  <div className="font-medium">{i.day}</div>
                  <div className="text-xs text-warm-600 mt-1">{i.rate}</div>
                  <div className="font-semibold text-primary-600 mt-0.5">{i.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 协议 */}
        <div className="card">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.agreeTerms} onChange={e => update('agreeTerms', e.target.checked)} className="mt-1" />
            <span className="text-sm text-gray-600">
              我已阅读并同意<b>《电子领养协议》</b>的全部条款，承诺科学养宠、不弃养、不虐待，按时完成回访并接受救助站的监督与指导。
              若违反协议，救助站有权收回动物并扣除押金。
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate(`/animals/${animalId}`)}>取消</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={!form.agreeTerms}>
            <Send className="w-4 h-4" /> 提交领养申请
          </button>
        </div>
      </form>
    </div>
  );
}
