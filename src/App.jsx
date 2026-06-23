import PublicApp from "./pages/PublicApp";
import AdminApp from "./pages/AdminApp";

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  return isAdminRoute ? <AdminApp /> : <PublicApp />;
}
