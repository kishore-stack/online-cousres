import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

type Instructor = {
  id: string;
  name: string;
  email: string;
  courses: { id: string; title: string }[];
};

export default function InstructorList() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Instructor[]>("/users/instructors");
        setInstructors(res.data);
      } catch (err) {
        console.error("Failed to load instructors", err);
      }
    };

    load();
  }, []);

  if (!instructors.length)
    return <p className="text-gray-400">No instructors yet</p>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {instructors.map(i => (
        <div
          key={i.id}
          onClick={() => navigate(`/instructor/${i.id}`)}
          className="border p-4 rounded-lg hover:shadow cursor-pointer"
        >
          <h3 className="font-bold">{i.name}</h3>

          <p className="text-sm text-gray-500">{i.email}</p>

          <p className="text-sm mt-2 text-blue-600">
            {i.courses.length
              ? i.courses.map(c => c.title).join(", ")
              : "No course assigned"}
          </p>
        </div>
      ))}
    </div>
  );
}