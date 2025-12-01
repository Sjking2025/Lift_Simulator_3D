import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, ContactShadows, MeshReflectorMaterial, MeshTransmissionMaterial, Text } from "@react-three/drei";
import { EffectComposer, Bloom, SSAO, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useStore } from "./store";

/*
  High Fidelity Elevator Sim:
  - MeshReflectorMaterial for polished floors
  - MeshTransmissionMaterial for premium glass
  - Detailed Environment & Lighting
  - Smart Door Logic
  - Activity Log
*/

function Shaft({ width = 2.4 }) {
  const floors = useStore(s => s.floors);
  const floorHeight = useStore(s => s.floorHeight);

  return (
    <group position={[0, (floors - 1) * floorHeight / 2, 0]}>
      {/* Structural Frame (Dark Metal) */}
      {[
        [width/2, width/2], [-width/2, width/2], 
        [width/2, -width/2], [-width/2, -width/2]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <boxGeometry args={[0.2, floors * floorHeight + 0.5, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Glass Shaft Panels (Premium Transmission) */}
      <group>
        <mesh position={[0, 0, -width/2]}>
          <boxGeometry args={[width, floors * floorHeight, 0.05]} />
          <MeshTransmissionMaterial 
            backside
            thickness={0.2} 
            chromaticAberration={0.05} 
            anisotropy={0.1} 
            distortion={0.1} 
            distortionScale={0.1} 
            temporalDistortion={0.1}
            color="#cbd5e1"
          />
        </mesh>
        <mesh position={[width/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[width, floors * floorHeight, 0.05]} />
          <MeshTransmissionMaterial 
            backside
            thickness={0.2} 
            chromaticAberration={0.05} 
            anisotropy={0.1} 
            distortion={0.1} 
            distortionScale={0.1} 
            temporalDistortion={0.1}
            color="#cbd5e1"
          />
        </mesh>
        <mesh position={[-width/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[width, floors * floorHeight, 0.05]} />
          <MeshTransmissionMaterial 
             backside
             thickness={0.2} 
             chromaticAberration={0.05} 
             anisotropy={0.1} 
             distortion={0.1} 
             distortionScale={0.1} 
             temporalDistortion={0.1}
             color="#cbd5e1"
          />
        </mesh>
      </group>
    </group>
  );
}

function FloorEnvironment({ floorIndex }) {
  const floorHeight = useStore(s => s.floorHeight);
  const y = floorIndex * floorHeight;

  return (
    <group position={[0, y, 0]}>
      {/* Polished Marble Floor */}
      <mesh position={[3, -0.05, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={0.1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#1e293b"
          metalness={0.5}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[3, floorHeight - 0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[6, floorHeight/2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[6, floorHeight]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Side Walls */}
      <mesh position={[3, floorHeight/2, -3]}>
        <planeGeometry args={[6, floorHeight]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>
      <mesh position={[3, floorHeight/2, 3]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6, floorHeight]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Elevator Door Frame */}
      <group position={[1.2, floorHeight/2, 0]}>
         <mesh position={[0, 0, 0.9]}>
            <boxGeometry args={[0.2, floorHeight, 0.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
         </mesh>
         <mesh position={[0, 0, -0.9]}>
            <boxGeometry args={[0.2, floorHeight, 0.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
         </mesh>
         <mesh position={[0, floorHeight/2 - 0.1, 0]}>
            <boxGeometry args={[0.2, 0.2, 2.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
         </mesh>
      </group>

      {/* Floor Number Sign (High Visibility - Side Wall) */}
      <group position={[3, 1.0, -2.9]} rotation={[0, 0, 0]}>
         <mesh>
           <boxGeometry args={[1.5, 0.6, 0.1]} />
           <meshStandardMaterial color="#000" />
         </mesh>
         <Text 
            position={[0, 0, 0.06]} 
            fontSize={0.35} 
            color="#ffffff" 
            anchorX="center" 
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
         >
           {`Floor ${floorIndex}`}
         </Text>
      </group>
      
      {/* Ceiling Light Strip */}
      <mesh position={[3, floorHeight - 0.15, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.2, 4]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ElevatorCar() {
  const ref = useRef();
  const elevatorY = useStore(s => s.elevatorY);
  const doorOpenProgress = useStore(s => s.doorOpenProgress);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = elevatorY;
    }
  });

  return (
    <group ref={ref}>
      {/* Car Shell (Outer) */}
      <group position={[0, 0.75, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 1.5, 2.0]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Interior Cutout */}
        <mesh position={[0, 0, 0.05]}>
           <boxGeometry args={[1.9, 1.4, 1.9]} />
           <meshStandardMaterial color="#e2e8f0" side={THREE.BackSide} roughness={0.3} />
        </mesh>
      </group>

      {/* Floor (Inside Car) */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI/2, 0, 0]}>
         <planeGeometry args={[1.8, 1.8]} />
         <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Ceiling Light (Inside) */}
      <mesh position={[0, 1.45, 0]} rotation={[Math.PI/2, 0, 0]}>
         <planeGeometry args={[1.5, 1.5]} />
         <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.2, 0]} intensity={1} color="#ffffff" distance={3} />

      {/* Sliding Doors (Metallic) */}
      <group position={[0.95, 0.75, 0]}>
         <mesh position={[0, 0, -0.5 * (1 - doorOpenProgress)]}>
            <boxGeometry args={[0.05, 1.4, 0.9]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
         </mesh>
         <mesh position={[0, 0, 0.5 * (1 - doorOpenProgress)]}>
            <boxGeometry args={[0.05, 1.4, 0.9]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
         </mesh>
      </group>
    </group>
  );
}

function Passenger({ p }) {
  const floorHeight = useStore(s => s.floorHeight);
  const elevatorY = useStore(s => s.elevatorY);
  const pos = useMemo(() => new THREE.Vector3(), []);
  
  useFrame((state, dt) => {
    let targetX = p.x;
    let targetY = p.source * floorHeight;
    let targetZ = p.z;

    if (p.state === 'waiting') {
      targetX = 3.5; // Waiting area further back
      targetY = p.source * floorHeight;
    } else if (p.state === 'boarding') {
      targetX = 0; 
      targetY = p.source * floorHeight;
    } else if (p.state === 'in_car') {
      targetX = 0;
      targetY = elevatorY; 
    } else if (p.state === 'exiting') {
      targetX = 4.5; 
      targetY = p.target * floorHeight;
    }

    pos.x += (targetX - pos.x) * 2.0 * dt;
    pos.y += (targetY - pos.y) * 4.0 * dt; 
    pos.z += (targetZ - pos.z) * 2.0 * dt;
  });

  return (
    <group position={pos}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.7, 4, 8]} />
        <meshStandardMaterial color={p.color} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fca5a5" />
      </mesh>
      
      <Html position={[0, 1.5, 0]} center>
        <div style={{ 
          background: "rgba(0,0,0,0.6)", 
          color: "white",
          padding: "2px 6px", 
          borderRadius: "12px", 
          fontSize: "10px", 
          fontWeight: "600",
          textAlign: "center",
          whiteSpace: "nowrap",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <div style={{fontSize: "8px", opacity: 0.8}}>{p.state}</div>
          <div>To: {p.target}</div>
        </div>
      </Html>
    </group>
  );
}

function SimulationLogic() {
  const { 
    floors, floorHeight, 
    elevatorY, setElevatorY, 
    doorState, setDoorState, doorOpenProgress, setDoorProgress,
    carCalls, hallCalls, clearCall, requestFloor,
    passengers, updatePassenger, removePassenger,
    addLog
  } = useStore();

  useFrame((state, dt) => {
    const SPEED = 1.0; 
    const DOOR_SPEED = 1.0; 

    // SMART DOOR LOGIC
    const isBusy = passengers.some(p => 
      (p.state === 'boarding' || p.state === 'exiting') && 
      Math.abs(p.source * floorHeight - elevatorY) < 0.1 
    );

    if (doorState === 'opening') {
      const next = Math.min(1, doorOpenProgress + DOOR_SPEED * dt);
      setDoorProgress(next);
      if (next >= 1) {
        setDoorState('open');
        addLog("Doors fully open");
      }
      return;
    }
    if (doorState === 'closing') {
      if (isBusy) {
        setDoorState('opening');
        addLog("Doors re-opening (Passenger detected)");
        return;
      }
      const next = Math.max(0, doorOpenProgress - DOOR_SPEED * dt);
      setDoorProgress(next);
      if (next <= 0) {
        setDoorState('closed');
        addLog("Doors closed");
        addLog(""); // Spacer
      }
      return;
    }
    if (doorState === 'open') {
      if (isBusy) return;
      return;
    }

    if (doorState === 'closed') {
      let target = null;
      const allCalls = [...carCalls, ...hallCalls.map(h => h.floor)].sort((a, b) => a - b);
      
      if (allCalls.length > 0) {
        const currentFloor = elevatorY / floorHeight;
        const nearest = allCalls.reduce((prev, curr) => 
          Math.abs(curr - currentFloor) < Math.abs(prev - currentFloor) ? curr : prev
        );
        target = nearest;
      }

      if (target !== null) {
        const targetY = target * floorHeight;
        const dy = targetY - elevatorY;
        
        if (Math.abs(dy) < 0.05) {
          setElevatorY(targetY);
          setDoorState('opening');
          addLog(""); // Spacer
          addLog(`Arrived at Floor ${target}`);
          
          setTimeout(() => {
            // 1. Passengers exit
            passengers.forEach(p => {
              if (p.state === 'in_car' && p.target === target) {
                updatePassenger(p.id, { state: 'exiting' });
                addLog(""); // Spacer
                addLog(`Passenger exiting at Floor ${target}`);
                addLog(""); // Spacer
                setTimeout(() => removePassenger(p.id), 4000); 
              }
            });

            // 2. Passengers board
            setTimeout(() => {
              passengers.forEach(p => {
                if (p.state === 'waiting' && p.source === target) {
                  updatePassenger(p.id, { state: 'boarding' });
                  addLog(""); // Spacer
                  addLog(`Passenger boarding at Floor ${target}`);
                  addLog(""); // Spacer
                  setTimeout(() => {
                     updatePassenger(p.id, { state: 'in_car' });
                     requestFloor(p.target, 'car');
                     addLog(`Passenger requested Floor ${p.target}`);
                  }, 2500); 
                }
              });
            }, 1000);

            clearCall(target);

            setTimeout(() => {
               if (useStore.getState().doorState === 'open') {
                 setDoorState('closing');
                 addLog("Doors closing...");
               }
            }, 4000);
          }, 1500); 
        } else {
          setElevatorY(elevatorY + Math.sign(dy) * Math.min(Math.abs(dy), SPEED * dt));
        }
      }
    }
  });

  return null;
}

function ActivityLog() {
  const logs = useStore(s => s.logs);
  return (
    <div style={{ color: "#1e293b", height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Live Activity Log
      </h3>
      <div className="flex-1 overflow-auto bg-white rounded-lg border border-slate-200 shadow-inner p-2 font-mono text-xs">
        {logs.length === 0 && <div className="text-slate-400 italic p-2">Waiting for events...</div>}
        {logs.map(log => (
          log.message === "" ? (
            <div key={log.id} className="h-3 bg-slate-50/50 my-1 border-t border-b border-transparent" />
          ) : (
            <div key={log.id} className="mb-2 border-b border-slate-100 pb-1 last:border-0">
              <span className="text-slate-400 mr-2">[{log.time}]</span>
              <span className="text-slate-700">{log.message}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function ControlPanel() {
  const { floors, addPassenger, passengers, addLog } = useStore();

  const spawnPassenger = () => {
    const source = Math.floor(Math.random() * floors);
    let target = Math.floor(Math.random() * floors);
    while (target === source) target = Math.floor(Math.random() * floors);
    
    const id = Math.random().toString(36).substr(2, 9);
    addPassenger({
      id,
      source,
      target,
      state: 'waiting',
      x: 3.5 + (Math.random() - 0.5), 
      z: (Math.random() - 0.5) * 2,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
    useStore.getState().requestFloor(source, 'hall');
    addLog(`New passenger spawned at Floor ${source}`);
  };

  return (
    <div style={{ color: "#1e293b" }}>
      <h3 className="font-bold text-lg mb-4">Lobby Control</h3>
      <button 
        onClick={spawnPassenger}
        style={{
          width: "100%",
          padding: "12px",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "16px",
          boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.5)"
        }}
      >
        + Spawn Passenger
      </button>

      <div className="text-sm font-semibold text-slate-500 mb-2">
        PASSENGERS ({passengers.length})
      </div>
      <div className="mt-2 max-h-[40vh] overflow-auto pr-2">
        {passengers.map(p => (
          <div key={p.id} className="text-xs p-3 bg-white mb-2 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div style={{width: 8, height: 8, borderRadius: "50%", background: p.color}}></div>
               <span className="font-medium text-slate-700">{p.state.toUpperCase()}</span>
            </div>
            <div className="text-slate-400 font-mono">
              {p.source} <span className="text-slate-300">→</span> {p.target}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ElevatorSceneWrapper() {
  const passengers = useStore(s => s.passengers);
  const floors = useStore(s => s.floors);
  
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", background: "#0f172a" }}>
      {/* Left Panel: Activity Log */}
      <div style={{ width: "300px", background: "#f8fafc", borderRight: "1px solid #e2e8f0", padding: "24px", zIndex: 10 }}>
        <ActivityLog />
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <Canvas shadows camera={{ position: [10, 8, 10], fov: 40 }}>
          <color attach="background" args={['#020617']} />
          
          {/* Cinematic Lighting */}
          <ambientLight intensity={0.2} />
          <spotLight 
            position={[10, 20, 10]} 
            angle={0.4} 
            penumbra={0.5} 
            intensity={2} 
            castShadow 
            shadow-bias={-0.0001}
          />
          <Environment preset="night" />
          
          <group position={[0, -2, 0]}>
            <Shaft />
            {Array.from({ length: floors }).map((_, i) => (
              <FloorEnvironment key={i} floorIndex={i} />
            ))}
            <ElevatorCar />
            {passengers.map(p => <Passenger key={p.id} p={p} />)}
            <SimulationLogic />
          </group>

          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} target={[0, 4, 0]} />
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
            <SSAO radius={0.1} intensity={20} luminanceInfluence={0.5} color="black" />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
          </EffectComposer>
        </Canvas>
      </div>
      
      {/* Right Panel: Controls */}
      <div style={{ width: "300px", background: "#f8fafc", borderLeft: "1px solid #e2e8f0", padding: "24px", zIndex: 10 }}>
        <ControlPanel />
      </div>
    </div>
  );
}
