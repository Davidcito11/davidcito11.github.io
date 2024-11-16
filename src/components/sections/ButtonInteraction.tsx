import React, { useRef } from "react";
import "../../styles/styles.css";

const ButtonInteraction: React.FC = () => {
  const btnRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 360;
      btn.style.setProperty("--x", `${x}deg`);
      console.log(`Angle: ${x}deg`);
        
    }
  };

  return (
    <a
      href="/ResumeJulianC.pdf"
      download="ResumeJulianC.pdf"
      target="_blank"
      rel="noopener noreferrer"
      ref={btnRef}
      onMouseMove={handleMouseMove}
    >
      <i></i>
      <i></i>
      <span>Resume</span>
    </a>
  );
};

export default ButtonInteraction;
