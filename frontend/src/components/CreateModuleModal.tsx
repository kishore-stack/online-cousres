import { useState } from "react";
import api from "../api/api";

type Props = {
  courseId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateModuleModal({
  courseId,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title) return;

    try {
      setLoading(true);
      await api.post("/modules", {
        title,
        courseId,
      });

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">

        <h2 className="text-xl font-bold mb-4">Create Module</h2>

        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Module Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
}