// components/ItemsPage.js
import React from 'react';
import Item from '../Components/Items';

const ItemsPage = ({ addToCart }) => {
  const items = [
    // Replace with your actual items
    { id: 1, name: 'NFT 1', imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.1.png' },
    { id: 2, name: 'NFT 2', imageUrl: '/path/to/image2.jpg' },
    { id: 3, name: 'NFT 3', imageUrl: '/path/to/image2.jpg' },
    { id: 4, name: 'NFT 4', imageUrl: '/path/to/image2.jpg' },
    // ... add all items
  ];

  return (
    <div>
      {items.map((item) => (
        <Item key={item.id} item={item} addToCart={addToCart} />
      ))}
    </div>
  );
};

export default ItemsPage;
