
import React, { useState, useEffect } from 'react';
import { ClassGroup, Lesson } from '../types';
import { generateLessonIdeas } from '../services/geminiService';
import { 
  Calendar, 
  Wand2, 
  CalendarDays, 
  FileText, 
  Settings, 
  UploadCloud, 
  Check, 
  Sparkles,
  Trash
} from 'lucide-react';

interface SmartDiaryProps {
  classes: ClassGroup[];
  updateClasses: (updatedClasses: ClassGroup[]) => void;
  isReadOnly?: boolean;
}

const SmartDiary: React.FC<SmartDiaryProps> = ({ classes, updateClasses, isReadOnly = false }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'PLANNING' | 'CALENDAR'>('PLANNING');
  const [planningText, setPlanningText] = useState('');
  const [startDate, setStartDate] = useState(new Date().getFullYear() + '-02-01');
  const [endDate, setEndDate] = useState(new Date().getFullYear() + '-12-15');
  const [weeklySchedule, setWeeklySchedule] = useState<Record<number, number>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  useEffect(() => {
    if (selectedClass) {
      setPlanningText(selectedClass.planningText || '');
      const initialSchedule: Record<number, number> = {};
      selectedClass.schedule.forEach(s => initialSchedule[s.dayOfWeek] = s.lessonsCount);
      setWeeklySchedule(initialSchedule);
      if (selectedClass.lessons && selectedClass.lessons.length > 0) {
        setActiveTab('CALENDAR');
      } else {
        setActiveTab('PLANNING');
      }
    }
  }, [selectedClassId, classes]); 

  const handleLessonCountChange = (dayIndex: number, delta: number) => {
    if (isReadOnly) return;
    setWeeklySchedule(prev => {
      const current = prev[dayIndex] || 0;
      const next = Math.max(0, current + delta);
      const newSchedule = { ...prev };
      if (next === 0) delete newSchedule[dayIndex];
      else newSchedule[dayIndex] = next;
      return newSchedule;
    });
  };

  const handleSavePlanning = () => {
    if (!selectedClass || isReadOnly) return;
    const updatedClass = { 
        ...selectedClass, 
        planningText,
        schedule: Object.entries(weeklySchedule).map(([day, count]) => ({
            dayOfWeek: parseInt(day),
            lessonsCount: count
        }))
    };
    updateClasses(classes.map(c => c.id === selectedClassId ? updatedClass : c));
    setActiveTab('CALENDAR');
  };

  const isHoliday = (date: Date): boolean => {
    const d = date.getDate();
    const m = date.getMonth(); 
    const holidays = ["1-0", "21-3", "1-4", "7-8", "12-9", "2-10", "15-10", "25-11"];
    return holidays.includes(`${d}-${m}`);
  };

  const distributeContent = () => {
    if (!selectedClass || !startDate || !endDate || isReadOnly) return;
    if (selectedClass.lessons.length > 0) {
        if (!window.confirm("Atenção: Já existem aulas geradas. Gerar novamente irá sobrescrever todo o diário atual. Continuar?")) return;
    }
    
    const topics = planningText.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    if (topics.length === 0) {
        alert("Ops! Cole seu conteúdo programático na aba 'Planejamento'.");
        setActiveTab('PLANNING');
        return;
    }
    if (Object.keys(weeklySchedule).length === 0) {
        alert("Configure a Grade Horária na aba 'Planejamento'.");
        setActiveTab('PLANNING');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const newLessons: Lesson[] = [];
    let topicIndex = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isHoliday(d)) continue;
        const dayOfWeek = d.getDay(); 
        const lessonCountForDay = weeklySchedule[dayOfWeek] || 0;

        if (lessonCountForDay > 0) {
            for (let i = 0; i < lessonCountForDay; i++) {
                const currentTopic = topicIndex < topics.length ? topics[topicIndex] : '';
                newLessons.push({
                    id: Math.random().toString(36).substr(2, 9),
                    classId: selectedClassId,
                    date: new Date(d).toISOString().split('T')[0],
                    topic: currentTopic,
                    content: currentTopic,
                    completed: false,
                    lessonIndex: i + 1
                });
                if (currentTopic) topicIndex++;
            }
        }
    }
    const updatedClass = { ...selectedClass, lessons: newLessons };
    updateClasses(classes.map(c => c.id === selectedClassId ? updatedClass : c));
  };

  const handleGenerateAI = async (lesson: Lesson) => {
    if (!selectedClass || isReadOnly) return;
    setAiLoading(lesson.id);
    const suggestion = await generateLessonIdeas(selectedClass.subject, lesson.topic, selectedClass.name);
    const updatedLessons = selectedClass.lessons.map(l => l.id === lesson.id ? { ...l, content: suggestion } : l);
    updateClasses(classes.map(c => c.id === selectedClassId ? { ...selectedClass, lessons: updatedLessons } : c));
    setAiLoading(null);
  };

  const handleUpdateLesson = (lessonId: string, field: 'topic' | 'content', value: string) => {
    if (!selectedClass || isReadOnly) return;
    const updatedLessons = selectedClass.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l);
    updateClasses(classes.map(c => c.id === selectedClassId ? { ...selectedClass, lessons: updatedLessons } : c));
  };

  const handleDeleteLesson = (lessonId: string) => {
      if (!selectedClass || isReadOnly) return;
      if(window.confirm("Remover esta aula do diário?")) {
        const updatedLessons = selectedClass.lessons.filter(l => l.id !== lessonId);
        updateClasses(classes.map(c => c.id === selectedClassId ? { ...selectedClass, lessons: updatedLessons } : c));
      }
  };

  const DAYS_MAP = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  if (classes.length === 0) return <div className="text-center p-12 text-slate-500 font-bold">Nenhuma turma cadastrada.</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Selector */}
      <div className="glass-panel rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
         
         <div className="flex items-center gap-5 w-full md:w-auto relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-500/10">
                <Calendar size={28} />
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Planejamento Ativo</label>
                <div className="relative group">
                    <select 
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="appearance-none bg-transparent font-extrabold text-slate-800 text-2xl focus:outline-none cursor-pointer pr-10 hover:text-blue-600 transition-colors"
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.subject}</option>)}
                    </select>
                    <Settings className="absolute right-0 top-1.5 text-slate-300 pointer-events-none" size={20} />
                </div>
            </div>
         </div>
            
         <div className="flex p-1.5 bg-white/50 border border-white/50 rounded-xl backdrop-blur-sm">
            <button 
                onClick={() => setActiveTab('PLANNING')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'PLANNING' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/30'}`}
            >
                <FileText size={16} /> 
                <span className="hidden sm:inline">Planejamento</span>
            </button>
            <button 
                onClick={() => setActiveTab('CALENDAR')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'CALENDAR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/30'}`}
            >
                <CalendarDays size={16} /> 
                <span className="hidden sm:inline">Diário</span>
            </button>
         </div>
      </div>

      {activeTab === 'PLANNING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 glass-panel rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                              <UploadCloud className="text-blue-500" size={22} /> Conteúdo
                          </h3>
                      </div>
                      <div className="bg-blue-100/50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Passo 1</div>
                  </div>
                  <textarea 
                    value={planningText}
                    onChange={(e) => !isReadOnly && setPlanningText(e.target.value)}
                    readOnly={isReadOnly}
                    className="flex-1 w-full p-6 border border-white/50 rounded-2xl font-mono text-sm leading-relaxed text-slate-700 focus:ring-4 focus:ring-blue-100 focus:bg-white bg-white/40 resize-none min-h-[400px] outline-none transition-all shadow-inner"
                    placeholder={`Cole aqui seu planejamento (um tópico por linha)...`}
                  />
              </div>

              <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col h-fit">
                   <div className="mb-8 flex justify-between items-center">
                       <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Settings className="text-blue-500" size={22} /> Grade
                       </h3>
                       <div className="bg-blue-100/50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Passo 2</div>
                   </div>
                   
                   <div className="space-y-3 flex-1">
                       {[1, 2, 3, 4, 5].map((dayIndex) => (
                           <div key={dayIndex} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${weeklySchedule[dayIndex] > 0 ? 'bg-blue-50/50 border-blue-200' : 'bg-white/30 border-white/50'}`}>
                               <span className={`font-bold text-sm ${weeklySchedule[dayIndex] > 0 ? 'text-blue-800' : 'text-slate-400'}`}>{DAYS_MAP[dayIndex]}</span>
                               <div className="flex items-center gap-3">
                                   <button 
                                      onClick={() => handleLessonCountChange(dayIndex, -1)}
                                      disabled={isReadOnly}
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:border-blue-400 text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
                                    >-</button>
                                   <span className={`w-6 text-center font-bold text-lg ${weeklySchedule[dayIndex] > 0 ? 'text-blue-600' : 'text-slate-300'}`}>{weeklySchedule[dayIndex] || 0}</span>
                                   <button 
                                      onClick={() => handleLessonCountChange(dayIndex, 1)}
                                      disabled={isReadOnly}
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:border-blue-400 text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
                                    >+</button>
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   {!isReadOnly && (
                    <button 
                        onClick={handleSavePlanning}
                        className="mt-8 w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 shadow-xl shadow-slate-300 transition-all flex justify-center items-center gap-2 transform active:scale-95"
                    >
                        <Check size={18} /> Salvar Configuração
                    </button>
                   )}
              </div>
          </div>
      )}

      {activeTab === 'CALENDAR' && (
          <div className="space-y-6 animate-fade-in">
              {!isReadOnly && (
              <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-end gap-8 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                  
                  <div className="flex-1 w-full relative z-10">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Início</label>
                      <input 
                          type="date" 
                          value={startDate} 
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full bg-white/60 border border-white/50 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-800 font-bold outline-none shadow-sm transition-all" 
                      />
                  </div>
                  <div className="flex-1 w-full relative z-10">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Fim</label>
                      <input 
                          type="date" 
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)} 
                          className="w-full bg-white/60 border border-white/50 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-800 font-bold outline-none shadow-sm transition-all" 
                      />
                  </div>
                  <button 
                    onClick={distributeContent}
                    className="relative z-10 w-full lg:w-auto h-[58px] px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 whitespace-nowrap transition-all transform active:scale-95"
                  >
                      <Wand2 size={20} /> 
                      Gerar Diário
                  </button>
              </div>
              )}

              <div className="glass-panel rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col">
                  <div className="px-8 py-6 bg-white/40 border-b border-white/50 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl text-slate-500 border border-slate-100 shadow-sm">
                             <CalendarDays size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Registro de Aulas</h3>
                      </div>
                      {selectedClass?.lessons && selectedClass.lessons.length > 0 && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-100/50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                        </span>
                      )}
                  </div>
                  
                  {(!selectedClass?.lessons || selectedClass.lessons.length === 0) ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
                          <CalendarDays size={64} className="text-slate-300 mb-6" />
                          <h4 className="text-xl font-bold text-slate-700 mb-2">Diário Vazio</h4>
                          <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">
                              Utilize o gerador acima para criar o cronograma automaticamente.
                          </p>
                      </div>
                  ) : (
                    <div className="divide-y divide-white/50 overflow-y-auto max-h-[700px] custom-scrollbar bg-white/20">
                        {selectedClass.lessons.map((lesson, idx) => {
                            const dateObj = new Date(lesson.date);
                            const dayName = DAYS_MAP[dateObj.getDay()];
                            const isToday = new Date().toDateString() === dateObj.toDateString();

                            return (
                            <div key={idx} className={`p-6 transition-all flex flex-col md:flex-row gap-6 items-start group border-l-4 ${isToday ? 'bg-blue-50/50 border-blue-500' : 'hover:bg-white/40 border-transparent'}`}>
                                <div className="flex flex-row md:flex-col items-center gap-3 min-w-[100px] pt-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{dayName}</span>
                                    <div className={`text-2xl font-black ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                        {dateObj.getDate().toString().padStart(2, '0')}/{ (dateObj.getMonth() + 1).toString().padStart(2, '0')}
                                    </div>
                                    {!isReadOnly && (
                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:mt-2">
                                            <Trash size={14} />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex-1 w-full bg-white/60 rounded-2xl border border-white/60 p-1 shadow-sm group-hover:shadow-md transition-shadow">
                                    <div className="relative">
                                        <div>
                                            <input 
                                              value={lesson.topic}
                                              readOnly={isReadOnly}
                                              onChange={(e) => handleUpdateLesson(lesson.id, 'topic', e.target.value)}
                                              placeholder="Tópico da Aula"
                                              className={`w-full font-bold text-slate-800 text-base mb-1 bg-transparent border-b border-slate-100 focus:border-blue-300 focus:ring-0 px-5 py-3 rounded-t-xl transition-colors ${!isReadOnly && 'hover:bg-white/50'}`}
                                            />
                                            <div className="px-2 pb-2">
                                                <textarea 
                                                    value={lesson.content}
                                                    readOnly={isReadOnly}
                                                    onChange={(e) => handleUpdateLesson(lesson.id, 'content', e.target.value)}
                                                    placeholder="Detalhes..."
                                                    className={`w-full bg-transparent border-none rounded-xl p-3 text-slate-600 text-sm leading-relaxed transition-colors resize-y min-h-[80px] focus:ring-0 ${isReadOnly ? '' : 'hover:bg-white/40'}`}
                                                />
                                            </div>
                                        </div>
                                        {!isReadOnly && lesson.topic && (
                                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleGenerateAI(lesson)}
                                                    disabled={!!aiLoading}
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                                                >
                                                    {aiLoading === lesson.id ? <Sparkles size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                    {aiLoading === lesson.id ? 'Gerando...' : 'IA Sugerir'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default SmartDiary;