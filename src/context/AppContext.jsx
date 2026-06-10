import { createContext, useContext, useReducer, useMemo } from 'react';
import {
  initialAnimals,
  initialClues,
  initialAdoptions,
  initialVolunteers,
  initialTasks,
  initialDonations,
  initialExpenses,
  rescueStations,
  followupSchedule,
  defaultUser,
} from '../data/mockData';

const AppContext = createContext();

const initialState = {
  animals: initialAnimals,
  clues: initialClues,
  adoptions: initialAdoptions,
  volunteers: initialVolunteers,
  tasks: initialTasks,
  donations: initialDonations,
  expenses: initialExpenses,
  stations: rescueStations,
  currentUser: defaultUser,
  notifications: [
    { id: 'N001', type: 'clue', message: '收到新的救助线索：朝阳区国贸发现受伤流浪猫', time: '10分钟前', read: false },
    { id: 'N002', type: 'adoption', message: '领养申请AD003待审核', time: '25分钟前', read: false },
    { id: 'N003', type: 'followup', message: '领养AD002的第90天回访已超期，请人工跟进', time: '1小时前', read: false },
  ],
};

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestStation(lat, lng, stations) {
  let nearest = stations[0];
  let minDist = getDistance(lat, lng, stations[0].lat, stations[0].lng);
  for (let i = 1; i < stations.length; i++) {
    const dist = getDistance(lat, lng, stations[i].lat, stations[i].lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = stations[i];
    }
  }
  return { station: nearest, distance: minDist };
}

