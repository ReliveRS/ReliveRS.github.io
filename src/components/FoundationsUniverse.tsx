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
 * Datos visuales, orbitales y descriptivos de cada fundamento.
 */
type Foundation = {
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
 * Props recibidas desde el componente principal del portfolio.
 */
type FoundationsUniverseProps = {
  onClose: () => void;
  onGalaxyNavigate: (galaxy: GalaxyId) => void;
};

/**
 * Datos que necesita una estrella fugaz para animarse.
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
 * Detecta si el viewport está en formato móvil.
 *
 * También reacciona a cambios de orientación, por ejemplo,
 * cuando el usuario gira su móvil de vertical a horizontal.
 */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;

    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}

/* -------------------------------------------------------------------------- */
/*                              METEOR TEXTURE                                */
/* -------------------------------------------------------------------------- */

/**
 * Crea una textura Canvas para el sprite de una estrella fugaz.
 *
 * Incluye:
 * - Estela difuminada
 * - Línea central luminosa
 * - Cabeza brillante
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

    /* Estela exterior difuminada. */
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

    /* Núcleo fino y brillante. */
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
 * Sprite animado que viaja desde la posición start hasta end.
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

    /* El meteoro aparece solo durante un tramo de su ciclo. */
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
/*                              FOUNDATIONS DATA                              */
/* -------------------------------------------------------------------------- */

/**
 * Planetas de la galaxia de fundamentos.
 */
const foundations: Foundation[] = [
  {
    id: 'logic',
    title: 'Lógica y flujo',
    label: 'LOGIC / FLOW',
    description:
      'Transformo problemas en pasos claros y verificables usando variables, tipos, condiciones, bucles y funciones.',
    color: '#4cc9f0',
    secondaryColor: '#0b6f96',
    radius: 3.8,
    speed: 0.37,
    startAngle: 0.2,
    tilt: 0.15,
    ellipse: 0.72,
    size: 1.05,
  },
  {
    id: 'oop',
    title: 'POO y diseño',
    label: 'OOP / DESIGN',
    description:
      'Diseño código mantenible con encapsulación, composición y principios como SOLID, eligiendo abstracciones que aportan valor.',
    color: '#8b5cf6',
    secondaryColor: '#4a1d97',
    radius: 5.55,
    speed: 0.22,
    startAngle: 1.5,
    tilt: 0.5,
    ellipse: 0.8,
    size: 0.82,
  },
  {
    id: 'structures',
    title: 'Estructuras de datos',
    label: 'DATA STRUCTURES',
    description:
      'Selecciono arrays, listas, mapas, conjuntos, pilas o colas según cómo se necesita almacenar, consultar y transformar la información.',
    color: '#2dd4bf',
    secondaryColor: '#0f766e',
    radius: 6.9,
    speed: 0.17,
    startAngle: 3.7,
    tilt: -0.58,
    ellipse: 0.64,
    size: 0.73,
  },
  {
    id: 'algorithms',
    title: 'Algoritmos',
    label: 'ALGORITHMS / COMPLEXITY',
    description:
      'Comparo enfoques, analizo coste temporal y espacial, y priorizo soluciones legibles y eficientes para el contexto.',
    color: '#60a5fa',
    secondaryColor: '#1d4ed8',
    radius: 7.9,
    speed: 0.14,
    startAngle: 5,
    tilt: 0.75,
    ellipse: 0.76,
    size: 0.68,
  },
  {
    id: 'quality',
    title: 'Depuración y calidad',
    label: 'DEBUG / TEST',
    description:
      'Investigo errores con método, uso logs y pruebas, cubro casos límite y reviso el código antes de dar una solución por válida.',
    color: '#e0f2fe',
    secondaryColor: '#6b8ca5',
    radius: 5,
    speed: 0.27,
    startAngle: 2.6,
    tilt: -0.35,
    ellipse: 0.58,
    size: 0.9,
  },
];

/* -------------------------------------------------------------------------- */
/*                              FOUNDATION ORBIT                              */
/* -------------------------------------------------------------------------- */

/**
 * Dibuja la trayectoria elíptica de un planeta de fundamentos.
 */
