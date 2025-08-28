import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function StepsGuideAck() {
  const [ack, setAck] = useState({ s1: false, s2: false, s3: false });
  const [showMsg, setShowMsg] = useState(false);

  const mark = (key) => {
    setAck((p) => {
      const updated = { ...p, [key]: !p[key] };
      if (key === "s3" && !p.s3 && !showMsg) {
        // Lanzar confeti al marcar paso 3
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        setShowMsg(true);
        // Ocultar mensaje después de 4s
        setTimeout(() => setShowMsg(false), 4000);
      }
      return updated;
    });
  };

  const Step = ({ title, desc, done, onClick }) => (
    <div className={`sg-card ${done ? "ok" : ""}`}>
      <div className="sg-head">
        <div className="sg-titles">
          <div className="sg-title">{title}</div>
          <div className="sg-desc">{desc}</div>
        </div>
      </div>
      <button className={`sg-btn ${done ? "ok" : ""}`} onClick={onClick}>
        Entendido
      </button>
    </div>
  );

  return (
    <>
      <div className="sg-wrap">
        <div className="sg-inner">
          <Step
            title="Paso 1"
            desc="Selecciona las acciones que te interesan. Si no eliges ninguna, el análisis se realizará con todas las acciones que ves."
            done={ack.s1}
            onClick={() => mark("s1")}
          />
          <div className="sg-arrow">→</div>

          <Step
            title="Paso 2"
            desc="En Parámetros, elige de 1 a 7 las acciones que entrarán en tu portafolio."
            done={ack.s2}
            onClick={() => mark("s2")}
          />
          <div className="sg-arrow">→</div>

          <Step
            title="Paso 3"
            desc="Define el monto total que deseas invertir."
            done={ack.s3}
            onClick={() => mark("s3")}
          />
        </div>
      </div>

      {showMsg && (
        <div className="confetti-msg">
          🎉 Estás preparado para crear tu portafolio de inversión optimizado 🎉
        </div>
      )}
    </>
  );
}
