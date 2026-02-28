import { useState } from "react";
import api from "../api/api";

type Props = {
  moduleId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateLessonModal({
  moduleId,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const createLesson = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

     await api.post("/lessons", {
  title,
  content: "Lesson content", // temporary placeholder
  moduleId,
});

      onCreated();
      onClose();
    } catch (err) {
      console.error("Lesson creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">

        <h2 className="text-xl font-bold mb-4">Create Lesson</h2>

        <input
          placeholder="Lesson title"
          className="w-full border p-3 rounded mb-4"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={createLesson}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <textarea
  placeholder="Lesson content"
  className="w-full border p-3 rounded mb-4"
  value={content}
  onChange={e => setContent(e.target.value)}
/>
        </div>

      </div>
    </div>
  );
}