function FoundationOrbit({
  foundation,
}: {
  foundation: Foundation;
}) {
  const points = useMemo(() => {
    return Array.from({ length: 161 }, (_, index) => {
      const angle = (index / 160) * Math.PI * 2;
      const x = Math.cos(angle) * foundation.radius;

      const depth =
        Math.sin(angle) * foundation.radius * foundation.ellipse;

      return [
        x,
        depth * Math.sin(foundation.tilt),
        depth * Math.cos(foundation.tilt),
      ] as [number, number, number];
    });
  }, [foundation]);

  return (
    <Line
      points={points}
      color={foundation.color}
      lineWidth={0.7}
      transparent
      opacity={0.27}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                            FOUNDATION SELECTION                            */
/* -------------------------------------------------------------------------- */

/**
 * Añade anillos, halo y luz extra a un planeta seleccionado.
 */
function FoundationSelection({
  foundation,
  selected,
}: {
  foundation: Foundation;
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
        color={foundation.color}
        intensity={selected ? 5.5 : 0}
        distance={foundation.size * 11}
      />

      <mesh rotation={[Math.PI / 2.35, 0.25, 0.2]}>
        <torusGeometry args={[foundation.size * 2.08, 0.027, 12, 64]} />
        <meshBasicMaterial
          color={foundation.color}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh rotation={[0.65, -0.45, 1.1]}>
        <torusGeometry args={[foundation.size * 2.37, 0.012, 12, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.42} />
      </mesh>

      <mesh scale={1.42}>
        <sphereGeometry args={[foundation.size, 32, 32]} />
        <meshBasicMaterial
          color={foundation.color}
          transparent
          opacity={0.11}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FOUNDATION PLANET                             */
/* -------------------------------------------------------------------------- */

/**
 * Planeta interactivo que representa un fundamento de programación.
 */
function FoundationPlanet({
  foundation,
  isPlaying,
  selected,
  onSelect,
}: {
  foundation: Foundation;
  isPlaying: boolean;
  selected: boolean;
  onSelect: (foundation: Foundation) => void;
}) {
  const orbit = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!orbit.current) return;

    const time = state.clock.getElapsedTime();

    /* Movimiento por la órbita elíptica. */
    if (isPlaying) {
      const angle = time * foundation.speed + foundation.startAngle;
      const x = Math.cos(angle) * foundation.radius;

      const depth =
        Math.sin(angle) * foundation.radius * foundation.ellipse;

      orbit.current.position.set(
        x,
        depth * Math.sin(foundation.tilt),
        depth * Math.cos(foundation.tilt),
      );
    }

    /* Escala más grande cuando el planeta está seleccionado. */
    const targetScale = selected ? 1.22 : 1;

    const nextScale = THREE.MathUtils.lerp(
      orbit.current.scale.x,
      targetScale,
      delta * 5,
    );

    orbit.current.scale.setScalar(nextScale);

    /* Rotación interna del planeta. */
    if (body.current) {
      body.current.rotation.y += delta * 0.34;
      body.current.rotation.x += delta * 0.06;
    }
  });

  return (
    <group ref={orbit}>
      <pointLight
        color={foundation.color}
        intensity={3.5}
        distance={foundation.size * 7}
      />

      {/* Cuerpo principal: al tocarlo se selecciona el fundamento. */}
      <mesh
        ref={body}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(foundation);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[foundation.size, 48, 48]} />

        <meshStandardMaterial
          color={foundation.color}
          emissive={foundation.secondaryColor}
          emissiveIntensity={selected ? 1.15 : 0.7}
          metalness={0.55}
          roughness={0.2}
        />
      </mesh>

      {/* Atmósfera exterior luminosa. */}
      <mesh scale={1.1}>
        <sphereGeometry args={[foundation.size, 32, 32]} />

        <meshBasicMaterial
          color={foundation.color}
          transparent
          opacity={selected ? 0.23 : 0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Malla decorativa técnica. */}
      <mesh scale={1.025} rotation={[0.3, 0.4, 0]}>
        <sphereGeometry args={[foundation.size, 16, 16]} />

        <meshBasicMaterial
          color={foundation.secondaryColor}
          transparent
          opacity={0.36}
          wireframe
        />
      </mesh>

      {/* Anillo del planeta. */}
      <mesh rotation={[Math.PI / 2.5, 0.3, 0.2]}>
        <torusGeometry args={[foundation.size * 1.46, 0.018, 12, 64]} />

        <meshBasicMaterial
          color={foundation.color}
          transparent
          opacity={0.6}
        />
      </mesh>

      <FoundationSelection
        foundation={foundation}
        selected={selected}
      />

      {/* Etiqueta HTML flotante. */}
      <Html
        position={[0, foundation.size * 1.75, 0]}
        center
        distanceFactor={11}
        style={{ pointerEvents: 'none' }}
      >
        <span
          className={`universe-planet-label${selected ? ' is-selected' : ''
            }`}
        >
          <small>{foundation.label}</small>
          {foundation.title}
        </span>
      </Html>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PROGRAMMING CORE                             */
/* -------------------------------------------------------------------------- */

/**
 * Núcleo central de la galaxia de fundamentos de programación.
 */
function ProgrammingCore({ isPlaying }: { isPlaying: boolean }) {
  const core = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!core.current || !isPlaying) return;

    core.current.rotation.y += delta * 0.2;
    core.current.rotation.x += delta * 0.05;
  });

  return (
    <Float speed={0.95} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={core}>
        <mesh>
          <octahedronGeometry args={[1.6, 2]} />

          <meshStandardMaterial
            color="#4cc9f0"
            emissive="#0c6f98"
            emissiveIntensity={1}
            metalness={0.85}
            roughness={0.16}
            wireframe
          />
        </mesh>

        <mesh scale={0.65}>
          <sphereGeometry args={[1, 48, 48]} />

          <meshStandardMaterial
            color="#071c34"
            emissive="#123b6f"
            emissiveIntensity={1.2}
            metalness={0.5}
            roughness={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.026, 12, 64]} />

          <meshBasicMaterial
            color="#4cc9f0"
            transparent
            opacity={0.78}
          />
        </mesh>

        <mesh rotation={[0.74, 0.45, 1.1]}>
          <torusGeometry args={[2.52, 0.018, 12, 64]} />

          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.62}
          />
        </mesh>

        <mesh rotation={[1.2, -0.42, 0.3]}>
          <torusGeometry args={[1.9, 0.015, 12, 64]} />

          <meshBasicMaterial
            color="#2dd4bf"
            transparent
            opacity={0.65}
          />
        </mesh>

        <Html
          position={[0, -2.95, 0]}
          center
          distanceFactor={11}
          style={{ pointerEvents: 'none' }}
        >
          <span className="universe-core-label foundation-core-label">
            PROGRAMMING MINDSET / CORE
          </span>
        </Html>
      </group>
    </Float>
  );
}

