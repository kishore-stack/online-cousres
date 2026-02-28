import { useEffect, useState } from "react";
import api from "../api/client";

type Attempt = {
  id: string;
  score: number;
  lesson: string;
  module: string;
  course: string;
  date: string;
};

export default function AttemptList() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Attempt[]>("/attempts/my");
        setAttempts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p>Loading attempts...</p>;

  if (!attempts.length)
    return <p className="text-gray-400">No quiz attempts yet.</p>;

  return (
    <div className="grid gap-4">

      {attempts.map(a => (
        <div
          key={a.id}
          className="p-4 rounded-xl border bg-white shadow"
        >

          <h3 className="font-bold text-lg text-indigo-700">
            {a.course}
          </h3>

          <p className="text-gray-600">
            Module: {a.module}
          </p>

          <p className="text-gray-600">
            Lesson: {a.lesson}
          </p>

          <div className="flex justify-between mt-3">

            <span className="font-semibold">
              Score: {a.score}
            </span>

            <span className="text-sm text-gray-400">
              {new Date(a.date).toLocaleDateString()}
            </span>

          </div>
        </div>
      ))}

    </div>
  );
}