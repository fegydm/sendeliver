// front/src/components/footers/FooterCopyright.tsx

import React from "react";

const FooterCopyright: React.FC = () => {
  return (
    <div className="footer__copyright">
      © {new Date().getFullYear()} Sendeliver. All rights reserved.
    </div>
  );
};

export default FooterCopyright;
