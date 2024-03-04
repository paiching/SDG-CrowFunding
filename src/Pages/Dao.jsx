import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useDAO } from '../hooks/useDAO';


const Dao = () => {
  
  const [name, setName] = useState('Loading...');
  const [events, setEvents] = useState(null);
  const { contract, getAllEvents,getName, ProposeDao } = useDAO();

  useEffect(() => {
   
    const fetchContractData = async () => {
      try {
       // const fetchedName = await useDAO.getName();
       const fetchedEvents = await getAllEvents();
       // setName(fetchedName);
       setEvents(fetchedEvents);
       // console.log(events);
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


    const handleDaoPropose = async () => {
    // Update these values as needed for your propose call
      try{
        const result = await ProposeDao();
        console.log("propose OK"+result); // Log the result or handle as needed
      }catch(error){
        console.error("Error propose contract data:", error);
      }
    };

  return (
    <div>
      <h1>DAO</h1>
      <p>Name: {name}</p>
      <p>Events: {events}</p>
      <button onClick={handleDaoPropose}>
        提案
      </button>
    </div>
  );
};

export default Dao;
