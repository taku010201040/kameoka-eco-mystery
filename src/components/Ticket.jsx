import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react'; // We need to install this or use an image placeholder. Let's use simple CSS/SVG for now or specific library if available.
// Actually, user stack doesn't have qrcode.react. I'll use a simple placeholder or just a stylish ID display.
// User didn't ask for a QR code specifically, just "Electronic Ticket". A stylish card is enough.

const Ticket = ({ data }) => {
    const [ticketInfo, setTicketInfo] = useState(null);
    const [error, setError] = useState(false);
    const [used, setUsed] = useState(false);

    const handleUseTicket = () => {
        if (window.confirm('チケットを使用済みにしますか？\n（スタッフの方のみ操作してください）')) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
            setUsed(timeStr);
        }
    };

    useEffect(() => {
        try {
            // Decode Base64 (Url Safe fix)
            // Replace - with + and _ with /
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            const binaryString = atob(base64);
            const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
            const decoded = new TextDecoder().decode(bytes);
            const parsed = JSON.parse(decoded);
            setTicketInfo(parsed);
        } catch (e) {
            console.error("Failed to parse ticket data", e);
            setError(true);
        }
    }, [data]);

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff' }}>
                <p>チケット情報の読み込みに失敗しました。</p>
            </div>
        );
    }

    if (!ticketInfo) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff' }}>
                <p>Loading Ticket...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#111',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            fontFamily: 'var(--font-body)'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: '#fff',
                    maxWidth: '400px',
                    width: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(230, 0, 18, 0.3)',
                    position: 'relative'
                }}
            >
                {/* Header */}
                <div style={{ background: '#E60012', padding: '20px', textAlign: 'center', color: '#fff' }}>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.05em' }}>DIGITAL TICKET</h1>
                    <p style={{ margin: '5px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>廃材ロボからの挑戦状！</p>
                </div>

                {/* Content */}
                <div style={{ padding: '30px' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'center', borderBottom: '2px dashed #eee', paddingBottom: '20px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>日時</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{ticketInfo.date}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#E60012' }}>{ticketInfo.time} <span style={{ fontSize: '1rem', color: '#000' }}>〜</span></div>
                    </div>

                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>会場</div>
                            <div style={{ fontWeight: 700 }}>TRANSit</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>人数</div>
                            <div style={{ fontWeight: 700 }}>{ticketInfo.count}名</div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>保護者様氏名</div>
                            <div style={{ fontWeight: 700 }}>{ticketInfo.name} 様</div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>金額</div>
                            <div style={{ fontWeight: 700 }}>¥ {ticketInfo.fee}</div>
                        </div>
                    </div>



                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#999', marginBottom: '10px' }}>Staff Only</p>
                        <div
                            onClick={!used ? handleUseTicket : undefined}
                            style={{
                                height: '60px',
                                background: used ? '#333' : 'repeating-linear-gradient(45deg, #ddd, #ddd 10px, #eee 10px, #eee 20px)',
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: used ? '#fff' : '#999',
                                fontWeight: 900,
                                letterSpacing: '0.2em',
                                cursor: used ? 'default' : 'pointer',
                                transition: 'all 0.3s'
                            }}>
                            {used ? `USED ${used}` : 'VALID'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ background: '#000', padding: '15px', textAlign: 'center', color: '#fff' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem' }}>当日スタッフにこの画面をご提示ください</p>
                    <p style={{ margin: '5px 0 0', fontSize: '0.6rem', color: '#666' }}>Ticket ID: {ticketInfo.id}</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Ticket;
