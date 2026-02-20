import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section id="home" className="section hero" style={{ overflow: 'hidden' }}>
            {/* Yellow Tape */}
            <div className="tape-container tape-yellow" style={{ position: 'absolute', top: '10%', transform: 'rotate(-5deg)', width: '120%', left: '-10%', zIndex: 5, background: '#FFD700', border: '3px solid #000', padding: '10px 0', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    style={{ display: 'flex', fontStyle: 'italic', fontWeight: 900, fontSize: '1.2rem' }}
                >
                    <span style={{ paddingRight: '40px' }}>⚠️ KEEP OUT ⚠️ WARNING ⚠️ 立入禁止 ⚠️ DANGER ⚠️ KEEP OUT ⚠️ WARNING ⚠️ 立入禁止 ⚠️ DANGER ⚠️</span>
                    <span style={{ paddingRight: '40px' }}>⚠️ KEEP OUT ⚠️ WARNING ⚠️ 立入禁止 ⚠️ DANGER ⚠️ KEEP OUT ⚠️ WARNING ⚠️ 立入禁止 ⚠️ DANGER ⚠️</span>
                </motion.div>
            </div>

            {/* Red Tape */}
            <div className="tape-container tape-red" style={{ position: 'absolute', bottom: '15%', transform: 'rotate(3deg)', width: '120%', left: '-10%', zIndex: 5, background: '#E60012', border: '3px solid #000', padding: '10px 0', whiteSpace: 'nowrap', overflow: 'hidden', color: '#fff' }}>
                <motion.div
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    style={{ display: 'flex', fontWeight: 900, fontSize: '1.2rem' }}
                >
                    <span style={{ paddingRight: '40px' }}>🚨 EMERGENCY 🚨 緊急事態 🚨 ALERT 🚨 爆弾解除せよ 🚨 EMERGENCY 🚨 緊急事態 🚨 ALERT 🚨 爆弾解除せよ 🚨</span>
                    <span style={{ paddingRight: '40px' }}>🚨 EMERGENCY 🚨 緊急事態 🚨 ALERT 🚨 爆弾解除せよ 🚨 EMERGENCY 🚨 緊急事態 🚨 ALERT 🚨 爆弾解除せよ 🚨</span>
                </motion.div>
            </div>

            <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ fontWeight: 900, marginBottom: '20px', color: '#000', background: '#fff', display: 'inline-block', padding: '8px 15px', transform: 'rotate(-2deg)', border: '2px solid #000' }}
                >
                    廃材×謎解き 体験型謎解きイベント
                </motion.div>

                <h1 className="collage-title" style={{ fontSize: 'clamp(2.5rem, 10vw, 6rem)', lineHeight: 1.1, textAlign: 'center' }}>
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} style={{ background: '#E60012', color: '#fff', padding: '0 10px', display: 'inline-block', border: '4px solid #000', margin: '5px' }}>廃材</motion.span>
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring' }} style={{ background: '#000', color: '#fff', padding: '0 10px', display: 'inline-block', border: '4px solid #000', margin: '5px' }}>ロボ</motion.span>
                    <span style={{ fontSize: '0.5em', fontWeight: 800 }}>からの</span><br />
                    <motion.span initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }} style={{ background: '#000', color: '#fff', padding: '0 15px', display: 'inline-block', border: '4px solid #000', margin: '5px', fontSize: '1.2em' }}>挑</motion.span>
                    <motion.span initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }} style={{ background: '#E60012', color: '#fff', padding: '0 15px', display: 'inline-block', border: '4px solid #000', margin: '5px', fontSize: '1.2em' }}>戦</motion.span>
                    <motion.span initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2 }} style={{ background: '#000', color: '#fff', padding: '0 15px', display: 'inline-block', border: '4px solid #000', margin: '5px', fontSize: '1.2em' }}>状</motion.span>
                    ！
                </h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{ marginTop: '30px' }}
                >
                    <p className="subtitle" style={{ fontWeight: 900, background: '#fff', color: '#000', display: 'inline-block', padding: '10px 20px', border: '3px solid #000', boxShadow: '5px 5px 0 #000', fontSize: '1.2rem' }}>
                        キミは、この謎を解き、爆弾を解除できるのか？
                    </p>
                </motion.div>

                <motion.div
                    style={{ marginTop: '40px' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <a href="#reserve" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', color: '#fff', background: '#E60012', padding: '15px 40px', fontSize: '1.5rem', fontWeight: 900, border: '4px solid #000', boxShadow: '8px 8px 0 #000', borderRadius: '50px' }}>
                        今すぐ予約する
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
