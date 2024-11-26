// front/src/components/footers/FooterCopyright.tsx

import React from "react";

const FooterCopyright: React.FC = () => {
  return (
    <div className="text-xs">
      © {new Date().getFullYear()} Sendeliver. All rights reserved.
    </div>
  );
};

export default FooterCopyright;
