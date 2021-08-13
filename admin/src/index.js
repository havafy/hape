import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import "antd/dist/antd.css";
import "./styles/vars.css";
import "./styles/global.css";
import "./styles/antd.css";
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios'
axios.defaults.baseURL = process.env.REACT_APP_API
axios.defaults.timeout = 30000 // 30 seconds

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
