import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import MatchPage from "@/pages/MatchPage";
import EditPage from "@/pages/EditPage";
import ComparePage from "@/pages/ComparePage";
import DeliveryPage from "@/pages/DeliveryPage";
import LibraryPage from "@/pages/LibraryPage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="match" element={<MatchPage />} />
          <Route path="edit" element={<EditPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
