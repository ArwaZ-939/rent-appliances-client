import 'bootstrap-icons/font/bootstrap-icons.css';
import {BrowserRouter,Route,Routes} from 'react-router-dom';
import Home from './copmonents/pages/Home';
import Login from './copmonents/pages/Login';
import Register from './copmonents/pages/Register';
import Contact from './copmonents/pages/Contact';
import Admin from './copmonents/pages/Admin';
import Feedback from './copmonents/pages/Feedback';
import RentalBooking from './copmonents/pages/RentalBooking';
import Payment from './copmonents/pages/Payment';
import Delivery from "./copmonents/pages/Delivery"
import Help from './copmonents/pages/Help';
import Password from './copmonents/pages/Password.js';
import ResetPassword from './copmonents/pages/ResetPassword.js';
import Profiler from './copmonents/pages/Profile.js';
import Otp from './copmonents/pages/Otp.js';
import DeleteAppliances from './copmonents/pages/DeleteAppliances.js';
import CustomerControl from './copmonents/pages/CustomerControl.js';
import UpdateAppliances from './copmonents/pages/UpdateAppliances.js';
import { DarkModeContext, DarkModeProvider } from './copmonents/sections/DarkModeContext.js';
import { LanguageProvider } from './copmonents/sections/LanguageContext.js';
import './App.css';
import './copmonents/css/DarkMode.css';
import './copmonents/css/RTL.css';
import CustomerFeedback from './copmonents/pages/CustomerFeedback.js';
import SmartRecom from './copmonents/pages/SmartRecom.js';
import CustomerChat from './copmonents/pages/CustomerChat.js';





function App() {
  
  return (
    <div> 

  <LanguageProvider>
  <DarkModeProvider>
  <BrowserRouter>
  <Routes>
    <Route path='/'           element={<Login/>}/>
    <Route path='/login'           element={<Login/>}/>
    <Route path='/home'       element={<Home/>}/>
    <Route path='/register'   element={<Register/>}/>
    <Route path='/contact'    element={<Contact/>}/>
    <Route path='/feedback' element={<Feedback/>}/>
    <Route path='/admin'      element={<Admin/>}/>
    <Route path='/Rental'      element={<RentalBooking/>}/>
    <Route path='/payment' element={<Payment/>}/>
    <Route path='/delivery' element={<Delivery/>}/>
    <Route path='/help' element={<Help/>}/>
    <Route path='/verifyEmail' element={<Password/>}/>
    <Route path='/reset-password' element={<ResetPassword/>}/>
    <Route path='/profile' element={<Profiler/>}/>
    <Route path='/otp' element={<Otp/>}/>
    <Route path='/delete-appliances' element={<DeleteAppliances/>}/>
    <Route path='/update-appliances' element={<UpdateAppliances/>}/>
    <Route path='/customer-control' element={<CustomerControl/>}/>
    <Route path='/customer-feedback' element={<CustomerFeedback/>}/>
    <Route path='/smart-recom' element={<SmartRecom/>}/>
    <Route path='/customer-chat' element={<CustomerChat/>}/>
    





    
    


  </Routes>
  
  </BrowserRouter>
  </DarkModeProvider>
  </LanguageProvider>

  </div>
  );
}

export default App;
