import { useEffect, useState, useCallback } from "react";
import api from "../api/client";

type Booking = {
  id: string;
  status: string;
  student: { name: string };
  availability: {
    startTime: string;
    instructor: { name: string };
  };
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  /* FIX → memoize load */
  const load = useCallback(async () => {
    try {
      const res = await api.get<Booking[]>("/booking");
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load bookings", err);
    }
  }, []);

  /* FIX → dependency added */
 useEffect(()=>{
  const load = async () => {}
  load()
},[])

  const approve = async (id: string) => {
    try {
      await api.patch(`/booking/${id}/approve`);
      load();
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Booking Requests</h1>

      {bookings.length === 0 && (
        <p className="text-gray-400">No bookings yet</p>
      )}

      {bookings.map((b) => (
        <div key={b.id} className="border p-4 rounded mb-3">
          <p>Student: {b.student.name}</p>
          <p>Instructor: {b.availability.instructor.name}</p>
          <p>
            Time: {new Date(b.availability.startTime).toLocaleString()}
          </p>
          <p>Status: {b.status}</p>

          {b.status === "REQUESTED" && (
            <button
              onClick={() => approve(b.id)}
              className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
            >
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  );
}