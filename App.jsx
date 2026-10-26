import { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const isLate = (t) => t.status !== "Completed" && new Date(t.dueDate) < new Date();

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}

/* ---------- Dashboard ---------- */
function Dashboard({ stats, tasks }) {
  const upcoming = tasks.filter((t) => t.status !== "Completed").slice(0, 5);
  const rate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  return (
    <>
      <div className="stats">
        <div className="stat hero"><b>{rate}%</b><span>Completion rate</span></div>
        <div className="stat"><b>{stats.total ?? 0}</b><span>Total tasks</span></div>
        <div className="stat"><b>{stats.pending ?? 0}</b><span>Pending</span></div>
        <div className="stat"><b>{stats.inProgress ?? 0}</b><span>In progress</span></div>
        <div className="stat"><b>{stats.overdue ?? 0}</b><span>Overdue</span></div>
      </div>
      <div className="panel">
        <div className="bar"><h3>Coming up next</h3></div>
        {upcoming.length === 0 ? (
          <div className="empty">Nothing due. Add a task to get started.</div>
        ) : (
          <div className="table-wrap"><table>
            <thead><tr><th>Task</th><th>Student</th><th>Due</th><th>Priority</th></tr></thead>
            <tbody>{upcoming.map((t) => (
              <tr key={t._id}>
                <td><div className="title">{t.title}</div><div className="sub">{t.subject}</div></td>
                <td>{t.student?.name}</td>
                <td className={isLate(t) ? "late" : ""}>{fmt(t.dueDate)}</td>
                <td><span className={`chip ${t.priority}`}>{t.priority}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </>
  );
}

/* ---------- Tasks ---------- */
function TaskForm({ initial, students, onSave, onClose }) {
  const [f, setF] = useState({
    title: "", description: "", subject: "", priority: "Medium", status: "Pending",
    dueDate: "", student: students[0]?._id || "", ...initial,
    ...(initial ? { dueDate: toInput(initial.dueDate), student: initial.student?._id || initial.student } : {}),
  });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await onSave(f); onClose(); } catch (err) { setError(err.message); }
  };
  return (
    <form onSubmit={submit}>
      {error && <div className="err">{error}</div>}
      <Field label="Title"><input required value={f.title} onChange={set("title")} /></Field>
      <Field label="Description"><textarea value={f.description} onChange={set("description")} /></Field>
      <div className="grid2">
        <Field label="Subject"><input required value={f.subject} onChange={set("subject")} /></Field>
        <Field label="Assigned to">
          <select required value={f.student} onChange={set("student")}>
            <option value="" disabled>Select student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.rollNo})</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={f.priority} onChange={set("priority")}>{["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}</select>
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={set("status")}>{["Pending", "In Progress", "Completed"].map((p) => <option key={p}>{p}</option>)}</select>
        </Field>
        <Field label="Due date"><input type="date" required value={f.dueDate} onChange={set("dueDate")} /></Field>
      </div>
      <div className="foot">
        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn">Save task</button>
      </div>
    </form>
  );
}

function Tasks({ tasks, students, reload }) {
  const [filters, setFilters] = useState({ q: "", status: "", priority: "" });
  const [modal, setModal] = useState(null);
  const [list, setList] = useState(tasks);

  useEffect(() => {
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.tasks(clean).then(setList);
  }, [filters, tasks]);

  const save = async (data) => {
    modal.task ? await api.updateTask(modal.task._id, data) : await api.addTask(data);
    reload();
  };
  const remove = async (t) => { if (confirm(`Delete "${t.title}"?`)) { await api.deleteTask(t._id); reload(); } };
  const toggle = async (t) => {
    await api.updateTask(t._id, { status: t.status === "Completed" ? "Pending" : "Completed" });
    reload();
  };
  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <div className="head">
        <div><h1>Tasks</h1><p>Assignments, projects and deadlines in one place.</p></div>
        <button className="btn" disabled={!students.length} onClick={() => setModal({})}>Add task</button>
      </div>
      <div className="panel">
        <div className="bar">
          <input placeholder="Search by title" value={filters.q} onChange={f("q")} />
          <select value={filters.status} onChange={f("status")}>
            <option value="">All statuses</option>{["Pending", "In Progress", "Completed"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.priority} onChange={f("priority")}>
            <option value="">All priorities</option>{["Low", "Medium", "High"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {list.length === 0 ? (
          <div className="empty">{students.length ? "No tasks match. Add one or clear the filters." : "Add a student first, then assign tasks."}</div>
        ) : (
          <div className="table-wrap"><table>
            <thead><tr><th>Task</th><th>Student</th><th>Due</th><th>Priority</th><th>Status</th><th /></tr></thead>
            <tbody>{list.map((t) => (
              <tr key={t._id}>
                <td><div className="title">{t.title}</div><div className="sub">{t.subject}</div></td>
                <td>{t.student?.name}<div className="sub">{t.student?.rollNo}</div></td>
                <td className={isLate(t) ? "late" : ""}>{fmt(t.dueDate)}</td>
                <td><span className={`chip ${t.priority}`}>{t.priority}</span></td>
                <td><span className={`chip ${t.status.replace(" ", "-")}`}>{t.status}</span></td>
                <td><div className="actions">
                  <button className="btn ghost sm" onClick={() => toggle(t)}>{t.status === "Completed" ? "Reopen" : "Complete"}</button>
                  <button className="btn ghost sm" onClick={() => setModal({ task: t })}>Edit</button>
                  <button className="btn danger sm" onClick={() => remove(t)}>Delete</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {modal && (
        <Modal title={modal.task ? "Edit task" : "New task"} onClose={() => setModal(null)}>
          <TaskForm initial={modal.task} students={students} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}

/* ---------- Students ---------- */
function StudentForm({ initial, onSave, onClose }) {
  const [f, setF] = useState({ name: "", rollNo: "", email: "", phone: "", course: "", year: 1, ...initial });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try { await onSave(f); onClose(); } catch (err) { setError(err.message); }
  };
  return (
    <form onSubmit={submit}>
      {error && <div className="err">{error}</div>}
      <div className="grid2">
        <Field label="Full name"><input required value={f.name} onChange={set("name")} /></Field>
        <Field label="Roll number"><input required value={f.rollNo} onChange={set("rollNo")} /></Field>
        <Field label="Email"><input type="email" required value={f.email} onChange={set("email")} /></Field>
        <Field label="Phone"><input value={f.phone || ""} onChange={set("phone")} /></Field>
        <Field label="Course"><input required value={f.course} onChange={set("course")} /></Field>
        <Field label="Year">
          <select value={f.year} onChange={set("year")}>{[1, 2, 3, 4, 5, 6].map((y) => <option key={y}>{y}</option>)}</select>
        </Field>
      </div>
      <div className="foot">
        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn">Save student</button>
      </div>
    </form>
  );
}

function Students({ students, tasks, reload }) {
  const [modal, setModal] = useState(null);
  const count = (id) => tasks.filter((t) => t.student?._id === id).length;
  const save = async (data) => {
    modal.student ? await api.updateStudent(modal.student._id, data) : await api.addStudent(data);
    reload();
  };
  const remove = async (s) => {
    if (confirm(`Delete ${s.name} and all their tasks?`)) { await api.deleteStudent(s._id); reload(); }
  };
  return (
    <>
      <div className="head">
        <div><h1>Student records</h1><p>Everyone you're tracking tasks for.</p></div>
        <button className="btn" onClick={() => setModal({})}>Add student</button>
      </div>
      <div className="panel">
        {students.length === 0 ? (
          <div className="empty">No students yet. Add your first student record.</div>
        ) : (
          <div className="table-wrap"><table>
            <thead><tr><th>Student</th><th>Roll no.</th><th>Course</th><th>Year</th><th>Contact</th><th>Tasks</th><th /></tr></thead>
            <tbody>{students.map((s) => (
              <tr key={s._id}>
                <td className="title">{s.name}</td>
                <td>{s.rollNo}</td>
                <td>{s.course}</td>
                <td>{s.year}</td>
                <td>{s.email}<div className="sub">{s.phone}</div></td>
                <td>{count(s._id)}</td>
                <td><div className="actions">
                  <button className="btn ghost sm" onClick={() => setModal({ student: s })}>Edit</button>
                  <button className="btn danger sm" onClick={() => remove(s)}>Delete</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {modal && (
        <Modal title={modal.student ? "Edit student" : "New student"} onClose={() => setModal(null)}>
          <StudentForm initial={modal.student} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const [s, t, st] = await Promise.all([api.stats(), api.tasks(), api.students()]);
      setStats(s); setTasks(t); setStudents(st); setError("");
    } catch (e) { setError("Can't reach the server. Start the backend and check MongoDB."); }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">FLEXI<small>Student task manager</small></div>
        <nav className="nav">
          {[["dashboard", "Dashboard"], ["tasks", "Tasks"], ["students", "Students"]].map(([k, l]) => (
            <button key={k} className={page === k ? "on" : ""} onClick={() => setPage(k)}>{l}</button>
          ))}
        </nav>
      </aside>
      <main className="main">
        {error && <div className="err">{error}</div>}
        {page === "dashboard" && (
          <>
            <div className="head"><div><h1>Dashboard</h1><p>Where everyone stands today.</p></div></div>
            <Dashboard stats={stats} tasks={tasks} />
          </>
        )}
        {page === "tasks" && <Tasks tasks={tasks} students={students} reload={reload} />}
        {page === "students" && <Students students={students} tasks={tasks} reload={reload} />}
      </main>
    </div>
  );
}
