import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  Header  from './Components/Header.tsx';
import FeatureSection from './Components/FeatureSection.tsx';
import SignIn from './Pages/SignIn'; // 調整路徑以匹配你的結構
import Home from './Pages/Home'; // 調整路徑以匹配你的結構
import Contracts from './Pages/Contracts.jsx';


const App = ()=>{

  return (
  
      <Router>
      <Header />
      
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/contracts" element={<Contracts />} />
        {/* <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} /> */}
      </Routes>
    </Router>
        
 
    
  );

}

export default App;