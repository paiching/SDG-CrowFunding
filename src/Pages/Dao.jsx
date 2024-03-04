import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useDAO } from '../hooks/useDAO';


const Dao = () => {
  const [price, setPrice] = useState('Loading...');
  const [totalSupply, setTotalSupply] = useState('Loading...');
  const [symbol, setSymbol] = useState('Loading...');
  const [name, setName] = useState('Loading...');
  const [eventName, seteventName] = useState('Loading...');
  const [contract, setContract] = useState(null);

  useEffect(() => {
   
    const fetchContractData = async () => {
      try {
        const fetchedName = await useDAO.getNname();
        setName(fetchedName);
        // 过滤出特定事件
      // Filter specific events directly with contractInstance
     //   const events = await contractInstance.queryFilter(contractInstance.filters[eventName](), fromBlock, toBlock);
      //   seteventName(JSON.stringify(events.map(event => event.args))); // Convert events to a string to display
        
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    };

    fetchContractData();
  }, []);

  return (
    <div>
      <h1>DAO</h1>
      <p>Name: {name}</p>
      
    </div>
  );
};

export default Dao;
