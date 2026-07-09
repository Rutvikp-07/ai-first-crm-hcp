import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { CheckSquare, Square, Check, Trash2, Plus } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Email GliclaCare Phase III cardiovascular trial summary to Dr. Anita Desai', completed: false, tag: 'GliclaCare' },
    { id: '2', text: 'Deliver 50 more samples of Pediatrix Multi-V to Dr. Sunita Rao clinic', completed: true, tag: 'Pediatrix' },
    { id: '3', text: 'Prepare CardioSart HCT Patient brochures for Fortis Escorts reception', completed: false, tag: 'CardioSart' },
    { id: '4', text: 'Call Dr. Preeti Gupta regarding safety data sheet receipt confirmation', completed: false, tag: 'DermaSoothe' }
  ]);

  const [newTaskInput, setNewTaskInput] = useState('');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTaskInput.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now().toString(), text: newTaskInput, completed: false, tag: 'General' }
    ]);
    setNewTaskInput('');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5 flex justify-between items-center bg-white border border-slate-100 shadow-soft select-none">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Your Action Checklists</h2>
          <p className="text-xs text-slate-400 mt-1">Track tasks and AI-extracted follow-ups from your sales interactions.</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Main List */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex gap-2 mb-5">
            <Input
              placeholder="Add a follow up action..."
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              containerClassName="flex-1"
            />
            <Button size="sm" className="h-10 px-4 mt-auto" onClick={addTask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`p-3.5 rounded-lg border flex items-center justify-between transition-all ${
                  task.completed
                    ? 'bg-slate-50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-200/60 shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                      task.completed ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white hover:border-slate-450'
                    }`}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <span className={`text-xs font-medium text-slate-700 ${task.completed ? 'line-through text-slate-450' : ''}`}>
                    {task.text}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="primary" className="text-[9px] px-1.5 py-0.5">{task.tag}</Badge>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Info stats */}
        <Card className="lg:col-span-3 p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-2 select-none">Summary Status</h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-450 font-semibold select-none">Total Actions</span>
            <span className="font-bold text-slate-800">{tasks.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-450 font-semibold select-none">Pending Actions</span>
            <span className="font-bold text-slate-800">{tasks.filter(t => !t.completed).length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-450 font-semibold select-none">Completed Actions</span>
            <span className="font-bold text-emerald-600">{tasks.filter(t => t.completed).length}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tasks;
