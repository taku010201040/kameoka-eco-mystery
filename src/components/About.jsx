import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';

const About = () => {
    const details = [
        { icon: <Calendar />, title: 'DATE', content: '2026.2.7 (Sat) / 2.14 (Sat)' },
        {
            icon: <MapPin />,
            title: 'LOCATION',
            content: <a href="https://maps.app.goo.gl/1hbSEWWG3U4uiztNA" target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'underline' }}>TRANSit (星和電機工事株式会社 横)</a>
        },
        {
            icon: <Users />,
            title: 'TARGET',
            content: (
                <>
                    小学校高学年〜中学生<br />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginTop: '5px', textAlign: 'left' }}>
                        ※対象年齢以下のお子様は、<br />保護者の方との参加をお願いします
                    </span>
                </>
            )
        },
        {
            icon: <Ticket />,
            title: 'FEE',
            content: (
                <>
                    500円 / 1人 (現金のみ対応可)<br />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginTop: '5px', textAlign: 'left' }}>
                        ※謎解き、ワークショップ<br />それぞれに500円の参加料がかかります
                    </span>
                </>
            )
        },
    ];

    return (
        <section id="about" className="section">
            <div className="container" style={{ width: '100%', maxWidth: '1000px' }}>
                <h2 className="section-title" data-text="MISSION DETAILS">MISSION DETAILS</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px' }}>
                    {details.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{ background: '#fff', border: '3px solid #000', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '8px 8px 0 #000' }}
                        >
                            <div style={{ color: '#E60012', marginBottom: '15px' }}>
                                {React.cloneElement(item.icon, { size: 40 })}
                            </div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: 900 }}>{item.title}</h3>
                            <div style={{ fontWeight: 700, lineHeight: 1.6 }}>{item.content}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
