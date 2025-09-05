import React from 'react'
import Login from './login/login';
import Dashboard from './Dashboard/Dashboard'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import  DisplaySedB  from './SedB/DisplaySedB';
import { Home } from './Home/Home';
import Quatationform from './quatationform/Quatationform';
import PaverBlock from './PaverBlock/PaverBlock';
import QuantityCalculatorModal from './QtyCalc/QuantityCalculatorModal';
import RccRoad from './RccRoad/RccRoad';
import MainBuilding from './MainBuilding/MainBuilding';
import ESRoom from './Electric_Store_Room/ESRoom';
import SecurityCabin from './SecurityCabin/SecurityCabin';
import ProtectedRoute from './ProtectedRoute';
import DisplayAllQuotations from './Quotations/DisplayAllQuotations';
import BillGenerator from './GenerateBill/BillGenerator';

const App = () => {
  const  myRouter = createBrowserRouter([
    {path:'/',element:<Login/>},
    {path:'/login',element:<Login/>},
    {path:'/dashboard',element:<ProtectedRoute><Dashboard/></ProtectedRoute>,
      children:[
         {path:'',element:<Home/>},
        {path:'/dashboard/home',element:<Home/>},
        {path:'/dashboard/createform',element:<Quatationform/>},
        {path:'/dashboard/bill',element:<BillGenerator/>},
        {path:'/dashboard/displayquotations',element:<DisplayAllQuotations/>},
        {path:'/dashboard/createform/sedB',element:<DisplaySedB/>},
        {path:'/dashboard/createform/PaverBlock',element:<PaverBlock/>},
        {path:'/dashboard/createform/qty-calculation',element:<QuantityCalculatorModal/>},
        {path:'/dashboard/createform/RCC-Road',element:<RccRoad/>},
        {path:'/dashboard/createform/Main-Building',element:<MainBuilding/>},
        {path:'/dashboard/createform/Electric-StoreRoom',element:<ESRoom/>},
        {path:'/dashboard/createform/SecurityCabin',element:<SecurityCabin/>},
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