/* Canvas crea el área WebGL donde Three.js renderiza objetos 3D.
   useFrame permite ejecutar animaciones en cada fotograma. */
import { Canvas, useFrame } from '@react-three/fiber';

/* Float aplica movimiento flotante suave.
   OrbitControls permite girar la cámara arrastrando.
   Sparkles crea partículas luminosas de fondo. */
import { Float, OrbitControls, Sparkles } from '@react-three/drei';

/* THREE proporciona tipos y clases de Three.js.
   Aquí lo usamos para indicar que una referencia apunta a Group o Mesh. */
import * as THREE from 'three';

/* useRef guarda referencias persistentes a objetos 3D.
   Cambiar esas referencias no obliga a React a renderizar de nuevo. */
import { useRef } from 'react';

/* Define los datos que necesita cada planeta tecnológico. */
type TechSatelliteProps = {
  /* Ángulo inicial de la órbita.
     Permite que los nodos empiecen en posiciones diferentes. */
  angle: number;

  /* Distancia entre el planeta y el núcleo. */
  radius: number;

  /* Velocidad de movimiento del planeta. */
  speed: number;

  /* Color hexadecimal del planeta. */
  color: string;

  /* Radio de la geometría de esfera. */
  size: number;

  /* Texto que identifica la tecnología representada por el planeta. */
  technology: string;

  /* Función recibida desde App.tsx.
     Se ejecuta al pulsar un planeta y envía su tecnología seleccionada. */
  onSelectTechnology: (technology: string) => void;
};

/* Componente reutilizable para crear un planeta orbital. */
function TechSatellite({
  angle,
  radius,
  speed,
  color,
  size,
  technology,
  onSelectTechnology,
}: TechSatelliteProps) {
  /* Referencia a la esfera 3D para actualizar su posición continuamente. */
  const satelliteReference = useRef<THREE.Mesh>(null);

  /* useFrame se ejecuta mientras la escena está activa.
     Se usa para mover cada planeta en una órbita. */
  useFrame((state) => {
    /* Si la esfera no se ha creado todavía, no hacemos nada. */
    if (!satelliteReference.current) {
      return;
    }

    /* Segundos desde que empezó a renderizarse la escena. */
    const time = state.clock.getElapsedTime();

    /* Ángulo actual:
       - time * speed mueve el planeta.
       - angle deja cada planeta en una posición inicial distinta. */
    const currentAngle = time * speed + angle;

    /* Movimiento horizontal de la órbita. */
    satelliteReference.current.position.x =
      Math.cos(currentAngle) * radius;

    /* Movimiento vertical: multiplicamos por 0.45 para formar una elipse. */
    satelliteReference.current.position.y =
      Math.sin(currentAngle) * radius * 0.45;

    /* Profundidad: hace que la trayectoria se perciba en 3D. */
    satelliteReference.current.position.z =
      Math.sin(currentAngle) * radius * 0.35;
  });

  return (
    /* mesh es un objeto 3D formado por una geometría y un material. */
    <mesh
      ref={satelliteReference}
      /* Ejecuta la función de App.tsx al pulsar el planeta. */
      onClick={(event) => {
        /* Evita que el clic llegue a otros objetos o controles de la escena. */
        event.stopPropagation();

        /* Envía el nombre de la tecnología al componente App. */
        onSelectTechnology(technology);
      }}
      /* Cambia el cursor a mano para indicar que el planeta es interactivo. */
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      /* Restaura el cursor normal al abandonar el planeta. */
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Geometría: esfera formada por segmentos suaves. */}
      <sphereGeometry args={[size, 24, 24]} />

      {/* Material brillante.
         emissive hace que parezca que el planeta emite luz propia. */}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.8}
        metalness={0.35}
        roughness={0.25}
      />
    </mesh>
  );
}

/* Define qué datos necesita el núcleo para comunicar clics a App.tsx. */
type TechCoreProps = {
  /* Función que recibe la tecnología del planeta seleccionado. */
  onSelectTechnology: (technology: string) => void;
};

