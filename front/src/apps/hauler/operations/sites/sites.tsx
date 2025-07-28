// File: src/apps/hauler/operations/sites/sites.tsx// File: src/apps/hauler/operations/sites/sites.tsx
// Last change: Created basic sites component with placeholder structure

import React, { useState } from 'react';

// Temporary site interface - will be moved to proper types later
interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  type: 'DEPOT' | 'LOADING_DOCK' | 'UNLOADING_DOCK' | 'WAREHOUSE' | 'DISTRIBUTION_CENTER' | 'SERVICE_CENTER';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// Sample data for initial display
const sampleSites: Site[] = [
  {
    id: 'site-1',
    name: 'Hlavné depo Bratislava',
    address: 'Prístavná 12',
    city: 'Bratislava',
    zipCode: '82109',
    country: 'Slovensko',
    type: 'DEPOT',
    status: 'ACTIVE',
    contactPerson: 'Ing. Miroslav Krejčí',
    contactPhone: '+421 2 5555 0001',
    contactEmail: 'depo.ba@sendeliver.sk'
  },
  {
    id: 'site-2',
    name: 'Nakladisko Tesco DC',
    address: 'Logistická 8',
    city: 'Senec',
    zipCode: '90301',
    country: 'Slovensko',
    type: 'LOADING_DOCK',
    status: 'ACTIVE',
    contactPerson: 'Jana Novotná',
    contactPhone: '+421 905 123 456',
    contactEmail: 'loading.senec@tesco.sk'
  },
  {
    id: 'site-3',
    name: 'Servisné centrum Martin',
    address: 'Priemyselná 23',
    city: 'Martin',
    zipCode: '03601',
    country: 'Slovensko',
    type: 'SERVICE_CENTER',
    status: 'MAINTENANCE',
    contactPerson: 'Tomáš Hudák',
    contactPhone: '+421 43 4444 567',
    contactEmail: 'servis.martin@sendeliver.sk'
  }
];

const SitesOperations: React.FC = () => {
  const [sites] = useState<Site[]>(sampleSites);
  const [selectedSite, setSelectedSite] = useState<Site | null>(sites[0] || null);

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'DEPOT': return 'Depo';
      case 'LOADING_DOCK': return 'Nakladisko';
      case 'UNLOADING_DOCK': return 'Vykladisko';
      case 'WAREHOUSE': return 'Sklad';
      case 'DISTRIBUTION_CENTER': return 'Distribučné centrum';
      case 'SERVICE_CENTER': return 'Servisné centrum';
      default: return type;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktívna';
      case 'INACTIVE': return 'Neaktívna';
      case 'MAINTENANCE': return 'Údržba';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'INACTIVE': return '#6c757d';
      case 'MAINTENANCE': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  return (
    <div className="sites-operations">
      {/* Temporary basic layout */}
      <div className="sites-header">
        <h2>Sites Management</h2>
        <p>Správa lokalít a objektov</p>
      </div>

      <div className="sites-content">
        {/* Sidebar with sites list */}
        <div className="sites-sidebar">
          <h3>Lokality ({sites.length})</h3>
          <div className="sites-list">
            {sites.map(site => (
              <div
                key={site.id}
                className={`site-item ${selectedSite?.id === site.id ? 'selected' : ''}`}
                onClick={() => setSelectedSite(site)}
              >
                <div className="site-icon">📍</div>
                <div className="site-info">
                  <div className="site-name">{site.name}</div>
                  <div className="site-location">{site.city}</div>
                  <div className="site-type">{getTypeDisplayName(site.type)}</div>
                </div>
                <div 
                  className="site-status"
                  style={{ 
                    color: getStatusColor(site.status),
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  {getStatusDisplayName(site.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="sites-main">
          {selectedSite ? (
            <div className="site-details">
              <div className="site-details-header">
                <h3>{selectedSite.name}</h3>
                <div 
                  className="site-status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(selectedSite.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {getStatusDisplayName(selectedSite.status)}
                </div>
              </div>

              <div className="site-details-content">
                <div className="detail-section">
                  <h4>Základné informácie</h4>
                  <div className="detail-grid">
                    <div><strong>Typ:</strong> {getTypeDisplayName(selectedSite.type)}</div>
                    <div><strong>Adresa:</strong> {selectedSite.address}</div>
                    <div><strong>Mesto:</strong> {selectedSite.city}</div>
                    <div><strong>PSČ:</strong> {selectedSite.zipCode}</div>
                    <div><strong>Krajina:</strong> {selectedSite.country}</div>
                  </div>
                </div>

                {selectedSite.contactPerson && (
                  <div className="detail-section">
                    <h4>Kontaktné informácie</h4>
                    <div className="detail-grid">
                      <div><strong>Kontaktná osoba:</strong> {selectedSite.contactPerson}</div>
                      <div><strong>Telefón:</strong> {selectedSite.contactPhone}</div>
                      <div><strong>Email:</strong> {selectedSite.contactEmail}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Vyberte lokalitu zo zoznamu</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sites-operations {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .sites-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 16px;
        }
        
        .sites-header h2 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .sites-header p {
          margin: 0;
          color: #666;
        }
        
        .sites-content {
          display: flex;
          flex: 1;
          gap: 20px;
          overflow: hidden;
        }
        
        .sites-sidebar {
          width: 300px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          overflow-y: auto;
        }
        
        .sites-sidebar h3 {
          margin: 0 0 16px 0;
          color: #333;
        }
        
        .site-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 8px;
          transition: background-color 0.2s;
        }
        
        .site-item:hover {
          background-color: #e9ecef;
        }
        
        .site-item.selected {
          background-color: #007bff;
          color: white;
        }
        
        .site-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .site-info {
          flex: 1;
        }
        
        .site-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .site-location {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 2px;
        }
        
        .site-type {
          font-size: 11px;
          opacity: 0.7;
        }
        
        .site-status {
          font-size: 12px;
          text-align: right;
        }
        
        .sites-main {
          flex: 1;
          background: white;
          border-radius: 8px;
          padding: 20px;
          overflow-y: auto;
        }
        
        .site-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }
        
        .site-details-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .detail-section {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
        }
        
        .detail-section h4 {
          margin: 0 0 12px 0;
          color: #333;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }
        
        .detail-grid div {
          font-size: 14px;
        }
        
        .no-selection {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export { SitesOperations };
export default SitesOperations;