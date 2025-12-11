import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

// --- Doors of Durin "Mithril Line Art" Shader ---
const DoorMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uTexture: { value: null },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uKeyholeOpen: { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform float uKeyholeOpen;

        void main() {
            vec4 color = texture2D(uTexture, vUv);
            
            // INTENSITY MAPPING
            // Use Green channel for best fidelity in most compression formats
            float intensity = color.g; 
            
            // SOFT MASKING (Anti-aliased feel)
            // Broader smoothstep reduces "crunchy" pixels at edges
            float alpha = smoothstep(0.15, 0.45, intensity);

            // SMOOTHER NORMALS
            // Use a slightly wider sample for normals to average out pixel noise
            vec2 px = vec2(1.5/uResolution.x, 0.0);
            vec2 py = vec2(1.5/uResolution.y, 0.0);
            
            float h = intensity;
            float hx = texture2D(uTexture, vUv + px).g;
            float hy = texture2D(uTexture, vUv + py).g;
            
            // Reduced multiplier (from 20.0 to 8.0) to reduce jagged noise
            float dx = (hx - h) * 8.0; 
            float dy = (hy - h) * 8.0;
            vec3 normal = normalize(vec3(-dx, -dy, 0.8)); // Z=0.8 for softer incline

            // LIGHTING PHYSICS
            vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
            vec3 lightPos = vec3(uMouse, 0.3); // Higher light = softer falloff
            vec3 surfPos = vec3(vUv, 0.0);
            vec3 lightDir = normalize(lightPos - surfPos);
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            vec3 halfDir = normalize(lightDir + viewDir);
            
            float NdotH = max(dot(normal, halfDir), 0.0);
            float specular = pow(NdotH, 40.0); // Broader, softer highlight (less sparkling noise)

            // LANTERN
            float mouseDist = distance(vUv * aspect, uMouse * aspect);
            float lantern = smoothstep(0.4, 0.0, mouseDist);

            // KEYHOLE
            vec2 center = vec2(0.5, 0.5);
            float centerDist = distance(vUv * aspect, center * aspect);
            float keyholeSpot = smoothstep(0.5, 0.0, centerDist) * uKeyholeOpen;

            // COMPOSITION
            // Base Mithril: A steady, clean silver-blue
            vec3 baseMithril = vec3(0.5, 0.6, 0.7) * intensity * 0.4;

            // Glint: Pure white-blue
            vec3 glintColor = vec3(0.9, 0.95, 1.0) * specular * lantern * 3.0 * intensity;

            // Keyhole: Magic blue
            vec3 keyholeColor = vec3(0.3, 0.6, 1.0) * keyholeSpot * intensity * 3.0;

            vec3 finalColor = baseMithril + glintColor + keyholeColor;

            // Final Polish: Boost alpha slightly on the very edges to 'thicken' the line
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

function DoorPlane() {
    const mesh = useRef();
    const texture = useTexture("/doors_of_durin.png");
    const { viewport } = useThree();

    const scale = useMemo(() => {
        // Desired: Roughly 60-70% of screen height
        const targetHeight = viewport.height * 0.7;

        // Calculate natural ratio from image if available, else standard landscape (4:3 -> 1.33)
        // Texture might not be loaded on first render, fallback to 1.5 (3:2)
        const ratio = texture.image ? (texture.image.width / texture.image.height) : 1.5;

        const targetWidth = targetHeight * ratio;

        // Check if this width is too wide for screen (mobile etc)
        if (targetWidth > viewport.width * 0.9) {
            const constrainedWidth = viewport.width * 0.9;
            return [constrainedWidth, constrainedWidth / ratio, 1];
        }

        return [targetWidth, targetHeight, 1];
    }, [viewport, texture.image]); // Re-run when viewport changes

    // Shader Uniforms
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTexture: { value: texture },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) }, // Start center
            uResolution: { value: new THREE.Vector2(100, 100) },
            uKeyholeOpen: { value: 0.0 }
        }),
        [texture]
    );

    useEffect(() => {
        if (mesh.current) {
            mesh.current.material.uniforms.uResolution.value.set(
                window.innerWidth,
                window.innerHeight
            );
        }
    }, [viewport]);

    // Exact Mouse Tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (mesh.current) {
                const u = e.clientX / window.innerWidth;
                const v = 1.0 - (e.clientY / window.innerHeight);
                gsap.to(mesh.current.material.uniforms.uMouse.value, {
                    x: u,
                    y: v,
                    duration: 0.1,
                    overwrite: true
                });
            }
        };

        const handleKeyhole = (e) => {
            const isOpen = e.detail.open;
            if (mesh.current) {
                gsap.to(mesh.current.material.uniforms.uKeyholeOpen, {
                    value: isOpen ? 1.0 : 0.0,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mithril-keyhole', handleKeyhole);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mithril-keyhole', handleKeyhole);
        };
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={mesh} position={[0, -viewport.height * 0.1, 0]} scale={scale}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial
                transparent={true}
                depthWrite={false}
                args={[DoorMaterial]}
                uniforms={uniforms}
            />
        </mesh>
    );
}

function Scene() {
    return (
        <>
            {/* Atmospheric Lighting (Moonlight) */}
            <ambientLight intensity={0.2} color="#a5b4fc" /> {/* Cool Indigo Ambient */}
            <spotLight
                position={[10, 20, 10]}
                angle={0.3}
                penumbra={1}
                intensity={2}
                color="#e0e7ff"
                castShadow
            />

            {/* The Infinite Starfield */}
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* Low-lying Mist (Ground Sparkles) */}
            <Sparkles
                count={200}
                scale={[20, 2, 10]}
                size={6}
                speed={0.4}
                opacity={0.2}
                color="#cbd5e1"
                position={[0, -4, 0]}
            />

            {/* The Gate Itself */}
            <DoorPlane />

            {/* Depth Fog */}
            <fog attach="fog" args={['#020617', 5, 30]} />

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.1}
                    intensity={0.5} // Slightly reduced to balance with stars
                    radius={0.6}
                />
                <Noise opacity={0.02} /> {/* Subtle film grain */}
                <Vignette eskil={false} offset={0.1} darkness={1.1} /> {/* Cinematic darker corners */}
            </EffectComposer>
        </>
    )
}

function Loader() {
    return null;
}

export default function DurinsGate() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 1.5]}>
                <React.Suspense fallback={<Loader />}>
                    <Scene />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
