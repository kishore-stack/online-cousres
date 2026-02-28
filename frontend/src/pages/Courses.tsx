import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../AuthContext";
import CreateCourseModal from "../components/CreateCourseModal";

type Course = {
  id: string;
  title: string;
  description: string;
};

export default function Courses() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD COURSES ================= */

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/courses?search=${search}&page=${page}`
        );

        // normalize backend response
        const courseData = Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? [];

        setCourses(courseData);

      } catch (err) {
        console.error("Failed to fetch courses", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [search, page]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Courses</h1>

          {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              + Create Course
            </button>
          )}
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search course..."
          className="w-full mb-6 p-3 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LOADING */}
        {loading && (
          <p className="text-center text-gray-500">Loading courses...</p>
        )}

        {/* EMPTY */}
        {!loading && courses.length === 0 && (
          <p className="text-center text-gray-400">No courses found</p>
        )}

        {/* LIST */}
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => window.location.href = `/courses/${c.id}`}
              className="bg-white shadow rounded-xl p-6 cursor-pointer hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{c.title}</h2>
              <p className="text-gray-600 mt-2">{c.description}</p>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Prev
          </button>

          <span className="font-bold">{page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Next
          </button>
        </div>

      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreated={() => setPage(1)} // reload courses
        />
      )}
    </div>
  );
}