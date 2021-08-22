import React from 'react'
import { useAuthDispatch, logout, useAuthState } from '../../context';
import SideBar from '../Sidebar';
import { Hape } from '../icons'
import {

  useHistory
} from "react-router-dom";

const Layout = ({ children }) => {
	const dispatch = useAuthDispatch();
	const userDetails = useAuthState();
  let history = useHistory();
  
	const handleLogout = () => {
		logout(dispatch);
		history.push('/login');
	}
    return (<div>
      <div className="header-bar">
        <div class="flex">
            <div class="flex-none ">
            <div className="logo" ><Hape fill="#DB4140" width="70px" /></div>
            </div>
            <div class="flex-grow">

            </div>
            <div className="flex-none w-48 justify-end text-right">
                <span>Hi {userDetails.user ? userDetails.user.name.split(' ')[0] : ''}!</span>
                <button className="mx-5" onClick={handleLogout}>Logout</button>
            </div>
         </div>
      </div>
      <div className="app-container">
        <div class="flex">
            <div class="flex-none ">
              <SideBar />
            </div>
            <div class="flex-grow">
                <div className="px-5">
                
                {children}

                  </div>
            </div>

          </div>
      </div>
      <div className="mt-20 mb-5 text-center text-xs text-gray-600">Hape Administrator ©2018 Created by Havafy</div>
      </div>
    )
  
}


export default Layout