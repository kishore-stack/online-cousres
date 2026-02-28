import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
};

export default function InstructorProfile() {
  const { id } = useParams();
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/availability/${id}`);
      setSlots(res.data);
    };

    if (id) load();
  }, [id]);

  const book = async (slotId: string) => {
    await api.post("/booking", { availabilityId: slotId });
    alert("Session requested");
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Available Slots
      </h1>

      {slots.length === 0 && (
        <p className="text-gray-400">Instructor not available</p>
      )}

      {slots.map(s => (
        <div
          key={s.id}
          className="border p-4 rounded mb-3 flex justify-between"
        >
          <div>
            {new Date(s.startTime).toLocaleString()}
          </div>

          <button
            onClick={() => book(s.id)}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Book
          </button>
        </div>
      ))}
    </div>
  );
}