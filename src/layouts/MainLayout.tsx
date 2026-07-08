import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import "../styles/mainLayouts.css";

function MainLayout() {
  return (
    <div className="layout">
      <Navbar />

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;