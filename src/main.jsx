import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

import store from "./store/authStore.js";
import {ToastContainer} from "react-toastify";


createRoot(document.getElementById('root')).render(
  <StrictMode>

      <Provider store={store}>
          <BrowserRouter>
              <App />
              <ToastContainer/>
          </BrowserRouter>
      </Provider>
  </StrictMode>,
)
