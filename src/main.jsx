import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from "react-redux";
import {BrowserRouter, createBrowserRouter, RouterProvider} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

import store from "./store/authStore.js";
import {ToastContainer} from "react-toastify";
import {SignupPage} from "./pages/Signup.jsx";
import {Protected} from "./components/Protected.jsx";
import {ScanQrPage} from "./pages/ScanQr.jsx";
import {ChatPage} from "./pages/Chat.jsx";

import {HomePage} from "./pages/Home.jsx";
import {VehiclesPage} from "./pages/Vehicles.jsx";
import {MyChatsPage} from "./pages/MyChats.jsx";
import {ProfilePage} from "./pages/Profile.jsx";
import {VehicleStatusPage} from "./pages/VehicleStatus.jsx";


const router =  createBrowserRouter([
    {
        path:'/',
        element: <App/>,
        children:[
            {
                path:"/signup",
                element: (
                    <Protected authentication={false}  >
                        <SignupPage/>
                    </Protected>
                )


            },{
                path:"/scan/:qrId",
                element:(
                    <Protected authentication={false}  >

                        <ScanQrPage/>

                    </Protected>
                )

            },{
                path:"/guest/chat/:sessionId",
                element:(
                    <Protected authentication={false}  >

                        <ChatPage/>

                    </Protected>
                )



            },{

                path:"/",
                element:(
                    <Protected authentication={true}  >

                        <HomePage/>

                    </Protected>
                )

            },{

                path:"/vehicle",
                element:(
                    <Protected authentication={true}  >

                       <VehiclesPage/>

                    </Protected>
                )
            },{

                path:'/chats',
                element:(
                    <Protected authentication={true}  >

                        <MyChatsPage/>

                    </Protected>
                )



            },{

                path:'/chat/:sessionId',
                element:(
                    <Protected authentication={true}  >

                        <ChatPage/>

                    </Protected>
                )


            },{


                path:"/profile",
                element:(
                    <Protected authentication={true}  >

                       <ProfilePage/>

                    </Protected>
                )
            },
            {

                path:'/vehicleStatus/:vehicleId',
                element:(
                    <Protected authentication={true}  >

                        <VehicleStatusPage/>

                    </Protected>
                )
            }
        ]
    }

])


createRoot(document.getElementById('root')).render(
  <StrictMode>

      <Provider store={store}>
          <RouterProvider router={router}/>

          <ToastContainer/>
      </Provider>
  </StrictMode>,
)
