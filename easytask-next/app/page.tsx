'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Task {
  id: number;
  title: string;
  tag: 'work' | 'personal' | 'urgent';
  priority: 'high' | 'med' | 'low';
  is_completed: boolean;
  due_date: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [energy, setEnergy] = useState('high');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState<'work' | 'personal' | 'urgent'>('work');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setIsLoading(true);
    // Removed .order() to prevent the 'column created_at does not exist' error
    const { data, error } = await supabase
      .from('tasks')
      .select('*');

    if (error) {
      console.error('Supabase Error:', error.message);
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  }

  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: newTaskTitle, 
        tag: newTaskTag, 
        priority: 'med', 
        is_completed: false,
        due_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }])
      .select();

    if (error) {
      alert("Error: " + error.message);
    } else if (data) {
      setTasks([data[0], ...tasks]);
      setNewTaskTitle('');
      setIsModalOpen(false);
    }
  };

  const toggleTask = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    }
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks.filter(t => activeTab === 'all' || t.tag === activeTab);

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex-wrapper">
      <aside className="sidebar">
        <div className="sidebar-logo"><span className="logo-dot"></span> EasyTask</div>
        <div className="sidebar-tagline">Your daily focus assistant</div>
        <ul className="sidebar-nav">
          <li className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
            <a href="#"><i className="bi bi-sun"></i> Today</a>
          </li>
        </ul>
        <div className="sidebar-section-label">Tags</div>
        <div className="sidebar-tags">
          {['work', 'personal', 'urgent'].map((tag) => (
            <span 
              key={tag}
              className={`tag-pill ${tag} ${activeTab === tag ? 'active' : ''}`} 
              onClick={() => setActiveTab(tag as any)}
            >
              <span className="dot"></span>{tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-greeting">
            <div className="day-label">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</div>
            <h1>Good morning, <span>Alex.</span></h1>
              <div className="progress-container" style={{ width: '100%', height: '8px', background: 'var(--et-border)', borderRadius: '10px', marginTop: '10px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--et-green)', borderRadius: '10px', transition: 'width 0.4s ease' }}></div>
              </div>
              <p style={{ fontSize: '12px', marginTop: '5px', color: 'var(--et-muted)' }}>{progress}% of daily goals reached</p>

          </div>
          <button className="btn-add-task" onClick={() => setIsModalOpen(true)}>
            <i className="bi bi-plus-lg"></i> Add Task
          </button>
        </header>

        <div className="energy-bar">
          <span className="energy-label">Energy today</span>
          <div className="energy-levels">
            {['high', 'mid', 'low'].map((level) => (
              <button 
                key={level}
                className={`energy-btn ${energy === level ? `active-${level}` : ''}`} 
                onClick={() => setEnergy(level)}
              >
                {level === 'high' ? '🔥 High' : level === 'mid' ? '⚡ Medium' : '🌿 Low'}
              </button>
            ))}
          </div>
        </div>

        <div className="task-list">
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '20px'}}>Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', opacity: 0.5}}>No tasks yet!</div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`task-item ${task.is_completed ? 'completed' : ''}`}>
                <div className={`task-priority priority-${task.priority}`}></div>
                <div className={`task-check ${task.is_completed ? 'checked' : ''}`} onClick={() => toggleTask(task.id, task.is_completed)}></div>
                <div className="task-body">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className="task-due"><i className="bi bi-clock"></i> {task.due_date}</span>
                    <span className={`task-tag ${task.tag}`}>{task.tag}</span>
                  </div>
                </div>
                <button className="task-action-btn delete" onClick={() => deleteTask(task.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Add New Task</h3>
            <input 
              className="form-control-custom" 
              placeholder="What's on your mind?" 
              value={newTaskTitle}
              autoFocus
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
            />
            <div className="tag-select">
              {['work', 'personal', 'urgent'].map(tag => (
                <button 
                  key={tag}
                  className={`tag-opt ${newTaskTag === tag ? `active-${tag}` : ''}`} 
                  onClick={() => setNewTaskTag(tag as any)}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
            <div className="modal-footer-custom">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveTask}>Save Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}