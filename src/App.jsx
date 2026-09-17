import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Search from "./pages/Search";
import Browse from "./pages/Browse";
import Watch from "./pages/Watch";

/**
 * App root — no sidebar, just topbar + content.
 * Watch page hides the topbar for immersive viewing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Watch page — no topbar */}
        <Route path="/watch/:type/:id/:season?/:episode?" element={<Watch />} />

        {/* All other pages — topbar visible */}
        <Route path="*" element={
          <>
            <TopBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/:type/:id" element={<Details />} />
              <Route path="/search" element={<Search />} />
              <Route path="/browse/:category" element={<Browse />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}
