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
 * Datos visuales, de órbita y de navegación para cada planeta del universo.
 */
type PlanetData = {
  id: string;
  title: string;
  tech: string;
  description: string;
  buttonLabel: string;
  targetSection: string;
  color: string;
  secondaryColor: string;
  initialAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  orbitTilt: number;
  orbitEllipse: number;
};

/**
 * Callbacks que entrega el componente padre a UniverseMode.
 */
type UniverseModeProps = {
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onGalaxyNavigate: (galaxy: GalaxyId) => void;
};

/**
 * Props necesarias para dibujar y animar un planeta.
 */
type PlanetProps = {
  planet: PlanetData;
  isPlaying: boolean;
  isSelected: boolean;
  onSelect: (planet: PlanetData) => void;
};

/**
 * Props para una estrella fugaz.
 */
type MeteorProps = {
  color: string;
  delay: number;
  speed: number;
  start: [number, number, number];
  end: [number, number, number];
};

/* -------------------------------------------------------------------------- */
/*                                  PLANETS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Catálogo de planetas/áreas del portfolio.
 * targetSection debe coincidir con los id de las secciones de tu portfolio.
 */
const planets: PlanetData[] = [
  {
    id: 'web',
    title: 'Web / React',
    tech: 'REACT · TYPESCRIPT',
    description:
      'Desarrollo web con React, TypeScript, JavaScript, HTML5 y CSS3. Este portfolio es mi laboratorio para aprender componentes, estado, animaciones y gráficos 3D.',
    buttonLabel: 'Ver stack tecnológico',
    targetSection: 'tecnologias',
    color: '#39d4ff',
    secondaryColor: '#056b9a',
    initialAngle: 0.15,
    orbitRadius: 3.85,
    orbitSpeed: 0.44,
    size: 0.46,
    orbitTilt: 0.18,
    orbitEllipse: 0.72,
  },
  {
    id: 'backend',
    title: 'Java / Backend',
    tech: 'JAVA · SPRING BOOT',
    description:
      'Desarrollo de APIs REST y servicios con Java, Spring Boot, JPA/Hibernate y autenticación JWT. También cuento con experiencia práctica en SQL y Core Banking.',
    buttonLabel: 'Ver proyectos',
    targetSection: 'proyectos',
    color: '#60a5fa',
    secondaryColor: '#163d94',
    initialAngle: 1.35,
    orbitRadius: 6.15,
    orbitSpeed: 0.22,
    size: 0.9,
    orbitTilt: 0.52,
    orbitEllipse: 0.82,
  },
  {
    id: 'android',
    title: 'Kotlin / Android',
    tech: 'KOTLIN · ANDROID',
    description:
      'Desarrollo Android con Kotlin, Jetpack Compose, Room, Flow y MVVM. RecordNote es el proyecto que reúne esta parte de mi perfil.',
    buttonLabel: 'Explorar RecordNote',
    targetSection: 'proyectos',
    color: '#a78bfa',
    secondaryColor: '#5626a7',
    initialAngle: 2.75,
    orbitRadius: 4.95,
    orbitSpeed: 0.31,
    size: 1.05,
    orbitTilt: -0.42,
    orbitEllipse: 0.64,
  },
  {
    id: 'systems',
    title: 'SQL / Sistemas',
    tech: 'SQL · DOCKER · LINUX',
    description:
      'Trabajo con SQL, PostgreSQL, MySQL, Oracle, Docker y sistemas técnicos. La experiencia en electrónica y Core Banking me aporta perspectiva sobre diagnóstico y fiabilidad.',
    buttonLabel: 'Ver trayectoria',
    targetSection: 'trayectoria',
    color: '#34d399',
    secondaryColor: '#087553',
    initialAngle: 4.1,
    orbitRadius: 8.15,
    orbitSpeed: 0.16,
    size: 0.76,
    orbitTilt: 0.74,
    orbitEllipse: 0.76,
  },
  {
    id: 'cloud',
    title: 'AWS / Cloud',
    tech: 'AWS · EC2 · CLOUD',
    description:
      'Despliegue de servicios en AWS EC2, Docker e infraestructura para mantener disponibles los servicios backend de proyectos como RecordNote.',
    buttonLabel: 'Ver arquitectura',
    targetSection: 'proyectos',
    color: '#fbbf24',
    secondaryColor: '#9a5005',
    initialAngle: 5.25,
    orbitRadius: 6.95,
    orbitSpeed: 0.19,
    size: 0.62,
    orbitTilt: -0.65,
    orbitEllipse: 0.58,
  },
];

