import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartMenu from './pages/StartMenu';
import GamePage from './pages/GamePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartMenu />} />
        <Route path="/play" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