/* -------------------------------------------------------------------------- */
/*                            FOUNDATIONS UNIVERSE                            */
/* -------------------------------------------------------------------------- */

/**
 * Galaxia de fundamentos de programación.
 *
 * En móvil:
 * - Al tocar un planeta desaparece GalaxyNavigator.
 * - Esto oculta GALAXY MAP, TECH HUMAN y CORE.
 * - Al cerrar el inspector o volver al mapa, GalaxyNavigator reaparece.
 *
 * En ordenador:
 * - GalaxyNavigator siempre permanece visible.
 */
function FoundationsUniverse({
  onClose,
  onGalaxyNavigate,
}: FoundationsUniverseProps) {
  const [selectedFoundation, setSelectedFoundation] =
    useState<Foundation | null>(null);

  /**
   * Estado específico de móvil para ocultar o mostrar GalaxyNavigator.
   */
  const [isGalaxyNavigatorVisible, setIsGalaxyNavigatorVisible] =
    useState(true);

  const isMobile = useIsMobile(768);

  /**
   * Inicia animaciones salvo que el usuario haya solicitado
   * reducir movimiento desde su sistema operativo.
   */
  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window === 'undefined') return true;

    return !window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  });

  /**
   * Abre la información del planeta seleccionado.
   * En móvil, oculta la navegación para dejar espacio al contenido.
   */
  const handleFoundationSelect = (foundation: Foundation) => {
    setSelectedFoundation(foundation);

    if (isMobile) {
      setIsGalaxyNavigatorVisible(false);
    }
  };

  /**
   * Cierra la ficha y recupera el menú en móvil.
   */
  const handleCloseFoundationInspector = () => {
    setSelectedFoundation(null);

    if (isMobile) {
      setIsGalaxyNavigatorVisible(true);
    }
  };

  /**
   * Vuelve a la vista general de la galaxia.
   */
  const handleBackToMap = () => {
    setSelectedFoundation(null);
    setIsGalaxyNavigatorVisible(true);
  };

  /**
   * Permite cerrar el inspector usando Escape.
   */
  useEffect(() => {
    if (!selectedFoundation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseFoundationInspector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFoundation, isMobile]);

  /**
   * Si se pasa a una pantalla de escritorio, el menú se muestra siempre.
   */
  useEffect(() => {
    if (!isMobile) {
      setIsGalaxyNavigatorVisible(true);
    }
  }, [isMobile]);

  /**
   * En escritorio: true siempre.
   * En móvil: depende de si se ha seleccionado un planeta.
   */
  const shouldShowGalaxyNavigator =
    !isMobile || isGalaxyNavigatorVisible;

  return (
    <section
      className="universe-mode foundations-universe"
      aria-label="Galaxia de fundamentos de programación"
    >
      {/* Escena 3D de Three.js. */}
      <div className="universe-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 1.5, 17], fov: 48 }}
          dpr={[1, 1.7]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.42} />

          <pointLight
            position={[3, 5, 5]}
            intensity={24}
            color="#4cc9f0"
          />

          <pointLight
            position={[-5, -3, 3]}
            intensity={15}
            color="#8b5cf6"
          />

          <Stars
            radius={80}
            depth={50}
            count={2700}
            factor={4}
            saturation={0.15}
            fade
            speed={0.5}
          />

          <Sparkles
            count={560}
            scale={[22, 16, 13]}
            size={2.15}
            speed={isPlaying ? 0.25 : 0.03}
            color="#b8f4ff"
            opacity={0.8}
          />

          {/* Dibujar órbitas. */}
          {foundations.map((foundation) => (
            <FoundationOrbit
              key={`orbit-${foundation.id}`}
              foundation={foundation}
            />
          ))}

          {/* Estrellas fugaces. */}
          <ShootingStar
            color="#b8f4ff"
            delay={0.15}
            speed={0.035}
            start={[-14, 8, -5]}
            end={[14, 0.5, -4]}
          />

          <ShootingStar
            color="#8b5cf6"
            delay={0.65}
            speed={0.028}
            start={[14, 6.5, -6]}
            end={[-14, -2, -5]}
          />

          {/* Núcleo central. */}
          <ProgrammingCore isPlaying={isPlaying} />

          {/* Planetas interactivos. */}
          {foundations.map((foundation) => (
            <FoundationPlanet
              key={foundation.id}
              foundation={foundation}
              isPlaying={isPlaying}
              selected={selectedFoundation?.id === foundation.id}
              onSelect={handleFoundationSelect}
            />
          ))}

          {/* Controles de cámara. */}
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

      {/* Título de la galaxia. */}
      <div className="universe-header foundations-header">
        <p className="universe-kicker">RELIVERS / FOUNDATION GALAXY</p>
        <h2>Fundamentos de programación</h2>
        <p>
          Las bases que utilizo para razonar, construir, depurar y mejorar
          software.
        </p>
      </div>

      {/* Salir del modo universo. */}
      <button
        type="button"
        className="universe-close-button"
        onClick={onClose}
      >
        ← Volver al portfolio
      </button>

      {/* Se oculta al seleccionar un planeta solo en móvil. */}
      {shouldShowGalaxyNavigator && (
        <GalaxyNavigator
          activeGalaxy="foundations"
          onNavigate={onGalaxyNavigate}
        />
      )}

      {/* Botones de control. */}
      <div className="universe-controls">
        <button
          type="button"
          className="universe-play-button"
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? '❚❚ Pausar órbitas' : '▶ Activar órbitas'}
        </button>

        {/* Visible solo al seleccionar un planeta desde móvil. */}
        {isMobile && selectedFoundation && (
          <button
            type="button"
            className="universe-back-to-map-button"
            onClick={handleBackToMap}
          >
            ← Volver al mapa
          </button>
        )}
      </div>

      {/* Ayuda inicial del universo. */}
      {!selectedFoundation && (
        <p className="universe-help">
          ARRASTRA PARA EXPLORAR · USA LA RUEDA PARA ACERCARTE · PULSA UN
          PLANETA
        </p>
      )}

      {/* Inspector informativo del planeta seleccionado. */}
      <aside
        className={`planet-inspector foundations-inspector${selectedFoundation ? ' is-visible' : ''
          }`}
        aria-live="polite"
        aria-hidden={!selectedFoundation}
      >
        <button
          type="button"
          className="planet-inspector-close"
          aria-label="Cerrar información"
          onClick={handleCloseFoundationInspector}
        >
          ×
        </button>

        <p className="planet-inspector-label">
          {selectedFoundation?.label || ''}
        </p>

        <h3 style={{ color: selectedFoundation?.color }}>
          {selectedFoundation?.title || ''}
        </h3>

        <p>{selectedFoundation?.description || ''}</p>
      </aside>
    </section>
  );
}

export default FoundationsUniverse;