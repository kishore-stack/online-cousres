import { useState } from "react";
import api from "../api/api";

type Props = {
  lessonId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateQuizModal({ lessonId, onClose, onCreated }: Props) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    setOptions(prev => [...prev, ""]);
  };

  const updateOption = (value: string, index: number) => {
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!question || options.some(o => !o) || !answer)
      return alert("Fill all fields");

    try {
      setLoading(true);

      await api.post("/quiz", {
        question,
        options,
        answer,
        lessonId,
      });

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">

        <h2 className="text-xl font-bold">Create Quiz</h2>

        {/* Question */}
        <input
          placeholder="Question"
          className="w-full border p-2 rounded"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />

        {/* Options */}
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt}
                onChange={e => updateOption(e.target.value, i)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 border p-2 rounded"
              />

              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  X
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addOption}
            className="text-sm text-blue-600"
          >
            + Add Option
          </button>
        </div>

        {/* Answer */}
        <select
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Correct Answer</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt || `Option ${i + 1}`}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
}