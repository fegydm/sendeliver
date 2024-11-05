// ./front/src/components/banner-s.component.js
import React from 'react';
import { Link } from 'react-router-dom';

const BannerS = () => {
  return (
    <div className="bg-hauler-primary-500 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-4">clients.sendeliver.com</h1>
      <div className="flex justify-center space-x-8">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/orders" className="hover:underline">
          Orders
        </Link>
        <Link to="/exchange" className="hover:underline">
          Exchange
        </Link>
      </div>
    </div>
  );
};

export default BannerS;
