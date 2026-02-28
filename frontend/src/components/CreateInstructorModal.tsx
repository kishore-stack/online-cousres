import { useEffect, useState } from "react";
import api from "../api/client";
import axios from "axios";

type Course = {
  id: string;
  title: string;
};

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateInstructorModal({ onClose, onCreated }: Props) {

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
  const loadCourses = async () => {
    try {
      const res = await api.get<Course[] | { data: Course[] }>("/courses");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data;

      setCourses(data);

    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

  loadCourses();
}, []);
  const submit = async () => {

    if (!name || !email || !password || !courseId) {
      alert("All fields required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/create-instructor", {
        name,
        email,
        password,
        courseId
      });

      onCreated();
      onClose();

    } catch (error: unknown) {

      let message = "Failed to create instructor";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white p-6 rounded-xl w-96 space-y-4">

        <h2 className="text-xl font-bold">Create Instructor</h2>

        <input
          placeholder="Name"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">Select Course</option>

          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}

        </select>

        <div className="flex justify-end gap-3">

          <button onClick={onClose}>
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>

        </div>

      </div>
    </div>
  );
}