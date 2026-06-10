import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ClueList from './pages/ClueList.jsx';
import ClueSubmit from './pages/ClueSubmit.jsx';
import AnimalList from './pages/AnimalList.jsx';
import AnimalDetail from './pages/AnimalDetail.jsx';
import AnimalNew from './pages/AnimalNew.jsx';
import AdoptionList from './pages/AdoptionList.jsx';
import AdoptionApply from './pages/AdoptionApply.jsx';
import AdoptionDetail from './pages/AdoptionDetail.jsx';
import VolunteerList from './pages/VolunteerList.jsx';
import VolunteerRegister from './pages/VolunteerRegister.jsx';
import TaskList from './pages/TaskList.jsx';
import Donation from './pages/Donation.jsx';
import StationManagement from './pages/StationManagement.jsx';
import { AlertTriangle } from 'lucide-react';

function ForbiddenPage() {
  const { state } = useApp();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-warm-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-warm-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">权限不足</h2>
      <p className="text-gray-500 max-w-md mb-6">
        当前角色「{state.currentUser.name}」无权限访问该页面。
        请在左下角切换角色视图，或联系系统管理员。
      </p>
    </div>
  );
}

function ProtectedRoute({ element, allowedRoles }) {
  const { state } = useApp();
  const location = useLocation();
  if (!allowedRoles.includes(state.currentUser.role)) {
    return <ForbiddenPage />;
  }
  return element;
}

export default function App() {
  const { state } = useApp();
  const role = state.currentUser.role;
  const defaultPath = role === 'adopter' ? '/adoptions' : role === 'volunteer' ? '/tasks' : '/dashboard';

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={defaultPath} replace />} />
        <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={['admin', 'staff']} />} />
        <Route path="clues" element={<ProtectedRoute element={<ClueList />} allowedRoles={['admin', 'staff']} />} />
        <Route path="clues/submit" element={<ProtectedRoute element={<ClueSubmit />} allowedRoles={['admin', 'staff']} />} />
        <Route path="animals" element={<ProtectedRoute element={<AnimalList />} allowedRoles={['admin', 'staff']} />} />
        <Route path="animals/new" element={<ProtectedRoute element={<AnimalNew />} allowedRoles={['admin', 'staff']} />} />
        <Route path="animals/:id" element={<ProtectedRoute element={<AnimalDetail />} allowedRoles={['admin', 'staff']} />} />
        <Route path="adoptions" element={<ProtectedRoute element={<AdoptionList />} allowedRoles={['admin', 'staff', 'adopter']} />} />
        <Route path="adoptions/apply/:animalId" element={<ProtectedRoute element={<AdoptionApply />} allowedRoles={['admin', 'staff', 'adopter']} />} />
        <Route path="adoptions/:id" element={<ProtectedRoute element={<AdoptionDetail />} allowedRoles={['admin', 'staff', 'adopter']} />} />
        <Route path="volunteers" element={<ProtectedRoute element={<VolunteerList />} allowedRoles={['admin', 'staff']} />} />
        <Route path="volunteers/register" element={<ProtectedRoute element={<VolunteerRegister />} allowedRoles={['admin', 'staff']} />} />
        <Route path="tasks" element={<ProtectedRoute element={<TaskList />} allowedRoles={['admin', 'staff', 'volunteer']} />} />
        <Route path="donations" element={<ProtectedRoute element={<Donation />} allowedRoles={['admin', 'staff']} />} />
        <Route path="stations" element={<ProtectedRoute element={<StationManagement />} allowedRoles={['admin']} />} />
      </Route>
    </Routes>
  );
}
