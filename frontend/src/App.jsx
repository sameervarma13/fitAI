import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import ChatWidget from './components/ChatWidget';
import Nutrition from './pages/Nutrition'
import Oura from './pages/Oura'





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/oura" element={<Oura />} />

      </Routes>
      <ChatWidget /> {/* This ensures it's visible across all pages */}
    </Router>
  );
}

export default App;