
import React, { useState } from 'react';
import { ClassGroup } from '../types';
import { Users, UserPlus, Trash2, School, ChevronDown, Plus, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface ClassManagerProps {
  classes: ClassGroup[];
  setClasses: React.Dispatch<React.SetStateAction<ClassGroup[]>>;
  isReadOnly?: boolean;
}

const GRADE_OPTIONS = [
  "6º Ano - Fundamental II",
  "7º Ano - Fundamental II",
  "8º Ano - Fundamental II",
  "9º Ano - Fundamental II",
  "1ª Série - Ensino Médio",
  "2ª Série - Ensino Médio",
  "3ª Série - Ensino Médio"
];

const LETTER_OPTIONS = ["A", "B", "C", "D", "E", "Única"];

const ClassManager: React.FC<ClassManagerProps> = ({ classes, setClasses, isReadOnly = false }) => {
  const [selectedGrade, setSelectedGrade] = useState(GRADE_OPTIONS[0]);
  const [selectedLetter, setSelectedLetter] = useState(LETTER_OPTIONS[0]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentReg, setNewStudentReg] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || isReadOnly || !newStudentName.trim()) return;
    const reg = newStudentReg.trim() || Math.floor(Math.random() * 90000 + 10000).toString();
    setClasses(prev => prev.map(c => {
      if (c.id === selectedClassId) {
        return {
          ...c,
          students: [...c.students, { id: Math.random().toString(36).substr(2, 9), name: newStudentName, registrationNumber: reg }].sort((a, b) => a.name.localeCompare(b.name))
        };
      }
      return c;
    }));
    setNewStudentName('');
    setNewStudentReg('');
  };

  const handleBulkImport = () => {
    if (!selectedClassId || isReadOnly || !bulkText.trim()) return;
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const newStudents = lines.map(line => ({
        id: Math.random().toString(36).substr(2, 9),
        name: line.trim(),
        registrationNumber: Math.floor(Math.random() * 90000 + 10000).toString()
    }));
    setClasses(prev => prev.map(c => {
        if (c.id === selectedClassId) {
            return {
                ...c,
                students: [...c.students, ...newStudents].sort((a, b) => a.name.localeCompare(b.name))
            };
        }
        return c;
    }));
    setBulkText('');
    setIsBulkMode(false);
    alert(`${newStudents.length} alunos importados com sucesso!`);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newSubject) return;
    const finalClassName = `${selectedGrade} - ${selectedLetter === 'Única' ? 'Única' : `Turma ${selectedLetter}`}`;
    const newClass: ClassGroup = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId: 'current', 
      name: finalClassName,
      subject: newSubject,
      schedule: [],
      students: [],
      lessons: [],
      grades: {}
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    setNewSubject('');
    setSelectedClassId(newClass.id);
  };

  const handleDeleteClass = () => {
    if (!selectedClassId || isReadOnly) return;
    if (window.confirm("Tem certeza que deseja excluir esta turma e todos os seus dados?")) {
        const updated = classes.filter(c => c.id !== selectedClassId);
        setClasses(updated);
        setSelectedClassId(updated[0]?.id || '');
    }
  }

  const handleDeleteStudent = (studentId: string) => {
      if (!selectedClassId || isReadOnly) return;
      if (window.confirm("Remover este aluno?")) {
          setClasses(prev => prev.map(c => {
              if (c.id === selectedClassId) {
                  return { ...c, students: c.students.filter(s => s.id !== studentId) };
              }
              return c;
          }));
      }
  }

  const currentClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Create Class Card */}
      {!isReadOnly && (
      <div className="glass-panel rounded-[2.5rem] overflow-hidden max-w-3xl mx-auto shadow-xl">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative p-8">
            <h3 className="text-2xl font-extrabold text-white tracking-tight relative z-10">Nova Turma</h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
        </div>

        <div className="p-8">
            <form onSubmit={handleCreateClass} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 group bg-white/50 px-5 py-3 rounded-2xl border border-white/50 focus-within:bg-white focus-within:ring-4 ring-blue-500/10 transition-all">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Série / Ano</label>
                        <div className="relative">
                            <select 
                                value={selectedGrade}
                                onChange={e => setSelectedGrade(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-slate-800 text-base font-bold focus:ring-0 cursor-pointer appearance-none relative z-10"
                            >
                                {GRADE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <ChevronDown className="absolute right-0 top-1 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="group bg-white/50 px-5 py-3 rounded-2xl border border-white/50 focus-within:bg-white focus-within:ring-4 ring-blue-500/10 transition-all">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Turma</label>
                        <div className="relative">
                            <select 
                                value={selectedLetter}
                                onChange={e => setSelectedLetter(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-slate-800 text-base font-bold focus:ring-0 cursor-pointer appearance-none relative z-10"
                            >
                                {LETTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt === 'Única' ? 'Única' : `Turma ${opt}`}</option>)}
                            </select>
                            <ChevronDown className="absolute right-0 top-1 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
                
                <div className="group bg-white/50 px-5 py-3 rounded-2xl border border-white/50 focus-within:bg-white focus-within:ring-4 ring-blue-500/10 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome da Disciplina</label>
                    <input 
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                        placeholder="Ex: Filosofia, Física, Matemática..."
                        className="w-full bg-transparent border-none p-0 text-slate-800 text-lg font-bold placeholder-slate-300 focus:ring-0"
                    />
                </div>
                
                <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-slate-800 text-white px-8 py-4 rounded-2xl hover:bg-slate-900 shadow-xl shadow-slate-200 transition-all font-bold text-sm uppercase tracking-wide flex items-center gap-2 transform active:scale-95">
                        <Plus size={18} /> Criar Turma
                    </button>
                </div>
            </form>
        </div>
      </div>
      )}

      {/* Management Section */}
      {classes.length > 0 ? (
        <div className="glass-panel rounded-[2.5rem] flex flex-col min-h-[600px] overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-6 md:p-8 bg-white/40 border-b border-white/50 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-white p-3 rounded-2xl text-blue-600 border border-white/50 shadow-sm">
                        <School size={28} />
                    </div>
                    <div className="relative group">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gerenciar Turma</label>
                        <select 
                            value={selectedClassId}
                            onChange={e => setSelectedClassId(e.target.value)}
                            className="appearance-none bg-transparent font-extrabold text-slate-800 text-2xl focus:outline-none cursor-pointer pr-8 hover:text-blue-600 transition-colors w-full md:w-auto"
                        >
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.subject}</option>)}
                        </select>
                         <ChevronDown className="absolute right-0 bottom-2 text-slate-400 pointer-events-none group-hover:text-blue-500" size={16} />
                    </div>
                </div>
                
                {!isReadOnly && (
                    <button 
                        onClick={handleDeleteClass}
                        className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-700 px-5 py-2.5 rounded-xl transition-colors text-xs font-bold uppercase tracking-wide border border-red-100"
                    >
                        <Trash2 size={16} /> Excluir
                    </button>
                )}
            </div>

            <div className="flex flex-col flex-1">
                {/* Add Student Area */}
                {!isReadOnly && currentClass && (
                    <div className="p-6 bg-slate-50/30 border-b border-white/50">
                        <div className="flex gap-2 mb-4 p-1 bg-white/40 rounded-xl w-fit border border-white/50">
                            <button 
                                onClick={() => setIsBulkMode(false)}
                                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${!isBulkMode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Individual
                            </button>
                            <button 
                                onClick={() => setIsBulkMode(true)}
                                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${isBulkMode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Importação Lista
                            </button>
                        </div>

                        {!isBulkMode ? (
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <input 
                                    value={newStudentName}
                                    onChange={e => setNewStudentName(e.target.value)}
                                    placeholder="Nome completo do aluno"
                                    className="flex-1 w-full px-5 py-3.5 bg-white/60 border border-white/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700 placeholder-slate-400 transition-all"
                                />
                                <input 
                                    value={newStudentReg}
                                    onChange={e => setNewStudentReg(e.target.value)}
                                    placeholder="Matrícula"
                                    className="w-full md:w-48 px-5 py-3.5 bg-white/60 border border-white/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700 placeholder-slate-400 transition-all"
                                />
                                <button 
                                    onClick={handleAddStudent}
                                    disabled={!newStudentName.trim()}
                                    className="w-full md:w-auto px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                                >
                                    <UserPlus size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <textarea 
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                    placeholder="Cole a lista de nomes aqui..."
                                    className="w-full h-32 px-5 py-4 bg-white/60 border border-white/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium transition-all resize-y"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleBulkImport}
                                        disabled={!bulkText.trim()}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                    >
                                        <FileSpreadsheet size={18} /> Processar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="overflow-y-auto custom-scrollbar flex-1 bg-white/30">
                {!currentClass || currentClass.students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Users size={48} className="opacity-20 mb-4" />
                        <p className="text-base font-bold text-slate-500">Nenhum aluno matriculado</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/50">
                        <tr>
                        <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Matrícula</th>
                        <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Nome do Aluno</th>
                        <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center">Status</th>
                        {!isReadOnly && <th className="px-6 py-4 text-center"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/50">
                        {currentClass.students.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-white/40 transition-colors group">
                            <td className="px-6 py-4 text-slate-500 font-mono text-xs font-medium">{student.registrationNumber}</td>
                            <td className="px-6 py-4 text-slate-800 font-bold text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600">
                                        {idx + 1}
                                    </div>
                                    {student.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
                                </span>
                            </td>
                            {!isReadOnly && (
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleDeleteStudent(student.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            )}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
                </div>
            </div>
        </div>
      ) : (
         isReadOnly && <div className="text-center p-12 text-slate-500 font-bold">Nenhuma turma cadastrada.</div>
      )}
    </div>
  );
};

export default ClassManager;