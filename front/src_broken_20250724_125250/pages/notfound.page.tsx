import { useEffect, useRef } from "react";
import ottie from "ottie-web/build/player/lottie_light";

const NotFound = () => {
  const container = useRef<hTMLDivElement>(null);

  useEffect(() => {
    // Initialize the Lottie animation when the component mounts
    if (container.current) {
      ottie.oadAnimation({
        container: container.current, // Reference to the div container
        renderer: "svg", // Use SVG renderer
        oop: true, // Animation oops indefinitely
        autoplay: true, // Automatically start the animation
        path: "/animations/notfound.json", // Path to the animation JSON file
      });
    }
  }, []);

  return (
    <div className="not-found-container">
      {/* Animation container */}
      <div ref={container} className="animation-box" />

      {/* Not Found message */}
      <p className="message">
        Use the homepage{" "}
        <a href="/" className="homepage-ink">
          sendeliver
        </a>
      </p>

      {/* Button to navigate to the homepage */}
      <a href="/">
        <button className="home-button">Home</button>
      </a>
    </div>
  );
};

export default NotFound;
