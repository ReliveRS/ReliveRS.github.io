import { useState, lazy, Suspense, useEffect } from 'react';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/universe.css';
import './styles/recruiter.css';
import './styles/animations.css';
import './styles/responsive.css';
import NetworkScene from './components/NetworkScene';
const LINKEDIN_URL = 'https://www.linkedin.com/in/rafael-segura-orta-628a31318/';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708C16 15.487 15.474 16 14.825 16H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
    </svg>
  );
}


const UniverseMode = lazy(() => import('./components/UniverseMode'));
const SoftSkillsUniverse = lazy(() => import('./components/SoftSkillsUniverse'));
const FoundationsUniverse = lazy(() => import('./components/FoundationsUniverse'));
const RecruiterMode = lazy(() => import('./components/RecruiterMode'));

type ActiveUniverse = 'portfolio' | 'tech' | 'soft-skills' | 'foundations';

function App() {
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState<string | null>(null);
  const [activeUniverse, setActiveUniverse] = useState<ActiveUniverse>('portfolio');
  const [isWarping, setIsWarping] = useState(false);
  const [nextUniverse, setNextUniverse] = useState<ActiveUniverse | null>(null);
  const [isRecruiterModeOpen, setIsRecruiterModeOpen] = useState(false);

  useEffect(() => {
    if (!isArchitectureOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsArchitectureOpen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isArchitectureOpen]);

  function travelToUniverse(destination: ActiveUniverse) {
    if (isWarping) return;
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setActiveUniverse(destination);
      return;
    }
    setIsWarping(true);
    setNextUniverse(destination);
    window.setTimeout(() => setActiveUniverse(destination), 430);
    window.setTimeout(() => { setIsWarping(false); setNextUniverse(null); }, 1050);
  }

  function navigateFromUniverse(sectionId: string) {
    setActiveUniverse('portfolio');
    window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  return <>
    <main>
      <nav className="navbar" aria-label="Navegación principal">
        <a className="logo" href="#inicio">
          ReliveRS<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#perfil">Perfil</a>
          <a href="#tecnologias">Stack</a>
          <a href="#trayectoria">Trayectoria</a>
          <a href="#proyectos">Proyectos</a>

          <button
            type="button"
            className="nav-universe-button"
            onClick={() => setActiveUniverse('tech')}
          >
            Universo tecnológico
          </button>
        </div>

        <div className="nav-social-links">
          <a
            href="https://github.com/ReliveRS"
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir GitHub en una pestaña nueva"
            title="GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir LinkedIn en una pestaña nueva"
            title="LinkedIn"
          >
            <LinkedInIcon />
          </a>
        </div>
      </nav>

      <section id="inicio" className="hero-section">
        <div className="hero-intro">
          <p className="status">DESARROLLO DE SOFTWARE · SISTEMAS · CIBERSEGURIDAD</p>



          <h1>
            Construyo soluciones<span> conectadas.</span>
          </h1>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-subheadline">
              Software Engineering · Android · Backend · Sistemas
            </p>

            <p className="hero-description">
              Desarrollo aplicaciones Android, APIs backend y soluciones basadas en datos.
              Combino experiencia en Core Banking, sistemas y diagnóstico técnico para
              construir software fiable, mantenible y orientado a resolver problemas
            </p>

            <div className="hero-stack-summary" aria-label="Tecnologías principales">
              <span>HTML5</span>
              <span>CSS3</span>
              <span>JavaScript</span>
              <span>TypeScript</span>
              <span>React</span>
              <span>Kotlin</span>
              <span>Java</span>
              <span>Spring Boot</span>
              <span>SQL</span>
              <span>Docker</span>
              <span>AWS</span>
            </div>

            <div className="hero-actions">
              <a className="button primary-button" href="#proyectos">
                Explorar proyectos
              </a>

              <a
                className="button secondary-button"
                href="https://github.com/ReliveRS"
                target="_blank"
                rel="noreferrer"
              >
                <span className="button-icon" aria-hidden="true">
                  <GitHubIcon />
                </span>
                Ver GitHub
              </a>

              <button
                type="button"
                className="button recruiter-mode-button"
                onClick={() => setIsRecruiterModeOpen(true)}
              >
                Recruiter Mode / 30 sec →
              </button>
            </div>
          </div>

          <div className="scene-container">
            <div className="scene-canvas" aria-hidden="true">
              <NetworkScene onSelectTechnology={setSelectedTechnology} />
            </div>

            <div className="scene-hud">
              <p className="scene-hud-title">TECH STACK / SYSTEM MAP</p>
            </div>

            {selectedTechnology && (
              <div className="technology-inspector">
                <p className="inspector-label">TECNOLOGÍA ACTIVA</p>
                <strong>{selectedTechnology}</strong>

                <button
                  type="button"
                  aria-label="Cerrar información del nodo"
                  onClick={() => setSelectedTechnology(null)}
                >
                  ×
                </button>
              </div>
            )}

            <button
              type="button"
              className="scene-expand-button"
              onClick={() => setActiveUniverse('tech')}
            >
              Entrar al universo tecnológico ↗
            </button>

            <p className="scene-status">
              <span />
              NODOS ACTIVOS: 05
            </p>
          </div>
        </div>
      </section>

      <section id="perfil" className="content-section profile-section">
        <div className="profile-copy">
          <p className="section-label">01 / PERFIL</p>

          <h2>Software, sistemas y resolución de problemas.</h2>

          <p>
            Mi perfil combina desarrollo de aplicaciones con experiencia técnica en
            sistemas electrónicos y automatizados. He trabajado en el mantenimiento y
            evolución de sistemas críticos de Core Banking, y desarrollo proyectos
            propios con aplicaciones móviles, backend REST, bases de datos y servicios
            cloud.
          </p>
        </div>

        <figure className="profile-visual">
          <img
            src="/profile-system-map.png"
            alt="Visualización abstracta de nodos, conexiones y sistemas tecnológicos"
            loading="lazy"
          />
          <figcaption>SOFTWARE · SYSTEMS · DATA</figcaption>
        </figure>
      </section>

      <section id="tecnologias" className="content-section">
        <p className="section-label">02 / STACK TECNOLÓGICO</p>
        <h2>Tecnologías que utilizo y sigo aprendiendo.</h2>
        <p>
          Desarrollo proyectos con tecnologías móviles, backend, bases de datos,
          automatización de entrega e infraestructura.
        </p>

        <div className="tech-grid">
          <article className="tech-card">
            <span className="tech-number">01</span>
            <h3>Aplicaciones</h3>
            <p>Java, Kotlin, Jetpack Compose, HTML5, CSS3 y JavaScript.</p>
          </article>

          <article className="tech-card">
            <span className="tech-number">02</span>
            <h3>Backend y APIs</h3>
            <p>Spring Boot, API REST, JPA/Hibernate, JWT, MVC, DAO y SOLID.</p>
          </article>

          <article className="tech-card">
            <span className="tech-number">03</span>
            <h3>Datos</h3>
            <p>SQL, PostgreSQL, MySQL, Oracle, Room y modelado de datos con ERwin.</p>
          </article>

          <article className="tech-card">
            <span className="tech-number">04</span>
            <h3>Calidad y entrega</h3>
            <p>
              Git, Bitbucket, Jenkins, SonarQube, JFrog Artifactory, Docker, AWS EC2
              y Postman.
            </p>
          </article>
        </div>
      </section>

      <section id="trayectoria" className="content-section">
        <p className="section-label">03 / TRAYECTORIA</p>
        <h2>De la electrónica a los sistemas críticos.</h2>
        <p>
          Una trayectoria técnica orientada al diagnóstico, la automatización, el
          mantenimiento de sistemas y el desarrollo de software.
        </p>

        <div className="timeline">
          <article className="timeline-item">
            <span className="timeline-date">MAR. 2026 — JUN. 2026</span>
            <h3>Viewnext · Core Banking de Cajamar</h3>
            <p>
              Participación en el mantenimiento y evolución de sistemas críticos del
              área de Ahorro, trabajando con COBOL, SQL, procesos batch, integración
              continua y herramientas de calidad.
            </p>
            <div className="project-tags">
              <span>COBOL</span>
              <span>SQL</span>
              <span>Jenkins</span>
              <span>SonarQube</span>
              <span>Bitbucket</span>
              <span>Control-M</span>
            </div>
          </article>

          <article className="timeline-item">
            <span className="timeline-date">2026 — ACTUALIDAD</span>
            <h3>Ciberseguridad en Entornos TI</h3>
            <p>
              Curso de especialización centrado en seguridad de sistemas y redes,
              protección de la información y respuesta ante incidentes.
            </p>
            <div className="project-tags">
              <span>Sistemas</span>
              <span>Redes</span>
              <span>Seguridad</span>
              <span>Incidentes</span>
            </div>
          </article>

          <article className="timeline-item">
            <span className="timeline-date">2017 — 2026</span>
            <h3>Electrónica, automatización y mantenimiento técnico</h3>
            <p>
              Diagnóstico, reparación y documentación de sistemas electrónicos y
              automatizados, aplicando análisis sistemático a incidencias complejas
              de hardware y software.
            </p>
            <div className="project-tags">
              <span>Electrónica</span>
              <span>Hardware</span>
              <span>Diagnóstico</span>
              <span>Automatización</span>
              <span>Documentación</span>
            </div>
          </article>
        </div>
      </section>

      <section id="proyectos" className="content-section">
        <p className="section-label">04 / PROYECTOS DESTACADOS</p>
        <h2>Proyectos construidos para resolver problemas.</h2>
        <p>
          Cada proyecto presenta las tecnologías utilizadas, su objetivo y
          decisiones técnicas relevantes.
        </p>

        <div className="project-list">
          <article className="project-card project-featured">
            <div className="project-header">
              <span className="project-id">PROYECTO_01</span>
              <span className="project-status">
                <span className="status-dot"></span>FUNCIONAL
              </span>
            </div>

            <p className="project-category">APP MÓVIL · BACKEND · CLOUD · IA</p>
            <h3>RecordNote</h3>

            <p className="project-description">
              Aplicación Android nativa para grabar, transcribir y organizar notas de
              voz. Combina persistencia local, sincronización con una API REST
              protegida con JWT y procesamiento de audio con OpenAI Whisper.
            </p>

            <div className="project-tags">
              <span>Kotlin</span>
              <span>Jetpack Compose</span>
              <span>MVVM</span>
              <span>Room</span>
              <span>Flow</span>
              <span>Spring Boot</span>
              <span>PostgreSQL</span>
              <span>JWT</span>
              <span>AWS EC2</span>
            </div>

            <div className="project-links">
              <a
                href="https://github.com/ReliveRS"
                target="_blank"
                rel="noreferrer"
              >
                Ver GitHub ↗
              </a>

              <button
                type="button"
                className="project-detail-button"
                onClick={() => setIsArchitectureOpen(true)}
              >
                Ver arquitectura →
              </button>
            </div>
          </article>

          <article className="project-card">
            <div className="project-header">
              <span className="project-id">EXPERIENCIA_01</span>
              <span className="project-status">
                <span className="status-dot status-dot-ready"></span>COMPLETADA
              </span>
            </div>

            <p className="project-category">SISTEMAS CRÍTICOS · CORE BANKING</p>
            <h3>Core Banking · Cajamar</h3>

            <p className="project-description">
              Participación en mantenimiento y evolución de sistemas bancarios del
              área de Ahorro, con trabajo sobre procesos, modelado de datos, SQL,
              calidad e integración continua.
            </p>

            <div className="project-tags">
              <span>COBOL</span>
              <span>SQL</span>
              <span>Jenkins</span>
              <span>SonarQube</span>
              <span>ERwin</span>
              <span>Control-M</span>
            </div>
          </article>

          <article className="project-card">
            <div className="project-header">
              <span className="project-id">EXPERIENCIA_02</span>
              <span className="project-status">
                <span className="status-dot status-dot-ready"></span>TÉCNICA
              </span>
            </div>

            <p className="project-category">
              ELECTRÓNICA · AUTOMATIZACIÓN · DIAGNÓSTICO
            </p>
            <h3>Sistemas automatizados</h3>

            <p className="project-description">
              Experiencia en mantenimiento, reparación y diagnóstico de equipos
              electrónicos y sistemas recreativos automatizados, documentando
              incidencias y mejoras operativas.
            </p>

            <div className="project-tags">
              <span>Electrónica</span>
              <span>Hardware</span>
              <span>Diagnóstico</span>
              <span>Automatización</span>
              <span>Documentación</span>
            </div>
          </article>
        </div>
      </section>

      <footer id="contacto" className="site-footer">
        <div className="footer-main">
          <div className="footer-info">
            <p className="footer-name">Rafael Segura</p>
            <p className="footer-location">Almería, España</p>
          </div>

          <nav className="footer-links" aria-label="Enlaces de contacto">
            <a href="mailto:rafael.segura.orta@gmail.com">
              <span className="footer-icon" aria-hidden="true">✉</span>
              Email
            </a>

            <a
              href="https://github.com/ReliveRS"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-icon" aria-hidden="true">
                <GitHubIcon />
              </span>
              GitHub
            </a>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-icon" aria-hidden="true">
                <LinkedInIcon />
              </span>
              LinkedIn
            </a>
          </nav>

          <button
            type="button"
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Volver arriba ↑
          </button>
        </div>

        <p className="footer-note">
          Portfolio técnico · Construido con React, TypeScript y Three.js
        </p>
      </footer>
    </main>

    {isArchitectureOpen && <div className="modal-overlay" onClick={() => setIsArchitectureOpen(false)}><section className="architecture-modal" role="dialog" aria-modal="true" aria-labelledby="architecture-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="section-label">RECORDNOTE / ARQUITECTURA</p><h2 id="architecture-title">Flujo de la aplicación</h2></div><button type="button" className="modal-close-button" aria-label="Cerrar arquitectura" onClick={() => setIsArchitectureOpen(false)}>×</button></div><div className="architecture-flow"><article className="architecture-node node-mobile"><span className="architecture-step">01</span><h3>Android App</h3><p>Kotlin · Jetpack Compose · Room · Flow</p></article><span className="architecture-arrow">→</span><article className="architecture-node node-api"><span className="architecture-step">02</span><h3>REST API</h3><p>Spring Boot 3 · JWT · JPA/Hibernate</p></article><span className="architecture-arrow">→</span><article className="architecture-node node-data"><span className="architecture-step">03</span><h3>Persistencia</h3><p>PostgreSQL · Sincronización · AWS EC2</p></article><span className="architecture-arrow">→</span><article className="architecture-node node-audio"><span className="architecture-step">04</span><h3>Procesamiento</h3><p>Audio · Whisper · Transcripción</p></article></div><div className="architecture-description"><h3>Decisiones técnicas</h3><p>RecordNote utiliza Room y Flow para mantener notas disponibles localmente y actualizar la interfaz de forma reactiva.</p><p>El backend Spring Boot expone una API REST protegida con JWT, persiste los datos mediante JPA/Hibernate sobre PostgreSQL y se despliega en AWS EC2.</p><p>Las notas de voz se envían para procesarse y transcribirse con OpenAI Whisper, permitiendo que el contenido se actualice entre cliente Android y servidor.</p></div></section></div>}

    <Suspense
      fallback={
        <div role="status" aria-live="polite">
          <p
            style={{
              color: '#39d4ff',
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              margin: 0,
              padding: '12px 22px',
              background: 'rgba(4, 16, 29, 0.94)',
              border: '1px solid rgba(57, 212, 255, 0.4)',
              borderRadius: '8px',
              boxShadow: '0 0 24px rgba(57, 212, 255, 0.25)',
              pointerEvents: 'none',
            }}
          >
            CARGANDO EXPERIENCIA...
          </p>
        </div>
      }
    >
      {activeUniverse === 'tech' && (
        <UniverseMode
          onClose={() => setActiveUniverse('portfolio')}
          onNavigate={navigateFromUniverse}
          onGalaxyNavigate={(galaxy) => travelToUniverse(galaxy)}
        />
      )}

      {activeUniverse === 'soft-skills' && (
        <SoftSkillsUniverse
          onClose={() => setActiveUniverse('portfolio')}
          onGalaxyNavigate={(galaxy) => travelToUniverse(galaxy)}
        />
      )}

      {activeUniverse === 'foundations' && (
        <FoundationsUniverse
          onClose={() => setActiveUniverse('portfolio')}
          onGalaxyNavigate={(galaxy) => travelToUniverse(galaxy)}
        />
      )}

      {isRecruiterModeOpen && (
        <RecruiterMode onClose={() => setIsRecruiterModeOpen(false)} />
      )}
    </Suspense>
    {isWarping && <div className={`galaxy-warp ${nextUniverse === 'soft-skills' ? 'galaxy-warp-soft' : nextUniverse === 'foundations' ? 'galaxy-warp-foundation' : 'galaxy-warp-tech'}`} aria-hidden="true"><div className="galaxy-warp-stars"></div><div className="galaxy-warp-core"></div><p>{nextUniverse === 'soft-skills' ? 'VIAJANDO A HUMAN SYSTEMS' : nextUniverse === 'foundations' ? 'VIAJANDO A FOUNDATION GALAXY' : 'REGRESANDO A TECH GALAXY'}</p></div>}
  </>;
}

export default App;
