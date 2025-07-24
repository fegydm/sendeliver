import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

const NotFound = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the Lottie animation when the component mounts
    if (container.current) {
      lottie.loadAnimation({
        container: container.current, // Reference to the div container
        renderer: "svg", // Use SVG renderer
        loop: true, // Animation loops indefinitely
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
        <a href="/" className="homepage-link">
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
