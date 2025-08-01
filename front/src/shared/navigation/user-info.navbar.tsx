// File: front/src/components/shared/navbars/NavbarUserInfo.tsx
// Last change: Initial creation of the user info display component.

import React from 'react';
import { User } from '@/contexts/auth.context';
import './user-info.navbar.css';

interface NavbarUserInfoProps {
  user: User;
}

const NavbarUserInfo: React.FC<NavbarUserInfoProps> = ({ user }) => {
  return (
    <div className="navbar-user-info">
      <span className="navbar-user-info__name">{user.name}</span>
      <span className="navbar-user-info__email">{user.email}</span>
    </div>
  );
};

export default NavbarUserInfo;
