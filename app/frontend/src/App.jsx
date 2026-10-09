import { useCallback, useEffect, useState } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/todos`);
      if (!response.ok) throw new Error('API returned an error');
      setTodos(await response.json());
      setError('');
    } catch {
      setError('Cannot reach the backend. Check the Docker services and API logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function addTodo(event) {
    event.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) throw new Error('Could not add task');
      setTitle('');
      await loadTodos();
    } catch {
      setError('Could not add task. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo) {
    try {
      const response = await fetch(`${API}/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) throw new Error();
      await loadTodos();
    } catch {
      setError('Could not update task.');
    }
  }

  async function deleteTodo(id) {
    try {
      const response = await fetch(`${API}/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      await loadTodos();
    } catch {
      setError('Could not delete task.');
    }
  }

  const completed = todos.filter(todo => todo.completed).length;
  const remaining = todos.length - completed;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <span>TaskFlow</span>
        </div>
        <div className="topbar-label">PERSONAL WORKSPACE</div>
      </nav>

      <main className="main-content">
        <header className="welcome">
          <div>
            <div className="eyebrow">YOUR PRODUCTIVITY SPACE</div>
            <h1>Make today <span>count.</span></h1>
            <p className="subtitle">One step at a time. You've got this.</p>
          </div>
          <div className="date-label">
            ✦ &nbsp; My task dashboard
          </div>
        </header>

        <section className="summary">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total tasks</span>
              <span className="stat-icon purple">▤</span>
            </div>
            <div className="stat-number">{todos.length}</div>
            <div className="stat-note">Tasks in your workspace</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon green">✓</span>
            </div>
            <div className="stat-number">{completed}</div>
            <div className="stat-note">Small wins add up</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Remaining</span>
              <span className="stat-icon blue">◷</span>
            </div>
            <div className="stat-number">{remaining}</div>
            <div className="stat-note">Ready for your focus</div>
          </div>
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Your task list</h2>
                <p>Keep track of what matters.</p>
              </div>
              <span className="task-count">{todos.length} tasks</span>
            </div>

            <form className="add-form" onSubmit={addTodo}>
              <input
                className="task-input"
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="e.g. Finish my DevOps project"
                maxLength={200}
                required
              />
              <button className="add-button" type="submit" disabled={saving}>
                {saving ? 'Adding...' : '+  Add new task'}
              </button>
            </form>

            {error && <p className="error" role="alert">{error}</p>}

            <div style={{ marginTop: 26 }}>
              {loading ? (
                <div className="empty-state">Loading your tasks...</div>
              ) : todos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✧</div>
                  <strong>Your space is clear</strong>
                  <div>Add a task above to get started.</div>
                </div>
              ) : (
                <div className="task-list">
                  {todos.map(todo => (
                    <article className={`task-row ${todo.completed ? 'done' : ''}`} key={todo.id}>
                      <input
                        className="task-checkbox"
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo)}
                        aria-label={`Mark ${todo.title} complete`}
                      />
                      <div className="task-details">
                        <div className="task-title">{todo.title}</div>
                        <span className="task-status">
                          {todo.completed ? '✓ Completed' : '○ In progress'}
                        </span>
                      </div>
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Your progress</h2>
                  <p>Every completed task counts.</p>
                </div>
              </div>
              <div className="progress-label">
                <span>Completion rate</span>
                <strong>{progress}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-label">
                <span>{completed} completed</span>
                <span>{remaining} left</span>
              </div>

              <div className="tip-card">
                <div className="tip-title">✦ A little reminder</div>
                <p>Focus on one task at a time. Consistent progress is better than perfection.</p>
              </div>
            </section>
          </aside>
        </div>

        <footer className="footer">
          TASKFLOW &nbsp;·&nbsp; BUILT WITH REACT, NODE.JS &amp; POSTGRESQL
        </footer>
      </main>
    </div>
  );
}
