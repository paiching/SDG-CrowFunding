// components/CartPage.js
import React from 'react';

const CartPage = ({ cartItems }) => {
  return (
    <div>
      <h2>Your Cart</h2>
      {/* Render cart items */}
      {cartItems.map((item, index) => (
        <div key={index}>
          <h3>{item.name}</h3>
          <p>Quantity: {item.quantity}</p>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
