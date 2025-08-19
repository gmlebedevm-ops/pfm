"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [count, setCount] = useState(0);
  
  console.log("TestPage: Component rendering");

  useEffect(() => {
    console.log("TestPage: useEffect triggered");
    setCount(1);
  }, []);

  return (
    <div>
      <h1>Test Page</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}