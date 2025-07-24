// File: src/components/hauler/admin/admin.component.tsx
// Účel: Hlavný "wrapper" pre celú sekciu Administratíva, s vnútornou navigáciou.

import React, { useState } from 'react';
import BillingComponent from './billing/billing.component';
import WebCardsComponent from './webcards/webcards.component';
// Budúce importy:
// import PeopleComponent from './people/people.component';
// import RolesComponent from './roles/roles.component';

import './admin.component.css';

type AdminSection = 'billing' | 'webcards' | 'people' | 'roles';

const AdminComponent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('billing');

  const menuItems = [
    { id: 'billing', label: 'Fakturácia' },
    { id: 'webcards', label: 'Webové Vizitky' },
    { id: 'people', label: 'Ľudia a Tímy' },
    { id: 'roles', label: 'Roly a Oprávnenia' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'billing':
        return <BillingComponent />;
      case 'webcards':
        return <WebCardsComponent />;
      // case 'people':
      //   return <PeopleComponent />;
      // case 'roles':
      //   return <RolesComponent />;
      default:
        return <div>Vyberte sekciu</div>;
    }
  };

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <h2 className="admin__sidebar-title">Administratíva</h2>
        <nav className="admin__nav">
          {menuItems.map(item => (
            <a
              key={item.id}
              href="#"
              className={`admin__nav-item ${activeSection === item.id ? 'admin__nav-item--active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(item.id as AdminSection);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="admin__content">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminComponent;