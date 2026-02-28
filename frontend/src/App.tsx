import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import QuizPlayer from "./pages/QuizPlayer";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Availability from "./pages/Availability";
import BookSession from "./pages/BookSession";
import AdminBookings from "./pages/AdminBookings";
import Instructors from "./pages/Instructors";
import InstructorProfile from "./pages/InstructorProfile";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* redirect root → dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:lessonId"
          element={
            <ProtectedRoute>
              <QuizPlayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/availability"
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <BookSession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route path="/instructors" element={<Instructors />} />
<Route path="/instructor/:id" element={<InstructorProfile />} />
      </Routes>
    </BrowserRouter>
  );
}