/* -------------------------------------------------------------------------- */
/*                                 MOBILE HOOK                                */
/* -------------------------------------------------------------------------- */

/**
 * Detecta si la pantalla está en tamaño móvil.
 * Se actualiza al girar el móvil o redimensionar el navegador.
 */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;

    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleMediaQueryChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleMediaQueryChange();
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [breakpoint]);

  return isMobile;
}

/* -------------------------------------------------------------------------- */
/*                               ORBIT COMPONENT                              */
/* -------------------------------------------------------------------------- */

/**
 * Dibuja la trayectoria elíptica de un planeta.
 */
function OrbitPath({ planet }: { planet: PlanetData }) {
  const points = useMemo(() => {
    return Array.from({ length: 161 }, (_, index) => {
      const angle = (index / 160) * Math.PI * 2;
      const x = Math.cos(angle) * planet.orbitRadius;
      const depth =
        Math.sin(angle) * planet.orbitRadius * planet.orbitEllipse;

      return [
        x,
        depth * Math.sin(planet.orbitTilt),
        depth * Math.cos(planet.orbitTilt),
      ] as [number, number, number];
    });
  }, [planet]);

  return (
    <Line
      points={points}
      color={planet.color}
      lineWidth={0.7}
      transparent
      opacity={0.26}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              SELECTION RINGS                               */
/* -------------------------------------------------------------------------- */

/**
 * Anillos y brillo que solo aparecen cuando un planeta está seleccionado.
 */
function SelectionRings({
  planet,
  isSelected,
}: {
  planet: PlanetData;
  isSelected: boolean;
}) {
  const rings = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rings.current || !isSelected) return;

    const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.1;

    rings.current.scale.setScalar(pulse);
    rings.current.rotation.z += delta * 0.95;
  });

  return (
    <group ref={rings} visible={isSelected}>
      <pointLight
        color={planet.color}
        intensity={isSelected ? 5.5 : 0}
        distance={planet.size * 10}
      />

      <mesh rotation={[Math.PI / 2.35, 0.25, 0.2]}>
        <torusGeometry args={[planet.size * 2.05, 0.027, 12, 64]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh rotation={[0.65, -0.45, 1.1]}>
        <torusGeometry args={[planet.size * 2.34, 0.012, 12, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.42} />
      </mesh>

      <mesh scale={1.42}>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0.11}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PLANET COMPONENT                             */
/* -------------------------------------------------------------------------- */

/**
 * Planeta interactivo: se desplaza por su órbita, gira, ilumina,
 * contiene una luna y permite seleccionar el área correspondiente.
 */
function UniversePlanet({
  planet,
  isPlaying,
  isSelected,
  onSelect,
}: PlanetProps) {
  const orbit = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const moon = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!orbit.current) return;

    const time = state.clock.getElapsedTime();

    /* Mueve el planeta por su órbita cuando las animaciones están activas. */
    if (isPlaying) {
      const angle = time * planet.orbitSpeed + planet.initialAngle;
      const x = Math.cos(angle) * planet.orbitRadius;
      const depth =
        Math.sin(angle) * planet.orbitRadius * planet.orbitEllipse;

      orbit.current.position.set(
        x,
        depth * Math.sin(planet.orbitTilt),
        depth * Math.cos(planet.orbitTilt),
      );
    }

    /* Aumenta suavemente la escala del planeta seleccionado. */
    const targetScale = isSelected ? 1.22 : 1;
    const nextScale = THREE.MathUtils.lerp(
      orbit.current.scale.x,
      targetScale,
      delta * 5,
    );

    orbit.current.scale.setScalar(nextScale);

    /* Rotación propia del planeta. */
    if (body.current) {
      body.current.rotation.y += delta * 0.42;
      body.current.rotation.x += delta * 0.08;
    }

    /* Órbita de la pequeña luna alrededor del planeta. */
    if (moon.current && isPlaying) {
      const moonAngle = time * 1.5 + planet.initialAngle;

      moon.current.position.set(
        Math.cos(moonAngle) * planet.size * 1.8,
        0,
        Math.sin(moonAngle) * planet.size * 1.8,
      );
    }
  });

  return (
    <group ref={orbit}>
      <pointLight
        color={planet.color}
        intensity={3.2}
        distance={planet.size * 7}
      />

      {/* Cuerpo principal. Al tocarlo/clicarlo abre su inspector. */}
      <mesh
        ref={body}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(planet);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[planet.size, 48, 48]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.secondaryColor}
          emissiveIntensity={isSelected ? 1.15 : 0.72}
          metalness={0.5}
          roughness={0.23}
        />
      </mesh>

      {/* Capas visuales de brillo, atmósfera y malla técnica. */}
      <mesh scale={1.1}>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={isSelected ? 0.22 : 0.12}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh scale={1.18}>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshBasicMaterial
          color={planet.secondaryColor}
          transparent
          opacity={0.045}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh scale={1.025} rotation={[0.25, 0.35, 0]}>
        <sphereGeometry args={[planet.size, 16, 16]} />
        <meshBasicMaterial
          color={planet.secondaryColor}
          transparent
          opacity={0.38}
          wireframe
        />
      </mesh>

      {/* Anillo decorativo del planeta. */}
      <mesh rotation={[Math.PI / 2.45, 0.2, 0.3]}>
        <torusGeometry args={[planet.size * 1.48, 0.018, 12, 64]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0.64}
        />
      </mesh>

      {/* Luna que gira alrededor del planeta. */}
      <mesh ref={moon} position={[planet.size * 1.8, 0, 0]}>
        <sphereGeometry args={[planet.size * 0.14, 20, 20]} />
        <meshStandardMaterial
          color="#e7edf5"
          emissive={planet.color}
          emissiveIntensity={2}
          metalness={0.45}
          roughness={0.2}
        />
      </mesh>

      <SelectionRings planet={planet} isSelected={isSelected} />

      {/* Etiqueta HTML flotante sobre el planeta. */}
      <Html
        position={[0, planet.size * 1.7, 0]}
        center
        distanceFactor={11}
        style={{ pointerEvents: 'none' }}
      >
        <span
          className={`universe-planet-label${isSelected ? ' is-selected' : ''
            }`}
        >
          <small>{planet.tech}</small>
          {planet.title}
        </span>
      </Html>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 METEOR TEXTURE                             */
