
import React, { useState } from 'react';
import { ClassGroup } from '../types';
import { Copy, ArrowDownToLine, Info, X } from 'lucide-react';

interface GradebookProps {
  classes: ClassGroup[];
  updateClasses: (classes: ClassGroup[]) => void;
  isReadOnly?: boolean;
}

const ASSESSMENTS = [
    { id: 'm1', group: 'Mensal', title: 'Mensal 1', short: 'M1', weight: 1 },
    { id: 'm2', group: 'Mensal', title: 'Mensal 2', short: 'M2', weight: 1 },
    { id: 'm3', group: 'Mensal', title: 'Mensal 3', short: 'M3', weight: 1 },
    { id: 'res', group: 'Trabalhos', title: 'Pesquisa', short: 'Pesq', weight: 1 },
    { id: 'bi', group: 'Bimestral', title: 'Prova Bim.', short: 'Bim', weight: 2 },
    { id: 'read', group: 'Extras', title: 'Leitura', short: 'Leit', weight: 0 },
];

const Gradebook: React.FC<GradebookProps> = ({ classes, updateClasses, isReadOnly = false }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [cloneModal, setCloneModal] = useState<{ id: string; mode: 'empty' | 'all'; title: string } | null>(null);
  const [cloneValue, setCloneValue] = useState('');

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const handleGradeChange = (studentId: string, assessId: string, value: string) => {
    if (isReadOnly || !selectedClass) return;
    let cleanVal = value.replace(',', '.');
    const num = parseFloat(cleanVal);
    if (value !== '' && (isNaN(num) || num < 0 || num > 10)) return;
    const updatedClasses = classes.map(c => {
        if (c.id === selectedClassId) {
            return {
                ...c,
                grades: { ...c.grades, [studentId]: { ...(c.grades?.[studentId] || {}), [assessId]: cleanVal } }
            };
        }
        return c;
    });
    updateClasses(updatedClasses);
  };

  const executeClone = () => {
    if (!cloneModal || !selectedClass) return;
    const num = parseFloat(cloneValue.replace(',', '.'));
    if (isNaN(num) || num < 0 || num > 10) return;
    const updatedClasses = classes.map(c => {
        if (c.id === selectedClassId) {
            const newGrades = { ...(c.grades || {}) };
            c.students.forEach(student => {
                const currentScore = newGrades[student.id]?.[cloneModal.id];
                if (cloneModal.mode === 'all' || (cloneModal.mode === 'empty' && !currentScore)) {
                    if (!newGrades[student.id]) newGrades[student.id] = {};
                    newGrades[student.id][cloneModal.id] = cloneValue.replace(',', '.');
                }
            });
            return { ...c, grades: newGrades };
        }
        return c;
    });
    updateClasses(updatedClasses);
    setCloneModal(null);
  };

  const calculateResults = (studentId: string) => {
    if (!selectedClass) return { avg: '-', val: 0 };
    const grades = selectedClass.grades?.[studentId] || {};
    let mSum = 0;
    ['m1', 'm2', 'm3'].forEach(id => { const val = parseFloat(grades[id] || '0'); mSum += isNaN(val) ? 0 : val; });
    const avgMonthly = mSum / 3;
    const res = parseFloat(grades['res'] || '0');
    const bi = parseFloat(grades['bi'] || '0');
    const baseAvg = (avgMonthly + res + (bi * 2)) / 4;
    const read = parseFloat(grades['read'] || '0');
    let final = baseAvg + read;
    if (final > 10) final = 10;
    return { avg: final.toFixed(1).replace('.', ','), val: final };
  };

  if (classes.length === 0) return <div className="text-center p-12 text-slate-500 font-bold">Nenhuma turma cadastrada.</div>;

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="glass-panel p-5 rounded-[2rem] flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
           <label className="text-slate-400 font-bold text-xs uppercase tracking-wide">Caderneta de:</label>
           <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-extrabold text-slate-800 text-lg focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
           >
             {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.subject}</option>)}
           </select>
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden flex flex-col h-[70vh] shadow-xl">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-white/50 backdrop-blur-md sticky top-0 z-20">
              <tr>
                <th className="p-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-b border-r border-slate-200 sticky left-0 z-30 bg-white/90 w-12 text-center">No.</th>
                <th className="p-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-b border-r border-slate-200 sticky left-12 z-30 bg-white/90 w-64 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]">Nome do Aluno</th>
                
                {ASSESSMENTS.map((ass, idx) => {
                  const isNewGroup = idx === 0 || ASSESSMENTS[idx-1].group !== ass.group;
                  return (
                  <th key={ass.id} className={`p-2 border-b border-r border-slate-200 min-w-[100px] group hover:bg-white/60 transition-colors ${isNewGroup ? 'border-l-4 border-l-blue-100' : ''}`}>
                    <div className="flex flex-col gap-1.5 p-1">
                      <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-700 uppercase">{ass.short}</span>
                          {ass.weight > 0 ? (
                              <span className="text-[9px] bg-blue-100/80 text-blue-700 px-1.5 py-0.5 rounded font-bold">P{ass.weight}</span>
                          ) : (
                              <span className="text-[9px] bg-yellow-100/80 text-yellow-700 px-1.5 py-0.5 rounded font-bold">Bônus</span>
                          )}
                      </div>
                      {!isReadOnly && (
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCloneModal({ id: ass.id, mode: 'empty', title: ass.title }); setCloneValue(''); }} className="flex-1 bg-white border border-slate-200 hover:text-blue-600 rounded py-1 flex justify-center"><ArrowDownToLine size={12} /></button>
                        <button onClick={() => { setCloneModal({ id: ass.id, mode: 'all', title: ass.title }); setCloneValue(''); }} className="flex-1 bg-white border border-slate-200 hover:text-blue-600 rounded py-1 flex justify-center"><Copy size={12} /></button>
                      </div>
                      )}
                    </div>
                  </th>
                  )
                })}
                <th className="p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200 w-24 text-center bg-slate-50/50">Média</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedClass.students.map((student, idx) => {
                const { avg, val } = calculateResults(student.id);
                return (
                  <tr key={student.id} className="hover:bg-white/40 transition-colors">
                    <td className="p-4 text-slate-400 text-center text-xs border-r border-slate-100 bg-white/40 sticky left-0 z-10 font-mono">{idx + 1}</td>
                    <td className="p-4 text-slate-700 font-bold text-sm border-r border-slate-100 bg-white/40 sticky left-12 z-10 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] truncate max-w-[250px]">{student.name}</td>
                    {ASSESSMENTS.map((ass, i) => {
                       const isNewGroup = i === 0 || ASSESSMENTS[i-1].group !== ass.group;
                       const rawVal = selectedClass.grades?.[student.id]?.[ass.id] || '';
                       const numVal = parseFloat(rawVal.replace(',', '.'));
                       return (
                        <td key={ass.id} className={`p-1 border-r border-slate-100 text-center h-12 ${isNewGroup ? 'border-l-4 border-l-blue-50/50' : ''}`}>
                            <input 
                            readOnly={isReadOnly}
                            value={rawVal}
                            onChange={(e) => handleGradeChange(student.id, ass.id, e.target.value)}
                            className={`w-full h-full text-center bg-transparent focus:bg-white/80 focus:shadow-inner outline-none font-bold transition-all text-sm rounded ${!isNaN(numVal) && numVal < 6 ? 'text-red-500' : 'text-slate-700'}`}
                            placeholder={isReadOnly ? "-" : ""}
                            />
                        </td>
                      )
                    })}
                    <td className="p-2 text-center border-l bg-slate-50/30">
                       <div className={`flex items-center justify-center font-extrabold text-sm w-10 h-10 mx-auto rounded-xl shadow-sm ${val < 6 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{avg}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {cloneModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4 rounded-[2.5rem]">
             <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-white animate-fade-in">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-slate-800">{cloneModal.mode === 'all' ? 'Replicar Todos' : 'Preencher Vazios'}</h3>
                     <button onClick={() => setCloneModal(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                 </div>
                 <div className="mb-8 text-center">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Nota a inserir</label>
                     <input 
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        autoFocus
                        value={cloneValue}
                        onChange={e => setCloneValue(e.target.value)}
                        className="w-full text-5xl font-black text-center border-b-4 border-blue-500 pb-2 focus:outline-none text-blue-600 bg-transparent placeholder-blue-200"
                        placeholder="10"
                     />
                 </div>
                 <div className="flex gap-4">
                     <button onClick={() => setCloneModal(null)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">Cancelar</button>
                     <button onClick={executeClone} disabled={!cloneValue} className="flex-1 py-4 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-300 disabled:opacity-50 transition-all">Confirmar</button>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Gradebook;
