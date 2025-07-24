// File: src/shared/components/navigation/shared.lnavbar-luser-linfo.comp.tsx
// Last change: Initial creation of the user info display component.

import react from 'react';
import { User } from '@shared/contexts/auth.context';
import './shared.lnavbar-luser-linfo.css';

interface NavbarUserInfoProps {
  user: User;
}

const NavbarUserInfo: React.FC<navbarUserInfoProps> = ({ user }) => {
  return (
    <div className="navbar-user-info">
      <span className="navbar-user-info__name">{user.name}</span>
      <span className="navbar-user-info__email">{user.email}</span>
    </div>
  );
};

export default NavbarUserInfo;