/* -------------------------------------------------------------------------- */

/**
 * Genera una textura Canvas usada por los sprites de las estrellas fugaces.
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

    /* Cola brillante y difuminada. */
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

    /* Núcleo fino y brillante del meteoro. */
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

    /* Cabeza luminosa de la estrella fugaz. */
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
 * Sprite animado que viaja desde start hasta end repetidamente.
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

    /* Solo se muestra durante parte del ciclo. */
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
/*                                    CORE                                    */
/* -------------------------------------------------------------------------- */

/**
 * Núcleo central decorativo de la galaxia tecnológica.
 */
function UniverseCore({ isPlaying }: { isPlaying: boolean }) {
  const core = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!core.current || !isPlaying) return;

    core.current.rotation.y += delta * 0.2;
    core.current.rotation.x += delta * 0.06;
  });

  return (
    <Float speed={1.05} rotationIntensity={0.18} floatIntensity={0.4}>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[1.52, 2]} />
          <meshStandardMaterial
            color="#39d4ff"
            emissive="#087aa8"
            emissiveIntensity={0.95}
            metalness={0.9}
            roughness={0.18}
            wireframe
          />
        </mesh>

        <mesh scale={0.66}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            color="#082d43"
            emissive="#075278"
            emissiveIntensity={1.25}
            metalness={0.5}
            roughness={0.22}
            transparent
            opacity={0.86}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.15, 0.025, 12, 64]} />
          <meshBasicMaterial
            color="#39d4ff"
            transparent
            opacity={0.76}
          />
        </mesh>

        <mesh rotation={[0.72, 0.42, 1.1]}>
          <torusGeometry args={[2.48, 0.018, 12, 64]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.58}
          />
        </mesh>

        <mesh rotation={[1.22, -0.42, 0.3]}>
          <torusGeometry args={[1.86, 0.015, 12, 64]} />
          <meshBasicMaterial
            color="#34d399"
            transparent
            opacity={0.66}
          />
        </mesh>

        <Html
          position={[0, -2.85, 0]}
          center
          distanceFactor={11}
          style={{ pointerEvents: 'none' }}
        >
          <span className="universe-core-label">
            RELIVERS / TECH CORE
          </span>
        </Html>
      </group>
    </Float>
  );
}

