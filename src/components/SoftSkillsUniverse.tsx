import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Html,
  Line,
  OrbitControls,
  Sparkles,
  Stars,
} from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import GalaxyNavigator from './GalaxyNavigator';
import type { GalaxyId } from './GalaxyNavigator';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

/**
 * Datos de cada planeta de habilidades personales.
 */
type SoftSkill = {
  id: string;
  title: string;
  label: string;
  description: string;
  color: string;
  secondaryColor: string;
  radius: number;
  speed: number;
  startAngle: number;
  tilt: number;
  ellipse: number;
  size: number;
};

/**
 * Callbacks proporcionados por el componente padre.
 */
type SoftSkillsUniverseProps = {
  onClose: () => void;
  onGalaxyNavigate: (galaxy: GalaxyId) => void;
};

/**
 * Datos que definen una estrella fugaz.
 */
type MeteorProps = {
  color: string;
  delay: number;
  speed: number;
  start: [number, number, number];
  end: [number, number, number];
};

/* -------------------------------------------------------------------------- */
/*                                 MOBILE HOOK                                */
/* -------------------------------------------------------------------------- */

/**
 * Detecta pantallas móviles y escucha cambios de orientación/tamaño.
 */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;

    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);

    return () => {
      mediaQuery.removeEventListener('change', updateIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

/* -------------------------------------------------------------------------- */
/*                              METEOR TEXTURE                                */
/* -------------------------------------------------------------------------- */

/**
 * Crea una textura de Canvas para simular la estela y la cabeza
 * luminosa de una estrella fugaz.
 */
function useMeteorTexture(color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');

    canvas.width = 1024;
    canvas.height = 160;

    const context = canvas.getContext('2d');

    if (!context) {
      return new THREE.CanvasTexture(canvas);
    }

    const middle = 80;

    /* Estela difuminada. */
    const tail = context.createLinearGradient(40, middle, 920, middle);

    tail.addColorStop(0, 'rgba(0,0,0,0)');
    tail.addColorStop(0.48, 'rgba(0,0,0,0.02)');
    tail.addColorStop(0.78, color);
    tail.addColorStop(1, 'rgba(255,255,255,0.95)');

    context.save();
    context.filter = 'blur(15px)';
    context.strokeStyle = tail;
    context.lineWidth = 12;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(35, middle);
    context.quadraticCurveTo(570, middle + 5, 925, middle);
    context.stroke();
    context.restore();

    /* Línea central brillante. */
    const core = context.createLinearGradient(250, middle, 940, middle);

    core.addColorStop(0, 'rgba(0,0,0,0)');
    core.addColorStop(0.72, color);
    core.addColorStop(1, '#ffffff');

    context.strokeStyle = core;
    context.lineWidth = 2.4;
    context.beginPath();
    context.moveTo(180, middle);
    context.lineTo(940, middle);
    context.stroke();

    /* Cabeza luminosa del meteoro. */
    const head = context.createRadialGradient(
      930,
      middle,
      1,
      930,
      middle,
      72,
    );

    head.addColorStop(0, 'rgba(255,255,255,1)');
    head.addColorStop(0.09, 'rgba(255,255,255,1)');
    head.addColorStop(0.27, color);
    head.addColorStop(0.55, color);
    head.addColorStop(1, 'rgba(0,0,0,0)');

    context.fillStyle = head;
    context.fillRect(858, 8, 144, 144);

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
  }, [color]);
}

/* -------------------------------------------------------------------------- */
/*                               SHOOTING STAR                                */
/* -------------------------------------------------------------------------- */

/**
 * Estrella fugaz que recorre un trayecto desde start hasta end.
 */
