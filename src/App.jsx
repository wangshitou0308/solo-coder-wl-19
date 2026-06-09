import { Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clues" element={<ClueList />} />
        <Route path="clues/submit" element={<ClueSubmit />} />
        <Route path="animals" element={<AnimalList />} />
        <Route path="animals/new" element={<AnimalNew />} />
        <Route path="animals/:id" element={<AnimalDetail />} />
        <Route path="adoptions" element={<AdoptionList />} />
        <Route path="adoptions/apply/:animalId" element={<AdoptionApply />} />
        <Route path="adoptions/:id" element={<AdoptionDetail />} />
        <Route path="volunteers" element={<VolunteerList />} />
        <Route path="volunteers/register" element={<VolunteerRegister />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="donations" element={<Donation />} />
        <Route path="stations" element={<StationManagement />} />
      </Route>
    </Routes>
  );
}
