import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Navbar";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Search from "./pages/Search";
import Browse from "./pages/Browse";

/**
 * App root — sidebar + topbar layout with main content area.
 * Sidebar fixed left, topbar at top of content, content scrolls.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:type/:id" element={<Details />} />
          <Route path="/search" element={<Search />} />
          <Route path="/browse/:category" element={<Browse />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
