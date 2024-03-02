// components/Item.jsx
import React, { useState } from 'react';
import styles from './Item.module.scss'; 

const Item = ({ addToCart, item }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  return (
    <div>
      <h2>Collect Your NFT</h2>
      <img src={item.imageUrl} alt={item.name} className={styles.ItemImage} />
      <div className="quantity-selector">
        <button onClick={() => handleQuantityChange(-1)}>-</button>
        <span>{quantity}</span>
        <button onClick={() => handleQuantityChange(1)}>+</button>
      </div>
      <button className="addToCart" onClick={() => addToCart(item, quantity)}>Add to Cart</button>
    </div>
  );
};

export default Item;
