import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";

const loadAbout = () => import("./pages/About.jsx");
const loadAdmin = () => import("./pages/Admin.jsx");
const loadAdminLogin = () => import("./pages/AdminLogin.jsx");
const loadFeed = () => import("./pages/Feed.jsx");
const loadHome = () => import("./pages/Home.jsx");
const loadMyReports = () => import("./pages/MyReports.jsx");
const loadNotifications = () => import("./pages/Notifications.jsx");
const loadPublicSite = () => import("./pages/PublicSite.jsx");
const loadReport = () => import("./pages/Report.jsx");

const About = lazy(loadAbout);
const Admin = lazy(loadAdmin);
const AdminLogin = lazy(loadAdminLogin);
const Feed = lazy(loadFeed);
const Home = lazy(loadHome);
const MyReports = lazy(loadMyReports);
const Notifications = lazy(loadNotifications);
const PublicSite = lazy(loadPublicSite);
const Report = lazy(loadReport);

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-primary" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const warmNavigation = () => {
      loadAbout();
    };
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1800));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const id = schedule(warmNavigation);

    return () => cancel(id);
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route path="/report" element={<Navigate to="/app/report" replace />} />
          <Route path="/feed" element={<Navigate to="/app/map" replace />} />
          <Route path="/profile" element={<Navigate to="/app/report" replace />} />
          <Route path="/my-reports" element={<Navigate to="/app/my-reports" replace />} />
          <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
          <Route path="/about" element={<Navigate to="/app/about" replace />} />
          <Route element={<Layout />}>
            <Route path="/app" element={<Feed />} />
            <Route path="/app/report" element={<Report />} />
            <Route path="/app/map" element={<Home />} />
            <Route path="/app/my-reports" element={<MyReports />} />
            <Route path="/app/notifications" element={<Notifications />} />
            <Route path="/app/profile" element={<Navigate to="/app/report" replace />} />
            <Route path="/app/about" element={<About />} />
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
