import React from 'react'
import DashboardHeader from '../pages/DashboardHeader'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div>
       <DashboardHeader/>
       <Outlet/>
    </div>
  )
}

export default Layout