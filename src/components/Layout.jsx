import { useState, useMemo } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  PawPrint,
  HeartHandshake,
  Users,
  ClipboardList,
  Gift,
  Building2,
  Bell,
  ChevronDown,
  Menu,
  X,
  AlertCircle,
  FileText,
  Truck,
  Shield,
  UserCog,
  Heart,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { userRoles } from '../data/mockData';

const allNavItems = [
  { path: '/dashboard', label: '数据仪表盘', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  {
    path: '/clues', label: '救助线索', icon: MapPin, badge: true, roles: ['admin', 'staff'],
    children: [
      { path: '/clues', label: '线索列表' },
      { path: '/clues/submit', label: '提交线索' },
    ]
  },
  {
    path: '/animals', label: '动物档案', icon: PawPrint, roles: ['admin', 'staff'],
    children: [
      { path: '/animals', label: '档案列表' },
      { path: '/animals/new', label: '新建档案' },
    ]
  },
  {
    path: '/adoptions', label: '领养管理', icon: HeartHandshake, badge: true, roles: ['admin', 'staff', 'adopter'],
    children: [
      { path: '/adoptions', label: '申请列表' },
    ]
  },
  {
    path: '/volunteers', label: '志愿者', icon: Users, roles: ['admin', 'staff'],
    children: [
      { path: '/volunteers', label: '志愿者列表' },
      { path: '/volunteers/register', label: '注册申请' },
    ]
  },
  { path: '/tasks', label: '任务中心', icon: ClipboardList, roles: ['admin', 'staff', 'volunteer'] },
  { path: '/donations', label: '捐赠管理', icon: Gift, roles: ['admin', 'staff'] },
  { path: '/stations', label: '救助站管理', icon: Building2, roles: ['admin'] },
];

const roleIconMap = {
  admin: Shield,
  staff: UserCog,
  volunteer: Heart,
  adopter: UserCheck,
};

export default function Layout() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({});
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const user = state.currentUser;
  const RoleIcon = roleIconMap[user.role] || Shield;

  const navItems = useMemo(() => allNavItems.filter(item => item.roles.includes(user.role)), [user.role]);

  const unreadClues = state.clues.filter(c => c.status === 'pending').length;
  const pendingAdoptions = state.adoptions.filter(a => a.status === 'reviewing').length;
  const overdueFollowups = state.adoptions.reduce((acc, a) =>
    acc + a.followups.filter(f => f.status === 'overdue').length, 0);

  const currentRoleInfo = userRoles.find(r => r.key === user.role);

  const toggleMenu = (path) => {
    setExpandedMenu(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const isParentActive = (parentPath) => {
    return location.pathname.startsWith(parentPath);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <div className="font-bold text-gray-800 truncate">流浪动物救助</div>
                <div className="text-xs text-gray-500 truncate">管理系统 v1.0</div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isParentActive(item.path);
            const expanded = expandedMenu[item.path] ?? active;
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.path}>
                <div
                  className={`nav-link ${active ? 'nav-link-active' : ''} cursor-pointer`}
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.path);
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.badge && item.path === '/clues' && unreadClues > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadClues}</span>
                      )}
                      {item.badge && item.path === '/adoptions' && (pendingAdoptions + overdueFollowups) > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingAdoptions + overdueFollowups}</span>
                      )}
                      {hasChildren && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      )}
                    </>
                  )}
                </div>
                {hasChildren && expanded && sidebarOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-2">
          {sidebarOpen && (
            <div className="relative">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              >
                <RoleIcon className="w-4 h-4 text-primary-600" />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs text-gray-500">当前视图</div>
                  <div className="text-sm font-medium truncate">{currentRoleInfo?.label || '未知角色'}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {roleMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-50 text-xs text-gray-500">切换角色视图</div>
                  {userRoles.map((role) => {
                    const RIcon = roleIconMap[role.key] || Shield;
                    const active = user.role === role.key;
                    return (
                      <button
                        key={role.key}
                        className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-start gap-2 transition-colors ${active ? 'bg-primary-50' : ''}`}
                        onClick={() => {
                          dispatch({ type: 'SET_USER_ROLE', payload: { role: role.key } });
                          setRoleMenuOpen(false);
                          const defaultPath = role.key === 'adopter' ? '/adoptions' : role.key === 'volunteer' ? '/tasks' : '/dashboard';
                          navigate(defaultPath);
                        }}
                      >
                        <RIcon className={`w-4 h-4 mt-0.5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${active ? 'text-primary-700' : 'text-gray-800'}`}>{role.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{role.desc}</div>
                        </div>
                        {active && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <button
            className="w-full flex items-center justify-center py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-400">🐾 欢迎使用城市流浪动物救助与领养管理平台</span>
          </div>

          <div className="flex items-center gap-4">
            {overdueFollowups > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{overdueFollowups} 个回访超期</span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell className="w-5 h-5" />
                {state.notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold">通知中心</span>
                    <span className="text-xs text-gray-500">{state.notifications.filter(n => !n.read).length} 未读</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {state.notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-primary-50/30' : ''}`}
                        onClick={() => {
                          dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { id: n.id } });
                          if (n.type === 'clue') navigate('/clues');
                          if (n.type === 'adoption') navigate('/adoptions');
                          if (n.type === 'followup') navigate('/adoptions');
                          setNotifOpen(false);
                        }}
                      >
                        <div className="text-sm text-gray-800">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user.name?.charAt(0) || '用'}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <RoleIcon className="w-3 h-3" />
                    {currentRoleInfo?.label || '未知角色'}
                    {user.role === 'staff' && user.stationId && (
                      <span className="text-gray-400">· {state.stations.find(s => s.id === user.stationId)?.name}</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-100">
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <RoleIcon className="w-3 h-3" /> {currentRoleInfo?.label}
                    </div>
                    {user.role === 'staff' && user.stationId && (
                      <div className="text-xs text-gray-500 mt-1">
                        所属站点：{state.stations.find(s => s.id === user.stationId)?.name}
                      </div>
                    )}
                  </div>
                  {user.role === 'staff' && (
                    <div className="px-4 py-3 border-b border-gray-50">
                      <label className="text-xs text-gray-500 block mb-1.5">切换所属站点</label>
                      <select
                        className="input-field !py-1.5 text-sm"
                        value={user.stationId || ''}
                        onChange={(e) => dispatch({ type: 'SET_USER_STATION', payload: { stationId: e.target.value } })}
                      >
                        {state.stations.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-50">快速切换角色视图</div>
                  {userRoles.map((role) => {
                    const RIcon = roleIconMap[role.key] || Shield;
                    const active = user.role === role.key;
                    return (
                      <button
                        key={role.key}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${active ? 'bg-primary-50' : ''}`}
                        onClick={() => {
                          dispatch({ type: 'SET_USER_ROLE', payload: { role: role.key } });
                          setUserMenuOpen(false);
                          const defaultPath = role.key === 'adopter' ? '/adoptions' : role.key === 'volunteer' ? '/tasks' : '/dashboard';
                          navigate(defaultPath);
                        }}
                      >
                        <RIcon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={active ? 'text-primary-700 font-medium' : 'text-gray-700'}>{role.label}</span>
                        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
                      </button>
                    );
                  })}
                  <button className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50 text-red-600">
                    <X className="w-4 h-4" /> 退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Outside Click */}
      {(notifOpen || userMenuOpen || roleMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotifOpen(false);
            setUserMenuOpen(false);
            setRoleMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
