import React from 'react'
import Login from './login/login';
import Dashboard from './Dashboard/Dashboard'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { DisplaySedB } from './SedB/DisplaySedB';
import { Home } from './Home/Home';

const App = () => {
  const  myRouter = createBrowserRouter([
    {path:'/',element:<Login/>},
    {path:'/login',element:<Login/>},
    {path:'/dashboard',element:<Dashboard/>,
      children:[
         {path:'',element:<Home/>},
        {path:'/dashboard/home',element:<Home/>},
        {path:'/dashboard/SedB',element:<DisplaySedB/>},
      ]
    }
  ])
  return (
   <div>
    <RouterProvider router={myRouter}/>
      <Toaster/>
    </div>
  )
}

export default App