/* Núcleo central con anillos y planetas tecnológicos. */
function TechCore({ onSelectTechnology }: TechCoreProps) {
  /* Referencia al grupo central para girarlo de forma continua. */
  const coreReference = useRef<THREE.Group>(null);

  /* Animación de rotación suave del núcleo y sus planetas. */
  useFrame((state) => {
    /* Si el grupo aún no está disponible, se detiene esta ejecución. */
    if (!coreReference.current) {
      return;
    }

    /* Rotación horizontal lenta. */
    coreReference.current.rotation.y =
      state.clock.getElapsedTime() * 0.22;

    /* Rotación vertical aún más suave para dar profundidad. */
    coreReference.current.rotation.x =
      state.clock.getElapsedTime() * 0.08;
  });

  return (
    /* Float añade una oscilación vertical y giro suave al sistema completo. */
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.65}>
      {/* group permite mover, girar y escalar todos los elementos juntos. */}
      <group ref={coreReference}>
        {/* Icosaedro en wireframe: estructura exterior del núcleo. */}
        <mesh>
          {/* args: radio 1.45 y nivel de detalle 2. */}
          <icosahedronGeometry args={[1.45, 2]} />

          {/* wireframe dibuja solo las líneas de la figura geométrica. */}
          <meshStandardMaterial
            color="#39d4ff"
            emissive="#0a8bb8"
            emissiveIntensity={0.75}
            metalness={0.85}
            roughness={0.25}
            wireframe
          />
        </mesh>

        {/* Esfera interior translúcida para generar sensación de profundidad. */}
        <mesh scale={0.72}>
          <sphereGeometry args={[1, 32, 32]} />

          <meshStandardMaterial
            color="#0c2c43"
            emissive="#06354d"
            emissiveIntensity={0.9}
            metalness={0.55}
            roughness={0.2}
            transparent
            opacity={0.72}
          />
        </mesh>

        {/* Anillo principal de la órbita cian. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.05, 0.025, 12, 90]} />
          <meshBasicMaterial
            color="#39d4ff"
            transparent
            opacity={0.72}
          />
        </mesh>

        {/* Segundo anillo violeta, inclinado para reforzar el efecto 3D. */}
        <mesh rotation={[0.65, 0.35, 1.1]}>
          <torusGeometry args={[2.35, 0.018, 12, 90]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.55}
          />
        </mesh>

        {/* Tercer anillo verde. */}
        <mesh rotation={[1.15, -0.45, 0.3]}>
          <torusGeometry args={[1.82, 0.014, 12, 90]} />
          <meshBasicMaterial
            color="#34d399"
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Nodo cian: desarrollo web con React y TypeScript. */}
        <TechSatellite
          angle={0}
          radius={2.05}
          speed={0.65}
          color="#39d4ff"
          size={0.12}
          technology="Web · React · TypeScript"
          onSelectTechnology={onSelectTechnology}
        />

        {/* Nodo azul: Java y desarrollo de APIs backend. */}
        <TechSatellite
          angle={1.25}
          radius={2.35}
          speed={0.48}
          color="#60a5fa"
          size={0.11}
          technology="Java · Spring Boot · API REST"
          onSelectTechnology={onSelectTechnology}
        />

        {/* Nodo violeta: Kotlin, Android y Jetpack Compose. */}
        <TechSatellite
          angle={2.5}
          radius={1.82}
          speed={0.78}
          color="#a78bfa"
          size={0.1}
          technology="Kotlin · Android · Jetpack Compose"
          onSelectTechnology={onSelectTechnology}
        />

        {/* Nodo verde: SQL, PostgreSQL, Docker y sistemas. */}
        <TechSatellite
          angle={3.75}
          radius={2.35}
          speed={0.55}
          color="#34d399"
          size={0.1}
          technology="SQL · PostgreSQL · Docker · Sistemas"
          onSelectTechnology={onSelectTechnology}
        />

        {/* Nodo ámbar: AWS, cloud y despliegue. */}
        <TechSatellite
          angle={5}
          radius={2.05}
          speed={0.72}
          color="#fbbf24"
          size={0.11}
          technology="AWS EC2 · Cloud · Despliegue"
          onSelectTechnology={onSelectTechnology}
        />
      </group>
    </Float>
  );
}

/* Props del componente exterior de la escena. */
type NetworkSceneProps = {
  /* Función que App.tsx usará cuando el usuario pulse un planeta. */
  onSelectTechnology: (technology: string) => void;
};

/* Componente que crea el Canvas, las luces, el fondo y los controles. */
function NetworkScene({ onSelectTechnology }: NetworkSceneProps) {
  return (
    /* Canvas es el área donde React Three Fiber renderiza WebGL. */
    <Canvas
      /* position: posición inicial de la cámara.
         fov: campo de visión, similar al zoom de una cámara. */
      camera={{ position: [0, 0, 7], fov: 45 }}
      /* Limita densidad de píxeles para equilibrar calidad y rendimiento. */
      dpr={[1, 1.5]}
      /* antialias suaviza bordes; alpha permite fondo transparente. */
      gl={{ antialias: true, alpha: true }}
    >
      {/* Luz ambiental: ilumina toda la escena de forma uniforme. */}
      <ambientLight intensity={0.55} />

      {/* Luz principal cian: ilumina desde arriba a la derecha. */}
      <pointLight position={[4, 3, 4]} intensity={18} color="#39d4ff" />

      {/* Luz secundaria violeta: aporta contraste y profundidad. */}
      <pointLight position={[-4, -2, 2]} intensity={10} color="#8b5cf6" />

      {/* Partículas luminosas del fondo. */}
      <Sparkles
        count={95}
        scale={[7, 7, 4]}
        size={2}
        speed={0.3}
        color="#8ee8ff"
        opacity={0.75}
      />

      {/* Núcleo y planetas. Le enviamos la función de clic desde App.tsx. */}
      <TechCore onSelectTechnology={onSelectTechnology} />

      {/* Permite girar la cámara arrastrando.
         El zoom y el desplazamiento lateral se desactivan para
         mantener el panel 3D controlado. */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
      />
    </Canvas>
  );
}

/* Permite importar NetworkScene desde App.tsx. */
export default NetworkScene;