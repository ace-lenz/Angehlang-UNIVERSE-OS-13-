import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Save, FileCode, AlertCircle, Loader2 } from 'lucide-react';
import { VirtualFile } from '@/types';
import { quantumBuilder } from '@/engine/QuantumBuilder';

export const ChangeReviewer = ({ 
  file, 
  onAccept, 
  onClose 
}: { 
  file: VirtualFile, 
  onAccept: (file: VirtualFile) => void, 
  onClose: () => void 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleAcceptAndSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const res = await quantumBuilder.writeFilesNative(file.name || 'generated_file.txt', file.content || '');
      if (res === false || (typeof res === 'object' && res.status === 'error')) {
        throw new Error("Failed to save file remotely");
      }
      setSaveStatus('success');
      console.log("File firmly persisted to native FS.");
      // Small delay for user to see success
      setTimeout(() => onAccept(file), 500);
    } catch(e) {
      setSaveStatus('error');
      console.error("Native FS save failed, falling back to download:", e);
      const blob = new Blob([file.content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'generated_file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onAccept(file);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
    >
      <div className="w-full max-w-5xl h-[80vh] bg-[#0a0a0b] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileCode size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Review_Changes: {file.name}</h2>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Modified Virtual Artifact</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Comparison View (Simulated Diff) */}
          <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-black/40 font-mono text-xs leading-relaxed">
            <div className="grid grid-cols-[30px_1fr] gap-4">
              <div className="text-slate-700 flex flex-col items-end">
                {file.content?.split('\n').map((_, i) => <span key={i}>{i+1}</span>)}
              </div>
              <div className="text-slate-300">
                {file.content?.split('\n').map((line, i) => (
                  <div key={i} className={line.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : line.includes('-') ? 'bg-red-500/10 text-red-400' : ''}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="w-full md:w-80 p-6 border-l border-white/10 bg-white/5 flex flex-col gap-6">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <AlertCircle size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Validation_Required</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                The agent swarm has proposed this modification. Review the structural integrity before committing to the virtual filesystem.
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button 
                onClick={handleAcceptAndSave}
                disabled={isSaving}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  saveStatus === 'success' ? 'bg-emerald-600 text-white' :
                  saveStatus === 'error' ? 'bg-red-600 text-white' :
                  'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : saveStatus === 'success' ? (
                  <Check size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? 'SAVING...' : saveStatus === 'success' ? 'SAVED!' : 'ACCEPT & SAVE'}
              </button>
              <button 
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition-all"
              >
                <X size={18} />
                DISCARD
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
