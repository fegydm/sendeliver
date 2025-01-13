// ./front/src/components/under-construction.component.tsx
import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// import "./under-construction.component.css"; // Import CSS styles old version

const UnderConstruction = () => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (container.current) {
      animationRef.current = lottie.loadAnimation({
        container: container.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/animations/under-construction.json",
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="under-construction">
      <div ref={container} className="animation-container" />
      <h1 className="title">UNDER CONSTRUCTION</h1>
      <p className="description">vytrim a idz domu abo nazad</p>
      <div className="button-container">
        <Link to="/">
          <button className="button">HOME</button>
        </Link>
        <button onClick={() => navigate(-1)} className="button button-secondary">
          BACK
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;
