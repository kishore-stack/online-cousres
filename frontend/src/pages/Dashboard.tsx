import { useEffect, useState, useCallback } from "react";
import api from "../api/client";
import AttemptList from "../components/AttemptList";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import InstructorList from "../components/InstructorList";
import { useAuth } from "../AuthContext";
import CreateInstructorModal from "../components/CreateInstructorModal";


type Course = {
  id: string;
  title: string;
  description: string;
  enrolled: boolean;
};

type Stats = {
  enrolledCourses: number;
  attempts: number;
  avgScore: number;
  bookings: number;
};

export default function Dashboard() {
 
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
   const [showInstructorModal, setShowInstructorModal] = useState(false);
  const { user } = useAuth();

  const navigate = useNavigate();

  /* ================= LOAD DASHBOARD ================= */

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseRes, statsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/users/stats").catch(() => ({ data: null })) // prevents crash if stats route missing
      ]);

      /* ---- normalize courses response ---- */

      let courseData: Course[] = [];

      if (Array.isArray(courseRes.data)) {
        courseData = courseRes.data;
      } else if (courseRes.data?.data) {
        courseData = courseRes.data.data;
      }

      setCourses(courseData);

      /* ---- stats safe set ---- */

      if (statsRes?.data) {
        setStats(statsRes.data);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ================= ENROLL COURSE ================= */

  const enrollCourse = async (id: string) => {
    try {
      await api.post(`/courses/enroll/${id}`);
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Enrollment failed");
    }
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="p-10 text-gray-500 text-center">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-500 text-center font-semibold">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <button
            onClick={loadDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* ================= STATS ================= */}

        {stats && (
          <div className="grid md:grid-cols-4 gap-6">

            <StatCard
              title="Enrolled Courses"
              value={stats.enrolledCourses}
              color="blue"
            />

            <StatCard
              title="Quiz Attempts"
              value={stats.attempts}
              color="purple"
            />

            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              color="green"
            />

            <StatCard
              title="Sessions Booked"
              value={stats.bookings}
              color="orange"
            />

          </div>
        )}

        {/* ================= COURSES ================= */}

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Courses</h2>

          {courses.length === 0 ? (
            <p className="text-gray-400">No courses available</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">

              {courses.map(c => (
                <div
                  key={c.id}
                  onClick={() => c.enrolled && navigate(`/courses/${c.id}`)}
                  className={`border rounded-lg p-4 space-y-2 hover:shadow transition ${
                    c.enrolled
                      ? "cursor-pointer"
                      : "opacity-70 cursor-not-allowed"
                  }`}
                >
                  <h3 className="font-semibold">{c.title}</h3>

                  <p className="text-sm text-gray-500">
                    {c.description}
                  </p>

                  {c.enrolled ? (
                    <span className="text-green-600 font-semibold">
                      ✓ Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enrollCourse(c.id);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Enroll
                    </button>
                  )}

                </div>
              ))}

            </div>
          )}
        </div>

        {/* ================= INSTRUCTORS ================= */}

        <div className="bg-white p-6 rounded-xl shadow">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">
      Instructors
    </h2>

    {user?.role === "ADMIN" && (
      <button onClick={() => setShowInstructorModal(true)}>
  + Add Instructor
</button>
    )}
  </div>

  <InstructorList />
</div>
        {/* ================= PERFORMANCE ================= */}

        <div className="bg-white p-6 rounded-xl shadow">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Performance Summary
            </h2>

            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className="text-blue-600 font-semibold hover:underline"
            >
              {showPerformance ? "Hide" : "View"}
            </button>
          </div>

          {showPerformance && (
            <div className="transition-all duration-300">
              <AttemptList />
            </div>
          )}

        </div>

      </div>
      {showInstructorModal && (
  <CreateInstructorModal
    onClose={() => setShowInstructorModal(false)}
    onCreated={loadDashboard}
  />
)}
    </div>
  );
}