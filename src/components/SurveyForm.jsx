import React, { useState, useEffect } from 'react';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwCLHpdFEciVe8ncsiSmNpELAJLiOVo81gx1HjieU-nGC07ZAHHS80narDf9S5OY9ZEcg/exec'; // Replace with your actual GAS Web App URL

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
    const [eventPreferences, setEventPreferences] = useState([]);
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
        '未就学児',
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
        console.log('--- 送信処理開始 ---');
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

            console.log('送信データ:', surveyData);
            console.log('GAS_URL:', GAS_URL);

            console.log('fetch開始...');
            // no-corsを削除してエラーを検知可能にする
            // GASをウェブアプリとして公開し、「全員(匿名)」に権限を与える必要があります
            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(surveyData)
            });
            console.log('fetchレスポンス受信:', response);

            if (!response.ok) {
                throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            }

            const result = await response.json();
            console.log('JSONデコード結果:', result);

            if (result.status === 'success') {
                console.log('成功フラグ設定(showSuccess=true)');
                setShowSuccess(true);
                console.log('--- 送信処理正常終了 ---');
            } else {
                throw new Error(result.message || 'サーバー側でエラーが発生しました');
            }

        } catch (error) {
            console.error('送信エラー詳細:', error);
            alert('送信に失敗しました。もう一度お試しください。エラー内容: ' + error.message);
        } finally {
            console.log('Submitting状態解除');
            setSubmitting(false);
        }
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

                    </div>
                );

            case 5: // 学び・気づき
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q17. このイベントは、環境や廃材について考える「きっかけ」になりそうだと感じましたか？
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>単一選択</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['強く感じた', '感じた', '少し感じた', 'あまり感じなかった'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: environmentalAwareness === option ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: environmentalAwareness === option ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                checked={environmentalAwareness === option}
                                                onChange={() => setEnvironmentalAwareness(option)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q18. お子様は楽しみながら学べていたと感じますか？
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['楽しみながら学べていた', '自分で考える場面が多かった', '環境について自然に考える内容だった', '難しかったが良い経験になった', '学びは感じなかった'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: learningExperience.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: learningExperience.includes(option) ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={learningExperience.includes(option)}
                                                onChange={() => handleCheckboxChange(option, setLearningExperience, learningExperience)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 6: // 改善点・今後
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q19. わかりにくかった点・困った点について
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['説明が少し分かりにくかった', '時間が短く感じた', '時間が長く感じた', '特に困った点はなかった', 'その他'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: difficulties.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: difficulties.includes(option) ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={difficulties.includes(option)}
                                                onChange={() => handleCheckboxChange(option, setDifficulties, difficulties)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                {difficulties.includes('その他') && (
                                    <input
                                        type="text"
                                        value={difficultiesOther}
                                        onChange={(e) => setDifficultiesOther(e.target.value)}
                                        placeholder="具体的に教えてください"
                                        style={{
                                            width: '100%',
                                            marginTop: '10px',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                )}
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q20. 改善してほしい点を自由にお書きください
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>任意</p>
                                <textarea
                                    value={improvementFreeText}
                                    onChange={(e) => setImprovementFreeText(e.target.value)}
                                    placeholder="改善してほしい点を自由にお書きください"
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

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q21. 今後の企画で「あったらいいな」と思うこと
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['謎解きをもっとやりたかった', 'ものづくりの時間を増やしたい', '廃材の種類を増やしてほしい', '開催時間を短くしてほしい', 'その他'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: improvements.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: improvements.includes(option) ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={improvements.includes(option)}
                                                onChange={() => handleCheckboxChange(option, setImprovements, improvements)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q22. 今後、どんなイベントがあれば参加したいですか？
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['自然体験', 'ものづくり・ワークショップ', '音楽・芸術', 'スポーツ・体を動かす', '知育・学習系', 'その他'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: eventPreferences.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: eventPreferences.includes(option) ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={eventPreferences.includes(option)}
                                                onChange={() => handleCheckboxChange(option, setEventPreferences, eventPreferences)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 7: // 星和電機工事について・今後の参加（条件分岐あり）
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q23. 今後、似たイベントがあればどう思いますか？
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '15px' }}>複数選択可</p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['ぜひ参加したい', '機会があれば参加したい', '内容次第で検討したい', 'あまり参加したいと思わない'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: futureParticipation.includes(option) ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: futureParticipation.includes(option) ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={futureParticipation.includes(option)}
                                                onChange={() => handleCheckboxChange(option, setFutureParticipation, futureParticipation)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q24. こんなイベントがあったらいいな、などのアイデアがあれば教えてください
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>任意</p>
                                <textarea
                                    value={futureIdeas}
                                    onChange={(e) => setFutureIdeas(e.target.value)}
                                    placeholder="アイデアを自由にお書きください"
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

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q25. 今後、星和電機工事（株）が同じようなイベントを開催した場合、参加したいと思いますか？ <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>*</span>
                                </label>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {['参加したい', '参加したくない', '内容次第'].map(option => (
                                        <label
                                            key={option}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: seiwaDenkiFuture === option ? '2px solid #3182ce' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: seiwaDenkiFuture === option ? '#ebf8ff' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                checked={seiwaDenkiFuture === option}
                                                onChange={() => setSeiwaDenkiFuture(option)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {seiwaDenkiFuture === '参加したくない' && (
                                <div style={{ marginBottom: '30px', padding: '20px', background: '#f7fafc', borderRadius: '6px' }}>
                                    <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                        Q26. 可能な範囲で理由を記載してください
                                    </label>
                                    <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>任意</p>
                                    <textarea
                                        value={seiwaDenkiNoReason}
                                        onChange={(e) => setSeiwaDenkiNoReason(e.target.value)}
                                        placeholder="理由をお書きください"
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
                            )}

                            {seiwaDenkiFuture === '内容次第' && (
                                <div style={{ marginBottom: '30px', padding: '20px', background: '#f7fafc', borderRadius: '6px' }}>
                                    <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                        Q27. どのような内容であれば参加したいと思いますか？
                                    </label>
                                    <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>任意</p>
                                    <textarea
                                        value={seiwaDenkiCondition}
                                        onChange={(e) => setSeiwaDenkiCondition(e.target.value)}
                                        placeholder="希望する内容をお書きください"
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
                            )}

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', display: 'block', color: '#2d3748' }}>
                                    Q28. 最後に、自由にご意見・ご感想をお書きください
                                </label>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '10px' }}>任意</p>
                                <textarea
                                    value={finalComments}
                                    onChange={(e) => setFinalComments(e.target.value)}
                                    placeholder="自由にお書きください"
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
                );

            default:
                return null;
        }
    };

    // Success Screen
    if (showSuccess) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#3182ce', marginBottom: '20px' }}>✓</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3748', marginBottom: '10px' }}>
                    送信完了
                </h2>
                <p style={{ color: '#718096', marginBottom: '30px' }}>貴重なご意見ありがとうございました</p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ padding: '12px 30px', borderRadius: '6px', border: 'none', background: '#2d3748', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                >
                    トップへ戻る
                </button>
            </div>
        );
    }

    // Preview Screen
    if (showPreview) {
        const previewData = [
            { title: '参加人数', value: `${participantCount}名` },
            { title: 'お子様の年齢', value: childAges.join(', ') },
            { title: '全体の満足度', value: overallSatisfaction },
            { title: '金額の妥当性', value: priceSatisfaction },
            { title: '楽しかった内容', value: enjoyableContents.map(c => c === 'その他' && enjoyableOther ? `その他: ${enjoyableOther}` : c).join(', ') },
            { title: '謎解きの感想', value: mysteryFeedback.join(', ') },
            { title: '謎解きの印象', value: mysteryImpression || '（記入なし）' },
            { title: 'ワークショップの様子', value: workshopEngagement.join(', ') },
            { title: 'ワークショップの難易度', value: workshopDifficulty.join(', ') },
            { title: '廃材への気づき', value: wasteAwareness.map(w => w === 'その他' && wasteOther ? `その他: ${wasteOther}` : w).join(', ') },
            { title: '作品の満足度', value: workshopSatisfaction.join(', ') },
            { title: 'ワークショップの印象', value: workshopImpression || '（記入なし）' },
            { title: '環境意識のきっかけ', value: environmentalAwareness || '（未回答）' },
            { title: '学びの感想', value: learningExperience.join(', ') || '（未回答）' },
            { title: '困った点', value: difficulties.map(d => d === 'その他' && difficultiesOther ? `その他: ${difficultiesOther}` : d).join(', ') || '（未回答）' },
            { title: '改善要望', value: improvements.join(', ') || '（未回答）' },
            { title: '今後の参加意向 (一般)', value: futureParticipation.join(', ') || '（未回答）' },
            { title: '次回やりたいこと', value: futureIdeas || '（記入なし）' },
            { title: '今後の参加意向 (星和電機)', value: seiwaDenkiFuture || '（未回答）' },
            { title: '自由記述', value: finalComments || '（記入なし）' }
        ];

        return (
            <section className="section" style={{ minHeight: '100vh', paddingTop: '80px', background: '#f7fafc' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ padding: '40px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', marginBottom: '30px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
                            回答の確認
                        </h2>

                        <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
                            {previewData.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '15px',
                                        background: '#f7fafc',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600, marginBottom: '5px' }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#2d3748', lineHeight: '1.6' }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setShowPreview(false)}
                                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#4a5568', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                            >
                                戻って修正
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#3182ce', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', opacity: submitting ? 0.7 : 1 }}
                            >
                                {submitting ? '送信中...' : '送信する'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section" style={{ minHeight: '100vh', paddingTop: '80px', background: '#f7fafc' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ padding: '40px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748' }}>
                                {steps[currentStep].title}
                            </h2>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>
                                Step {currentStep + 1} / {totalSteps}
                            </span>
                        </div>
                        <div style={{ height: '6px', background: '#edf2f7', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${((currentStep + 1) / totalSteps) * 100}%`, height: '100%', background: '#3182ce', transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>

                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            style={{
                                padding: '12px 25px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: currentStep === 0 ? '#f7fafc' : '#fff',
                                color: currentStep === 0 ? '#cbd5e1' : '#4a5568',
                                fontWeight: 600,
                                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            戻る
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!isStepComplete(currentStep)}
                            style={{
                                padding: '12px 25px',
                                borderRadius: '6px',
                                border: 'none',
                                background: isStepComplete(currentStep) ? '#3182ce' : '#cbd5e1',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: isStepComplete(currentStep) ? 'pointer' : 'not-allowed',
                                fontSize: '1rem'
                            }}
                        >
                            次へ
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SurveyForm;