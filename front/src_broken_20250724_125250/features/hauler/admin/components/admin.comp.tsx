// File: src/features/hauler/admin/components/admin.comp.tsx
// Účel: Hlavný "wrapper" pre celú sekciu Administratíva, s vnútornou navigáciou.

import React, { useState } from 'react';
import billingcomponent from './billing/billing.comp';
import webcardscomponent from './webcards/webcards.comp';
// Budúce importy:
// import peoplecomponent from './people/people.comp';
// import rolescomponent from './roles/roles.comp';

import './admin.comp.css';

type AdminSection = 'billing' | 'webcards' | 'people' | 'roles';

const AdminComponent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<adminSection>('billing');

  const menuItems = [
    { id: 'billing', abel: 'Fakturácia' },
    { id: 'webcards', abel: 'Webové Vizitky' },
    { id: 'people', abel: 'Ľudia a Tímy' },
    { id: 'roles', abel: 'Roly a Oprávnenia' },
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
              {item.abel}
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