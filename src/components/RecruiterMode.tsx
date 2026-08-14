import { useEffect } from 'react';

type RecruiterModeProps = {
  onClose: () => void;
};

const highlights = [
  {
    number: '01',
    title: 'Perfil objetivo',
    text: 'Junior Java / Backend Developer con base en desarrollo multiplataforma, sistemas y resolución de incidencias.',
  },
  {
    number: '02',
    title: 'Experiencia relevante',
    text: 'Core Banking en Cajamar / Viewnext: COBOL, SQL, calidad, integración continua y procesos críticos.',
  },
  {
    number: '03',
    title: 'Proyecto principal',
    text: 'RecordNote: Android con Kotlin y Compose, API REST con Spring Boot, JWT, PostgreSQL y AWS EC2.',
  },
];

const skills = [
  'Java',
  'Spring Boot',
  'SQL',
  'Kotlin',
  'PostgreSQL',
  'AWS EC2',
  'JUnit',
  'Git',
];

function RecruiterMode({ onClose }: RecruiterModeProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  return (
    <section
      className="recruiter-mode"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruiter-mode-title"
    >
      <div className="recruiter-mode-grid" aria-hidden="true"></div>

      <button
        type="button"
        className="recruiter-mode-close"
        aria-label="Cerrar Recruiter Mode"
        onClick={onClose}
      >
        ×
      </button>

      <main className="recruiter-mode-content">
        <header className="recruiter-mode-header">
          <p className="recruiter-mode-kicker">RELIVERS / RECRUITER MODE</p>
          <p className="recruiter-mode-time">PERFIL EN 30 SEGUNDOS</p>
          <h2 id="recruiter-mode-title">Rafael Segura Orta</h2>
          <p className="recruiter-mode-role">Junior Java · Backend · Sistemas</p>
          <p className="recruiter-mode-summary">
            Perfil técnico orientado a construir software mantenible, resolver
            incidencias y trabajar con datos, procesos y sistemas críticos.
          </p>
        </header>

        <section className="recruiter-mode-highlights" aria-label="Resumen profesional">
          {highlights.map((highlight) => (
            <article className="recruiter-highlight" key={highlight.number}>
              <span>{highlight.number}</span>
              <div>
                <h3>{highlight.title}</h3>
                <p>{highlight.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="recruiter-mode-stack" aria-label="Stack principal">
          <p className="recruiter-mode-section-label">STACK PRINCIPAL</p>
          <div>
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="recruiter-mode-actions" aria-label="Acciones rápidas">
          <a
            className="recruiter-action recruiter-action-primary"
            href="https://github.com/ReliveRS"
            target="_blank"
            rel="noreferrer"
          >
            Ver GitHub ↗
          </a>

          <a
            className="recruiter-action"
            href="mailto:rafael.segura.orta@gmail.com"
          >
            Contactar →
          </a>

          {/* Coloca el PDF público en public/cv-rafael-segura-orta.pdf
              para activar esta descarga. */}
          <a
            className="recruiter-action"
            href="/cv-rafael-segura-orta.pdf"
            download
          >
            Descargar CV ↓
          </a>
        </section>

        <footer className="recruiter-mode-footer">
          <span>ALMERÍA, ESPAÑA</span>
          <span>JAVA / BACKEND / SISTEMAS</span>
          <button type="button" onClick={onClose}>
            ← Explorar portfolio completo
          </button>
        </footer>
      </main>
    </section>
  );
}

export default RecruiterMode;