function ShootingStar({
  color,
  delay,
  speed,
  start,
  end,
}: MeteorProps) {
  const meteor = useRef<THREE.Sprite>(null);
  const texture = useMeteorTexture(color);

  const direction = Math.atan2(
    end[1] - start[1],
    end[0] - start[0],
  );

  useFrame((state) => {
    if (!meteor.current) return;

    const progress =
      (state.clock.getElapsedTime() * speed + delay) % 1;

    meteor.current.visible = progress > 0.16 && progress < 0.8;

    const travel = THREE.MathUtils.clamp(
      (progress - 0.16) / 0.64,
      0,
      1,
    );

    meteor.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], travel),
      THREE.MathUtils.lerp(start[1], end[1], travel),
      THREE.MathUtils.lerp(start[2], end[2], travel),
    );
  });

  return (
    <sprite ref={meteor} visible={false} scale={[3.5, 0.55, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        rotation={direction}
      />
    </sprite>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  SOFT SKILLS                               */
/* -------------------------------------------------------------------------- */

/**
 * Planetas de habilidades personales.
 */
const softSkills: SoftSkill[] = [
  {
    id: 'problem-solving',
    title: 'Resolución de problemas',
    label: 'PROBLEM SOLVING',
    description:
      'Analizo incidencias de forma estructurada, identifico causas y convierto problemas técnicos complejos en soluciones verificables.',
    color: '#ff7eb6',
    secondaryColor: '#a62069',
    radius: 3.8,
    speed: 0.36,
    startAngle: 0.2,
    tilt: 0.18,
    ellipse: 0.72,
    size: 1.05,
  },
  {
    id: 'reliability',
    title: 'Fiabilidad',
    label: 'RELIABILITY',
    description:
      'Trabajo con atención al detalle y sentido de responsabilidad, especialmente en entornos donde la continuidad y la calidad son críticas.',
    color: '#ffd166',
    secondaryColor: '#a85c08',
    radius: 5.6,
    speed: 0.2,
    startAngle: 1.5,
    tilt: 0.52,
    ellipse: 0.8,
    size: 0.78,
  },
  {
    id: 'adaptability',
    title: 'Adaptabilidad',
    label: 'ADAPTABILITY',
    description:
      'Me adapto a nuevas tecnologías, dominios y herramientas: de sistemas electrónicos y automatizados a backend, cloud y ciberseguridad.',
    color: '#8be9fd',
    secondaryColor: '#147b9a',
    radius: 6.9,
    speed: 0.16,
    startAngle: 3.7,
    tilt: -0.58,
    ellipse: 0.64,
    size: 0.65,
  },
  {
    id: 'improvement',
    title: 'Mejora continua',
    label: 'CONTINUOUS IMPROVEMENT',
    description:
      'Documento procesos, detecto oportunidades de mejora y busco formas más eficientes y mantenibles de trabajar.',
    color: '#b8f28b',
    secondaryColor: '#39863a',
    radius: 7.9,
    speed: 0.13,
    startAngle: 5,
    tilt: 0.75,
    ellipse: 0.76,
    size: 0.72,
  },
  {
    id: 'communication',
    title: 'Comunicación',
    label: 'COMMUNICATION',
    description:
      'Combino comunicación técnica clara, coordinación operativa y orientación a personas para facilitar el trabajo en equipo.',
    color: '#c9a7ff',
    secondaryColor: '#6740a8',
    radius: 5,
    speed: 0.27,
    startAngle: 2.6,
    tilt: -0.35,
    ellipse: 0.58,
    size: 0.88,
  },
];

/* -------------------------------------------------------------------------- */
/*                                SKILL ORBIT                                 */
/* -------------------------------------------------------------------------- */

/**
 * Dibuja la ruta orbital elíptica de una habilidad.
 */
function SkillOrbit({ skill }: { skill: SoftSkill }) {
  const points = useMemo(() => {
    return Array.from({ length: 161 }, (_, index) => {
      const angle = (index / 160) * Math.PI * 2;
      const x = Math.cos(angle) * skill.radius;
      const depth =
        Math.sin(angle) * skill.radius * skill.ellipse;

      return [
        x,
        depth * Math.sin(skill.tilt),
        depth * Math.cos(skill.tilt),
      ] as [number, number, number];
    });
  }, [skill]);

  return (
    <Line
      points={points}
      color={skill.color}
      lineWidth={0.7}
      transparent
      opacity={0.25}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              SKILL SELECTION                               */
/* -------------------------------------------------------------------------- */

/**
 * Anillos, halo y luz extra para la habilidad seleccionada.
 */
function SkillSelection({
  skill,
  selected,
}: {
  skill: SoftSkill;
  selected: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current || !selected) return;

    group.current.rotation.z += delta * 0.92;

    const pulse =
      1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.1;

    group.current.scale.setScalar(pulse);
  });

  return (
    <group ref={group} visible={selected}>
      <pointLight
        color={skill.color}
        intensity={selected ? 5.5 : 0}
        distance={skill.size * 11}
      />

      <mesh rotation={[Math.PI / 2.35, 0.25, 0.2]}>
        <torusGeometry args={[skill.size * 2.08, 0.027, 12, 64]} />
        <meshBasicMaterial
          color={skill.color}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh rotation={[0.65, -0.45, 1.1]}>
        <torusGeometry args={[skill.size * 2.37, 0.012, 12, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.42} />
      </mesh>

      <mesh scale={1.42}>
        <sphereGeometry args={[skill.size, 32, 32]} />
        <meshBasicMaterial
          color={skill.color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SKILL PLANET                                */
/* -------------------------------------------------------------------------- */

/**
 * Planeta clicable que representa una soft skill.
 */
function SkillPlanet({
  skill,
  isPlaying,
  selected,
  onSelect,
}: {
  skill: SoftSkill;
  isPlaying: boolean;
  selected: boolean;
  onSelect: (skill: SoftSkill) => void;
}) {
  const orbit = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!orbit.current) return;

    const time = state.clock.getElapsedTime();

    /* Movimiento orbital. */
    if (isPlaying) {
      const angle = time * skill.speed + skill.startAngle;
      const x = Math.cos(angle) * skill.radius;
      const depth =
        Math.sin(angle) * skill.radius * skill.ellipse;

      orbit.current.position.set(
        x,
        depth * Math.sin(skill.tilt),
        depth * Math.cos(skill.tilt),
      );
    }

    /* Escalado suave al seleccionar. */
    const targetScale = selected ? 1.22 : 1;

    orbit.current.scale.setScalar(
      THREE.MathUtils.lerp(
        orbit.current.scale.x,
        targetScale,
        delta * 5,
      ),
    );

    /* Rotación del planeta sobre sí mismo. */
    if (body.current) {
      body.current.rotation.y += delta * 0.32;
      body.current.rotation.x += delta * 0.06;
    }
  });

  return (
    <group ref={orbit}>
      <pointLight
        color={skill.color}
        intensity={3.5}
        distance={skill.size * 7}
      />

      {/* Cuerpo principal interactivo. */}
      <mesh
        ref={body}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(skill);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[skill.size, 48, 48]} />
        <meshStandardMaterial
          color={skill.color}
          emissive={skill.secondaryColor}
          emissiveIntensity={selected ? 1.15 : 0.68}
          metalness={0.36}
          roughness={0.28}
        />
      </mesh>

      {/* Atmósfera de brillo. */}
      <mesh scale={1.11}>
        <sphereGeometry args={[skill.size, 32, 32]} />
        <meshBasicMaterial
          color={skill.color}
          transparent
          opacity={selected ? 0.24 : 0.13}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Malla decorativa. */}
      <mesh scale={1.025} rotation={[0.3, 0.4, 0]}>
        <sphereGeometry args={[skill.size, 16, 16]} />
        <meshBasicMaterial
          color={skill.secondaryColor}
          transparent
          opacity={0.32}
          wireframe
        />
      </mesh>

      {/* Anillo decorativo. */}
      <mesh rotation={[Math.PI / 2.5, 0.3, 0.2]}>
        <torusGeometry args={[skill.size * 1.46, 0.018, 12, 64]} />
        <meshBasicMaterial
          color={skill.color}
          transparent
          opacity={0.6}
        />
      </mesh>

      <SkillSelection skill={skill} selected={selected} />

      {/* Etiqueta HTML suspendida sobre el planeta. */}
      <Html
        position={[0, skill.size * 1.75, 0]}
        center
        distanceFactor={11}
        style={{ pointerEvents: 'none' }}
      >
        <span
          className={`universe-planet-label${selected ? ' is-selected' : ''
            }`}
        >
          <small>{skill.label}</small>
          {skill.title}
        </span>
      </Html>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 HUMAN CORE                                 */
/* -------------------------------------------------------------------------- */

/**
 * Núcleo 3D central de la galaxia de habilidades personales.
 */
function HumanCore({ isPlaying }: { isPlaying: boolean }) {
  const core = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!core.current || !isPlaying) return;

    core.current.rotation.y += delta * 0.18;
    core.current.rotation.x += delta * 0.05;
  });

  return (
    <Float speed={0.9} rotationIntensity={0.14} floatIntensity={0.42}>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[1.6, 2]} />
          <meshStandardMaterial
            color="#ff8ac3"
            emissive="#9a215c"
            emissiveIntensity={1}
            metalness={0.72}
            roughness={0.21}
            wireframe
          />
        </mesh>

        <mesh scale={0.65}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            color="#421125"
            emissive="#8f234f"
            emissiveIntensity={1.15}
            metalness={0.4}
            roughness={0.25}
            transparent
            opacity={0.88}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.026, 12, 64]} />
          <meshBasicMaterial
            color="#ff7eb6"
            transparent
            opacity={0.76}
          />
        </mesh>

        <mesh rotation={[0.74, 0.45, 1.1]}>
          <torusGeometry args={[2.52, 0.018, 12, 64]} />
          <meshBasicMaterial
            color="#ffd166"
            transparent
            opacity={0.62}
          />
        </mesh>

        <mesh rotation={[1.2, -0.42, 0.3]}>
          <torusGeometry args={[1.9, 0.015, 12, 64]} />
          <meshBasicMaterial
            color="#b8f28b"
            transparent
            opacity={0.62}
          />
        </mesh>

        <Html
          position={[0, -2.95, 0]}
          center
          distanceFactor={11}
          style={{ pointerEvents: 'none' }}
        >
          <span className="universe-core-label soft-core-label">
            HUMAN SYSTEMS / CORE
          </span>
        </Html>
      </group>
    </Float>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SOFT SKILLS UNIVERSE                            */
