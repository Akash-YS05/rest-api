"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient, tokenStore } from "@/lib/api-client";
import type { ApiFailure, AuthResult, Task, User } from "@/types/api";

type AuthMode = "login" | "register";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

const getErrorMessage = (result: unknown, fallback: string): string => {
  if (!result || typeof result !== "object") return fallback;
  const maybe = result as ApiFailure;
  return maybe?.error?.message || fallback;
};

export default function HomePage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("TODO");

  const canSubmitAuth = useMemo(() => {
    if (authMode === "register") {
      return Boolean(name.trim() && email.trim() && password.trim());
    }
    return Boolean(email.trim() && password.trim());
  }, [authMode, email, name, password]);

  const fetchMe = useCallback(async () => {
    const result = await apiClient.get<User | null>("/api/v1/auth/me");
    if (result.success && result.data) {
      setUser(result.data);
      return true;
    }
    setUser(null);
    return false;
  }, []);

  const fetchTasks = useCallback(async (filter: "ALL" | TaskStatus) => {
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    const result = await apiClient.get<Task[]>(`/api/v1/tasks${qs}`);
    if (result.success) {
      setTasks(result.data);
      return;
    }
    setMessage({ type: "error", text: getErrorMessage(result, "Failed to fetch tasks") });
  }, []);

  useEffect(() => {
    const init = async () => {
      const authenticated = await fetchMe();
      if (authenticated) await fetchTasks("ALL");
    };
    void init();
  }, [fetchMe, fetchTasks]);

  const onAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (authMode === "register") {
      const registerResult = await apiClient.post<User>("/api/v1/auth/register", {
        name,
        email,
        password,
      });

      if (!registerResult.success) {
        setMessage({ type: "error", text: getErrorMessage(registerResult, "Registration failed") });
        setLoading(false);
        return;
      }

      setMessage({ type: "success", text: "Registration successful. Login now." });
      setAuthMode("login");
      setPassword("");
      setLoading(false);
      return;
    }

    const loginResult = await apiClient.post<AuthResult>("/api/v1/auth/login", {
      email,
      password,
    });

    if (!loginResult.success) {
      setMessage({ type: "error", text: getErrorMessage(loginResult, "Login failed") });
      setLoading(false);
      return;
    }

    tokenStore.set(loginResult.data.accessToken);
    setUser(loginResult.data.user);
    setPassword("");
    setLoading(false);
    setMessage({ type: "success", text: "Session active" });
    await fetchTasks(taskFilter);
  };

  const onCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await apiClient.post<Task>("/api/v1/tasks", {
      title: taskTitle,
      description: taskDescription || undefined,
      status: taskStatus,
    });

    if (!result.success) {
      setMessage({ type: "error", text: getErrorMessage(result, "Task creation failed") });
      setLoading(false);
      return;
    }

    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("TODO");
    setLoading(false);
    setMessage({ type: "success", text: "Task created" });
    await fetchTasks(taskFilter);
  };

  const onUpdateTaskStatus = async (task: Task, status: TaskStatus) => {
    const result = await apiClient.put<Task>(`/api/v1/tasks/${task.id}`, {
      title: task.title,
      description: task.description ?? undefined,
      status,
    });

    if (!result.success) {
      setMessage({ type: "error", text: getErrorMessage(result, "Task update failed") });
      return;
    }

    setMessage({ type: "success", text: "Task updated" });
    await fetchTasks(taskFilter);
  };

  const onDeleteTask = async (taskId: string) => {
    const result = await apiClient.delete<{ message: string }>(`/api/v1/tasks/${taskId}`);
    if (!result.success) {
      setMessage({ type: "error", text: getErrorMessage(result, "Task delete failed") });
      return;
    }

    setMessage({ type: "success", text: "Task deleted" });
    await fetchTasks(taskFilter);
  };

  const onLogout = async () => {
    await apiClient.post<{ message: string }>("/api/v1/auth/logout", {});
    tokenStore.clear();
    setUser(null);
    setTasks([]);
    setMessage({ type: "success", text: "Logged out" });
  };

  return (
    <main className="arch-grid min-h-screen p-6 md:p-12 lg:p-15">
      {/* Structural Header */}
      <header className="mb-10 border-b-2 border-[#1A1C20] pb-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-6xl font-black font-semibold leading-[0.8] tracking-[-0.08em] uppercase">
              Blueprint<br/>Workspace
            </h1>
          </div>
          <div className="text-right">
            <p className="max-w-xs font-mono text-sm text-[#1A1C20] leading-tight uppercase font-medium">
              A structured environment for secure API development and testing. Clean. Minimal. Precise.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Navigation / Meta Info */}
        <nav className="lg:col-span-2 space-y-10">
          <div className="section-marker uppercase tracking-widest">Navigation</div>
          <ul className="space-y-6 font-bold text-sm uppercase tracking-tight">
            <li><Link href="/docs" className="hover:text-[#D25A46] transition-colors border-b-2 border-transparent hover:border-[#D25A46]">Swagger Reference</Link></li>
            <li><a href="/api/v1/health" target="_blank" className="hover:text-[#D25A46] transition-colors border-b-2 border-transparent hover:border-[#D25A46]">System Status</a></li>
            <li><a href="/api/v1/docs/postman" target="_blank" className="hover:text-[#D25A46] transition-colors border-b-2 border-transparent hover:border-[#D25A46]">Postman Export</a></li>
          </ul>
        </nav>

        {/* Authentication Pane */}
        <section className="lg:col-span-4 space-y-6">
          <div className="section-marker uppercase tracking-widest">Identity</div>
          <div className="arch-box arch-shadow p-8 md:p-10">
            <h2 className="text-2xl font-black font-semibold mb-8 tracking-tighter uppercase">{user ? "User Session" : "Access Control"}</h2>
            
            {user ? (
              <div className="space-y-8">
                <div className="border-l-8 border-[#D25A46] pl-6 py-2">
                  <p className="text-2xl font-black font-mono tracking-tighter uppercase">{user.name}</p>
                  <p className="text-sm opacity-60 font-bold">{user.email}</p>
                </div>
                <div className="bg-[#1A1C20] text-white p-5 text-xs font-mono font-bold uppercase tracking-widest">
                  Role: {user.role}
                </div>
                <div className="grid gap-4 pt-4">
                  <Link href="/dashboard" className="arch-button font-black">Dashboard</Link>
                  <button onClick={onLogout} className="arch-button arch-button-primary font-black">Sign Out</button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex gap-8 border-b-2 border-[#1A1C20] pb-4">
                  <button onClick={() => setAuthMode("login")} className={`text-sm font-black uppercase tracking-tighter ${authMode === "login" ? "text-[#D25A46]" : "opacity-30"}`}>Login</button>
                  <button onClick={() => setAuthMode("register")} className={`text-sm font-black uppercase tracking-tighter ${authMode === "register" ? "text-[#D25A46]" : "opacity-30"}`}>Register</button>
                </div>

                <form onSubmit={onAuthSubmit} className="space-y-6">
                  {authMode === "register" && (
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="arch-input font-bold" />
                  )}
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="arch-input font-bold" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="arch-input font-bold" />
                  <button disabled={!canSubmitAuth || loading} className="arch-button arch-button-primary w-full py-4 text-base font-black">
                    {loading ? "Processing" : authMode === "login" ? "Sign In" : "Register"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Task Management Pane */}
        <section className="lg:col-span-6 space-y-6">
          <div className="section-marker uppercase tracking-widest">Operations</div>
          <div className="arch-box arch-shadow p-8 md:p-10 min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <h2 className="text-3xl font-black font-semibold tracking-tighter uppercase">Tasks</h2>
              <select
                value={taskFilter}
                onChange={(e) => {
                  const val = e.target.value as "ALL" | TaskStatus;
                  setTaskFilter(val);
                  if (user) void fetchTasks(val);
                }}
                disabled={!user}
                className="bg-transparent border-b-2 border-[#1A1C20] text-sm font-black uppercase outline-none px-2 py-1 tracking-tighter"
              >
                <option value="ALL">All Tasks</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">Active</option>
                <option value="DONE">Completed</option>
              </select>
            </div>

            {user ? (
              <div className="space-y-12">
                <form onSubmit={onCreateTask} className="grid gap-6 p-6 bg-[#1A1C20]/5 border-2 border-[#1A1C20] mb-12">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task Title" className="arch-input font-bold" />
                    <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as TaskStatus)} className="arch-input font-bold uppercase text-xs">
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">Active</option>
                      <option value="DONE">Completed</option>
                    </select>
                  </div>
                  <input value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Task Description" className="arch-input font-bold" />
                  <button disabled={loading} className="arch-button arch-button-primary w-full py-3 font-black">Add Task</button>
                </form>

                <div className="space-y-0">
                  {tasks.map((task) => (
                    <div key={task.id} className="group border-t-2 border-[#1A1C20] py-8 flex flex-col md:flex-row justify-between gap-8 hover:bg-[#D25A46]/5 transition-colors px-6 -mx-6 md:-mx-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-xs font-mono text-[#D25A46] font-black uppercase">Task {task.id.slice(0, 4)}</span>
                          <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{task.title}</h3>
                        </div>
                        {task.description && <p className="text-sm font-bold opacity-70 max-w-xl leading-snug">{task.description}</p>}
                      </div>
                      <div className="flex items-center gap-8">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task, e.target.value as TaskStatus)}
                          className="bg-transparent text-xs font-black uppercase outline-none border-b-2 border-transparent hover:border-[#1A1C20] py-1"
                        >
                          <option value="TODO">Todo</option>
                          <option value="IN_PROGRESS">Active</option>
                          <option value="DONE">Completed</option>
                        </select>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="text-xs font-black uppercase text-[#D25A46] opacity-0 group-hover:opacity-100 transition-opacity border-b-2 border-transparent hover:border-[#D25A46]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="py-32 text-center font-mono text-sm opacity-30 uppercase tracking-[0.3em] font-bold">
                      No Tasks Found
                    </div>
                  )}
                  {tasks.length > 0 && <div className="border-t-2 border-[#1A1C20]"></div>}
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-[#1A1C20]/10">
                <p className="font-mono text-sm font-bold uppercase opacity-30 tracking-widest text-center px-10">Sign in to access operational data</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Notifications */}
      {message && (
        <div className={`fixed bottom-10 right-10 z-50 arch-box arch-shadow px-8 py-5 font-black text-sm uppercase tracking-widest ${
          message.type === 'success' ? 'bg-[#D25A46] text-white' : 'bg-black text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Footer Markers */}
      <footer className="mt-32 pt-10 border-t-2 border-[#1A1C20] flex justify-between font-mono text-[10px] uppercase opacity-40 font-bold tracking-widest">
        <span>Rest API Workspace</span>
        <span>© 2026 Arch Systems</span>
      </footer>
    </main>
  );
}
