import React, { useState, useEffect } from 'react';
import './App.css';  

function App() {
  // initialize all of the states needed
  const [data, setData] = useState([]);  
  const [cartTotal, setCartTotal] = useState(0);  
  const [cartItems, setCartItems] = useState([]);  
  const [loggedIn, setLoggedIn] = useState(false);  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupMode, setSignupMode] = useState(false); 

  // fetch items from API backend
  useEffect(() => {
    fetch("/api/items")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching items:', error));
  }, []);

  // add  item to cart and update total
  const addToCart = (item) => {
    setCartTotal(prevTotal => prevTotal + item.price);
    setCartItems(prevItems => [...prevItems, item]);
  };

  // handle when the user logs in 
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setLoggedIn(true);
        setLoginError('');
        console.log("Login success:", data);
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (err) {
      setLoginError("Error connecting to server");
    }
  };

  // handle when the user signs up 
  const handleSignup = async () => {
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created! You can now log in.");
        setSignupMode(false);
        setUsername('');
        setPassword('');
        setEmail('');
        setLoginError('');
      } else {
        setLoginError(data.error || "Signup failed");
      }
    } catch (err) {
      setLoginError("Error connecting to server");
    }
  };

// display 
  return (
    <div className="background">
      <div className="container">
        {/* Authentication */}
        {!loggedIn ? (
          <div style={{ padding: '10px' }}>
            <h3>{signupMode ? "Sign Up" : "Login"}</h3>
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {signupMode && (
              <input 
                type="email" 
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signupMode ? handleSignup : handleLogin}>
              {signupMode ? "Create Account" : "Login"}
            </button>
            {loginError && <p style={{ color: "red" }}>{loginError}</p>}
            <p>
              {signupMode ? "Already have an account?" : "Don't have an account?"}
              <button onClick={() => setSignupMode(prev => !prev)} style={{ marginLeft: "5px" }}>
                {signupMode ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        ) : (
          <div style={{ padding: '10px', textAlign: 'right' }}>
            <button onClick={() => setLoggedIn(false)}>Logout</button>
          </div>
        )}

        {/* Cart */}
        <div className="cart">
          <h2>🛒 Cart Total: ${cartTotal.toFixed(2)}</h2>
          {cartItems.length > 0 && (
            <ul>
              {cartItems.map((item, index) => (
                <li key={index}>{item.item} - ${item.price.toFixed(2)}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Items */}
        <h1 className="header">Available Items</h1>

        {data.length > 0 ? (
          <div className="grid">
            {data.map(item => (
              <div key={item.item} className="itemBox">
                <div className="imagePlaceholder"></div>
                <p className="itemText">{item.item}</p>
                <button className="addToCartButton" onClick={() => addToCart(item)}>
                  ➕ Add {item.item} - ${item.price.toFixed(2)}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading items...</p>
        )}
      </div>
    </div>
  );
}

export default App;
