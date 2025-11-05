"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

interface Course { _id: string; titleEn: string; titleAm: string; descriptionEn: string; descriptionAm: string; thumbnail?: string }
interface Module { _id: string; titleEn: string; titleAm: string; contentEn: string; contentAm: string; videoUrl?: string; order?: number }
interface Quiz { _id: string; questionEn: string; questionAm: string; optionsEn: string[]; optionsAm: string[]; correctAnswer: string }

export default function AdminPage() {
  const [tab, setTab] = useState<"dashboard" | "add" | "manage">("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  // Check authentication on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkAuth = async () => {
      if (!token) {
        toast.error("Please login to access admin panel");
        router.push("/login");
        return;
      }

      try {
        // Verify token is valid by checking user role
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          toast.error("Please login to access admin panel");
          router.push("/login");
          return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== "admin") {
          toast.error("Admin access required");
          router.push("/dashboard");
          return;
        }
      } catch {
        toast.error("Please login to access admin panel");
        router.push("/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [token, router]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch {}
  };

  useEffect(() => { if (!checkingAuth) fetchCourses(); }, [checkingAuth]);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-[#0b0b0b] to-[#161616] text-gray-100">
        <div className="text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-[#0b0b0b] to-[#161616] text-gray-100">
      <Toaster position="top-right" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 md:px-8 py-8 md:grid-cols-4">
        {/* Sidebar */}
        <aside className="md:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h2 className="mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-xl font-extrabold text-transparent">Admin</h2>
          <nav className="space-y-2">
            <button onClick={() => setTab("dashboard")} className={`w-full rounded-lg px-3 py-2 text-left transition ${tab === "dashboard" ? "bg-yellow-400 text-black" : "hover:bg-white/10"}`}>Dashboard</button>
            <button onClick={() => setTab("add")} className={`w-full rounded-lg px-3 py-2 text-left transition ${tab === "add" ? "bg-yellow-400 text-black" : "hover:bg-white/10"}`}>Add Course</button>
            <button onClick={() => setTab("manage")} className={`w-full rounded-lg px-3 py-2 text-left transition ${tab === "manage" ? "bg-yellow-400 text-black" : "hover:bg-white/10"}`}>Manage Courses</button>
          </nav>
        </aside>

        {/* Content */}
        <main className="md:col-span-3 space-y-6">
          {tab === "dashboard" && <Dashboard courses={courses} />}
          {tab === "add" && <AddCourse onCreated={() => (toast.success("Course created"), fetchCourses(), setTab("manage"))} token={token} />}
          {tab === "manage" && <ManageCourses courses={courses} refresh={fetchCourses} token={token} />}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ courses }: { courses: Course[] }) {
  const [stats, setStats] = useState<any>(null);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
          setTopCourses(data.topCourses || []);
          setRecentUsers(data.recentUsers || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-center text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-center text-red-400">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Total Users</div>
          <div className="text-2xl font-bold text-yellow-300">{stats.totalUsers}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-400/10 to-blue-600/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Total Courses</div>
          <div className="text-2xl font-bold text-blue-300">{stats.totalCourses}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-400/10 to-green-600/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Enrollments</div>
          <div className="text-2xl font-bold text-green-300">{stats.totalEnrollments}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-400/10 to-purple-600/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Total Points</div>
          <div className="text-2xl font-bold text-purple-300">{stats.totalPoints.toLocaleString()}</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Admins</div>
          <div className="text-xl font-bold text-gray-200">{stats.totalAdmins}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Modules</div>
          <div className="text-xl font-bold text-gray-200">{stats.totalModules}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Quizzes</div>
          <div className="text-xl font-bold text-gray-200">{stats.totalQuizzes}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="text-gray-400 text-sm mb-1">Completed</div>
          <div className="text-xl font-bold text-green-300">{stats.completedCourses}</div>
        </div>
      </div>

      {/* Top Courses & Recent Users */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Enrolled Courses */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-lg font-semibold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Top Enrolled Courses
          </h3>
          {topCourses.length === 0 ? (
            <div className="text-gray-400 text-sm">No enrollments yet</div>
          ) : (
            <div className="space-y-3">
              {topCourses.slice(0, 5).map((course, idx) => (
                <div key={course.courseId} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300 text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-200 text-sm">{course.courseTitleEn}</div>
                      <div className="text-gray-400 text-xs">{course.enrollments} enrollments</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-lg font-semibold bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
            Recent Users
          </h3>
          {recentUsers.length === 0 ? (
            <div className="text-gray-400 text-sm">No users yet</div>
          ) : (
            <div className="space-y-3">
              {recentUsers.slice(0, 5).map((user, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <div>
                    <div className="font-medium text-gray-200 text-sm">{user.name}</div>
                    <div className="text-gray-400 text-xs">{user.email}</div>
                  </div>
                  <div className="rounded bg-yellow-400/15 px-2 py-1 text-xs font-semibold text-yellow-300">
                    {user.role}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddCourse({ onCreated, token }: { onCreated: () => void; token: string | null }) {
  const [titleEn, setTitleEn] = useState("");
  const [titleAm, setTitleAm] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAm, setDescriptionAm] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [thumbPid, setThumbPid] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ titleEn, titleAm, descriptionEn, descriptionAm, thumbnailUrl, thumbnailPublicId: thumbPid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      onCreated();
      setTitleEn(""); setTitleAm(""); setDescriptionEn(""); setDescriptionAm(""); setThumbnailUrl(""); setThumbPid(""); setPreview("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <h3 className="text-xl font-semibold">Add Course</h3>
      <div>
        <label htmlFor="course-title-en" className="mb-1 block">Title (English)</label>
        <input id="course-title-en" aria-label="Course title in English" placeholder="Course title in English" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="course-title-am" className="mb-1 block">Title (Amharic)</label>
        <input id="course-title-am" aria-label="Course title in Amharic" placeholder="ኮርስ ርእስ (አማርኛ)" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={titleAm} onChange={e => setTitleAm(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="course-desc-en" className="mb-1 block">Description (English)</label>
        <textarea id="course-desc-en" aria-label="Course description in English" placeholder="Course description in English" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 whitespace-pre-wrap" rows={4} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="course-desc-am" className="mb-1 block">Description (Amharic)</label>
        <textarea id="course-desc-am" aria-label="Course description in Amharic" placeholder="ኮርስ መግለጫ (አማርኛ)" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 whitespace-pre-wrap" rows={4} value={descriptionAm} onChange={e => setDescriptionAm(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label className="mb-1 block">Thumbnail</label>
        <div className="flex items-center gap-3">
          <input
            aria-label="Course thumbnail image file"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Upload failed");
                setThumbnailUrl(data.url);
                setThumbPid(data.publicId || "");
                setPreview(data.url);
              } catch (err: any) {
                toast.error(err.message || "Upload failed");
              } finally {
                setUploading(false);
              }
            }}
            className="rounded border border-white/15 bg-white/5 px-3 py-2"
          />
          {uploading && <span className="text-sm text-gray-300">Uploading...</span>}
        </div>
        <input id="course-thumb" aria-label="Course thumbnail URL" placeholder="or paste image URL..." className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
        {preview || thumbnailUrl ? (
          <div className="mt-2 flex items-center gap-2">
            <img src={preview || thumbnailUrl} alt="thumbnail preview" className="h-24 w-24 rounded-lg object-cover ring-1 ring-white/10" />
            {thumbPid && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: thumbPid }) });
                    if (!res.ok) throw new Error("Delete failed");
                    setPreview(""); setThumbnailUrl(""); setThumbPid("");
                    toast.success("Thumbnail removed");
                  } catch (e: any) {
                    toast.error(e.message || "Delete failed");
                  }
                }}
                className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300"
              >
                Delete
              </button>
            )}
          </div>
        ) : null}
      </div>
      <button className="rounded-full bg-yellow-400 px-5 py-2 font-semibold text-black">Create</button>
    </form>
  );
}

function ManageCourses({ courses, refresh, token }: { courses: Course[]; refresh: () => void; token: string | null }) {
  const delCourse = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/courses?courseId=${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Course deleted");
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      {courses.length === 0 && <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300">No courses yet.</div>}
      {courses.map(c => (
        <CourseItem key={c._id} course={c} onDeleted={() => delCourse(c._id)} token={token} />
      ))}
    </div>
  );
}

function CourseItem({ course, onDeleted, token }: { course: Course; onDeleted: () => void; token: string | null }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const loadModules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/modules?courseId=${course._id}`);
      const data = await res.json();
      if (res.ok) setModules((data.modules || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
    } finally { setLoading(false); }
  };

  useEffect(() => { if (open) loadModules(); }, [open]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">{course.titleEn} / {course.titleAm}</h4>
          <p className="text-gray-300">{course.descriptionEn} / {course.descriptionAm}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDeleted} className="rounded border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-300">Delete</button>
          <button onClick={() => setOpen(v => !v)} className="rounded border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-yellow-300">{open ? "Hide" : "Manage Modules"}</button>
        </div>
      </div>
      {open && (
        <div className="mt-4 space-y-4">
          <AddModuleForm courseId={course._id} onAdded={loadModules} token={token} />
          {loading ? (
            <div className="text-gray-400">Loading modules...</div>
          ) : (
            <div className="space-y-3">
              {modules.length === 0 && <div className="text-gray-400">No modules yet.</div>}
              {modules.map((m, idx) => (
                <div
                  key={m._id}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async () => {
                    if (dragIndex === null || dragIndex === idx) return;
                    const newList = [...modules];
                    const [moved] = newList.splice(dragIndex, 1);
                    newList.splice(idx, 0, moved);
                    // reindex order starting at 0
                    const reindexed = newList.map((mm, i) => ({ ...mm, order: i }));
                    setModules(reindexed);
                    setDragIndex(null);
                    // persist order sequentially
                    try {
                      await Promise.all(
                        reindexed.map(mm =>
                          fetch(`/api/admin/courses/modules?moduleId=${mm._id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                            body: JSON.stringify({ order: (mm as any).order }),
                          })
                        )
                      );
                      toast.success("Order updated");
                    } catch {
                      toast.error("Failed to save order");
                    }
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 p-1">
                  <div className="flex items-center gap-2">
                    <div className="cursor-grab select-none rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300">⇅</div>
                    <div className="flex-1">
                      <ModuleItem module={m} token={token} reload={loadModules} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddModuleForm({ courseId, onAdded, token }: { courseId: string; onAdded: () => void; token: string | null }) {
  const [titleEn, setTitleEn] = useState("");
  const [titleAm, setTitleAm] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentAm, setContentAm] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [thumbPid, setThumbPid] = useState("");
  const [uploading, setUploading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/courses/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ titleEn, titleAm, contentEn, contentAm, videoUrl, courseId, thumbnailUrl: thumbUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add module");
      toast.success("Module added");
      setTitleEn(""); setTitleAm(""); setContentEn(""); setContentAm(""); setVideoUrl(""); setThumbUrl(""); setThumbPid("");
      onAdded();
    } catch (e: any) {
      toast.error(e.message || "Failed to add module");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h5 className="font-semibold">Add Module</h5>
      <div>
        <label className="mb-1 block text-sm text-gray-300">Title (English)</label>
        <input className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="Module title in English" value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-300">Title (Amharic)</label>
        <input className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="ሞጁል ርእስ (አማርኛ)" value={titleAm} onChange={e => setTitleAm(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-300">Text Lesson (English)</label>
        <textarea className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 whitespace-pre-wrap" rows={6} placeholder="Write the lesson text here in English..." value={contentEn} onChange={e => setContentEn(e.target.value)} required />
        <p className="mt-1 text-xs text-gray-400">Add your lesson content here. You can include explanations, examples, and notes.</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = async () => {
                const file = (input.files && input.files[0]) || null;
                if (!file) return;
                setUploading(true);
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || "Upload failed");
                  setContentEn(prev => `${prev}\n\n![Image](${data.url})\n\n`);
                  toast.success("Image uploaded");
                } catch (e: any) {
                  toast.error(e.message || "Upload failed");
                } finally {
                  setUploading(false);
                }
              };
              input.click();
            }}
            className="rounded border border-white/15 bg-white/5 px-3 py-1 text-sm text-gray-200 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
          >
            Upload image to content
          </button>
          {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-300">Text Lesson (Amharic)</label>
        <textarea className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 whitespace-pre-wrap" rows={6} placeholder="የትምህርት ጽሑፍ እዚህ በአማርኛ ይጻፉ..." value={contentAm} onChange={e => setContentAm(e.target.value)} required />
        <p className="mt-1 text-xs text-gray-400">Add your lesson content here in Amharic. You can include explanations, examples, and notes.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-300">YouTube Video URL (optional)</label>
        <input className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="mb-1 block text-sm text-gray-300">Module Thumbnail (optional)</label>
        <div className="flex items-center gap-2">
          <input
            aria-label="Module thumbnail image file"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Upload failed");
                setThumbUrl(data.url);
                setThumbPid(data.publicId || "");
              } catch (e: any) {
                toast.error(e.message || "Upload failed");
              } finally {
                setUploading(false);
              }
            }}
            className="rounded border border-white/15 bg-white/5 px-3 py-2"
          />
          {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
          {thumbUrl && (
            <>
              <img src={thumbUrl} alt="thumb" className="h-12 w-12 rounded object-cover ring-1 ring-white/10" />
              {thumbPid && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: thumbPid }) });
                      if (!res.ok) throw new Error("Delete failed");
                      setThumbUrl(""); setThumbPid("");
                      toast.success("Thumbnail removed");
                    } catch (e: any) {
                      toast.error(e.message || "Delete failed");
                    }
                  }}
                  className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <button className="rounded-full bg-yellow-400 px-4 py-1 text-black">Add Module</button>
    </form>
  );
}

