import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Cube from './Cube';
import Sphere from './Sphere';
import Tabs from './Tabs';

function App() {

  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Tabs />}>
                    <Route index element={<Cube />} />
                    <Route path="sphere" element={<Sphere />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
