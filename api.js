const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const api = {
  stats: () => request("/tasks/stats"),
  tasks: (params = {}) => request("/tasks?" + new URLSearchParams(params)),
  addTask: (body) => request("/tasks", { method: "POST", body }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: "PUT", body }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  students: () => request("/students"),
  addStudent: (body) => request("/students", { method: "POST", body }),
  updateStudent: (id, body) => request(`/students/${id}`, { method: "PUT", body }),
  deleteStudent: (id) => request(`/students/${id}`, { method: "DELETE" }),
};
