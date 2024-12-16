import React, { useState, useEffect } from "react";

const FooterSwitch: React.FC = () => {
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    const link = document.getElementById("dynamic-stylesheet") as HTMLLinkElement;
    if (!link) {
      const newLink = document.createElement("link");
      newLink.id = "dynamic-stylesheet";
      newLink.rel = "stylesheet";
      newLink.href = isDefault ? "/src/styles/default.css" : "/src/styles/none.css";
      document.head.appendChild(newLink);
    } else {
      link.href = isDefault ? "/src/styles/default.css" : "/src/styles/none.css";
    }
  }, [isDefault]);

  const handleSwitch = () => setIsDefault(!isDefault);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="footer-switch" className="text-sm text-gray-700 dark:text-gray-300">
        Default Styles
      </label>
      <input
        id="footer-switch"
        type="checkbox"
        checked={isDefault}
        onChange={handleSwitch}
        className="form-checkbox h-5 w-5 text-blue-600"
      />
    </div>
  );
};

export default FooterSwitch;
