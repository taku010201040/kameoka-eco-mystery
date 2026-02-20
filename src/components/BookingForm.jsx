import React from 'react';
import { motion } from 'framer-motion';

const BookingForm = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const iconVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 1.5,
                ease: "easeInOut",
                delay: 0.5
            }
        }
    };

    return (
        <section id="reserve" className="section" style={{ padding: '80px 20px', overflow: 'hidden' }}>
            <div className="container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="section-title" data-text="THANK YOU">THANK YOU</h2>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="glass-card"
                    style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        padding: '60px 30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '30px',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset',
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative Background Elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-60px',
                        right: '-60px',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(230,0,18,0.15) 0%, transparent 70%)',
                        zIndex: 0,
                        filter: 'blur(20px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-40px',
                        left: '-40px',
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
                        zIndex: 0,
                        filter: 'blur(20px)'
                    }} />

                    {/* Animated Icon */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', zIndex: 1 }}>
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                            <motion.path
                                d="M50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85Z"
                                stroke="#E60012"
                                strokeWidth="4"
                                variants={iconVariants}
                            />
                            <motion.path
                                d="M35 50L45 60L65 40"
                                stroke="#E60012"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                variants={iconVariants}
                            />
                        </svg>
                    </div>

                    <div style={{ textAlign: 'center', zIndex: 1 }}>
                        <motion.h3
                            variants={itemVariants}
                            style={{
                                fontSize: '2.2rem',
                                fontWeight: 900,
                                color: '#333',
                                marginBottom: '15px',
                                lineHeight: 1.3,
                                letterSpacing: '-0.02em'
                            }}
                        >
                            本イベントは<br />
                            <span style={{ color: '#E60012', fontSize: '2.4rem' }}>終了しました</span>
                        </motion.h3>

                        <motion.div
                            variants={itemVariants}
                            style={{
                                width: '60px',
                                height: '4px',
                                background: 'linear-gradient(90deg, #E60012, #0ea5e9)',
                                margin: '20px auto',
                                borderRadius: '2px'
                            }}
                        />

                        <motion.p
                            variants={itemVariants}
                            style={{
                                fontSize: '1.1rem',
                                lineHeight: '2.4',
                                color: '#4b5563',
                                fontWeight: 500,
                                fontFamily: "'Noto Sans JP', sans-serif"
                            }}
                        >
                            2月7日(土)、2月14日(土)の両日程におきまして、<br />
                            <span style={{ fontWeight: 700, color: '#1f2937', background: 'rgba(230,0,18,0.05)', padding: '2px 8px', borderRadius: '4px' }}>たくさんの方々にご来場いただき</span><br />
                            誠にありがとうございました。<br />
                            <br />
                            皆様のまたのご参加を<br />
                            心よりお待ちしております。
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default BookingForm;
