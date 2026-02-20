import React from 'react';
import { motion } from 'framer-motion';

const Story = () => {
    return (
        <section id="story" className="section">
            <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
                <h2 className="section-title" data-text="STORY">STORY</h2>

                <div className="story-content" style={{ fontSize: '1.2rem', lineHeight: 2.2, textAlign: 'left', background: 'rgba(255,255,255,0.9)', padding: '50px', borderRadius: '30px', border: '3px solid #000', boxShadow: '15px 15px 0 rgba(0,0,0,0.1)' }}>
                    <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ marginBottom: '30px' }}>
                        <span style={{ display: 'inline-block' }}>彼は、廃材を減らし</span>
                        <span style={{ display: 'inline-block' }}>アップサイクルの価値を伝えるために</span>
                        <span style={{ display: 'inline-block' }}>つくられたロボット。</span><br />
                        <span style={{ display: 'inline-block' }}>名前は <strong style={{ background: '#E60012', color: '#fff', padding: '0 8px', borderRadius: '4px' }}>Re:bbit（リビット）</strong>。</span>
                    </motion.p>

                    <motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ marginBottom: '30px' }}>
                        <span style={{ display: 'inline-block' }}>工事現場、家庭、学校……</span>
                        <span style={{ display: 'inline-block' }}>あらゆる場所で、</span>
                        <span style={{ display: 'inline-block' }}>役目を終えた部品たちが</span>
                        <span style={{ display: 'inline-block' }}>無造作に捨てられていく。</span><br />
                        <span style={{ display: 'inline-block' }}>「もういらない」</span>
                        <span style={{ display: 'inline-block' }}>「古い」「ゴミ」——</span>
                        <span style={{ display: 'inline-block' }}>そんな理由だけで。</span>
                    </motion.p>

                    <motion.p initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} style={{ marginBottom: '30px', fontWeight: 900, fontSize: '1.5rem', color: '#000', borderLeft: '8px solid #E60012', paddingLeft: '20px' }}>
                        <span style={{ display: 'inline-block' }}>「ちゃんと役に立ってたのに……</span><br />
                        <span style={{ display: 'inline-block' }}>使い終わった瞬間に</span>
                        <span style={{ display: 'inline-block' }}>"なかったこと"にされるなんて、</span>
                        <span style={{ display: 'inline-block' }}>おかしいでしょ！」</span>
                    </motion.p>

                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} style={{ marginBottom: '30px' }}>
                        <span style={{ display: 'inline-block' }}>もし「当たり前」の毎日が急に止まったら？</span><br />
                        <span style={{ display: 'inline-block' }}>電気も、機械も、</span>
                        <span style={{ display: 'inline-block' }}>すべてがピタッと動かなくなったら？</span>
                    </motion.p>

                    <motion.p initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} style={{ fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(1.1rem, 3.2vw, 1.7rem)', color: '#fff', background: '#000', padding: '15px 30px', display: 'block', width: 'fit-content', margin: '40px auto 0', transform: 'rotate(-1.2deg)', textAlign: 'center', lineHeight: 1.4, boxShadow: '8px 8px 0 rgba(230,0,18,0.5)' }}>
                        <span style={{ display: 'inline-block' }}>「だったら、</span>
                        <span style={{ display: 'inline-block' }}>ボクの手で</span>
                        <span style={{ display: 'inline-block' }}>強制的に</span>
                        <span style={{ display: 'inline-block' }}>止めるしかないじゃん！」</span>
                    </motion.p>
                </div>
            </div>
        </section>
    );
};

export default Story;
