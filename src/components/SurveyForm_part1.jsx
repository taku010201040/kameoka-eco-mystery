import React, { useState, useEffect } from 'react';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzS-mH8jCjdLw-F-kF-K7P8gJ1m6jK-L-M9N0pQ-R-S-T-U/exec'; // Replace with your actual GAS Web App URL

const SurveyForm = () => {
    // State management
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Step 1: イベント認知
    const [discoverySource, setDiscoverySource] = useState('');
    const [discoverySourceOther, setDiscoverySourceOther] = useState('');
    const [snsDetails, setSnsDetails] = useState([]);
    const [snsOther, setSnsOther] = useState('');
    const [flyerSource, setFlyerSource] = useState('');
    const [flyerShopName, setFlyerShopName] = useState('');

    // Step 2: 基本情報
    const [participantCount, setParticipantCount] = useState('');
    const [childAges, setChildAges] = useState([]);
    const [childAgesOther, setChildAgesOther] = useState('');
    const [participation, setParticipation] = useState(''); // '謎解きのみ' | 'ワークショップのみ' | '両方'

    // Step 3: 全体の満足度
    const [overallSatisfaction, setOverallSatisfaction] = useState(''); // 単一選択に変更
    const [priceSatisfaction, setPriceSatisfaction] = useState('');
    const [enjoyableContents, setEnjoyableContents] = useState([]);
    const [enjoyableOther, setEnjoyableOther] = useState('');

    // Step 4: 謎解きについて
    const [mysteryFeedback, setMysteryFeedback] = useState([]);
    const [mysteryImpression, setMysteryImpression] = useState('');

    // Step 5: ワークショップについて
    const [workshopEngagement, setWorkshopEngagement] = useState([]);
    const [workshopDifficulty, setWorkshopDifficulty] = useState([]);
    const [wasteAwareness, setWasteAwareness] = useState([]);
    const [wasteOther, setWasteOther] = useState('');
    const [workshopSatisfaction, setWorkshopSatisfaction] = useState([]);
    const [workshopImpression, setWorkshopImpression] = useState('');

    // Step 6: 学び・気づき
    const [environmentalAwareness, setEnvironmentalAwareness] = useState(''); // 単一選択に変更
    const [learningExperience, setLearningExperience] = useState([]);

    // Step 7: 改善点・今後
    const [difficulties, setDifficulties] = useState([]);
    const [difficultiesOther, setDifficultiesOther] = useState('');
    const [improvementFreeText, setImprovementFreeText] = useState('');
    const [improvements, setImprovements] = useState([]);
    const [futureParticipation, setFutureParticipation] = useState([]);
    const [futureIdeas, setFutureIdeas] = useState('');

    // Step 8: 星和電機工事について（条件分岐あり）
    const [seiwaDenkiFuture, setSeiwaDenkiFuture] = useState('');
    const [seiwaDenkiNoReason, setSeiwaDenkiNoReason] = useState('');
    const [seiwaDenkiCondition, setSeiwaDenkiCondition] = useState('');
    const [finalComments, setFinalComments] = useState('');

    const steps = [
        { id: 0, title: 'イベント認知', required: true },
        { id: 1, title: '基本情報', required: true },
        { id: 2, title: '全体の満足度', required: true },
        { id: 3, title: '謎解き', required: true },
        { id: 4, title: 'ワークショップ', required: true },
        { id: 5, title: '学び・気づき', required: false },
        { id: 6, title: '改善点・今後', required: false },
        { id: 7, title: '今後の参加', required: false },
    ];

    const totalSteps = steps.length;

    const childAgeOptions = [
        '小学生（低学年）',
        '小学生（高学年）',
        '中学生',
        '高校生',
        'その他'
    ];

    const handleCheckboxChange = (value, setter, currentValues) => {
        setter(prev =>
            prev.includes(value)
                ? prev.filter(item => item !== value)
                : [...prev, value]
        );
    };

    const isStepComplete = (stepId) => {
        switch (stepId) {
            case 0: // イベント認知
                if (!discoverySource) return false;
                if (discoverySource === 'SNS等') {
                    return snsDetails.length > 0 && (!snsDetails.includes('その他') || snsOther.trim() !== '');
                } else if (discoverySource === 'チラシ') {
                    if (!flyerSource) return false;
                    if (flyerSource === 'お店・施設で見た（貰った）') {
                        return flyerShopName.trim() !== '';
                    }
                    return true;
                } else if (discoverySource === 'その他') {
                    return discoverySourceOther.trim() !== '';
                }
                return true;
            case 1: return participantCount !== '' && childAges.length > 0 && (!childAges.includes('その他') || childAgesOther.trim() !== '') && participation !== '';
            case 2: return overallSatisfaction !== '' && enjoyableContents.length > 0;
            case 3:
                // 謎解きに参加していない場合はスキップ
                if (participation === 'ワークショップのみ') return true;
                return mysteryFeedback.length > 0;
            case 4:
                // ワークショップに参加していない場合はスキップ
                if (participation === '謎解きのみ') return true;
                return workshopEngagement.length > 0 && workshopDifficulty.length > 0 && wasteAwareness.length > 0 && workshopSatisfaction.length > 0;
            case 5: return true; // Optional
            case 6: return true; // Optional
            case 7: return true; // Optional
            default: return false;
        }
    };

    const handleNext = () => {
        let nextStep = currentStep + 1;

        // 参加状況に応じてステップをスキップ
        if (participation === '謎解きのみ') {
            // case 3（謎解き）は表示、case 4（ワークショップ）をスキップ
            if (currentStep === 3 && nextStep === 4) nextStep = 5; // 謎解きの次は学び・気づきへ
        } else if (participation === 'ワークショップのみ') {
            // case 3（謎解き）をスキップ、case 4（ワークショップ）は表示
            if (currentStep === 2 && nextStep === 3) nextStep = 4; // 満足度の次はワークショップへ
        }
        // '両方'の場合はすべてのステップを表示

        if (nextStep < totalSteps) {
            setCurrentStep(nextStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setShowPreview(true);
        }
    };

    const handleBack = () => {
        let prevStep = currentStep - 1;

        // 参加状況に応じてステップをスキップ
        if (participation === '謎解きのみ') {
            if (currentStep === 5 && prevStep === 4) prevStep = 3; // 学び・気づきから謎解きへ
        } else if (participation === 'ワークショップのみ') {
            if (currentStep === 4 && prevStep === 3) prevStep = 2; // ワークショップから満足度へ
        }

        if (prevStep >= 0) {
            setCurrentStep(prevStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleEditStep = (stepId) => {
        setShowPreview(false);
        setShowConfirmation(false);
        setCurrentStep(stepId);
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            const surveyData = {
                action: 'submitSurvey',
                // Step 1
                discoverySource: discoverySource === 'その他' && discoverySourceOther ? `その他: ${discoverySourceOther}` : discoverySource,
                snsDetails: snsDetails.map(s => s === 'その他' && snsOther ? `その他: ${snsOther}` : s).join(', '),
                flyerSource,
                flyerShopName,
                // Step 2
                participantCount,
                childAges: childAges.map(a => a === 'その他' && childAgesOther ? `その他: ${childAgesOther}` : a).join(', '),
                participation,
                // Step 3
                overallSatisfaction,
                priceSatisfaction,
                enjoyableContents: enjoyableContents.map(c => c === 'その他' && enjoyableOther ? `その他: ${enjoyableOther}` : c).join(', '),
                // Step 4
                // Step 4
                mysteryFeedback: mysteryFeedback.join(', '),
                mysteryImpression,
                // Step 5
                workshopEngagement: workshopEngagement.join(', '),
                workshopDifficulty: workshopDifficulty.join(', '),
                wasteAwareness: wasteAwareness.map(w => w === 'その他' && wasteOther ? `その他: ${wasteOther}` : w).join(', '),
                workshopSatisfaction: workshopSatisfaction.join(', '),
                workshopImpression,
                // Step 6
                environmentalAwareness,
                learningExperience: learningExperience.join(', '),
                // Step 7
                difficulties: difficulties.map(d => d === 'その他' && difficultiesOther ? `その他: ${difficultiesOther}` : d).join(', '),
                improvementFreeText,
                improvements: improvements.join(', '),
                futureParticipation: futureParticipation.join(', '),
                futureIdeas,
                // Step 8
                seiwaDenkiFuture,
                seiwaDenkiNoReason,
                seiwaDenkiCondition,
                finalComments,
                submittedAt: new Date().toISOString()
            };

            await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData)
            });

            setShowSuccess(true);

        } catch (error) {
            console.error('送信エラー:', error);
            alert('送信に失敗しました。もう一度お試しください。');
        }

        setSubmitting(false);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // イベント認知経路（条件分岐あり）
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q1. イベントをどこで知りましたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {['SNS等', 'チラシ', '知人からの紹介', 'その他'].map(option => (
                                    <label
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            border: discoverySource === option ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: discoverySource === option ? '#ebf8ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            checked={discoverySource === option}
                                            onChange={() => setDiscoverySource(option)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 500 }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                            {discoverySource === 'その他' && (
                                <input
                                    type="text"
                                    value={discoverySourceOther}
                                    onChange={(e) => setDiscoverySourceOther(e.target.value)}
                                    placeholder="その他の内容を入力してください"
                                    style={{
                                        width: '100%',
                                        marginTop: '10px',
                                        padding: '10px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            )}
                        </div>

                        {/* Q2: SNS等の詳細（条件表示） */}
                        {discoverySource === 'SNS等' && (
                            <div style={{ marginBottom: '30px', padding: '20px', background: '#f7fafc', borderRadius: '6px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q2. 具体的なSNS等の名称を教えてください <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['亀岡市公式ホームページ', '亀岡市公式LINE', '亀岡市公式SNS（Instagram、X、Facebook等）', 'プレスリリース', 'かめまるインスタ', 'イベント公式Instagram', '星和電機工事（株）公式Instagram', 'かめおか子ども新聞', 'その他'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: snsDetails.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: snsDetails.includes(option) ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={snsDetails.includes(option)}
                                                onChange={() => handleCheckboxChange(option, setSnsDetails, snsDetails)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                {snsDetails.includes('その他') && (
                                    <input
                                        type="text"
                                        value={snsOther}
                                        onChange={(e) => setSnsOther(e.target.value)}
                                        placeholder="その他のSNS等を入力してください"
                                        style={{
                                            width: '100%',
                                            marginTop: '10px',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {/* Q3: チラシの詳細（条件表示） */}
                        {discoverySource === 'チラシ' && (
                            <div style={{ marginBottom: '30px', padding: '20px', background: '#f7fafc', borderRadius: '6px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q3. どこでチラシを知りましたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                                </label>
                                <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
                                    {['イベントスタッフからの配布', 'お店・施設で見た（貰った）'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: flyerSource === option ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: flyerSource === option ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                checked={flyerSource === option}
                                                onChange={() => setFlyerSource(option)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                {flyerSource === 'お店・施設で見た（貰った）' && (
                                    <div>
                                        <label style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', display: 'block', color: '#4a5568' }}>
                                            具体的なお店・施設の名称を教えてください
                                        </label>
                                        <input
                                            type="text"
                                            value={flyerShopName}
                                            onChange={(e) => setFlyerShopName(e.target.value)}
                                            placeholder="例: ○○書店、△△図書館"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 1: // 基本情報
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q4. 参加人数を教えてください（お子様のみ） <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={participantCount}
                                onChange={(e) => setParticipantCount(e.target.value)}
                                placeholder="例: 3"
                                style={{
                                    width: '200px',
                                    padding: '10px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                            />
                            <span style={{ marginLeft: '10px', color: '#718096' }}>名</span>
                        </div>

                        <div>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q5. お子様の年齢を教えてください <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {childAgeOptions.map(option => (
                                    <label
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            border: childAges.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: childAges.includes(option) ? '#ebf8ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={childAges.includes(option)}
                                            onChange={() => handleCheckboxChange(option, setChildAges, childAges)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 500 }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                            {childAges.includes('その他') && (
                                <input
                                    type="text"
                                    value={childAgesOther}
                                    onChange={(e) => setChildAgesOther(e.target.value)}
                                    placeholder="その他の年齢を入力してください"
                                    style={{
                                        width: '100%',
                                        marginTop: '10px',
                                        padding: '10px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q6. どちらに参加しましたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>単一選択</p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {['謎解きのみ', 'ワークショップのみ', '両方'].map(option => (
                                    <label
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            border: participation === option ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: participation === option ? '#ebf8ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="participation"
                                            checked={participation === option}
                                            onChange={() => setParticipation(option)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 500 }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 2: // 全体の満足度
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q7. イベント全体について、当てはまるものを選んでください <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>単一選択</p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {['とても満足した', '満足した', '普通だった', 'あまり満足していない', '内容が少し分かりにくかった'].map(option => (
                                    <label
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            border: overallSatisfaction === option ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: overallSatisfaction === option ? '#ebf8ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="overallSatisfaction"
                                            checked={overallSatisfaction === option}
                                            onChange={() => setOverallSatisfaction(option)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 500 }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q8. 金額の妥当性について、どう感じましたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>単一選択</p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {['安い', '妥当', '高い'].map(option => (
                                    <label
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            border: priceSatisfaction === option ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: priceSatisfaction === option ? '#ebf8ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="priceSatisfaction"
                                            checked={priceSatisfaction === option}
                                            onChange={() => setPriceSatisfaction(option)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 500 }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q9. 特に楽しかった内容は何ですか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {['謎解き', 'ワークショップ（ものづくり）', 'チームで協力すること', '廃材を選ぶ・触る体験', 'ストーリーや世界観', 'その他'].map(option => (
                                    <label
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            border: enjoyableContents.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: enjoyableContents.includes(option) ? '#ebf8ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={enjoyableContents.includes(option)}
                                            onChange={() => handleCheckboxChange(option, setEnjoyableContents, enjoyableContents)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 500 }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                            {enjoyableContents.includes('その他') && (
                                <input
                                    type="text"
                                    value={enjoyableOther}
                                    onChange={(e) => setEnjoyableOther(e.target.value)}
                                    placeholder="その他の内容を入力してください"
                                    style={{
                                        width: '100%',
                                        marginTop: '10px',
                                        padding: '10px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );
            case 3: // 謎解きについて
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q10. 謎解きの難易度や、お子様の様子について、当てはまるものをすべて選んでください <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                            </label>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {[
                                    '全体としてちょうどよかった',
                                    '考えごたえがあった',
                                    '一部に難しいと感じる場面があった',
                                    '一部に簡単だと感じる場面があった',
                                    '年齢によって感じ方が分かれそうだと感じた',
                                    'サポートがあったので安心して取り組めた',
                                    'とても楽しく考えていた',
                                    '楽しみながら取り組めていた',
                                    '普通だった',
                                    '少し難しそうにしていた'
                                ].map(option => (
                                    <label
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            border: mysteryFeedback.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: mysteryFeedback.includes(option) ? '#ebf8ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={mysteryFeedback.includes(option)}
                                            onChange={() => handleCheckboxChange(option, setMysteryFeedback, mysteryFeedback)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                Q11. 謎解きで印象に残った点があれば教えてください
                            </label>
                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>任意</p>
                            <textarea
                                value={mysteryImpression}
                                onChange={(e) => setMysteryImpression(e.target.value)}
                                placeholder="印象に残った点を自由にお書きください"
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.95rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>
                );

            case 4: // ワークショップについて
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q12. お子様はワークショップを楽しんでいましたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['とても楽しく取り組めていた', '楽しそうだった', 'ふつうだった', '少し難しそうだった'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: workshopEngagement.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: workshopEngagement.includes(option) ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={workshopEngagement.includes(option)}
                                                onChange={() => handleCheckboxChange(option, setWorkshopEngagement, workshopEngagement)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                        Q13. お子様にとってワークショップの難易度はどうでしたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                                    </label>
                                    <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {['自由度が高く取り組みやすかった', '発想力を使う内容だった', '少し難しいと感じる場面があった', '簡単だと感じる場面があった', '年齢に応じた工夫が必要だと感じた', 'スタッフのサポートが丁度良かった'].map(option => (
                                            <label
                                                key={option}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '12px',
                                                    border: workshopDifficulty.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    background: workshopDifficulty.includes(option) ? '#ebf8ff' : '#fff',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={workshopDifficulty.includes(option)}
                                                    onChange={() => handleCheckboxChange(option, setWorkshopDifficulty, workshopDifficulty)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <div style={{ marginBottom: '30px' }}>
                                        <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                            Q14. 廃材について、新しく気づいた点はありましたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                                        </label>
                                        <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                        <div style={{ display: 'grid', gap: '10px' }}>
                                            {['廃材でも工夫すれば使えること', 'ごみになる前に再利用できること', '環境問題と身近な生活がつながっていること', '特に新しい気づきはなかった', 'その他'].map(option => (
                                                <label
                                                    key={option}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '12px',
                                                        border: wasteAwareness.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        background: wasteAwareness.includes(option) ? '#ebf8ff' : '#fff',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={wasteAwareness.includes(option)}
                                                        onChange={() => handleCheckboxChange(option, setWasteAwareness, wasteAwareness)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {wasteAwareness.includes('その他') && (
                                            <input
                                                type="text"
                                                value={wasteOther}
                                                onChange={(e) => setWasteOther(e.target.value)}
                                                placeholder="その他の内容を入力してください"
                                                style={{
                                                    width: '100%',
                                                    marginTop: '10px',
                                                    padding: '10px',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '6px',
                                                    fontSize: '0.95rem'
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <div style={{ marginBottom: '30px' }}>
                                            <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                                Q15. お子様は作ったものについて、どう感じていましたか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                                            </label>
                                            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                            <div style={{ display: 'grid', gap: '10px' }}>
                                                {['とても満足していた', '満足していた', 'ふつうだった', 'あまり満足していない様子だった'].map(option => (
                                                    <label
                                                        key={option}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            padding: '12px',
                                                            border: workshopSatisfaction.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            background: workshopSatisfaction.includes(option) ? '#ebf8ff' : '#fff',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={workshopSatisfaction.includes(option)}
                                                            onChange={() => handleCheckboxChange(option, setWorkshopSatisfaction, workshopSatisfaction)}
                                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontWeight: 500 }}>{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div>
                                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                                    Q16. ワークショップで印象に残った点があれば教えてください
                                                </label>
                                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>任意</p>
                                                <textarea
                                                    value={workshopImpression}
                                                    onChange={(e) => setWorkshopImpression(e.target.value)}
                                                    placeholder="印象に残った点を自由にお書きください"
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '100px',
                                                        padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
        </div>
        </div>
            );