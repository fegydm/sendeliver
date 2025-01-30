// File: src/components/elements/DriverCard.tsx

import React, { useState } from 'react';
import "@/styles/components/DriverCard.css";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  photo: string;
  address: string;
  driverId: string;
  licenseId: string;
  phone: string;
  email: string;
  experience: string;
  driverType: string;
  payrollId: string;
}

const DriverCard: React.FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const drivers: Driver[] = [
    {
      id: '1',
      firstName: 'Peter',
      lastName: 'Anderson',
      photo: '/api/placeholder/100/100',
      address: '1111 Riverside',
      driverId: 'DRV001',
      licenseId: 'LIC92506',
      phone: '123-456-8',
      email: 'peter@example.com',
      experience: '5 years',
      driverType: 'Full-time',
      payrollId: 'PAY123'
    },
    // More drivers...
  ];

  const filteredDrivers = drivers.filter(driver => 
    `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="driver-container">
      <div className="driver-sidebar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon" />
        </div>
        
        <div className="drivers-list">
          {filteredDrivers.map(driver => (
            <div
              key={driver.id}
              className={`driver-item ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
              onClick={() => setSelectedDriver(driver)}
            >
              <img
                src={driver.photo}
                alt={`${driver.firstName} ${driver.lastName}`}
                className="driver-photo-small"
              />
              <span className="driver-name">{driver.firstName} {driver.lastName}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedDriver ? (
        <div className="driver-detail">
          <img
            src={selectedDriver.photo}
            alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
            className="driver-photo-large"
          />
          
          <div className="form-group">
            <label className="form-label">Adresa</label>
            <input
              type="text"
              className="form-input"
              value={selectedDriver.address}
              onChange={() => {}} // Add handler for changes
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Číslo ID</label>
              <input
                type="text"
                className="form-input"
                value={selectedDriver.driverId}
                onChange={() => {}}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Číslo Pasu</label>
              <input
                type="text"
                className="form-input"
                value={selectedDriver.licenseId}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="input-with-icon">
              <span className="icon icon-phone" />
              <input
                type="text"
                className="form-input"
                value={selectedDriver.phone}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <span className="icon icon-email" />
              <input
                type="email"
                className="form-input"
                value={selectedDriver.email}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lekárske prehliadky</label>
            <div className="medical-records">
              <span className="icon icon-file" />
              {/* Medical records content */}
            </div>
          </div>
        </div>
      ) : (
        <div className="driver-detail">
          <p>Vyberte vodiča zo zoznamu</p>
        </div>
      )}
    </div>
  );
};

export default DriverCard;