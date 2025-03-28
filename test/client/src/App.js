import React, { useState, useEffect } from 'react';

function App() {
  // initalize empty array
  const [data, setData] = useState([]);  
  const [cartTotal, setCartTotal] = useState(0);  

  useEffect(() => {
    // fetcg data from the backend API
    fetch("/api/items")
      .then(res => res.json())
      .then(data => {
        setData(data);  
        console.log(data); 
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
  }, []);

  // func to add price to the cart total
  // add the price to the previous cart total
  const addToCart = (price) => {
    setCartTotal(prevTotal => prevTotal + price);  
  };

  return (
    <div>
      <h1>Items</h1>

            {/* Cart total */}
      <div>
        <h2>Cart Total: ${cartTotal.toFixed(2)}</h2>
      </div>

      {data.length > 0 ? (
        <div>
          {data.map(item => (
            <div key={item.item}>
              <button onClick={() => addToCart(item.price)}>
                Add {item.item} - ${item.price.toFixed(2)}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
