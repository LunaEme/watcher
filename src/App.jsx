import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Search from "./pages/Search";
import Browse from "./pages/Browse";
import Watch from "./pages/Watch";

/**
 * App root — topbar + content + footer.
 * Watch page hides topbar and footer for immersive viewing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/watch/:type/:id/:season?/:episode?" element={<Watch />} />
        <Route path="*" element={
          <>
            <TopBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/:type/:id" element={<Details />} />
              <Route path="/search" element={<Search />} />
              <Route path="/browse/:category" element={<Browse />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}
