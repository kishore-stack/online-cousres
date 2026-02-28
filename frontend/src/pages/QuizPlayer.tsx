import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import axios from "axios";

/* ================= TYPES ================= */

type Question = {
  id: string;
  question: string;
  options: string[];
};

type IncorrectAnswer = {
  question: string;
  correct: string;
  yours?: string;
};

type QuizResult = {
  score: number;
  total: number;
  incorrect: IncorrectAnswer[];
};

/* ================= COMPONENT ================= */

export default function QuizPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");

  /* ================= LOAD QUIZ ================= */

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    const loadQuiz = async () => {
      try {
        const res = await api.get<Question[]>(`/quiz/${lessonId}`);
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [lessonId]);

  /* ================= SELECT ANSWER ================= */

  const selectAnswer = (qid: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [qid]: option,
    }));
  };

  /* ================= SUBMIT QUIZ ================= */

  const submitQuiz = async () => {
    if (!lessonId) return;

    if (questions.some(q => !answers[q.id])) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      const res = await api.post<QuizResult>("/quiz/submit", {
        lessonId,
        answers,
      });

      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          "Failed to submit quiz";

        setError(message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return <p className="p-10">Loading quiz...</p>;
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <p className="p-10 text-gray-400">
        No quiz for this lesson
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">

        <h1 className="text-2xl font-bold mb-6">Quiz</h1>

        {result ? (
          <div className="space-y-6">

            <h2 className="text-2xl font-bold text-green-600 text-center">
              Score: {result.score} / {result.total}
            </h2>

            {result.incorrect.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-red-600">
                  Incorrect Answers:
                </h3>

                {result.incorrect.map((q, i) => (
                  <div key={i} className="border p-4 mb-3 rounded">
                    <p className="font-semibold">{q.question}</p>
                    <p>Your answer: {q.yours || "Not answered"}</p>
                    <p className="text-green-600">
                      Correct: {q.correct}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        ) : (
          <>
            {questions.map(q => (
              <div key={q.id} className="mb-6">

                <p className="font-semibold mb-2">
                  {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => selectAnswer(q.id, opt)}
                      className={`block w-full text-left px-4 py-2 rounded border ${
                        answers[q.id] === opt
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

              </div>
            ))}

            <button
              onClick={submitQuiz}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Submit Quiz
            </button>
          </>
        )}

      </div>
    </div>
  );
}