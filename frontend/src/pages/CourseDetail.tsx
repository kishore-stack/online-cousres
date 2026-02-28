
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../AuthContext";
import CreateModuleModal from "../components/CreateModuleModal";
import CreateLessonModal from "../components/CreateLessonModal";
import CreateQuizModal from "../components/CreateQuizModal";

type Module = {
  id: string;
  title: string;
};

type Lesson = {
  id: string;
  title: string;
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [lessonModal, setLessonModal] = useState<string | null>(null);
  const [quizModal, setQuizModal] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  /* ================= LOAD MODULES ================= */

  const loadModules = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await api.get<{ data: Module[] }>(
        `/modules/course/${id}`
      );

      setModules(res.data.data);

    } catch (err) {
      console.error("Failed to load modules", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  /* ================= TOGGLE MODULE ================= */

  const toggleModule = async (moduleId: string) => {
    if (expanded === moduleId) {
      setExpanded(null);
      return;
    }

    if (!lessons[moduleId]) {
      try {
        const res = await api.get<{ data: Lesson[] }>(
          `/lessons/module/${moduleId}`
        );

        setLessons(prev => ({
          ...prev,
          [moduleId]: res.data.data,
        }));

      } catch (err) {
        console.error("Failed to load lessons", err);
      }
    }

    setExpanded(moduleId);
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Course Modules</h1>

          {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
            <button
              onClick={() => setShowModuleModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Module
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-gray-500">Loading modules...</p>
        )}

        {/* EMPTY */}
        {!loading && modules.length === 0 && (
          <p className="text-gray-400">No modules yet.</p>
        )}

        {/* MODULE LIST */}
        {modules.map(module => (
          <div key={module.id} className="border rounded-lg mb-4 overflow-hidden">

            {/* MODULE HEADER */}
         <div
  onClick={() => toggleModule(module.id)}
  className="flex justify-between items-center bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition"
>
  <span className="font-semibold">
    {module.title}
  </span>

  <div className="flex gap-2">

    {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
      <>
        {/* Add Lesson */}
        <button
          onClick={() => setLessonModal(module.id)}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded"
        >
          + Lesson
        </button>

        {/* Delete Module */}
        <button
          onClick={async () => {
            if (!confirm("Delete this module?")) return;

            try {
              await api.delete(`/modules/${module.id}`);
              loadModules();
            } catch (err) {
              console.error("Delete module failed", err);
            }
          }}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </>
    )}

  </div>

</div>

            {/* LESSONS */}
            {expanded === module.id && (
              <div className="p-4 space-y-3">

                {lessons[module.id]?.map(lesson => (
                  <div
                    key={lesson.id}
                    className="p-3 border rounded flex justify-between items-center"
                  >

                    <span>{lesson.title}</span>
<div className="flex gap-2">

  {/* Start Quiz */}
 {user?.role === "USER" && (
  <button
    onClick={() => navigate(`/quiz/${lesson.id}`)}
    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
  >
    Start Quiz
  </button>
)}

  {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
    <>
      {/* Add Quiz */}
      <button
        onClick={() => setQuizModal(lesson.id)}
        className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
      >
        + Quiz
      </button>

      {/* Delete Lesson */}
      <button
        onClick={async () => {
          if (!confirm("Delete this lesson?")) return;

          try {
            await api.delete(`/lessons/${lesson.id}`);

            setLessons(prev => ({
              ...prev,
              [module.id]: prev[module.id]?.filter(
                l => l.id !== lesson.id
              ) || []
            }));

          } catch (err) {
            console.error("Delete lesson failed", err);
          }
        }}
        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
      >
        Delete
      </button>
    </>
  )}

</div>

                  </div>
                ))}

              </div>
            )}
          </div>
        ))}

      </div>

      {/* CREATE MODULE */}
      {showModuleModal && id && (
        <CreateModuleModal
          courseId={id}
          onClose={() => setShowModuleModal(false)}
          onCreated={loadModules}
        />
      )}

      {/* CREATE LESSON */}
      {lessonModal && (
        <CreateLessonModal
          moduleId={lessonModal}
          onClose={() => setLessonModal(null)}
          onCreated={() => {
            setLessons(prev => {
              const copy = { ...prev };
              delete copy[lessonModal];
              return copy;
            });
            toggleModule(lessonModal);
          }}
        />
      )}

      {/* CREATE QUIZ */}
      {quizModal && (
        <CreateQuizModal
          lessonId={quizModal}
          onClose={() => setQuizModal(null)}
          onCreated={() => toggleModule(expanded!)}
        />
      )}

    </div>
  );
}