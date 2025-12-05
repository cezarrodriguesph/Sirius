
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClassManager from './components/ClassManager';
import SmartDiary from './components/SmartDiary';
import Gradebook from './components/Gradebook';
import { View, ClassGroup, User, Role, DeviceMode } from './types';
import { UserCircle2, ShieldCheck, School, ArrowRight, Smartphone, Monitor, Lock, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [deviceMode, setDeviceMode] = useState<DeviceMode | null>(null);
  
  // Virgin System State - No Classes Initially
  const [classes, setClasses] = useState<ClassGroup[]>([]);

  // Login Form State
  const [loginName, setLoginName] = useState('');
  const [loginRole, setLoginRole] = useState<Role>('TEACHER');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName) return;
    setCurrentUser({
      id: Math.random().toString(),
      name: loginName,
      role: loginRole
    });
    // Teacher always starts on Dashboard. Coordinator too.
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(View.DASHBOARD);
    setLoginName('');
  };

  // 1. Device Selection Screen
  if (!deviceMode) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="max-w-4xl w-full">
                  <div className="text-center mb-12 animate-fade-in">
                      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 mb-4 shadow-lg">
                          <School className="text-blue-600" size={32} />
                      </div>
                      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">Sirius Edu</h1>
                      <p className="text-slate-500 font-medium">Selecione sua experiência de navegação</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                      <button 
                        onClick={() => setDeviceMode('MOBILE')}
                        className="group relative h-64 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
                              <Smartphone size={40} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-800 text-center">Versão Mobile</h3>
                              <p className="text-xs text-slate-500 font-medium text-center mt-1">App simulado com navegação inferior</p>
                          </div>
                      </button>

                      <button 
                        onClick={() => setDeviceMode('DESKTOP')}
                        className="group relative h-64 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                              <Monitor size={40} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-800 text-center">Versão Desktop</h3>
                              <p className="text-xs text-slate-500 font-medium text-center mt-1">Painel completo com sidebar lateral</p>
                          </div>
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  // 2. Glass Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 relative animate-fade-in">
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
           
           <div className="text-center mb-10">
               <div className="inline-block p-4 rounded-full bg-blue-50/50 mb-4 border border-blue-100/50">
                  <Lock className="text-blue-600" size={28} />
               </div>
               <h2 className="text-3xl font-extrabold text-slate-800">Bem-vindo</h2>
               <p className="text-slate-500 text-sm mt-2">Acesse o portal do Colégio Estrela Sirius</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Identificação</label>
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full bg-white/50 border border-white/50 rounded-2xl px-5 py-4 text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm"
                      placeholder="Seu nome completo"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <button
                       type="button"
                       onClick={() => setLoginRole('TEACHER')}
                       className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${loginRole === 'TEACHER' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/40 text-slate-500 border-white/50 hover:bg-white/60'}`}
                     >
                       <UserCircle2 size={24} className="mb-1" />
                       <span className="text-xs font-bold">Professor</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => setLoginRole('COORDINATOR')}
                       className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${loginRole === 'COORDINATOR' ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-white/40 text-slate-500 border-white/50 hover:bg-white/60'}`}
                     >
                       <ShieldCheck size={24} className="mb-1" />
                       <span className="text-xs font-bold">Coordenação</span>
                     </button>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-slate-800 text-white font-bold text-sm shadow-xl hover:bg-slate-900 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    Entrar no Sistema <ArrowRight size={16} />
                </button>
           </form>

           <div className="mt-8 text-center">
               <button onClick={() => setDeviceMode(null)} className="text-xs text-slate-400 font-medium hover:text-slate-600 transition-colors">
                   Trocar modo de visualização
               </button>
           </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    const isCoord = currentUser.role === 'COORDINATOR';

    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard classes={classes} />;
      case View.STUDENTS:
        return <ClassManager classes={classes} setClasses={setClasses} isReadOnly={isCoord} />;
      case View.DIARY:
        return <SmartDiary classes={classes} updateClasses={setClasses} isReadOnly={isCoord} />;
      case View.GRADES:
        return <Gradebook classes={classes} updateClasses={setClasses} isReadOnly={isCoord} />;
      default:
        return <Dashboard classes={classes} />;
    }
  };

  // 3. Main App Layout (Desktop vs Mobile Simulation)
  return (
    <div className={`min-h-screen ${deviceMode === 'MOBILE' ? 'flex items-center justify-center p-4 md:p-8' : ''}`}>
       {deviceMode === 'MOBILE' ? (
           // Mobile Simulator Frame
           <div className="relative w-full max-w-[400px] h-[850px] bg-slate-900 rounded-[3rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden ring-4 ring-slate-900/10">
               {/* Phone Notch/Bar */}
               <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900 z-50 flex justify-center items-end pb-1">
                   <div className="w-20 h-1.5 bg-slate-800 rounded-full"></div>
               </div>
               
               {/* App Content */}
               <div className="w-full h-full bg-slate-50 overflow-hidden rounded-[2.5rem]">
                   <Layout 
                        currentView={currentView} 
                        onChangeView={setCurrentView} 
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        deviceMode={deviceMode}
                   >
                    {renderView()}
                   </Layout>
               </div>
           </div>
       ) : (
           // Full Desktop Layout
           <Layout 
                currentView={currentView} 
                onChangeView={setCurrentView} 
                currentUser={currentUser}
                onLogout={handleLogout}
                deviceMode={deviceMode}
            >
            {renderView()}
            </Layout>
       )}
    </div>
  );
};

export default App;