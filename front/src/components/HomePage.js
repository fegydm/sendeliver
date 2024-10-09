import React from 'react';

function HomePage() {
  return (
    <div className="bg-blue-500 text-white p-4">
      <h1 className="text-3xl font-bold">Welcome to Sendeliver</h1>
      <p className="mt-4">Please choose your portal:</p>
      <ul>
        <li className="mt-2">
          <a href="/sender" className="text-blue-300 hover:text-blue-100">Sender Portal</a>
        </li>
        <li className="mt-2">
          <a href="/hauler" className="text-blue-300 hover:text-blue-100">Hauler Portal</a>
        </li>
      </ul>
    </div>
  );
}

export default HomePage;
