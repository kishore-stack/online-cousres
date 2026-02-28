import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
};

export default function Availability() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* stable loader */
  const loadSlots = useCallback(async () => {
    try {
      const res = await api.get<Slot[]>("/availability/me");
      setSlots(res.data);
    } catch (err) {
      console.error("Failed loading slots", err);
    }
  }, []);

useEffect(() => {
  const loadSlots = async () => {
    try {
      const res = await api.get<Slot[]>("/availability/me");
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  loadSlots();
}, []);

  const createSlot = async () => {
    try {
      await api.post("/availability", { startTime, endTime });
      setStartTime("");
      setEndTime("");
      loadSlots();
    } catch (err) {
      console.error("Create slot failed", err);
    }
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Availability</h1>

      <div className="space-y-3 mb-6">
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={createSlot}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Create Slot
        </button>
      </div>

      <div className="space-y-3">
        {slots.map((s) => (
          <div key={s.id} className="border p-3 rounded">
            {new Date(s.startTime).toLocaleString()} →{" "}
            {new Date(s.endTime).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}