/* -------------------------------------------------------------------------- */
/*                                UNIVERSE MODE                               */
/* -------------------------------------------------------------------------- */

/**
 * Escena 3D principal.
 *
 * Comportamiento móvil:
 * - Al abrir la ficha de un planeta, se oculta GalaxyNavigator.
 * - GalaxyNavigator contiene GALAXY MAP, TECH HUMAN y CORE.
 * - Al cerrar la ficha, pulsar Escape o volver al mapa, el menú reaparece.
 *
 * Comportamiento escritorio:
 * - GalaxyNavigator se muestra siempre.
 */
function UniverseMode({
  onClose,
  onNavigate,
  onGalaxyNavigate,
}: UniverseModeProps) {
  const [selectedPlanet, setSelectedPlanet] =
    useState<PlanetData | null>(null);

  const [isGalaxyNavigatorVisible, setIsGalaxyNavigatorVisible] =
    useState(true);

  const isMobile = useIsMobile(768);

  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window === 'undefined') return true;

    return !window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  });

  /**
   * Selecciona un planeta y abre su panel informativo.
   * En móvil oculta el menú para liberar espacio visual.
   */
  const handlePlanetSelect = (planet: PlanetData) => {
    setSelectedPlanet(planet);

    if (isMobile) {
      setIsGalaxyNavigatorVisible(false);
    }
  };

  /**
   * Cierra el panel y recupera el menú en móvil.
   */
  const handleClosePlanetInspector = () => {
    setSelectedPlanet(null);

    if (isMobile) {
      setIsGalaxyNavigatorVisible(true);
    }
  };

  /**
   * Cierra el planeta activo y muestra otra vez el menú del mapa.
   */
  const handleBackToMap = () => {
    setSelectedPlanet(null);
    setIsGalaxyNavigatorVisible(true);
  };

  /**
   * Navega a la sección vinculada con el planeta seleccionado.
   */
  const handleNavigate = () => {
    if (!selectedPlanet) return;

    const sectionId = selectedPlanet.targetSection;

    handleBackToMap();
    onNavigate(sectionId);
  };

  /**
   * Escape cierra el panel activo y restaura el menú móvil.
   */
  useEffect(() => {
    if (!selectedPlanet) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClosePlanetInspector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPlanet, isMobile]);

  /**
   * Si se pasa de móvil a escritorio, garantiza que el menú sea visible.
   */
  useEffect(() => {
    if (!isMobile) {
      setIsGalaxyNavigatorVisible(true);
    }
  }, [isMobile]);

  /**
   * Desktop: siempre visible.
   * Móvil: visible solo si no se ha abierto un planeta.
   */
  const shouldShowGalaxyNavigator =
    !isMobile || isGalaxyNavigatorVisible;

  return (
    <section className="universe-mode" aria-label="Universo tecnológico">
      {/* Fondo y escena 3D de React Three Fiber. */}
      <div className="universe-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 1.5, 17], fov: 48 }}
          dpr={[1, 1.7]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.42} />

          <pointLight
            position={[3, 5, 5]}
            intensity={25}
            color="#39d4ff"
          />

          <pointLight
            position={[-5, -3, 3]}
            intensity={14}
            color="#8b5cf6"
          />

          <Stars
            radius={80}
            depth={50}
            count={2600}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />

          <Sparkles
            count={520}
            scale={[22, 16, 13]}
            size={2.1}
            speed={isPlaying ? 0.28 : 0.03}
            color="#8ee8ff"
            opacity={0.78}
          />

          {/* Trayectorias orbitales. */}
          {planets.map((planet) => (
            <OrbitPath
              key={`path-${planet.id}`}
              planet={planet}
            />
          ))}

          {/* Estrellas fugaces decorativas. */}
          <ShootingStar
            color="#8ee8ff"
            delay={0}
            speed={0.035}
            start={[-14, 8, -5]}
            end={[14, 0.5, -4]}
          />

          <ShootingStar
            color="#c4b5fd"
            delay={0.5}
            speed={0.028}
            start={[14, 6.5, -6]}
            end={[-14, -2, -5]}
          />

          {/* Núcleo central de la galaxia. */}
          <UniverseCore isPlaying={isPlaying} />

          {/* Planetas clicables. */}
          {planets.map((planet) => (
            <UniversePlanet
              key={planet.id}
              planet={planet}
              isPlaying={isPlaying}
              isSelected={selectedPlanet?.id === planet.id}
              onSelect={handlePlanetSelect}
            />
          ))}

          {/* Controles de cámara. */}
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={7}
            maxDistance={27}
            autoRotate={isPlaying}
            autoRotateSpeed={0.18}
          />
        </Canvas>
      </div>

      {/* Título visible de la escena. */}
      <div className="universe-header">
        <p className="universe-kicker">RELIVERS / UNIVERSE MODE</p>
        <h2>Universo tecnológico</h2>
        <p>Explora los planetas y descubre cada área de mi perfil.</p>
      </div>

      {/* Sale del modo universo y vuelve al portfolio normal. */}
      <button
        type="button"
        className="universe-close-button"
        onClick={onClose}
      >
        ← Volver al portfolio
      </button>

      {/* Se oculta en móvil tras pulsar un planeta. */}
      {shouldShowGalaxyNavigator && (
        <GalaxyNavigator
          activeGalaxy="tech"
          onNavigate={onGalaxyNavigate}
        />
      )}

      {/* Controles de animación y regreso al mapa. */}
      <div className="universe-controls">
        <button
          type="button"
          className="universe-play-button"
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? '❚❚ Pausar órbitas' : '▶ Activar órbitas'}
        </button>

        {/* Solo aparece en móvil tras seleccionar un planeta. */}
        {isMobile && selectedPlanet && (
          <button
            type="button"
            className="universe-back-to-map-button"
            onClick={handleBackToMap}
          >
            ← Volver al mapa
          </button>
        )}
      </div>

      {/* Instrucciones solo antes de seleccionar un planeta. */}
      {!selectedPlanet && (
        <p className="universe-help">
          ARRASTRA PARA EXPLORAR · USA LA RUEDA PARA ACERCARTE · PULSA UN
          PLANETA
        </p>
      )}

      {/* Panel informativo del planeta activo. */}
      <aside
        className={`planet-inspector${selectedPlanet ? ' is-visible' : ''
          }`}
        aria-live="polite"
        aria-hidden={!selectedPlanet}
      >
        <button
          type="button"
          className="planet-inspector-close"
          aria-label="Cerrar información del planeta"
          onClick={handleClosePlanetInspector}
        >
          ×
        </button>

        <p className="planet-inspector-label">
          {selectedPlanet?.tech || ''}
        </p>

        <h3 style={{ color: selectedPlanet?.color }}>
          {selectedPlanet?.title || ''}
        </h3>

        <p>{selectedPlanet?.description || ''}</p>

        <button
          type="button"
          className="planet-navigate-button"
          onClick={handleNavigate}
          disabled={!selectedPlanet}
        >
          {selectedPlanet
            ? `${selectedPlanet.buttonLabel} →`
            : 'Explorar →'}
        </button>
      </aside>
    </section>
  );
}

export default UniverseMode;