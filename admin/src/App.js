import './App.css';

import MainLayout from './components/Layout/MainLayout'
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <>
    <AuthProvider>
      <div className="App">
        <MainLayout />
      </div>
    </AuthProvider>
    </>
  );
}

export default App;
