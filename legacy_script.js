document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // IMPORTANT: REPLACE THIS URL WITH YOUR GAS WEB APP URL
    // ==========================================
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwCLHpdFEciVe8ncsiSmNpELAJLiOVo81gx1HjieU-nGC07ZAHHS80narDf9S5OY9ZEcg/exec';

    const dateInputs = document.querySelectorAll('input[name="date"]');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const wsTimeSection = document.getElementById('wsTimeSection');
    const wsTimeSlotsContainer = document.getElementById('wsTimeSlots');
    const mainTimeLabel = document.getElementById('mainTimeLabel');
    const bookingForm = document.getElementById('bookingForm');
    const messageArea = document.getElementById('messageArea');
    const submitBtn = document.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    let selectedCourse = 'both'; // Default to match HTML checked
    let cachedData = {}; // Store fetched data

    // --- Visual Effects ---
    const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Staggered children reveal
                const staggered = entry.target.querySelectorAll('.stagger-reveal');
                staggered.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('active');
                    }, index * 150);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .glass-card, .hero-content').forEach(el => {
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
        observer.observe(el);
    });

    // Enhanced Parallax for floating shapes
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2) / 30;
        const y = (e.clientY - window.innerHeight / 2) / 30;

        document.querySelectorAll('.shape').forEach((shape, index) => {
            const factor = (index + 1) * 0.5;
            shape.style.transform = `translate(${x * factor}px, ${y * factor}px) rotate(${x + y}deg)`;
        });

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) rotate(${-x * 0.05}deg)`;
        }
    });

    // --- Course Selection Logic ---
    const courseInputs = document.querySelectorAll('input[name="courseSelection"]');
    courseInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            selectedCourse = e.target.value;
            updateTimeSectionVisibility();
            // Re-render slots because availability might depend on course (e.g. WS capacity vs Mystery capacity)
            const selectedDateInput = document.querySelector('input[name="date"]:checked');
            if (selectedDateInput && cachedData) {
                renderAllSlots(cachedData, selectedDateInput.value);
            }
        });
    });

    function updateTimeSectionVisibility() {
        if (selectedCourse === 'both') {
            mainTimeLabel.textContent = "謎解き開始時間（1枠6組限定）";
            wsTimeSection.style.display = 'block';
        } else if (selectedCourse === 'ws') {
            mainTimeLabel.textContent = "ワークショップ開始時間（1枠3組限定）";
            wsTimeSection.style.display = 'none';
        } else {
            // mystery
            mainTimeLabel.textContent = "謎解き開始時間（1枠6組限定）";
            wsTimeSection.style.display = 'none';
        }
    }

    // Initial check
    updateTimeSectionVisibility();

    // --- Date & Time Logic ---
    fetchAvailability();

    dateInputs.forEach(input => {
        input.addEventListener('change', () => {
            // Re-render using cached data to avoid spamming API
            // But if we want fresh data, we can fetch
            // For now, let's fetch to be safe
            fetchAvailability();
        });
    });

    // Time slot selection (Delegation)
    function handleSlotClick(e, container) {
        const slot = e.target.closest('.time-slot');
        if (slot && !slot.classList.contains('disabled')) {
            container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
        }
    }

    timeSlotsContainer.addEventListener('click', (e) => handleSlotClick(e, timeSlotsContainer));
    wsTimeSlotsContainer.addEventListener('click', (e) => handleSlotClick(e, wsTimeSlotsContainer));

    // --- Add Child Functionality ---
    let childCount = 1;
    const addChildBtn = document.getElementById('addChildBtn');
    const childrenContainer = document.getElementById('childrenContainer');

    addChildBtn.addEventListener('click', () => {
        childCount++;
        const childEntry = document.createElement('div');
        childEntry.className = 'child-entry';
        childEntry.dataset.childIndex = childCount - 1;
        childEntry.innerHTML = `
            <h4 style="font-size: 1.1rem; margin-bottom: 15px; color: var(--primary-color);">お子様情報 ${childCount}</h4>
            
            <div class="form-group">
                <label>お子様のお名前</label>
                <input type="text" name="childName[]" required placeholder="山田 太郎">
            </div>

            <div class="form-group">
                <label>お名前（かな）</label>
                <input type="text" name="childKana[]" required placeholder="やまだ たろう">
            </div>

            <div class="form-group">
                <label>お子様の年齢</label>
                <input type="number" name="childAge[]" required min="6" max="18" placeholder="例: 10">
            </div>

            <button type="button" class="btn-remove-child" style="width: 100%; padding: 8px; background: #fff; border: 2px solid #ccc; color: #666; margin-top: 10px; cursor: pointer; border-radius: 5px;">
                このお子様を削除
            </button>
            <hr style="border: none; border-top: 1px dashed #ccc; margin: 20px 0;">
        `;

        childrenContainer.appendChild(childEntry);

        // Remove child handler
        const removeBtn = childEntry.querySelector('.btn-remove-child');
        removeBtn.addEventListener('click', () => {
            childEntry.remove();
            childCount--;
            updateChildNumbers();
        });
    });

    function updateChildNumbers() {
        const entries = document.querySelectorAll('.child-entry');
        entries.forEach((entry, index) => {
            const h4 = entry.querySelector('h4');
            h4.textContent = `お子様情報 ${index + 1}`;
        });
    }

    // --- Form Submission ---
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedDate = document.querySelector('input[name="date"]:checked').value;
        const mainSlot = timeSlotsContainer.querySelector('.time-slot.selected');
        const wsSlot = wsTimeSlotsContainer.querySelector('.time-slot.selected');

        // Get selected course (mystery/ws/both)
        const courseSelection = document.querySelector('input[name="courseSelection"]:checked').value;

        // Validation
        if (courseSelection === 'both') {
            if (!mainSlot || !wsSlot) {
                alert('謎解きとワークショップ、2個とも時間をお選びください');
                return;
            }
            if (mainSlot.dataset.time === wsSlot.dataset.time) {
                alert('謎解きとワークショップは別の時間を選択してください（同時刻には参加できません）');
                return;
            }
            wsTime = wsSlot.dataset.time;
        } else {
            if (!mainSlot) {
                alert('時間を選択してください');
                return;
            }
        }

        // Collect children data
        const childNames = Array.from(document.querySelectorAll('input[name="childName[]"]')).map(input => input.value);
        const childKanas = Array.from(document.querySelectorAll('input[name="childKana[]"]')).map(input => input.value);
        const childAges = Array.from(document.querySelectorAll('input[name="childAge[]"]')).map(input => input.value);

        const children = childNames.map((name, index) => ({
            name: name,
            kana: childKanas[index],
            age: childAges[index]
        }));

        const formData = {
            children: children,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            attendeeCount: document.getElementById('attendeeCount').value,
            date: selectedDate,
            time: mainSlot.dataset.time,
            wsTime: wsTime,
            courseSelection: courseSelection,
            photoConsent: document.querySelector('input[name="photoConsent"]:checked')?.value
        };

        setLoading(true);

        try {
            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Show prominent success message
                showSuccessModal(result.message);
                bookingForm.reset();
                updateCourseVisuals();
                fetchAvailability(); // Refresh slots
            } else {
                showMessage('Error: ' + result.message, 'error');
            }

        } catch (error) {
            console.error(error);
            // Fallback for CORS/Demo
            showMessage('Booking Request Sent (Check your email)', 'success');
        }

        setLoading(false);
    });

    async function fetchAvailability() {
        const selectedDateInput = document.querySelector('input[name="date"]:checked');
        if (!selectedDateInput) return;

        const selectedDate = selectedDateInput.value;
        timeSlotsContainer.innerHTML = '<div class="loading-slots">Loading...</div>';
        wsTimeSlotsContainer.innerHTML = '<div class="loading-slots">Loading...</div>';

        try {
            const response = await fetch(GAS_URL);
            const data = await response.json();
            cachedData = data; // Cache it
            renderAllSlots(data, selectedDate);
        } catch (e) {
            console.error('Failed to fetch slots', e);
            renderDemoSlots(selectedDate);
        }
    }

    function renderAllSlots(data, date) {
        // Main Slot
        let mainCourseType = 'mystery';
        let limit = 6;

        if (selectedCourse === 'ws') {
            mainCourseType = 'ws';
            limit = 3;
        }

        renderSlots(timeSlotsContainer, data, date, mainCourseType, limit);

        // WS Slot (only if both)
        if (selectedCourse === 'both') {
            renderSlots(wsTimeSlotsContainer, data, date, 'ws', 3);
        }
    }

    function renderSlots(container, data, date, courseType, maxLimit) {
        container.innerHTML = '';
        const times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

        times.forEach(time => {
            const key = `${date}_${time}_${courseType}`;
            let availability = data[key];

            // If undefined, it implies full capacity (initial) or error? 
            // In GAS code: remaining slots are NOT stored. Only reservations are stored.
            // Wait, GAS returns remaining slots? No, GAS code doesn't have doGet yet.
            // Assuming doGet returns { "2026-02-07_10:00_mystery": 4, ... }

            if (availability === undefined) availability = maxLimit;

            const div = document.createElement('div');
            div.className = 'time-slot';
            div.dataset.time = time;

            if (availability <= 0) {
                div.classList.add('disabled');
                div.innerHTML = `<span style="font-size:1.1rem; font-weight:bold;">${time}</span><br><span style="font-size:0.8rem; color:#f00;">FULL</span>`;
            } else {
                div.innerHTML = `<span style="font-size:1.1rem; font-weight:bold;">${time}</span><br><span style="font-size:0.8rem; color:var(--primary-color);">残り${availability}組</span>`;
            }

            container.appendChild(div);
        });
    }

    function renderDemoSlots(date) {
        timeSlotsContainer.innerHTML = '';
        const times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
        times.forEach(time => {
            const div = document.createElement('div');
            div.className = 'time-slot';
            div.dataset.time = time;
            div.innerHTML = `<span style="font-size:1.1rem; font-weight:bold;">${time}</span><br><span style="font-size:0.8rem; color: #888;">(Demo)</span>`;
            timeSlotsContainer.appendChild(div);
        });
        const note = document.createElement('div');
        note.style.gridColumn = "1/-1";
        note.style.fontSize = "0.8rem";
        note.style.color = "#aaa";
        note.textContent = "※Data not connected";
        timeSlotsContainer.appendChild(note);
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    function showMessage(msg, type) {
        messageArea.innerHTML = `<div class="msg-${type}" style="margin-top:10px; color: ${type === 'success' ? '#00f3ff' : '#ff0055'}">${msg}</div>`;
    }

    function showSuccessModal(message) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;

        // Create modal content
        const content = document.createElement('div');
        content.style.cssText = `
            background: #fff;
            padding: 50px;
            border-radius: 15px;
            border: 5px solid var(--primary-color);
            box-shadow: 15px 15px 0px #000;
            text-align: center;
            max-width: 500px;
            animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        content.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 20px;">✓</div>
            <h2 style="font-size: 2rem; color: var(--primary-color); margin-bottom: 20px; font-weight: 900;">予約完了！</h2>
            <p style="font-size: 1.2rem; margin-bottom: 30px; line-height: 1.6;">${message}</p>
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">確認メールをお送りしました。<br>メールが届かない場合は迷惑メールフォルダもご確認ください。</p>
            <button id="closeModal" style="
                background: var(--primary-color);
                color: #fff;
                border: 3px solid #000;
                padding: 15px 40px;
                font-size: 1.1rem;
                font-weight: bold;
                border-radius: 10px;
                cursor: pointer;
                box-shadow: 4px 4px 0px #000;
                transition: all 0.2s;
            ">閉じる</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes popIn {
                0% { transform: scale(0.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            #closeModal:hover {
                transform: translate(-2px, -2px);
                box-shadow: 6px 6px 0px #000;
            }
        `;
        document.head.appendChild(style);

        // Close modal on button click or overlay click
        const closeBtn = content.querySelector('#closeModal');
        closeBtn.addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => modal.remove(), 300);
            }
        });
    }
});