/* -------------------------------------------------------------------------- */

/**
 * Galaxia de habilidades personales.
 *
 * En móvil:
 * - Seleccionar un planeta oculta GalaxyNavigator.
 * - GalaxyNavigator contiene GALAXY MAP, TECH HUMAN y CORE.
 * - Cerrar la ficha, Escape o "Volver al mapa" recupera el menú.
 *
 * En escritorio:
 * - El navegador de galaxias siempre es visible.
 */
function SoftSkillsUniverse({
  onClose,
  onGalaxyNavigate,
}: SoftSkillsUniverseProps) {
  const [selectedSkill, setSelectedSkill] =
    useState<SoftSkill | null>(null);

  /**
   * Controla solo la visibilidad móvil del menú GalaxyNavigator.
   */
  const [isGalaxyNavigatorVisible, setIsGalaxyNavigatorVisible] =
    useState(true);

  const isMobile = useIsMobile(768);

  /**
   * Respeta la preferencia del usuario que haya reducido animaciones.
   */
  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window === 'undefined') return true;

    return !window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  });

  /**
   * Abre la información de una skill.
   * En móvil, deja espacio para el panel y oculta el navegador.
   */
  const handleSkillSelect = (skill: SoftSkill) => {
    setSelectedSkill(skill);

    if (isMobile) {
      setIsGalaxyNavigatorVisible(false);
    }
  };

  /**
   * Cierra el inspector y recupera el menú en móvil.
   */
  const handleCloseSkillInspector = () => {
    setSelectedSkill(null);

    if (isMobile) {
      setIsGalaxyNavigatorVisible(true);
    }
  };

  /**
   * Vuelve al estado inicial del mapa.
   */
  const handleBackToMap = () => {
    setSelectedSkill(null);
    setIsGalaxyNavigatorVisible(true);
  };

  /**
   * Escape cierra la información de la habilidad seleccionada.
   */
  useEffect(() => {
    if (!selectedSkill) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseSkillInspector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSkill, isMobile]);

  /**
   * Si se amplía la ventana a escritorio, vuelve a hacer visible el menú.
   */
  useEffect(() => {
    if (!isMobile) {
      setIsGalaxyNavigatorVisible(true);
    }
  }, [isMobile]);

  /**
   * Escritorio: siempre se muestra.
   * Móvil: solo mientras no se abre un planeta.
   */
  const shouldShowGalaxyNavigator =
    !isMobile || isGalaxyNavigatorVisible;

  return (
    <section
      className="universe-mode soft-skills-universe"
      aria-label="Galaxia de habilidades personales"
    >
      {/* Escena 3D. */}
      <div className="universe-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 1.5, 17], fov: 48 }}
          dpr={[1, 1.7]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.45} />

          <pointLight
            position={[3, 5, 5]}
            intensity={24}
            color="#ff7eb6"
          />

          <pointLight
            position={[-5, -3, 3]}
            intensity={15}
            color="#ffd166"
          />

          <Stars
            radius={80}
            depth={50}
            count={2500}
            factor={4}
            saturation={0.3}
            fade
            speed={0.5}
          />

          <Sparkles
            count={540}
            scale={[22, 16, 13]}
            size={2.25}
            speed={isPlaying ? 0.25 : 0.03}
            color="#ffd6e9"
            opacity={0.78}
          />

          {/* Órbitas de las habilidades. */}
          {softSkills.map((skill) => (
            <SkillOrbit
              key={`orbit-${skill.id}`}
              skill={skill}
            />
          ))}

          {/* Meteoros decorativos. */}
          <ShootingStar
            color="#ffd6e9"
            delay={0}
            speed={0.035}
            start={[-14, 8, -5]}
            end={[14, 0.5, -4]}
          />

          <ShootingStar
            color="#ffd166"
            delay={0.5}
            speed={0.028}
            start={[14, 6.5, -6]}
            end={[-14, -2, -5]}
          />

          {/* Núcleo humano central. */}
          <HumanCore isPlaying={isPlaying} />

          {/* Planetas de soft skills. */}
          {softSkills.map((skill) => (
            <SkillPlanet
              key={skill.id}
              skill={skill}
              isPlaying={isPlaying}
              selected={selectedSkill?.id === skill.id}
              onSelect={handleSkillSelect}
            />
          ))}

          {/* Control de cámara. */}
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={7}
            maxDistance={27}
            autoRotate={isPlaying}
            autoRotateSpeed={0.16}
          />
        </Canvas>
      </div>

      {/* Cabecera visible de la galaxia. */}
      <div className="universe-header soft-skills-header">
        <p className="universe-kicker">RELIVERS / HUMAN SYSTEMS</p>
        <h2>Galaxia Soft Skills</h2>
        <p>
          Las habilidades personales que sostienen mi forma de trabajar
          con tecnología y con personas.
        </p>
      </div>

      {/* Sale de la galaxia y vuelve al portfolio principal. */}
      <button
        type="button"
        className="universe-close-button"
        onClick={onClose}
      >
        ← Volver al portfolio
      </button>

      {/* Se oculta al seleccionar una habilidad únicamente en móvil. */}
      {shouldShowGalaxyNavigator && (
        <GalaxyNavigator
          activeGalaxy="soft-skills"
          onNavigate={onGalaxyNavigate}
        />
      )}

      {/* Controles de la escena. */}
      <div className="universe-controls">
        <button
          type="button"
          className="universe-play-button"
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? '❚❚ Pausar órbitas' : '▶ Activar órbitas'}
        </button>

        {/* Botón visible solo cuando se abre una skill desde móvil. */}
        {isMobile && selectedSkill && (
          <button
            type="button"
            className="universe-back-to-map-button"
            onClick={handleBackToMap}
          >
            ← Volver al mapa
          </button>
        )}
      </div>

      {/* Guía mostrada antes de seleccionar una habilidad. */}
      {!selectedSkill && (
        <p className="universe-help">
          ARRASTRA PARA EXPLORAR · USA LA RUEDA PARA ACERCARTE · PULSA UN
          PLANETA
        </p>
      )}

      {/* Panel de información de la habilidad seleccionada. */}
      <aside
        className={`planet-inspector soft-skills-inspector${selectedSkill ? ' is-visible' : ''
          }`}
        aria-live="polite"
        aria-hidden={!selectedSkill}
      >
        <button
          type="button"
          className="planet-inspector-close"
          aria-label="Cerrar información"
          onClick={handleCloseSkillInspector}
        >
          ×
        </button>

        <p className="planet-inspector-label">
          {selectedSkill?.label || ''}
        </p>

        <h3 style={{ color: selectedSkill?.color }}>
          {selectedSkill?.title || ''}
        </h3>

        <p>{selectedSkill?.description || ''}</p>
      </aside>
    </section>
  );
}

export default SoftSkillsUniverse;