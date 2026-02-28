import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

type Instructor = {
  id: string;
  name: string;
  email: string;
};

export default function Instructors() {
  const [list, setList] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Instructor[]>("/instructors");
        setList(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading)
    return <p className="p-10 text-center">Loading instructors...</p>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Instructors</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {list.map(i => (
          <div
            key={i.id}
            onClick={() => navigate(`/instructor/${i.id}`)}
            className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{i.name}</h2>
            <p className="text-gray-500">{i.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}