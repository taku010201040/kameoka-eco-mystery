import React from 'react';
import { motion } from 'framer-motion';

const Workshop = () => {
    return (
        <section id="ws" className="section">
            <div className="container">
                <h2 className="section-title" data-text="SPECIAL WORKSHOP">SPECIAL WORKSHOP</h2>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card"
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        <div style={{ position: 'relative' }}>
                            <img src="/murakami.jpg" alt="講師: 村上なつかさん" style={{ width: '100%', borderRadius: '15px', border: '3px solid #000', boxShadow: '10px 10px 0 #000' }} />
                            <p style={{ marginTop: '15px', fontWeight: 900, textAlign: 'center' }}>講師: 村上なつかさん</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#E60012' }}>倉庫たんけん！ワクワク廃材クラフト</h3>
                            <p style={{ lineHeight: 1.8, marginBottom: '25px' }}>
                                ボルトやナット、コンセントなど見たことあるような無いような道具や材料で好きなものを作ろう！<br />
                                いろんな廃材をパーツにして自由に組み合わせて、自分だけの作品に。<br /><br />
                                電気工事屋さんの倉庫で、珍しい自分だけの宝物を見つけてみよう。
                            </p>
                            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', border: '2px solid #ddd' }}>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                                    <span style={{ display: 'inline-block' }}>講師：村上なつか</span>{' '}
                                    <span style={{ fontSize: '0.9rem', color: '#666', display: 'inline-block' }}>（むらかみ道具店 店主・廃材商人）</span>
                                </h4>
                                <p style={{ fontSize: '0.95rem', color: '#444' }}>
                                    <span style={{ display: 'inline-block' }}>2024年、循環型社会を促進するための</span>
                                    <span style={{ display: 'inline-block' }}>ものづくりの廃材を見える化・流通させる</span>
                                    <span style={{ display: 'inline-block' }}>「廃材商人」として、</span>
                                    <span style={{ display: 'inline-block' }}>鯖江で「むらかみ道具店」を</span>
                                    <span style={{ display: 'inline-block' }}>立ち上げ活動中。</span>
                                </p>
                            </div>
                            <div style={{ marginTop: '20px', background: '#fff5f5', padding: '15px', borderLeft: '5px solid #E60012', fontWeight: 800, fontSize: '0.9rem' }}>
                                <span style={{ display: 'inline-block' }}>※謎解きと同じ時間帯には予約できません。</span><br />
                                <span style={{ display: 'inline-block' }}>時間をずらして「両方参加」が断然おすすめ！</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Workshop;
