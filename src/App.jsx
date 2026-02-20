import React, { useEffect, useRef, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Environment, MeshDistortMaterial } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

// Components
// Components
import Hero from './components/Hero';
import Story from './components/Story';
import Event from './components/Event';
import Workshop from './components/Workshop';
import About from './components/About';
import BookingForm from './components/BookingForm';
import Ticket from './components/Ticket';
import ReservationDashboard from './components/ReservationDashboard';
import SurveyForm from './components/SurveyForm';

gsap.registerPlugin(ScrollTrigger);

// --- 3D Background Elements ---
function BackgroundElement({ position, color, speed, size = 1 }) {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.x = t * 0.1 * speed;
        meshRef.current.rotation.y = t * 0.15 * speed;
    });

    return (
        <Float speed={speed * 2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef} position={position}>
                <dodecahedronGeometry args={[size, 0]} />
                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.3}
                    radius={1}
                    wireframe
                />
            </mesh>
        </Float>
    );
}

function Rig() {
    const { camera, mouse } = useThree();
    const vec = new THREE.Vector3();

    return useFrame(() => {
        camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, camera.position.z), 0.05);
        camera.lookAt(0, 0, 0);
    });
}

function Scene() {
    const groupRef = useRef();

    useEffect(() => {
        // Background movement linked to scroll
        gsap.to(groupRef.current.rotation, {
            y: Math.PI * 2,
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 2,
            }
        });

        gsap.to(groupRef.current.position, {
            z: -5,
            scrollTrigger: {
                trigger: ".reserve",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 1,
            }
        });
    }, []);

    return (
        <group ref={groupRef}>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <BackgroundElement position={[-5, 2, -5]} color="#E60012" speed={1} size={1.5} />
            <BackgroundElement position={[6, -3, -2]} color="#000" speed={0.8} size={1} />
            <BackgroundElement position={[-4, -5, -8]} color="#E60012" speed={1.2} size={2} />
            <BackgroundElement position={[8, 4, -10]} color="#000" speed={0.5} size={3} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Rig />
        </group>
    );
}

// --- Main App ---
function App() {
    const [ticketData, setTicketData] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);

    useEffect(() => {
        // Check for ticket or dashboard query param
        const params = new URLSearchParams(window.location.search);
        const ticket = params.get('ticket');
        const view = params.get('view');

        if (ticket) {
            setTicketData(ticket);
        }

        if (view === 'dashboard') {
            setShowDashboard(true);
        }

        if (view === 'survey') {
            setShowSurvey(true);
        }

        // Smooth scroll triggers for all glass-cards
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach((card) => {
            gsap.fromTo(card,
                { opacity: 0, scale: 0.9, y: 50 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    }
                }
            );
        });
    }, []);

    return (
        <div className="app-container">
            <div id="canvas-container">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 15]} />
                    <Suspense fallback={null}>
                        <Scene />
                    </Suspense>
                </Canvas>
            </div>

            {ticketData ? (
                <Ticket data={ticketData} />
            ) : showDashboard ? (
                <ReservationDashboard />
            ) : showSurvey ? (
                <SurveyForm />
            ) : (
                <>
                    <header style={{
                        position: 'fixed',
                        top: 0,
                        width: '100%',
                        padding: '15px 40px',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(15px)',
                        borderBottom: '3px solid #000'
                    }}>
                        <div className="logo" style={{
                            background: '#000',
                            color: '#fff',
                            padding: '8px 20px',
                            fontWeight: 900,
                            transform: 'rotate(-1.5deg)',
                            boxShadow: '4px 4px 0 #E60012',
                            fontSize: '1.6rem',
                            fontFamily: 'var(--font-heading)',
                            letterSpacing: '-0.02em'
                        }}>
                            <span style={{ display: 'inline-block' }}>廃材ロボからの</span><span style={{ display: 'inline-block' }}>挑戦状！</span>
                        </div>
                        <nav>
                            <ul style={{ display: 'flex', listStyle: 'none', gap: '30px', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.9rem' }}>
                                <li><a href="#home" style={{ textDecoration: 'none', color: '#000', transition: 'color 0.3s' }}>Home</a></li>
                                <li><a href="#story" style={{ textDecoration: 'none', color: '#000', transition: 'color 0.3s' }}>Story</a></li>
                                <li><a href="#mission1" style={{ textDecoration: 'none', color: '#000', transition: 'color 0.3s' }}>Event</a></li>
                                <li><a href="#ws" style={{ textDecoration: 'none', color: '#000', transition: 'color 0.3s' }}>Workshop</a></li>
                                <li><a href="#reserve" style={{
                                    textDecoration: 'none',
                                    color: '#fff',
                                    background: '#E60012',
                                    padding: '8px 25px',
                                    borderRadius: '50px',
                                    border: '2px solid #000',
                                    boxShadow: '3px 3px 0 #000'
                                }}>Reserve</a></li>
                            </ul>
                        </nav>
                    </header>

                    <main>
                        <Hero />
                        <Story />
                        <Event />
                        <Workshop />
                        <About />
                        <BookingForm />
                    </main>

                    <footer style={{ padding: '80px 20px', textAlign: 'center', background: '#000', color: '#fff' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <p style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 700 }}>
                                主催: かめおか共創支援プロジェクト 学生チーム(環境班) / 亀岡市(商工観光課)<br />
                                協力: 星和電機工事株式会社
                            </p>
                            <p style={{ opacity: 0.6 }}>&copy; 2026 Re:bbit Eco Mystery Project. All Rights Reserved.</p>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}

export default App;
