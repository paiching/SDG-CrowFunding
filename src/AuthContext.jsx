// AuthContext.js
import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [smartAccount, setSmartAccount] = useState(null);
  const [CAaddress, setCAaddress] = useState(null);
  const [userAddress, setUserAddress] = useState(''); // Add this line
  const [signer, setSigner] = useState(null); 

  //這兩個參數由signin設置過來

  return (
    <AuthContext.Provider value={{ 
      userInfo, setUserInfo, 
      CAaddress, setCAaddress, 
      smartAccount, setSmartAccount, 
      signer, setSigner,
      userAddress, setUserAddress // Add this
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
