
import React, { useState } from 'react';
import { Plus, MoreHorizontal, Calendar, ArrowRight, X, User as UserIcon, Save, CheckCircle, Clock, AlertCircle, MessageSquare, Paperclip, History, Send, Users } from 'lucide-react';
import { Task, TaskStatus, User as UserType, Employee } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  employees: Employee[];
  user: UserType;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, employees, user, onAddTask, onUpdateTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '', description: '', priority: 'Medium', status: 'To Do', assignee: '', team: []
  });
  
  // Task Modal Tab
  const [modalTab, setModalTab] = useState<'details' | 'comments' | 'history'>('details');
  const [newComment, setNewComment] = useState('');

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return 'bg-slate-100/50 border-slate-200';
      case 'In Progress': return 'bg-blue-50/50 border-blue-100';
      case 'Review': return 'bg-yellow-50/50 border-yellow-100';
      case 'Done': return 'bg-orange-50/50 border-orange-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'High': return 'bg-red-100 text-red-700';
        case 'Medium': return 'bg-orange-100 text-orange-700';
        case 'Low': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
  };

    const normalizeStatus = (s?: string) => {
        if (!s) return '';
        const v = s.toString().toLowerCase().trim();
        if (v === 'todo' || v === 'to do') return 'To Do';
        if (v === 'in progress' || v === 'inprogress') return 'In Progress';
        if (v === 'review') return 'Review';
        if (v === 'done' || v === 'completed') return 'Done';
        return s;
    };

    const normalizePriority = (p?: string) => {
        if (!p) return 'Medium';
        const v = p.toString().toLowerCase().trim();
        if (v === 'high') return 'High';
        if (v === 'low') return 'Low';
        return 'Medium';
    };

  const moveTask = (task: Task, direction: 'next' | 'prev' | 'select', newStatus?: TaskStatus) => {
    const statusOrder: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];
    let nextStatus = newStatus;

    if (!nextStatus) {
        const currentIndex = statusOrder.indexOf(task.status);
        if (direction === 'next' && currentIndex < statusOrder.length - 1) {
            nextStatus = statusOrder[currentIndex + 1];
        }
    }

    if (nextStatus) {
        onUpdateTask({ 
            ...task, 
            status: nextStatus,
            history: [...(task.history || []), { 
                id: Date.now().toString(), 
                user: user.name, 
                action: `Moved to ${nextStatus}`, 
                date: new Date().toLocaleString() 
            }]
        });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!window.confirm('Are you sure you want to add this new task?')) {
          return;
      }
      
      if(newTask.title && newTask.assignee) {
        const assignedEmployee = employees.find(e => e.name === newTask.assignee);
        const taskId = `task-${Date.now()}`;
        
        const newTaskObj = {
            id: taskId,
            title: newTask.title,
            description: newTask.description || '',
            priority: newTask.priority as any,
            status: 'To Do' as const,
            assignee: newTask.assignee,
            assigneeAvatar: assignedEmployee?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newTask.assignee)}&background=random`,
            team: newTask.team || [],
            dueDate: new Date().toISOString().split('T')[0],
            comments: [],
            history: [{ id: Date.now().toString(), user: user.name, action: 'Created Task', date: new Date().toLocaleString() }]
        };
        
        console.log('📍 Adding Task:', newTaskObj);
        onAddTask(newTaskObj);
        console.log('✅ Task submitted to backend');
        
        setIsModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'Medium', status: 'To Do', assignee: '', team: [] });
      } else {
          alert('Please enter a title and select an assignee.');
      }
  };

  const handleToggleMember = (empName: string) => {
      const currentTeam = newTask.team || [];
      if (currentTeam.includes(empName)) {
          setNewTask({ ...newTask, team: currentTeam.filter(m => m !== empName) });
      } else {
          setNewTask({ ...newTask, team: [...currentTeam, empName] });
      }
  };

  const handleUpdateSelectedTask = () => {
      if (!window.confirm('Are you sure you want to update this task?')) {
          return;
      }
      
      if (selectedTask) {
          onUpdateTask({
              ...selectedTask,
              history: [...(selectedTask.history || []), {
                  id: Date.now().toString(),
                  user: user.name,
                  action: 'Updated Task Details',
                  date: new Date().toLocaleString()
              }]
          });
          setSelectedTask(null);
      }
  };

  const handleAddComment = () => {
      if (selectedTask && newComment.trim()) {
          const updatedTask = {
              ...selectedTask,
              comments: [...(selectedTask.comments || []), {
                  id: Date.now().toString(),
                  user: user.name,
                  avatar: user.avatar,
                  text: newComment,
                  date: new Date().toLocaleString()
              }]
          };
          onUpdateTask(updatedTask);
          setSelectedTask(updatedTask); // Update local state for immediate feedback
          setNewComment('');
      }
  };

    const Column = ({ title, status }: { title: string, status: TaskStatus }) => {
        const columnTasks = tasks.filter(t => normalizeStatus((t as any).status) === status);

    return (
      <div className={`flex-1 min-w-[300px] rounded-2xl p-4 border flex flex-col h-full shadow-inner backdrop-blur-sm ${getStatusColor(status)}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">{title}</h3>
            <span className="bg-white px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-500 shadow-sm border border-slate-100">{columnTasks.length}</span>
        </div>
        
        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {columnTasks.map(task => (
                <div 
                    key={task.id} 
                    onClick={() => { setSelectedTask(task); setModalTab('details'); }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-2">
                                                        {(() => {
                                                                const p = normalizePriority((task as any).priority);
                                                                return (
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPriorityColor(p)}`}>
                                                                        {p}
                                                                    </span>
                                                                );
                                                        })()}
                        <div className="relative group/edit">
                             <button className="text-slate-400 hover:text-slate-600">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">{task.title}</h4>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center -space-x-2">
                            <img src={(task as any).assigneeAvatar || task.assigneeAvatar} alt={(task as any).assignee || task.assignee} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" title={`Assignee: ${(task as any).assignee || task.assignee}`} />
                            {task.team && task.team.length > 0 && (
                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                    +{task.team.length}
                                </div>
                            )}
                        </div>
                        {status !== 'Done' && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); moveTask(task, 'next'); }}
                                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-accent-500 transition-colors" title="Move Next"
                            >
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
             <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm hover:bg-white hover:text-accent-500 hover:border-accent-300 transition-all flex items-center justify-center font-medium"
            >
                <Plus size={16} className="mr-1" /> Add Task
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Task Board</h1>
          <p className="text-slate-500 mt-1">Manage project tasks and workflows.</p>
        </div>
        <div className="flex items-center space-x-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-accent-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-accent-600 shadow-lg shadow-orange-500/30 transition-all font-medium"
            >
                <Plus size={18} />
                <span>New Task</span>
            </button>
        </div>
      </div>

            {/* Stat Cards - styled per user snippet */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between transition-all hover:shadow-xl transform hover:-translate-y-0.5">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Tasks</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{tasks.length}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-current/20">
                        <Users size={20} />
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between transition-all hover:shadow-xl transform hover:-translate-y-0.5">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">To Do</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{tasks.filter(t => normalizeStatus((t as any).status) === 'To Do').length}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500 text-white shadow-lg shadow-current/20">
                        <Clock size={20} />
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between transition-all hover:shadow-xl transform hover:-translate-y-0.5">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In Progress</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{tasks.filter(t => normalizeStatus((t as any).status) === 'In Progress').length}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-500 text-white shadow-lg shadow-current/20">
                        <AlertCircle size={20} />
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between transition-all hover:shadow-xl transform hover:-translate-y-0.5">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Done</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{tasks.filter(t => normalizeStatus((t as any).status) === 'Done').length}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500 text-white shadow-lg shadow-current/20">
                        <CheckCircle size={20} />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-6 h-full min-w-[1200px]">
            <Column title="To Do" status="To Do" />
            <Column title="In Progress" status="In Progress" />
            <Column title="Review" status="Review" />
            <Column title="Done" status="Done" />
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">Add New Task</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <form onSubmit={handleAddTask} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                        <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50" rows={3} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                            <select value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50" required>
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.designation})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-32 overflow-y-auto">
                            {employees.map(emp => (
                                <div key={emp.id} className="flex items-center space-x-2 mb-1">
                                    <input 
                                        type="checkbox" 
                                        checked={(newTask.team || []).includes(emp.name)}
                                        onChange={() => handleToggleMember(emp.name)}
                                        className="rounded text-accent-500 focus:ring-accent-500"
                                    />
                                    <span className="text-sm text-slate-700">{emp.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-accent-500 text-white py-2.5 rounded-xl font-medium hover:bg-accent-600 transition-colors shadow-lg shadow-orange-500/30">Add Task</button>
                </form>
            </div>
        </div>
      )}

      {/* Enhanced Task Details Modal */}
      {selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="font-bold text-gray-800 text-lg">Task Details</h3>
                    <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                
                {/* Tabs */}
                <div className="bg-white border-b border-slate-100 px-6 flex space-x-6 flex-shrink-0">
                    <button onClick={() => setModalTab('details')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${modalTab === 'details' ? 'border-accent-500 text-accent-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Details</button>
                    <button onClick={() => setModalTab('comments')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${modalTab === 'comments' ? 'border-accent-500 text-accent-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Comments ({selectedTask.comments?.length || 0})</button>
                    <button onClick={() => setModalTab('history')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${modalTab === 'history' ? 'border-accent-500 text-accent-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>History</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {modalTab === 'details' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Title</label>
                                <input value={selectedTask.title} onChange={e => setSelectedTask({...selectedTask, title: e.target.value})} className="w-full text-lg font-semibold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-accent-500 focus:outline-none bg-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</label>
                                <textarea value={selectedTask.description} onChange={e => setSelectedTask({...selectedTask, description: e.target.value})} className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-500/50" rows={4} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Status</label>
                                    <select value={selectedTask.status} onChange={e => setSelectedTask({...selectedTask, status: e.target.value as any})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                                        <option>To Do</option>
                                        <option>In Progress</option>
                                        <option>Review</option>
                                        <option>Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Priority</label>
                                    <select value={selectedTask.priority} onChange={e => setSelectedTask({...selectedTask, priority: e.target.value as any})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Assignee</label>
                                <select value={selectedTask.assignee} onChange={e => setSelectedTask({...selectedTask, assignee: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedTask.team && selectedTask.team.length > 0 && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Team Members</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTask.team.map((member, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200">{member}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Attachments</label>
                                <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <Paperclip size={20} className="text-slate-400 mb-1" />
                                    <span className="text-xs text-slate-500">Click to upload files</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalTab === 'comments' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="flex-1 space-y-4 overflow-y-auto">
                                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                                    selectedTask.comments.map(comment => (
                                        <div key={comment.id} className="flex space-x-3">
                                            <img src={comment.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                                            <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-100">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-bold text-slate-800">{comment.user}</span>
                                                    <span className="text-xs text-slate-400">{comment.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-600">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400 italic">No comments yet.</div>
                                )}
                            </div>
                            <div className="pt-2 flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..." 
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button onClick={handleAddComment} className="p-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors"><Send size={18} /></button>
                            </div>
                        </div>
                    )}

                    {modalTab === 'history' && (
                        <div className="space-y-4">
                            {selectedTask.history && selectedTask.history.length > 0 ? (
                                <ul className="space-y-4">
                                    {selectedTask.history.map(item => (
                                        <li key={item.id} className="flex items-start space-x-3 text-sm">
                                            <div className="mt-1">
                                                <History size={14} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-slate-800 font-medium">
                                                    <span className="font-bold">{item.user}</span> {item.action}
                                                </p>
                                                <p className="text-xs text-slate-400">{item.date}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-slate-400 italic">No history available.</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 flex justify-end flex-shrink-0 border-t border-slate-100">
                    <button onClick={handleUpdateSelectedTask} className="bg-accent-500 text-white px-6 py-2 rounded-xl flex items-center space-x-2 hover:bg-accent-600 shadow-lg shadow-orange-500/30 transition-all font-medium">
                        <Save size={18} />
                        <span>Save Changes</span>
                    </button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default TaskBoard;
