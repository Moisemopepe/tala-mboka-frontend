import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";

const About = lazy(() => import("./pages/About.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const MyReports = lazy(() => import("./pages/MyReports.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Report = lazy(() => import("./pages/Report.jsx"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-primary" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Feed />} />
            <Route path="/report" element={<Report />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