function ModuleItem({ module, token, reload }: { module: Module; token: string | null; reload: () => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleEn, setTitleEn] = useState(module.titleEn);
  const [titleAm, setTitleAm] = useState(module.titleAm);
  const [contentEn, setContentEn] = useState(module.contentEn);
  const [contentAm, setContentAm] = useState(module.contentAm);
  const [videoUrl, setVideoUrl] = useState(module.videoUrl || "");
  const [thumbUrl, setThumbUrl] = useState<string>("");
  const [thumbPid, setThumbPid] = useState<string>("");

  const loadQuizzes = async () => {
    try {
      const res = await fetch(`/api/modules/quizzes?moduleId=${module._id}`);
      const data = await res.json();
      if (res.ok) setQuizzes(data.quizzes || []);
    } catch {}
  };
  useEffect(() => { if (show) loadQuizzes(); }, [show]);

  const saveModule = async () => {
    try {
      const res = await fetch(`/api/admin/courses/modules?moduleId=${module._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ titleEn, titleAm, contentEn, contentAm, videoUrl, thumbnailUrl: thumbUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Update failed");
      toast.success("Module updated");
      setEditing(false);
      reload();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const deleteModule = async () => {
    try {
      const res = await fetch(`/api/admin/courses/modules?moduleId=${module._id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Module deleted");
      reload();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <label className="mb-1 block text-sm text-gray-300">Title (English)</label>
              <input aria-label="Module title in English" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={titleEn} onChange={e => setTitleEn(e.target.value)} />
              <label className="mb-1 block text-sm text-gray-300">Title (Amharic)</label>
              <input aria-label="Module title in Amharic" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={titleAm} onChange={e => setTitleAm(e.target.value)} />
              <label className="mb-1 mt-2 block text-sm text-gray-300">Content (English)</label>
              <textarea aria-label="Module content in English" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 whitespace-pre-wrap" rows={3} value={contentEn} onChange={e => setContentEn(e.target.value)} />
              <label className="mb-1 block text-sm text-gray-300">Content (Amharic)</label>
              <textarea aria-label="Module content in Amharic" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 whitespace-pre-wrap" rows={3} value={contentAm} onChange={e => setContentAm(e.target.value)} />
              <label className="mb-1 mt-2 block text-sm text-gray-300">YouTube URL</label>
              <input aria-label="Module video URL" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="YouTube URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
              <div className="mt-2 space-y-2">
                <label className="mb-1 block text-sm text-gray-300">Thumbnail (optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Upload module thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || "Upload failed");
                        setThumbUrl(data.url);
                        setThumbPid(data.publicId || "");
                      } catch (e: any) {
                        toast.error(e.message || "Upload failed");
                      }
                    }}
                    className="rounded border border-white/15 bg-white/5 px-3 py-2"
                  />
                  {thumbUrl && <img src={thumbUrl} alt="thumb" className="h-10 w-10 rounded object-cover ring-1 ring-white/10" />}
                  {thumbPid && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: thumbPid }) });
                          if (!res.ok) throw new Error("Delete failed");
                          setThumbUrl(""); setThumbPid("");
                          toast.success("Thumbnail removed");
                        } catch (e: any) {
                          toast.error(e.message || "Delete failed");
                        }
                      }}
                      className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async () => {
                      const file = (input.files && input.files[0]) || null;
                      if (!file) return;
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || "Upload failed");
                        setContentEn(prev => `${prev}\n\n![Image](${data.url})\n\n`);
                        toast.success("Image uploaded to content");
                      } catch (e: any) {
                        toast.error(e.message || "Upload failed");
                      }
                    };
                    input.click();
                  }}
                  className="rounded border border-white/15 bg-white/5 px-3 py-1 text-xs text-gray-200 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                >
                  Upload image to content
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="font-semibold truncate">{module.titleEn} / {module.titleAm}</div>
              {module.videoUrl && <div className="text-xs text-gray-400 truncate">Video: {module.videoUrl}</div>}
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {editing ? (
            <>
              <button onClick={saveModule} className="rounded border border-green-500/40 bg-green-500/10 px-3 py-1 text-green-300">Save</button>
              <button onClick={() => (setEditing(false), setTitleEn(module.titleEn), setTitleAm(module.titleAm), setContentEn(module.contentEn), setContentAm(module.contentAm), setVideoUrl(module.videoUrl || ""))} className="rounded border border-gray-500/40 bg-gray-500/10 px-3 py-1 text-gray-300">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="rounded border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-yellow-300">Edit</button>
              <button onClick={deleteModule} className="rounded border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-300">Delete</button>
              <button onClick={() => setShow(v => !v)} className="rounded border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-yellow-300">{show ? "Hide" : "Manage Quizzes"}</button>
            </>
          )}
        </div>
      </div>
      {show && (
        <div className="mt-3 space-y-3">
          <AddQuizForm moduleId={module._id} token={token} onAdded={loadQuizzes} />
          {quizzes.length === 0 && <div className="text-gray-400">No quizzes yet.</div>}
          {quizzes.map(q => (
            <QuizItem key={q._id} quiz={q} token={token} reload={loadQuizzes} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuizItem({ quiz, token, reload }: { quiz: Quiz; token: string | null; reload: () => void }) {
  const [editing, setEditing] = useState(false);
  const [questionEn, setQuestionEn] = useState(quiz.questionEn);
  const [questionAm, setQuestionAm] = useState(quiz.questionAm);
  const [optionsEn, setOptionsEn] = useState<string[]>(quiz.optionsEn);
  const [optionsAm, setOptionsAm] = useState<string[]>(quiz.optionsAm);
  const [correctAnswer, setCorrectAnswer] = useState(quiz.correctAnswer);

  const updateOptionEn = (i: number, val: string) => setOptionsEn(prev => prev.map((o, idx) => (idx === i ? val : o)));
  const updateOptionAm = (i: number, val: string) => setOptionsAm(prev => prev.map((o, idx) => (idx === i ? val : o)));

  const save = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes?quizId=${quiz._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ questionEn, questionAm, optionsEn, optionsAm, correctAnswer }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Update failed");
      toast.success("Quiz updated");
      setEditing(false);
      reload();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const del = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes?quizId=${quiz._id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Quiz deleted");
      reload();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="rounded border border-white/10 bg-white/5 p-3">
      {editing ? (
        <div className="space-y-2">
          <label className="mb-1 block text-sm text-gray-300">Question (English)</label>
          <input aria-label="Quiz question in English" placeholder="Question in English" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={questionEn} onChange={e => setQuestionEn(e.target.value)} />
          <label className="mb-1 block text-sm text-gray-300">Question (Amharic)</label>
          <input aria-label="Quiz question in Amharic" placeholder="ጥያቄ (አማርኛ)" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={questionAm} onChange={e => setQuestionAm(e.target.value)} />
          <label className="mb-1 block text-sm text-gray-300">Options (English)</label>
          {optionsEn.map((o, i) => (
            <input key={i} aria-label={`Option ${i + 1} in English`} placeholder={`Option ${i + 1} in English`} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={o} onChange={e => updateOptionEn(i, e.target.value)} />
          ))}
          <label className="mb-1 block text-sm text-gray-300">Options (Amharic)</label>
          {optionsAm.map((o, i) => (
            <input key={`am-${i}`} aria-label={`Option ${i + 1} in Amharic`} placeholder={`አማራጭ ${i + 1} (አማርኛ)`} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" value={o} onChange={e => updateOptionAm(i, e.target.value)} />
          ))}
          <input aria-label="Correct answer" className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="Correct answer" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={save} className="rounded border border-green-500/40 bg-green-500/10 px-3 py-1 text-green-300">Save</button>
            <button onClick={() => (setEditing(false), setQuestionEn(quiz.questionEn), setQuestionAm(quiz.questionAm), setOptionsEn(quiz.optionsEn), setOptionsAm(quiz.optionsAm), setCorrectAnswer(quiz.correctAnswer))} className="rounded border border-gray-500/40 bg-gray-500/10 px-3 py-1 text-gray-300">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="font-medium">{quiz.questionEn} / {quiz.questionAm}</div>
          <div className="mt-1 text-sm text-gray-300">Options (EN): {quiz.optionsEn.join(", ")}</div>
          <div className="mt-1 text-sm text-gray-300">Options (AM): {quiz.optionsAm.join(", ")}</div>
          <div className="text-sm text-green-300">Answer: {quiz.correctAnswer}</div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => setEditing(true)} className="rounded border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-yellow-300">Edit</button>
            <button onClick={del} className="rounded border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-300">Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
function AddQuizForm({ moduleId, token, onAdded }: { moduleId: string; token: string | null; onAdded: () => void }) {
  const [questionEn, setQuestionEn] = useState("");
  const [questionAm, setQuestionAm] = useState("");
  const [optionsEn, setOptionsEn] = useState<string[]>(["", "", "", ""]);
  const [optionsAm, setOptionsAm] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const updateOptionEn = (i: number, val: string) => setOptionsEn(prev => prev.map((o, idx) => (idx === i ? val : o)));
  const updateOptionAm = (i: number, val: string) => setOptionsAm(prev => prev.map((o, idx) => (idx === i ? val : o)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanOptionsEn = optionsEn.map(o => o.trim()).filter(Boolean);
      const cleanOptionsAm = optionsAm.map(o => o.trim()).filter(Boolean);
      if (cleanOptionsEn.length < 2 || cleanOptionsAm.length < 2) throw new Error("At least two options in both languages");
      if (!cleanOptionsEn.includes(correctAnswer) && !cleanOptionsAm.includes(correctAnswer)) throw new Error("Correct answer must be one of the options");
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ moduleId, questionEn, questionAm, optionsEn: cleanOptionsEn, optionsAm: cleanOptionsAm, correctAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add quiz");
      toast.success("Quiz added");
      setQuestionEn(""); setQuestionAm(""); setOptionsEn(["", "", "", ""]); setOptionsAm(["", "", "", ""]); setCorrectAnswer("");
      onAdded();
    } catch (e: any) {
      toast.error(e.message || "Failed to add quiz");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="font-semibold">Add Quiz</div>
      <label className="mb-1 block text-sm text-gray-300">Question (English)</label>
      <input className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="Question in English" value={questionEn} onChange={e => setQuestionEn(e.target.value)} required />
      <label className="mb-1 block text-sm text-gray-300">Question (Amharic)</label>
      <input className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="ጥያቄ (አማርኛ)" value={questionAm} onChange={e => setQuestionAm(e.target.value)} required />
      <label className="mb-1 block text-sm text-gray-300">Options (English)</label>
      {optionsEn.map((o, i) => (
        <input key={i} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder={`Option ${i + 1} in English`} value={o} onChange={e => updateOptionEn(i, e.target.value)} />
      ))}
      <label className="mb-1 block text-sm text-gray-300">Options (Amharic)</label>
      {optionsAm.map((o, i) => (
        <input key={`am-${i}`} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder={`አማራጭ ${i + 1} (አማርኛ)`} value={o} onChange={e => updateOptionAm(i, e.target.value)} />
      ))}
      <input className="w-full rounded border border-white/15 bg-white/5 px-3 py-2" placeholder="Correct answer (must match an option)" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
      <button className="rounded-full bg-yellow-400 px-4 py-1 text-black">Add Quiz</button>
    </form>
  );
}
