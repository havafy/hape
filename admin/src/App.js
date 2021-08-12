import './App.css';
import axios from 'axios'
import MainLayout from './components/Layout/MainLayout'
import { AuthProvider } from "./context/AuthContext";
axios.defaults.baseURL = process.env.API
axios.defaults.timeout = 30000 // 30 seconds
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
