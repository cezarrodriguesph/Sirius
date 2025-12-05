
import React from 'react';
import { View, User, DeviceMode } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Menu, 
  LogOut,
  Star,
  Cloud,
  ChevronLeft
} from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onChangeView: (view: View) => void;
  currentUser: User | null;
  onLogout: () => void;
  deviceMode: DeviceMode;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, currentUser, onLogout, deviceMode, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Simulate cloud sync
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 2000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return <>{children}</>;

  const getPageTitle = () => {
    if (currentView === View.DASHBOARD) return currentUser.role === 'COORDINATOR' ? "Painel" : "Início";
    if (currentView === View.DIARY) return "Diário";
    if (currentView === View.GRADES) return "Notas";
    if (currentView === View.STUDENTS) return "Turmas";
    return "";
  };

  // --- MOBILE LAYOUT ---
  if (deviceMode === 'MOBILE') {
      return (
          <div className="h-full flex flex-col bg-[#eef2ff] relative">
              {/* Mobile Header */}
              <header className="h-16 px-6 flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-30 border-b border-white/50">
                  <div className="flex items-center gap-2">
                       {currentView !== View.DASHBOARD && (
                           <button onClick={() => onChangeView(View.DASHBOARD)} className="mr-1 text-slate-500">
                               <ChevronLeft size={20} />
                           </button>
                       )}
                       <span className="font-bold text-slate-800 text-lg">{getPageTitle()}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                      {currentUser.name.charAt(0)}
                  </div>
              </header>

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24">
                  {children}
              </main>

              {/* Bottom Navigation Bar */}
              <nav className="absolute bottom-6 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/50 flex justify-around items-center z-40 px-2">
                  <button 
                    onClick={() => onChangeView(View.DASHBOARD)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === View.DASHBOARD ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                      <LayoutDashboard size={20} className={currentView === View.DASHBOARD ? 'fill-blue-600/20' : ''} />
                      <span className="text-[10px] font-bold">Início</span>
                  </button>

                  <button 
                    onClick={() => onChangeView(View.STUDENTS)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === View.STUDENTS ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                      <Users size={20} className={currentView === View.STUDENTS ? 'fill-blue-600/20' : ''} />
                      <span className="text-[10px] font-bold">Turmas</span>
                  </button>

                  <button 
                    onClick={() => onChangeView(View.DIARY)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === View.DIARY ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                      <BookOpen size={20} className={currentView === View.DIARY ? 'fill-blue-600/20' : ''} />
                      <span className="text-[10px] font-bold">Diário</span>
                  </button>

                  <button 
                    onClick={() => onChangeView(View.GRADES)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === View.GRADES ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                      <GraduationCap size={20} className={currentView === View.GRADES ? 'fill-blue-600/20' : ''} />
                      <span className="text-[10px] font-bold">Notas</span>
                  </button>
                  
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  
                  <button 
                    onClick={onLogout}
                    className="flex flex-col items-center gap-1 p-2 text-red-400"
                  >
                      <LogOut size={20} />
                  </button>
              </nav>
          </div>
      )
  }

  // --- DESKTOP LAYOUT ---
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-1 transition-all duration-300 font-medium ${
        currentView === view 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
          : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-white' : 'text-slate-400'} />
      <span className={`${!isSidebarOpen && 'hidden'}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Floating Glass Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-24'
        } transition-all duration-300 flex flex-col z-20 p-6`}
      >
        <div className="h-full glass-panel rounded-[2.5rem] flex flex-col p-4 shadow-2xl relative overflow-hidden">
            {/* Logo Area */}
            <div className="flex items-center gap-3 p-2 mb-8">
                <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                    <Star className="text-white fill-white" size={20} />
                </div>
                {isSidebarOpen && (
                    <div className="animate-fade-in">
                        <span className="font-extrabold text-slate-800 text-lg tracking-tight">Sirius<span className="text-blue-600">Edu</span></span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-1">
                <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label={currentUser.role === 'COORDINATOR' ? "Visão Geral" : "Início"} />
                {currentUser.role === 'TEACHER' && (
                <>
                    <NavItem view={View.STUDENTS} icon={Users} label="Turmas" />
                    <NavItem view={View.DIARY} icon={BookOpen} label="Diário" />
                    <NavItem view={View.GRADES} icon={GraduationCap} label="Notas" />
                </>
                )}
                {currentUser.role === 'COORDINATOR' && (
                    <>
                    <NavItem view={View.STUDENTS} icon={Users} label="Gestão Turmas" />
                    <NavItem view={View.DIARY} icon={BookOpen} label="Auditoria" />
                    <NavItem view={View.GRADES} icon={GraduationCap} label="Boletins" />
                    </>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-slate-100">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-50 text-slate-400 mb-2 transition-colors"
                >
                    <Menu size={20} />
                </button>
                <button 
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                >
                    <LogOut size={20} />
                    {isSidebarOpen && <span className="font-bold text-xs">Sair da Conta</span>}
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 pl-0">
        {/* Top Header Glass */}
        <header className="h-20 glass-panel rounded-[2rem] mb-6 px-8 flex items-center justify-between shadow-sm">
          <div>
             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
               {getPageTitle()}
             </h2>
          </div>

          <div className="flex items-center gap-6">
             {isSaving ? (
               <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-white/50 text-xs font-bold text-slate-500">
                 <Cloud size={14} className="animate-pulse" />
                 <span>Sincronizando...</span>
               </div>
            ) : (
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/50 rounded-full border border-emerald-100/50 text-xs font-bold text-emerald-600">
                 <Cloud size={14} />
                 <span>Salvo</span>
               </div>
            )}
            
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{currentUser.role === 'TEACHER' ? 'Professor(a)' : 'Coordenação'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white font-bold flex items-center justify-center shadow-lg shadow-slate-500/20">
                   {currentUser.name.charAt(0)}
                </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar rounded-[2.5rem] pb-2">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;