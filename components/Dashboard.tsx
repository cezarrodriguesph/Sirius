
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, CheckCircle2, ArrowRight, Activity, Search, Sparkles } from 'lucide-react';
import { ClassGroup } from '../types';

interface DashboardProps {
  classes?: ClassGroup[];
}

const StatCard = ({ title, value, sub, icon: Icon, colorClass, bgClass }: any) => (
  <div className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-slate-200/50">
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${bgClass} ${colorClass}`}>
            <Icon size={24} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/50 px-2 py-1 rounded-lg">Este Mês</span>
    </div>
    <div>
      <h3 className="text-4xl font-extrabold text-slate-800 mb-1 tracking-tight">{value}</h3>
      <p className="text-xs font-bold text-slate-500">{title}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ classes = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);
  const totalClasses = classes.length;
  const totalLessons = classes.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);
  
  const gradesFilled = classes.reduce((acc, c) => {
      let count = 0;
      Object.values(c.grades || {}).forEach(studentGrades => {
          count += Object.keys(studentGrades).length;
      });
      return acc + count;
  }, 0);

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/25">
         <div className="absolute inset-0 z-0">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl transform -translate-x-5 translate-y-5"></div>
         </div>
         <div className="relative z-10 p-8 md:p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <div className="flex items-center gap-2 text-blue-200 font-bold mb-2">
                  <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                      <Sparkles size={14} className="text-yellow-300" />
                  </div>
                  <span className="uppercase text-[10px] tracking-widest">Painel Acadêmico</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight leading-tight">{greeting}, Professor(a).</h1>
               <p className="text-indigo-100 max-w-lg text-sm font-medium leading-relaxed opacity-90">
                  Bem-vindo à nova experiência Sirius Edu. Seu painel foi atualizado para máxima clareza e eficiência.
               </p>
            </div>
         </div>
      </div>

      {classes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:bg-white/70 transition-colors">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 border border-blue-100 shadow-sm">
                      <Users size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Sem Turmas</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs">
                      Comece cadastrando suas turmas e importando alunos para liberar as funções do diário.
                  </p>
                  <button className="text-blue-600 font-bold text-sm bg-blue-50 px-6 py-3 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                      Cadastrar Primeira Turma
                  </button>
              </div>
              <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center text-center opacity-50">
                  <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6 border border-purple-100 shadow-sm">
                      <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Diário Inteligente</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs">
                      Automação completa do planejamento de aulas. Disponível após cadastro.
                  </p>
              </div>
          </div>
      ) : (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    title="Alunos Ativos" 
                    value={totalStudents} 
                    icon={Users} 
                    colorClass="text-indigo-600" 
                    bgClass="bg-indigo-50"
                />
                <StatCard 
                    title="Turmas" 
                    value={totalClasses} 
                    icon={BookOpen} 
                    colorClass="text-emerald-600" 
                    bgClass="bg-emerald-50"
                />
                <StatCard 
                    title="Aulas" 
                    value={totalLessons} 
                    icon={CheckCircle2} 
                    colorClass="text-blue-600" 
                    bgClass="bg-blue-50"
                />
                <StatCard 
                    title="Notas" 
                    value={gradesFilled} 
                    icon={Activity} 
                    colorClass="text-amber-600" 
                    bgClass="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Card */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem]">
                    <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" />
                        Atividade por Turma
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classes.map(c => ({ name: c.name.split(' - ')[0], lessons: c.lessons?.length || 0, students: c.students.length }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                cursor={{fill: 'rgba(241, 245, 249, 0.4)'}}
                            />
                            <Bar dataKey="lessons" name="Aulas" radius={[6, 6, 6, 6]} fill="#3b82f6" barSize={24} />
                            <Bar dataKey="students" name="Alunos" radius={[6, 6, 6, 6]} fill="#cbd5e1" barSize={24} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Class List Card */}
                <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col h-[500px]">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Suas Turmas</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/50 rounded-2xl text-sm focus:bg-white focus:border-blue-300 outline-none transition-all placeholder-slate-400 text-slate-700 font-bold shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {filteredClasses.length > 0 ? (
                            filteredClasses.map(c => (
                                <div key={c.id} className="p-4 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/80 cursor-pointer flex justify-between items-center group transition-all">
                                    <div>
                                        <div className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">{c.name}</div>
                                        <div className="text-xs text-slate-400 font-semibold mt-0.5">{c.subject}</div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-white text-slate-500 px-3 py-1.5 rounded-full shadow-sm group-hover:text-blue-600 transition-colors">
                                        {c.students.length}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400 text-xs font-medium">
                                Nenhuma turma encontrada.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;