import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  Header  from './Components/Header.tsx';
import  Footer  from './Components/Footer.tsx';
import SignIn from './Pages/SignIn'; // 調整路徑以匹配你的結構
import Home from './Pages/Home'; // 調整路徑以匹配你的結構
import Contracts from './Pages/Contracts.jsx';
import ProposalForm from './Components/ProposalForm.tsx'
import ProposalPage from './Pages/ProposalPage.tsx'
import ItemsPage from './Pages/ItemsPage.jsx';
import ProductList from './Pages/ProductList.tsx';
import { AuthProvider } from './AuthContext';
import Dao from './Pages/Dao.jsx';
import ContractsDao from './Pages/ContractsDao.jsx';

const App = ()=>{


  return (
    <AuthProvider>
      <Router>
      <Header />
      
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/contracts" element={<Contracts />} />
      <Route path="/propose" element={<ProposalForm />} />
      <Route path="/usedao" element={<Dao />} />
      <Route path="/items" element={<ItemsPage />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/dao" element={<ContractsDao />} />
     
        {/* <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} /> */}
      </Routes>
      <Footer />
    </Router>
        
    </AuthProvider>
    
  );

}

export default App;