function generateId(prefix) {
  return prefix + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase();
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CLUE': {
      const { lat, lng } = action.payload;
      const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
      let status = 'pending';
      let assignedStationId = null;
      if (hasCoords) {
        const { station } = findNearestStation(lat, lng, state.stations);
        status = 'assigned';
        assignedStationId = station.id;
      }
      const newClue = {
        id: generateId('C'),
        ...action.payload,
        reportTime: new Date().toLocaleString('zh-CN'),
        status,
        assignedStationId,
        animalId: null,
      };
      return {
        ...state,
        clues: [newClue, ...state.clues],
      };
    }

    case 'UPDATE_CLUE_STATUS': {
      const { clueId, status, animalId } = action.payload;
      return {
        ...state,
        clues: state.clues.map(c =>
          c.id === clueId ? { ...c, status, animalId: animalId || c.animalId } : c
        ),
      };
    }

    case 'ADD_ANIMAL': {
      const newAnimal = {
        id: action.payload.id || generateId('A'),
        ...action.payload,
        vaccinations: action.payload.vaccinations || [],
        dewormings: action.payload.dewormings || [],
        treatments: action.payload.treatments || [],
      };
      return {
        ...state,
        animals: [newAnimal, ...state.animals],
      };
    }

    case 'UPDATE_ANIMAL': {
      const { id, data } = action.payload;
      const animal = state.animals.find(a => a.id === id);
      if (animal?.status === 'archived') {
        return state;
      }
      return {
        ...state,
        animals: state.animals.map(a => a.id === id ? { ...a, ...data } : a),
      };
    }

    case 'CHANGE_ANIMAL_STATUS': {
      const { id, status } = action.payload;
      const animal = state.animals.find(a => a.id === id);
      if (animal?.status === 'archived') {
        return state;
      }
      return {
        ...state,
        animals: state.animals.map(a => a.id === id ? { ...a, status } : a),
      };
    }

    case 'ADD_VACCINATION': {
      const { animalId, vaccination } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal?.status === 'archived') {
        return state;
      }
      return {
        ...state,
        animals: state.animals.map(a =>
          a.id === animalId ? { ...a, vaccinations: [...a.vaccinations, vaccination] } : a
        ),
      };
    }

    case 'ADD_DEWORMING': {
      const { animalId, deworming } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal?.status === 'archived') {
        return state;
      }
      return {
        ...state,
        animals: state.animals.map(a =>
          a.id === animalId ? { ...a, dewormings: [...a.dewormings, deworming] } : a
        ),
      };
    }

    case 'ADD_TREATMENT': {
      const { animalId, treatment } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal?.status === 'archived') {
        return state;
      }
      return {
        ...state,
        animals: state.animals.map(a =>
          a.id === animalId ? { ...a, treatments: [...a.treatments, treatment] } : a
        ),
      };
    }

    case 'ADD_HEALTH_EVENT': {
      const { animalId, event } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal?.status === 'archived') {
        return state;
      }
      const newEvent = {
        id: generateId('H'),
        ...event,
      };
      return {
        ...state,
        animals: state.animals.map(a =>
          a.id === animalId
            ? { ...a, healthEvents: [...(a.healthEvents || []), newEvent] }
            : a
        ),
      };
    }

    case 'SET_STERILIZED': {
      const { animalId, sterilized, date } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal?.status === 'archived') {
        return state;
      }
      return {
        ...state,
        animals: state.animals.map(a =>
          a.id === animalId ? { ...a, sterilized } : a
        ),
      };
    }

    case 'ADD_ADOPTION_APPLICATION': {
      const animal = state.animals.find(a => a.id === action.payload.animalId);
      if (animal?.status !== 'adoptable') {
        return state;
      }
      const newAdoption = {
        id: generateId('AD'),
        ...action.payload,
        animalName: animal?.name || '',
        applyTime: new Date().toISOString().split('T')[0],
        status: 'reviewing',
        phoneInterviewDate: null,
        phoneInterviewNotes: '',
        homeVisitDate: null,
        homeVisitPass: null,
        homeVisitNotes: '',
        meetDate: null,
        depositPaid: false,
        signedDate: null,
        followups: [],
      };
      return {
        ...state,
        adoptions: [newAdoption, ...state.adoptions],
      };
    }

    case 'UPDATE_ADOPTION': {
      const { id, data } = action.payload;
      return {
        ...state,
        adoptions: state.adoptions.map(a => a.id === id ? { ...a, ...data } : a),
      };
    }

    case 'APPROVE_ADOPTION_AND_SIGN': {
      const { adoptionId, signedDate } = action.payload;
      const adoption = state.adoptions.find(a => a.id === adoptionId);
      if (!adoption) return state;

      const followups = followupSchedule.map((day, idx) => ({
        id: generateId('F'),
        day,
        dueDate: addDays(signedDate, day),
        status: 'pending',
        photos: [],
        notes: '',
        auditStatus: 'pending',
        depositReleased: 0,
      }));

      return {
        ...state,
        adoptions: state.adoptions.map(a =>
          a.id === adoptionId
            ? { ...a, status: 'completed', signedDate, followups, depositPaid: true }
            : a
        ),
        animals: state.animals.map(a =>
          a.id === adoption.animalId
            ? { ...a, status: 'followup', adoptionDate: signedDate, adopterId: 'U' + Math.random().toString(36).slice(2, 7) }
            : a
        ),
      };
    }

    case 'SUBMIT_FOLLOWUP': {
      const { adoptionId, followupId, photos, notes } = action.payload;
      return {
        ...state,
        adoptions: state.adoptions.map(a => {
          if (a.id !== adoptionId) return a;
          return {
            ...a,
            followups: a.followups.map(f =>
              f.id === followupId
                ? { ...f, status: 'completed', photos, notes, auditStatus: 'pending' }
                : f
            ),
          };
        }),
      };
    }

    case 'AUDIT_FOLLOWUP': {
      const { adoptionId, followupId, approved, amount } = action.payload;
      return {
        ...state,
        adoptions: state.adoptions.map(a => {
          if (a.id !== adoptionId) return a;
          return {
            ...a,
            followups: a.followups.map(f =>
              f.id === followupId
                ? { ...f, auditStatus: approved ? 'approved' : 'rejected', depositReleased: approved ? amount : 0 }
                : f
            ),
          };
        }),
      };
    }

    case 'MARK_FOLLOWUP_OVERDUE': {
      const { adoptionId, followupId } = action.payload;
      return {
        ...state,
        adoptions: state.adoptions.map(a => {
          if (a.id !== adoptionId) return a;
          return {
            ...a,
            followups: a.followups.map(f =>
              f.id === followupId
                ? { ...f, status: 'overdue' }
                : f
            ),
          };
        }),
      };
    }

    case 'ADD_VOLUNTEER': {
      const newVolunteer = {
        id: generateId('V'),
        ...action.payload,
        status: 'pending',
        joinDate: new Date().toISOString().split('T')[0],
        tasksCompleted: 0,
        rating: 0,
      };
      return {
        ...state,
        volunteers: [...state.volunteers, newVolunteer],
      };
    }

    case 'APPROVE_VOLUNTEER': {
      const { volunteerId } = action.payload;
      return {
        ...state,
        volunteers: state.volunteers.map(v =>
          v.id === volunteerId ? { ...v, status: 'active' } : v
        ),
      };
    }

    case 'UPDATE_VOLUNTEER': {
      const { id, data } = action.payload;
      return {
        ...state,
        volunteers: state.volunteers.map(v =>
          v.id === id ? { ...v, ...data } : v
        ),
      };
    }

    case 'ADD_TASK': {
      const newTask = {
        id: generateId('T'),
        ...action.payload,
        publishTime: new Date().toLocaleString('zh-CN'),
        status: 'open',
        claimantId: null,
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
      };
    }

    case 'CLAIM_TASK': {
      const { taskId, volunteerId } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.status === 'completed' || task.status === 'claimed') {
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === taskId ? { ...t, status: 'claimed', claimantId: volunteerId } : t
        ),
      };
    }

    case 'COMPLETE_TASK': {
      const { taskId } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      let newClues = state.clues;
      if (task?.clueId) {
        newClues = state.clues.map(c =>
          c.id === task.clueId ? { ...c, status: 'rescued' } : c
        );
      }
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t),
        clues: newClues,
        volunteers: state.volunteers.map(v =>
          v.id === task?.claimantId ? { ...v, tasksCompleted: v.tasksCompleted + 1 } : v
        ),
      };
    }

    case 'CREATE_TASK_FROM_CLUE': {
      const { clueId, title, description, deadline, reward } = action.payload;
      const clue = state.clues.find(c => c.id === clueId);
      if (!clue) return state;
      const newTask = {
        id: generateId('T'),
        title: title || `${clue.location}救援任务`,
        type: '运输',
        description: description || `前往${clue.location}救援${clue.species}类动物，体貌特征：${clue.features}`,
        location: clue.location,
        publishTime: new Date().toLocaleString('zh-CN'),
        deadline: deadline || addDays(new Date().toISOString().split('T')[0], 1),
        reward: reward || 50,
        status: 'open',
        claimantId: null,
        stationId: clue.assignedStationId || state.stations[0]?.id,
        clueId,
      };
      const updatedClues = state.clues.map(c =>
        c.id === clueId ? { ...c, status: 'assigned' } : c
      );
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
        clues: updatedClues,
      };
    }

    case 'ADD_DONATION': {
      const newDonation = {
        id: generateId('D'),
        ...action.payload,
        date: new Date().toISOString().split('T')[0],
        status: 'confirmed',
      };
      return {
        ...state,
        donations: [newDonation, ...state.donations],
      };
    }

    case 'ADD_EXPENSE': {
      const newExpense = {
        id: generateId('E'),
        ...action.payload,
        date: new Date().toISOString().split('T')[0],
      };
      return {
        ...state,
        expenses: [newExpense, ...state.expenses],
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const { id } = action.payload;
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
      };
    }

    case 'ADD_NOTIFICATION': {
      const newNote = {
        id: generateId('N'),
        ...action.payload,
        time: '刚刚',
        read: false,
      };
      return {
        ...state,
        notifications: [newNote, ...state.notifications],
      };
    }

    case 'SET_USER_ROLE': {
      const { role } = action.payload;
      const roleNameMap = {
        admin: '系统管理员',
        staff: '救助站工作人员',
        volunteer: '志愿者',
        adopter: '领养人',
      };
      let stationId = null;
      if (role === 'staff') stationId = 'S001';
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          role,
          name: roleNameMap[role] || state.currentUser.name,
          stationId,
        },
      };
    }

    case 'SET_USER_STATION': {
      const { stationId } = action.payload;
      return {
        ...state,
        currentUser: { ...state.currentUser, stationId },
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const user = state.currentUser;

  const filtered = useMemo(() => {
    const { role, stationId } = user;
    const byStation = (list) => stationId ? list.filter(x => x.stationId === stationId) : list;
    const byUserStation = (list) => {
      if (role === 'admin') return list;
      if (role === 'staff') return list.filter(x => x.stationId === stationId);
      return [];
    };
    switch (role) {
      case 'admin':
        return {
          animals: state.animals,
          clues: state.clues,
          adoptions: state.adoptions,
          tasks: state.tasks,
          volunteers: state.volunteers,
          donations: state.donations,
          expenses: state.expenses,
          stations: state.stations,
        };
      case 'staff':
        return {
          animals: state.animals.filter(a => a.stationId === stationId),
          clues: state.clues.filter(c => c.assignedStationId === stationId || !c.assignedStationId),
          adoptions: state.adoptions.filter(a => {
            const an = state.animals.find(x => x.id === a.animalId);
            return an?.stationId === stationId;
          }),
          tasks: state.tasks.filter(t => t.stationId === stationId),
          volunteers: state.volunteers,
          donations: state.donations,
          expenses: state.expenses,
          stations: state.stations.filter(s => s.id === stationId),
        };
      case 'volunteer':
        return {
          animals: [],
          clues: [],
          adoptions: [],
          tasks: state.tasks,
          volunteers: [],
          donations: [],
          expenses: [],
          stations: [],
        };
      case 'adopter':
        return {
          animals: [],
          clues: [],
          adoptions: state.adoptions.filter(a => a.applicantName === user.name || a.id === 'AD001'),
          tasks: [],
          volunteers: [],
          donations: [],
          expenses: [],
          stations: [],
        };
      default:
        return {
          animals: [], clues: [], adoptions: [], tasks: [], volunteers: [], donations: [], expenses: [], stations: [],
        };
    }
  }, [user, state]);

  const value = useMemo(() => ({
    state,
    dispatch,
    filtered,
    findNearestStation: (lat, lng) => findNearestStation(lat, lng, state.stations),
    generateId,
  }), [state, filtered]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
