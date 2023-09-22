import logo from './logo.svg';
import './Assets/css/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './Components/Main';

function App() {
  return (
   <>
      <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Main/>}/>
      </Routes>
      </BrowserRouter>
   </>
  );
}

export default App;
