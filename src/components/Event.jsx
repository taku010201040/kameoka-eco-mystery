import React from 'react';
import { motion } from 'framer-motion';

const Event = () => {
    return (
        <section id="mission1" className="section">
            <div className="container">
                <h2 className="section-title" data-text="SPECIAL EVENT">SPECIAL EVENT</h2>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{ margin: '0 auto', textAlign: 'center' }}
                >
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '30px', fontFamily: 'var(--font-heading)' }}>
                            「廃材」を学ぶ、体験型謎解きイベント<br />ロボットからの挑戦状
                        </h3>
                        <p style={{ textAlign: 'left', lineHeight: 2, fontSize: '1.1rem' }}>
                            <span style={{ display: 'inline-block' }}>亀岡市内の企業から出る廃材をテーマに、</span>
                            <span style={{ display: 'inline-block' }}>小・中学生が楽しみながら</span>
                            <span style={{ display: 'inline-block' }}>環境について学べる</span>
                            <span style={{ display: 'inline-block' }}>学習型謎解きイベントです。</span><br /><br />
                            <span style={{ display: 'inline-block' }}>廃材で作られた謎に挑戦しながら、</span>
                            <span style={{ display: 'inline-block' }}>遊んで、考えて、</span>
                            <span style={{ display: 'inline-block' }}>捨てられるものが</span>
                            <span style={{ display: 'inline-block' }}>価値あるものへと変わる体験をし、</span>
                            <span style={{ display: 'inline-block' }}>「廃材がどのように生まれ変わるのか」</span>
                            <span style={{ display: 'inline-block' }}>「環境のためにできることは何か」を考えます。</span><br /><br />
                            <span style={{ fontWeight: 'bold', color: '#E60012', fontSize: '1.3rem', display: 'inline-block' }}>Re:bbit</span>
                            <span style={{ display: 'inline-block' }}>からの挑戦状を、</span>
                            <span style={{ display: 'inline-block' }}>キミは受け取る覚悟があるか？</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Event;
