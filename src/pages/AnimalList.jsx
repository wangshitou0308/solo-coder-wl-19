import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { animalStatuses } from '../data/mockData';
import {
  PawPrint,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  ArrowRightLeft,
  Calendar,
  Scissors,
  Syringe,
  AlertTriangle,
} from 'lucide-react';

export default function AnimalList() {
  const { state, filtered } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const getStatusInfo = (key) => animalStatuses.find(s => s.key === key) || { label: key, color: 'bg-gray-100 text-gray-600' };

  const visibleAnimals = filtered.animals;

  const displayAnimals = useMemo(() => {
    return visibleAnimals.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (speciesFilter !== 'all' && a.species !== speciesFilter) return false;
      if (stationFilter !== 'all' && a.stationId !== stationFilter) return false;
      if (genderFilter !== 'all' && a.gender !== genderFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !a.name.toLowerCase().includes(s) &&
          !a.breed.toLowerCase().includes(s) &&
          !a.color.toLowerCase().includes(s) &&
          !a.id.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [visibleAnimals, search, statusFilter, speciesFilter, stationFilter, genderFilter]);

  const stats = {
    total: visibleAnimals.length,
    adoptable: visibleAnimals.filter(a => a.status === 'adoptable').length,
    treating: visibleAnimals.filter(a => a.status === 'treating').length,
    unsterilized: visibleAnimals.filter(a => !a.sterilized && a.ageEstimate >= 0.8 && !['adopted', 'followup', 'archived'].includes(a.status)).length,
  };

  const getStationName = (id) => state.stations.find(s => s.id === id)?.name || '未知';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">动物档案管理</h1>
          <p className="text-sm text-gray-500 mt-1">完整记录收容动物的健康档案与状态流转</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/animals/new')}>
          <Plus className="w-4 h-4" /> 新建档案
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card !p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">档案总数</div>
            <PawPrint className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="card !p-4 bg-green-50 border-green-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">待领养</div>
            <Eye className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.adoptable}</div>
        </div>
        <div className="card !p-4 bg-red-50 border-red-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">治疗中</div>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.treating}</div>
        </div>
        <div className="card !p-4 bg-warm-50 border-warm-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">待绝育</div>
            <Scissors className="w-5 h-5 text-warm-600" />
          </div>
          <div className="text-2xl font-bold text-warm-600 mt-1">{stats.unsterilized}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索编号、名字、品种、毛色..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !w-auto">
              <option value="all">全部状态</option>
              {animalStatuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className="input-field !w-28">
              <option value="all">全部物种</option>
              <option value="犬">犬</option>
              <option value="猫">猫</option>
            </select>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="input-field !w-24">
              <option value="all">公母不限</option>
              <option value="公">公</option>
              <option value="母">母</option>
            </select>
            <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)} className="input-field !w-auto">
              <option value="all">全部救助站</option>
              {state.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayAnimals.map((a) => {
          const st = getStatusInfo(a.status);
          return (
            <div key={a.id} className="card !p-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/animals/${a.id}`)}>
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <img src={a.photo} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`status-badge ${st.color}`}>{st.label}</span>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">{a.id}</div>
                </div>
                {!a.sterilized && !['adopted', 'followup', 'archived'].includes(a.status) && (
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-warm-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> 待绝育
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                  <div className="text-white font-bold text-lg">{a.name}</div>
                  <div className="text-white/80 text-xs">{a.breed} · {a.gender} · 约{a.ageEstimate < 1 ? `${Math.round(a.ageEstimate * 12)}个月` : `${a.ageEstimate}岁`}</div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>入站：{a.rescueDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                  <PawPrint className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{getStationName(a.stationId)}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Syringe className="w-3.5 h-3.5 text-primary-500" />
                    {a.vaccinations.length}针
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Scissors className={`w-3.5 h-3.5 ${a.sterilized ? 'text-primary-500' : 'text-gray-400'}`} />
                    {a.sterilized ? '已绝育' : '未绝育'}
                  </div>
                </div>
                <button className="w-full btn-secondary !py-2 text-sm !px-0 mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  查看详情 <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {displayAnimals.length === 0 && (
        <div className="card text-center py-16">
          <PawPrint className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="text-gray-500 mt-4">暂无符合条件的动物档案</div>
        </div>
      )}
    </div>
  );
}
