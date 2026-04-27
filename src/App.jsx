import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import About from "./pages/About.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
import Admin from "./pages/Admin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Feed from "./pages/Feed.jsx";
import Home from "./pages/Home.jsx";
import MyReports from "./pages/MyReports.jsx";
import Profile from "./pages/Profile.jsx";
import Report from "./pages/Report.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Feed />} />
          <Route
            path="/report"
            element={<Report />}
          />
          <Route path="/feed" element={<Home />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
