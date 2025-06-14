// ===== 전역 변수 =====
let currentDate = new Date();
let today = new Date();
let selectedDate = null; // 모달에서 선택된 날짜
let events = {}; // 일정 저장 객체 {날짜: [일정들]}
let editingEventId = null; // 수정 중인 일정 ID
let selectedColor = 'blue'; // 현재 선택된 색상
let currentView = 'month'; // 'month' 또는 'week'
let currentWeekStart = null; // 현재 주간 보기의 시작 날짜

// ===== 유틸리티 함수들 (먼저 정의) =====

// 날짜 비교 함수
function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// 날짜 포맷팅 함수 (YYYY-MM-DD)
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// HTML 이스케이프 함수 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 클릭 효과 추가
function addClickEffect(element) {
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = '';
    }, 150);
}

// ===== 일정 관련 함수들 =====

// 일정 표시 추가
function addEventIndicators(dayElement, dateObj) {
    const dateKey = formatDate(dateObj);
    const dayEvents = events[dateKey] || [];
    
    if (dayEvents.length > 0) {
        dayElement.classList.add('has-events');
        
        // 주요 색상 결정 (첫 번째 일정의 색상 또는 혼합)
        const mainColor = getMainColorForDate(dayEvents);
        dayElement.classList.add(`color-${mainColor}`);
        
        // 일정 개수 표시
        const eventCount = document.createElement('div');
        eventCount.className = 'event-count';
        eventCount.textContent = dayEvents.length;
        dayElement.appendChild(eventCount);
    }
}

// 해당 날짜의 주요 색상 결정
function getMainColorForDate(dayEvents) {
    if (dayEvents.length === 1) {
        return dayEvents[0].color || 'blue';
    }
    
    // 여러 일정이 있을 때 가장 많은 색상 또는 첫 번째 색상
    const colorCounts = {};
    dayEvents.forEach(event => {
        const color = event.color || 'blue';
        colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
    
    // 가장 많이 사용된 색상 반환
    return Object.keys(colorCounts).reduce((a, b) => 
        colorCounts[a] > colorCounts[b] ? a : b
    );
}

// 오늘 표시 아이콘 추가
function addTodayIndicator(dayElement) {
    const todayIndicator = document.createElement('div');
    todayIndicator.className = 'today-indicator';
    todayIndicator.textContent = '●';
    dayElement.appendChild(todayIndicator);
}

// ===== 날짜 스타일 및 요소 생성 함수들 =====

// 날짜 스타일 적용
function applyDayStyles(dayElement, dateObj, dayOfWeek, isOtherMonth) {
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
        return;
    }
    
    // 요일별 스타일
    if (dayOfWeek === 0) dayElement.classList.add('sunday');
    if (dayOfWeek === 6) dayElement.classList.add('saturday');
    
    // 오늘 날짜 체크
    if (isSameDate(dateObj, today)) {
        dayElement.classList.add('today');
        addTodayIndicator(dayElement);
    }
    
    // 과거 날짜 체크
    if (dateObj < today && !isSameDate(dateObj, today)) {
        dayElement.classList.add('past');
    }
}

// 개별 날짜 요소 생성
function createDayElement(day, year, month, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    // 실제 날짜 객체 생성
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay();
    
    // 날짜 표시
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // 스타일 클래스 적용
    applyDayStyles(dayElement, dateObj, dayOfWeek, isOtherMonth);
    
    // 클릭 이벤트 추가
    dayElement.addEventListener('click', function() {
        handleDayClick(dateObj, dayElement);
    });
    
    // 데이터 속성 추가
    dayElement.setAttribute('data-date', formatDate(dateObj));
    
    // 일정이 있는 날짜 표시 (다른 달이 아닐 때만)
    if (!isOtherMonth) {
        addEventIndicators(dayElement, dateObj);
    }
    
    return dayElement;
}

// ===== 달력 생성 함수들 =====

// 이전 달 날짜들 추가
function addPreviousMonthDays(calendarGrid, year, month, startDayOfWeek) {
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDate = prevMonth.getDate();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayElement = createDayElement(
            prevMonthLastDate - i, 
            year, 
            month - 1, 
            true // 다른 달
        );
        calendarGrid.appendChild(dayElement);
    }
}

// 현재 달 날짜들 추가
function addCurrentMonthDays(calendarGrid, year, month, lastDate) {
    for (let day = 1; day <= lastDate; day++) {
        const dayElement = createDayElement(day, year, month, false);
        calendarGrid.appendChild(dayElement);
    }
}

// 다음 달 날짜들 추가
function addNextMonthDays(calendarGrid, year, month, startDayOfWeek, lastDate) {
    const remainingDays = 42 - (startDayOfWeek + lastDate);
    
    for (let day = 1; day <= remainingDays; day++) {
        const dayElement = createDayElement(
            day, 
            year, 
            month + 1, 
            true // 다른 달
        );
        calendarGrid.appendChild(dayElement);
    }
}

// 달력 그리드 생성
function generateCalendarGrid(year, month) {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) {
        console.error('calendarGrid 요소를 찾을 수 없습니다');
        return;
    }
    
    calendarGrid.innerHTML = ''; // 기존 내용 제거
    
    // 해당 월의 첫째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫째 날의 요일 (0: 일요일, 6: 토요일)
    const startDayOfWeek = firstDay.getDay();
    
    console.log(`${month + 1}월 첫째 날 요일: ${startDayOfWeek}, 마지막 날: ${lastDay.getDate()}일`);
    
    // 이전 달의 마지막 날들 추가
    addPreviousMonthDays(calendarGrid, year, month, startDayOfWeek);
    
    // 현재 달의 날짜들 추가
    addCurrentMonthDays(calendarGrid, year, month, lastDay.getDate());
    
    // 다음 달의 첫 날들 추가 (6주 달력을 만들기 위해)
    addNextMonthDays(calendarGrid, year, month, startDayOfWeek, lastDay.getDate());
}

// 현재 월 표시 업데이트
function updateCurrentMonthDisplay(year, month) {
    const monthNames = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    const displayText = `${year}년 ${monthNames[month]}`;
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
        monthElement.textContent = displayText;
    }
}

// 주간 표시 업데이트
function updateWeekDisplay() {
    const monthElement = document.getElementById('currentMonth');
    if (!monthElement || !currentWeekStart) return;
    
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startMonth = currentWeekStart.getMonth() + 1;
    const endMonth = weekEnd.getMonth() + 1;
    const startDate = currentWeekStart.getDate();
    const endDate = weekEnd.getDate();
    const year = currentWeekStart.getFullYear();
    
    let displayText;
    if (startMonth === endMonth) {
        displayText = `${year}년 ${startMonth}월 ${startDate}일 - ${endDate}일`;
    } else {
        displayText = `${year}년 ${startMonth}월 ${startDate}일 - ${endMonth}월 ${endDate}일`;
    }
    
    monthElement.textContent = displayText;
}

// 달력 렌더링 메인 함수
function renderCalendar() {
    try {
        if (currentView === 'month') {
            renderMonthView();
        } else {
            renderWeekView();
        }
    } catch (error) {
        console.error('달력 렌더링 중 오류:', error);
    }
}

// 월간 보기 렌더링
function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    console.log(`월간 달력 렌더링: ${year}년 ${month + 1}월`);
    
    // 현재 월 표시 업데이트
    updateCurrentMonthDisplay(year, month);
    
    // 달력 그리드 생성
    generateCalendarGrid(year, month);
    
    console.log('월간 달력 렌더링 완료');
}

// 주간 보기 렌더링
function renderWeekView() {
    try {
        // 현재 주의 시작일 계산 (일요일 기준)
        if (!currentWeekStart) {
            currentWeekStart = getWeekStart(currentDate);
        }
        
        console.log('주간 달력 렌더링:', currentWeekStart.toLocaleDateString());
        
        // 주간 표시 업데이트
        updateWeekDisplay();
        
        // ⚠️ 이 부분이 문제! 함수 호출 확인
        console.log('generateWeekGrid 함수 호출 시작');
        generateWeekGrid();
        console.log('generateWeekGrid 함수 호출 완료');
        
        console.log('주간 달력 렌더링 완료');
    } catch (error) {
        console.error('주간 달력 렌더링 중 오류:', error);
    }
}

// ===== 이벤트 처리 함수들 =====

// 날짜 클릭 처리
function handleDayClick(date, element) {
    try {
        const formattedDate = formatDate(date);
        const koreanDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        console.log('클릭된 날짜:', formattedDate, '(' + koreanDate + ')');
        
        // 시각적 피드백
        addClickEffect(element);
        
        // 선택된 날짜 저장
        selectedDate = date;
        
        // 모달 열기
        openEventModal(date, koreanDate);
    } catch (error) {
        console.error('날짜 클릭 처리 중 오류:', error);
    }
}

// 이전 달로 이동
function previousMonth() {
    try {
        currentDate.setMonth(currentDate.getMonth() - 1);
        console.log('이전 달로 이동:', currentDate.toLocaleDateString());
        renderCalendar();
    } catch (error) {
        console.error('이전 달 이동 중 오류:', error);
    }
}

// 다음 달로 이동
function nextMonth() {
    try {
        currentDate.setMonth(currentDate.getMonth() + 1);
        console.log('다음 달로 이동:', currentDate.toLocaleDateString());
        renderCalendar();
    } catch (error) {
        console.error('다음 달 이동 중 오류:', error);
    }
}

// 통합 이전/다음 기간 이동
function previousPeriod() {
    try {
        if (currentView === 'month') {
            previousMonth();
        } else {
            previousWeek();
        }
    } catch (error) {
        console.error('이전 기간 이동 중 오류:', error);
    }
}

function nextPeriod() {
    try {
        if (currentView === 'month') {
            nextMonth();
        } else {
            nextWeek();
        }
    } catch (error) {
        console.error('다음 기간 이동 중 오류:', error);
    }
}

// 이전 주로 이동
function previousWeek() {
    try {
        if (!currentWeekStart) {
            currentWeekStart = getWeekStart(currentDate);
        }
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        console.log('이전 주로 이동:', currentWeekStart.toLocaleDateString());
        renderWeekView();
    } catch (error) {
        console.error('이전 주 이동 중 오류:', error);
    }
}

// 다음 주로 이동
function nextWeek() {
    try {
        if (!currentWeekStart) {
            currentWeekStart = getWeekStart(currentDate);
        }
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        console.log('다음 주로 이동:', currentWeekStart.toLocaleDateString());
        renderWeekView();
    } catch (error) {
        console.error('다음 주 이동 중 오류:', error);
    }
}

// ===== 모달 관련 함수들 =====

// 모달 열기
function openEventModal(date, koreanDate) {
    try {
        const modal = document.getElementById('eventModal');
        const selectedDateDiv = document.getElementById('selectedDate');
        const modalTitle = document.getElementById('modalTitle');
        
        if (!modal || !selectedDateDiv) {
            console.error('모달 요소를 찾을 수 없습니다');
            return;
        }
        
        // 수정 모드 초기화
        editingEventId = null;
        modalTitle.textContent = '일정 관리';
        
        // 선택된 날짜 표시
        selectedDateDiv.textContent = koreanDate;
        
        // 해당 날짜의 기존 일정 표시
        displayEventsForDate(date);
        
        // 폼 초기화
        resetEventForm();
        
        // 모달 표시
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('모달 열기 중 오류:', error);
    }
}

// 일정 수정을 위한 모달 열기
function openEditModal(eventId) {
    try {
        if (!selectedDate) return;
        
        const dateKey = formatDate(selectedDate);
        const dayEvents = events[dateKey] || [];
        const eventToEdit = dayEvents.find(event => event.id === eventId);
        
        if (!eventToEdit) {
            console.error('수정할 일정을 찾을 수 없습니다');
            return;
        }
        
        // 수정 모드 설정
        editingEventId = eventId;
        document.getElementById('modalTitle').textContent = '일정 수정';
        
        // 폼에 기존 데이터 입력
        document.getElementById('eventTitle').value = eventToEdit.title || '';
        document.getElementById('eventDescription').value = eventToEdit.description || '';
        document.getElementById('eventPriority').value = eventToEdit.priority || 'normal';
        
        // 시간 설정 (구 형식과 신 형식 모두 지원)
        if (eventToEdit.isAllDay) {
            document.getElementById('allDayCheck').checked = true;
            toggleAllDay();
        } else {
            document.getElementById('allDayCheck').checked = false;
            
            // 신 형식 우선, 구 형식 fallback
            if (eventToEdit.startTime || eventToEdit.endTime) {
                document.getElementById('startTime').value = eventToEdit.startTime || '';
                document.getElementById('endTime').value = eventToEdit.endTime || '';
            } else if (eventToEdit.time) {
                // 구 형식의 time 필드를 startTime으로 변환
                document.getElementById('startTime').value = eventToEdit.time;
                document.getElementById('endTime').value = '';
            }
            
            toggleAllDay();
        }
        
        // 색상 선택
        selectColor(eventToEdit.color || 'blue');
        
        // 버튼 텍스트 변경
        const submitBtn = document.querySelector('#eventForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '일정 수정';
        }
        
        console.log('수정 모드로 설정됨:', eventToEdit);
    } catch (error) {
        console.error('수정 모달 열기 중 오류:', error);
    }
}

// 모달 닫기
function closeModal() {
    try {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        selectedDate = null;
        editingEventId = null;
        
        // 버튼 텍스트 원래대로
        const submitBtn = document.querySelector('#eventForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '일정 추가';
        }
        
        // 모달 제목 원래대로
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = '일정 관리';
        }
    } catch (error) {
        console.error('모달 닫기 중 오류:', error);
    }
}

// 모달 이벤트 설정
function setupModalEvents() {
    try {
        const modal = document.getElementById('eventModal');
        if (!modal) return;
        
        // 모달 외부 클릭시 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    } catch (error) {
        console.error('모달 이벤트 설정 중 오류:', error);
    }
}

// ===== 일정 관리 함수들 =====

// 이벤트 폼 설정
function setupEventForm() {
    try {
        const form = document.getElementById('eventForm');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewEvent();
        });
    } catch (error) {
        console.error('이벤트 폼 설정 중 오류:', error);
    }
}

// 새 일정 추가 또는 수정
function addNewEvent() {
    try {
        if (!selectedDate) return;
        
        const title = document.getElementById('eventTitle').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const priority = document.getElementById('eventPriority').value;
        const isAllDay = document.getElementById('allDayCheck').checked;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        
        // 필수 필드 검증
        if (!title) {
            alert('일정 제목을 입력해주세요.');
            return;
        }
        
        // 시간 검증
        if (!isAllDay && startTime && endTime && startTime >= endTime) {
            alert('종료 시간이 시작 시간보다 늦어야 합니다.');
            return;
        }
        
        const dateKey = formatDate(selectedDate);
        
        if (editingEventId) {
            // 기존 일정 수정
            if (events[dateKey]) {
                const eventIndex = events[dateKey].findIndex(event => event.id === editingEventId);
                if (eventIndex !== -1) {
                    events[dateKey][eventIndex] = {
                        ...events[dateKey][eventIndex],
                        title: title,
                        description: description,
                        priority: priority,
                        isAllDay: isAllDay,
                        startTime: isAllDay ? '' : startTime,
                        endTime: isAllDay ? '' : endTime,
                        color: selectedColor,
                        updatedAt: new Date().toISOString()
                    };
                    console.log('일정 수정됨:', events[dateKey][eventIndex]);
                }
            }
        } else {
            // 새 일정 추가
            const newEvent = {
                id: Date.now(),
                title: title,
                description: description,
                priority: priority,
                isAllDay: isAllDay,
                startTime: isAllDay ? '' : startTime,
                endTime: isAllDay ? '' : endTime,
                color: selectedColor,
                createdAt: new Date().toISOString()
            };
            
            if (!events[dateKey]) {
                events[dateKey] = [];
            }
            
            events[dateKey].push(newEvent);
            console.log('새 일정 추가됨:', newEvent);
        }
        
        // localStorage에 저장
        saveEventsToStorage();
        
        // 화면 업데이트
        displayEventsForDate(selectedDate);
        renderCalendar();
        
        // 폼 초기화
        resetEventForm();
        
        // 수정 모드 해제
        editingEventId = null;
        const submitBtn = document.querySelector('#eventForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '일정 추가';
        }
        
    } catch (error) {
        console.error('일정 추가/수정 중 오류:', error);
    }
}

// 일정 삭제
function deleteEvent(eventId) {
    try {
        if (!selectedDate) return;
        
        const dateKey = formatDate(selectedDate);
        if (events[dateKey]) {
            events[dateKey] = events[dateKey].filter(event => event.id !== eventId);
            
            if (events[dateKey].length === 0) {
                delete events[dateKey];
            }
            
            saveEventsToStorage();
            displayEventsForDate(selectedDate);
            renderCalendar();
            
            console.log('일정 삭제됨:', eventId);
        }
    } catch (error) {
        console.error('일정 삭제 중 오류:', error);
    }
}

// 해당 날짜의 일정 표시
function displayEventsForDate(date) {
    try {
        const eventList = document.getElementById('eventList');
        if (!eventList) return;
        
        const dateKey = formatDate(date);
        const dayEvents = events[dateKey] || [];
        
        if (dayEvents.length === 0) {
            eventList.innerHTML = '<div class="event-list-empty">이 날에는 일정이 없습니다.</div>';
            return;
        }
        
        eventList.innerHTML = dayEvents.map(event => {
            let timeDisplay = '';
            if (event.isAllDay) {
                timeDisplay = '<div class="event-time">🌅 하루 종일</div>';
            } else if (event.startTime || event.endTime) {
                const start = event.startTime || '';
                const end = event.endTime || '';
                if (start && end) {
                    timeDisplay = `<div class="event-time">🕐 ${start} - ${end}</div>`;
                } else if (start) {
                    timeDisplay = `<div class="event-time">🕐 ${start} 시작</div>`;
                }
            }
            
            return `
                <div class="event-item color-${event.color || 'blue'}">
                    <div class="event-info">
                        <div class="event-title">${escapeHtml(event.title)}</div>
                        ${timeDisplay}
                        ${event.description ? `<div class="event-description">${escapeHtml(event.description)}</div>` : ''}
                    </div>
                    <div class="event-actions">
                        <button class="event-delete" style="background: #4CAF50; margin-right: 5px;" onclick="openEditModal(${event.id})">수정</button>
                        <button class="event-delete" onclick="deleteEvent(${event.id})">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('일정 표시 중 오류:', error);
    }
}

// 폼 초기화
function resetEventForm() {
    try {
        const elements = ['eventTitle', 'eventDescription', 'eventPriority'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'eventPriority') {
                    element.value = 'normal';
                } else {
                    element.value = '';
                }
            }
        });
        
        // 시간 관련 폼 초기화
        document.getElementById('allDayCheck').checked = false;
        document.getElementById('startTime').value = '';
        document.getElementById('endTime').value = '';
        toggleAllDay(); // UI 상태 업데이트
        
        // 색상 초기화 (파란색으로)
        selectColor('blue');
        
        // 수정 모드 해제
        editingEventId = null;
        
    } catch (error) {
        console.error('폼 초기화 중 오류:', error);
    }
}

// ===== 시간 설정 관련 함수들 =====

// 시간 입력 설정
function setupTimeInputs() {
    try {
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        
        if (startTimeInput && endTimeInput) {
            startTimeInput.addEventListener('change', updateDuration);
            endTimeInput.addEventListener('change', updateDuration);
        }
    } catch (error) {
        console.error('시간 입력 설정 중 오류:', error);
    }
}

// 하루 종일 토글
function toggleAllDay() {
    try {
        const allDayCheck = document.getElementById('allDayCheck');
        const timeSection = document.getElementById('timeSection');
        const timeInputs = document.getElementById('timeInputs');
        const durationDisplay = document.getElementById('durationDisplay');
        
        if (!allDayCheck || !timeSection || !timeInputs) return;
        
        if (allDayCheck.checked) {
            // 하루 종일 선택됨
            timeSection.classList.add('all-day');
            timeInputs.classList.add('disabled');
            if (durationDisplay) durationDisplay.classList.add('hidden');
            
            // 시간 입력 값 초기화
            document.getElementById('startTime').value = '';
            document.getElementById('endTime').value = '';
        } else {
            // 시간 설정 모드
            timeSection.classList.remove('all-day');
            timeInputs.classList.remove('disabled');
            updateDuration(); // 기간 표시 업데이트
        }
    } catch (error) {
        console.error('하루 종일 토글 중 오류:', error);
    }
}

// 일정 기간 계산 및 표시
function updateDuration() {
    try {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const durationDisplay = document.getElementById('durationDisplay');
        const allDayCheck = document.getElementById('allDayCheck');
        
        if (!durationDisplay || allDayCheck.checked) return;
        
        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            
            if (end > start) {
                const diffMs = end - start;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                let durationText = '일정 기간: ';
                if (diffHours > 0) {
                    durationText += `${diffHours}시간 `;
                }
                if (diffMinutes > 0) {
                    durationText += `${diffMinutes}분`;
                }
                if (diffHours === 0 && diffMinutes === 0) {
                    durationText += '0분';
                }
                
                durationDisplay.textContent = durationText;
                durationDisplay.classList.remove('hidden');
            } else {
                durationDisplay.textContent = '⚠️ 종료 시간이 시작 시간보다 빨라요';
                durationDisplay.classList.remove('hidden');
                durationDisplay.style.color = '#ff6b6b';
                return;
            }
        } else {
            durationDisplay.classList.add('hidden');
        }
        
        // 정상 색상으로 복원
        durationDisplay.style.color = '#667eea';
    } catch (error) {
        console.error('기간 계산 중 오류:', error);
    }
}

// ===== 색상 관련 함수들 =====

// 색상 선택기 설정
function setupColorPicker() {
    try {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                selectColor(color);
            });
        });
        
        // 기본 색상 설정
        selectColor('blue');
    } catch (error) {
        console.error('색상 선택기 설정 중 오류:', error);
    }
}

// 색상 선택
function selectColor(color) {
    try {
        selectedColor = color;
        
        // 모든 색상 옵션에서 선택 해제
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // 선택된 색상 표시
        const selectedOption = document.querySelector(`.color-option[data-color="${color}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        console.log('색상 선택됨:', color);
    } catch (error) {
        console.error('색상 선택 중 오류:', error);
    }
}

// ===== 로컬 스토리지 관련 함수들 =====

// 일정을 localStorage에 저장
function saveEventsToStorage() {
    try {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        console.log('일정이 localStorage에 저장되었습니다.');
    } catch (error) {
        console.error('일정 저장 실패:', error);
    }
}

// localStorage에서 일정 불러오기
function loadEventsFromStorage() {
    try {
        const savedEvents = localStorage.getItem('calendarEvents');
        if (savedEvents) {
            events = JSON.parse(savedEvents);
            console.log('일정이 localStorage에서 불러와졌습니다:', events);
        }
    } catch (error) {
        console.error('일정 불러오기 실패:', error);
        events = {};
    }
}

// ===== 주간 보기 관련 함수들 =====

// 주의 시작일 구하기 (일요일 기준)
function getWeekStart(date) {
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    return weekStart;
}

// 주간 그리드 생성
function generateWeekGrid() {
    try {
        const weekHeader = document.getElementById('weekHeader');
        const weekGrid = document.getElementById('weekGrid');
        
        if (!weekHeader || !weekGrid || !currentWeekStart) return;
        
        console.log('주간 그리드 생성 시작');
        
        // 헤더 생성
        generateWeekHeader(weekHeader);
        
        // 시간대별 그리드 생성
        generateWeekTimeGrid(weekGrid);
        
        console.log('주간 그리드 생성 완료');
        
    } catch (error) {
        console.error('주간 그리드 생성 중 오류:', error);
    }
}

// 주간 헤더 생성
function generateWeekHeader(weekHeader) {
    weekHeader.innerHTML = '';
    
    // 시간 라벨 빈 공간
    const timeLabel = document.createElement('div');
    timeLabel.className = 'time-label';
    weekHeader.appendChild(timeLabel);
    
    // 7일간의 날짜 헤더
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(currentWeekStart);
        currentDay.setDate(currentDay.getDate() + i);
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'week-day-header';
        
        // 오늘 날짜 체크
        if (isSameDate(currentDay, today)) {
            dayHeader.classList.add('today');
        }
        
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[currentDay.getDay()];
        const dayNumber = currentDay.getDate();
        
        dayHeader.innerHTML = `
            <div class="day-number">${dayNumber}</div>
            <div class="day-name">${dayName}</div>
        `;
        
        // 클릭 이벤트 추가
        dayHeader.addEventListener('click', () => {
            handleDayClick(currentDay, dayHeader);
        });
        
        weekHeader.appendChild(dayHeader);
    }
}



// 시간대별 주간 일정 표시
function displayWeekEventsForTimeSlot(dayColumn, date, timeSlot) {
    const dateKey = formatDate(date);
    const dayEvents = events[dateKey] || [];
    
    console.log(`${formatDate(date)} ${timeSlot.label}에 일정 표시 중:`, dayEvents.length, '개');
    
    // 해당 시간대에 맞는 일정들만 필터링
    const timeSlotEvents = dayEvents.filter(event => {
        const belongs = isEventInTimeSlot(event, timeSlot);
        console.log(`일정 "${event.title}" -> ${timeSlot.label}: ${belongs}`);
        return belongs;
    });
    
    console.log(`${timeSlot.label}에 표시될 일정:`, timeSlotEvents.length, '개');
    
    timeSlotEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `week-event color-${event.color || 'blue'}`;
        
        // 시간과 제목 분리해서 표시
        const timeSpan = document.createElement('span');
        timeSpan.className = 'week-event-time';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'week-event-title';
        titleSpan.textContent = event.title;
        
        // 시간 표시 로직 (시간대에 따라 다르게)
        if (timeSlot.id === 'all-day') {
            // 하루 종일 시간대에서는 "종일"만 표시
            if (event.isAllDay) {
                timeSpan.textContent = '종일';
                eventElement.appendChild(timeSpan);
            }
        } else {
            // 다른 시간대에서는 구체적인 시간 표시
            if (!event.isAllDay) {
                // 신 형식: startTime, endTime 사용
                if (event.startTime || event.endTime) {
                    if (event.startTime && event.endTime) {
                        timeSpan.textContent = `${event.startTime}-${event.endTime}`;
                    } else if (event.startTime) {
                        timeSpan.textContent = event.startTime;
                    }
                }
                // 구 형식: time 필드 사용 (하위 호환성)
                else if (event.time) {
                    timeSpan.textContent = event.time;
                }
                
                if (timeSpan.textContent) {
                    eventElement.appendChild(timeSpan);
                }
            }
        }
        
        eventElement.appendChild(titleSpan);
        
        // 툴팁 추가
        let tooltipText = event.title;
        if (event.isAllDay) {
            tooltipText = `🌅 하루 종일: ${tooltipText}`;
        } else if (event.startTime || event.endTime) {
            const timeStr = event.startTime && event.endTime 
                ? `${event.startTime} - ${event.endTime}` 
                : (event.startTime || '');
            if (timeStr) tooltipText = `🕐 ${timeStr}: ${tooltipText}`;
        }
        if (event.description) tooltipText += `\n${event.description}`;
        eventElement.title = tooltipText;
        
        // 일정 클릭 이벤트 (수정용)
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedDate = date;
            openEditModal(event.id);
        });
        
        dayColumn.appendChild(eventElement);
    });
}

// 일정이 특정 시간대에 속하는지 확인
function isEventInTimeSlot(event, timeSlot) {
    console.log(`일정 체크: "${event.title}", 하루종일: ${event.isAllDay}, 구형식시간: ${event.time}, 시작시간: ${event.startTime}, 시간대: ${timeSlot.id}`);
    
    // 하루 종일 일정인 경우
    if (event.isAllDay) {
        const result = timeSlot.id === 'all-day';
        console.log(`하루종일 일정 -> ${timeSlot.id === 'all-day' ? '하루종일 시간대' : '다른 시간대'}: ${result}`);
        return result;
    }
    
    // 하루 종일 시간대에서는 하루 종일 일정만 표시
    if (timeSlot.id === 'all-day') {
        console.log('하루종일 시간대인데 시간 일정임: false');
        return false;
    }
    
    // 시간 정보 추출 (구 형식과 신 형식 모두 지원)
    let timeToCheck = null;
    
    if (event.startTime) {
        // 신 형식: startTime 사용
        timeToCheck = event.startTime;
        console.log(`신 형식 시작시간 사용: ${timeToCheck}`);
    } else if (event.time) {
        // 구 형식: time 필드 사용
        timeToCheck = event.time;
        console.log(`구 형식 시간 사용: ${timeToCheck}`);
    }
    
    // 시간이 설정되지 않은 경우 오전에 표시
    if (!timeToCheck) {
        const result = timeSlot.id === 'morning';
        console.log(`시간 미설정 -> 오전에 표시: ${result}`);
        return result;
    }
    
    // 시간이 있는 경우 해당 시간대 확인
    const startHour = parseInt(timeToCheck.split(':')[0]);
    console.log(`분석할 시간: ${timeToCheck}, 시작 시간: ${startHour}시`);
    
    // 시간대별 분류
    let result = false;
    switch (timeSlot.id) {
        case 'morning':
            result = startHour >= 6 && startHour < 12;
            console.log(`오전 체크 (6-12시): ${result}`);
            break;
        case 'afternoon':
            result = startHour >= 12 && startHour < 18;
            console.log(`오후 체크 (12-18시): ${result}`);
            break;
        case 'evening':
            result = startHour >= 18 || startHour < 6;
            console.log(`저녁 체크 (18시 이후 또는 6시 이전): ${result}`);
            break;
        default:
            result = false;
    }
    return result;
}

// ===== 보기 모드 전환 함수들 (전역 함수로 명시적 정의) =====

// 월간 보기로 전환
function switchToMonthView() {
    try {
        console.log('월간 보기 전환 시작');
        currentView = 'month';
        
        // UI 요소 확인
        const monthView = document.getElementById('monthView');
        const weekView = document.getElementById('weekView');
        const monthBtn = document.getElementById('monthViewBtn');
        const weekBtn = document.getElementById('weekViewBtn');
        
        // UI 업데이트
        if (monthView) {
            monthView.classList.remove('hidden');
            console.log('월간 보기 표시');
        }
        
        if (weekView) {
            weekView.classList.remove('active');
            console.log('주간 보기 숨김');
        }
        
        // 버튼 활성화 상태 변경
        if (monthBtn) monthBtn.classList.add('active');
        if (weekBtn) weekBtn.classList.remove('active');
        
        // 월간 달력 렌더링
        renderMonthView();
        
        console.log('월간 보기 전환 완료');
    } catch (error) {
        console.error('월간 보기 전환 중 오류:', error);
    }
}

// 주간 보기로 전환
function switchToWeekView() {
    try {
        console.log('주간 보기 전환 시작');
        currentView = 'week';
        
        // 현재 날짜 기준으로 주간 시작일 설정
        currentWeekStart = getWeekStart(currentDate);
        console.log('주간 시작일:', currentWeekStart.toLocaleDateString());
        
        // UI 요소 확인
        const monthView = document.getElementById('monthView');
        const weekView = document.getElementById('weekView');
        const monthBtn = document.getElementById('monthViewBtn');
        const weekBtn = document.getElementById('weekViewBtn');
        
        console.log('UI 요소 확인:', {
            monthView: !!monthView,
            weekView: !!weekView,
            monthBtn: !!monthBtn,
            weekBtn: !!weekBtn
        });
        
        // UI 업데이트
        if (monthView) {
            monthView.classList.add('hidden');
            console.log('월간 보기 숨김');
        }
        
        if (weekView) {
            weekView.classList.add('active');
            console.log('주간 보기 활성화');
        }
        
        // 버튼 활성화 상태 변경
        if (monthBtn) monthBtn.classList.remove('active');
        if (weekBtn) weekBtn.classList.add('active');
        
        // 주간 달력 렌더링
        renderWeekView();
        
        console.log('주간 보기 전환 완료');
        
        // 최종 상태 확인
        setTimeout(() => {
            const weekViewStyle = window.getComputedStyle(weekView);
            console.log('주간 보기 최종 display 상태:', weekViewStyle.display);
        }, 100);
        
    } catch (error) {
        console.error('주간 보기 전환 중 오류:', error);
    }
}

// 전역 범위에서 함수 접근 가능하도록 명시적 할당
window.switchToMonthView = switchToMonthView;
window.switchToWeekView = switchToWeekView;

// ===== 주간 보기 관련 함수들 =====

// 주의 시작일 구하기 (일요일 기준)
function getWeekStart(date) {
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    return weekStart;
}

// 주간 그리드 생성
function generateWeekGrid() {
    try {
        const weekHeader = document.getElementById('weekHeader');
        const weekGrid = document.getElementById('weekGrid');
        
        if (!weekHeader || !weekGrid || !currentWeekStart) return;
        
        // 헤더 생성
        generateWeekHeader(weekHeader);
        
        // 시간대별 그리드 생성 (하루 종일 일정 영역)
        generateWeekTimeGrid(weekGrid);
        
    } catch (error) {
        console.error('주간 그리드 생성 중 오류:', error);
    }
}

// 주간 헤더 생성
function generateWeekHeader(weekHeader) {
    weekHeader.innerHTML = '';
    
    // 시간 라벨 빈 공간
    const timeLabel = document.createElement('div');
    timeLabel.className = 'time-label';
    weekHeader.appendChild(timeLabel);
    
    // 7일간의 날짜 헤더
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(currentWeekStart);
        currentDay.setDate(currentDay.getDate() + i);
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'week-day-header';
        
        // 오늘 날짜 체크
        if (isSameDate(currentDay, today)) {
            dayHeader.classList.add('today');
        }
        
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[currentDay.getDay()];
        const dayNumber = currentDay.getDate();
        
        dayHeader.innerHTML = `
            <div class="day-number">${dayNumber}</div>
            <div class="day-name">${dayName}</div>
        `;
        
        // 클릭 이벤트 추가
        dayHeader.addEventListener('click', () => {
            handleDayClick(currentDay, dayHeader);
        });
        
        weekHeader.appendChild(dayHeader);
    }
}



// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 개인 캘린더 앱이 시작되었습니다!');
    
    try {
        // 저장된 일정 불러오기
        loadEventsFromStorage();
        
        // 캘린더 렌더링
        renderCalendar();
        
        // 이벤트 폼 제출 리스너 추가
        setupEventForm();
        
        // 색상 선택 이벤트 추가
        setupColorPicker();
        
        // 시간 설정 이벤트 추가
        setupTimeInputs();
        
        // 모달 외부 클릭시 닫기
        setupModalEvents();
        
        console.log('초기화 완료!');
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        // 기본 캘린더라도 표시
        renderCalendar();
    }
});
// 주간 시간대별 그리드 생성
function generateWeekTimeGrid(weekGrid) {
    weekGrid.innerHTML = '';
    console.log('시간대별 그리드 생성 시작');

    const timeSlots = [
        { id: 'all-day', label: '하루 종일', startHour: 0, endHour: 24 },
        { id: 'morning', label: '오전', startHour: 6, endHour: 12 },
        { id: 'afternoon', label: '오후', startHour: 12, endHour: 18 },
        { id: 'evening', label: '저녁', startHour: 18, endHour: 24 }
    ];

    timeSlots.forEach((timeSlot) => {
        const timeSlotLabel = document.createElement('div');
        timeSlotLabel.className = 'week-time-slot';
        timeSlotLabel.textContent = timeSlot.label;
        weekGrid.appendChild(timeSlotLabel);

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(currentWeekStart);
            currentDay.setDate(currentDay.getDate() + i);

            const dayColumn = document.createElement('div');
            dayColumn.className = 'week-day-column';
            dayColumn.setAttribute('data-date', formatDate(currentDay));
            dayColumn.setAttribute('data-timeslot', timeSlot.id);

            if (isSameDate(currentDay, today)) {
                dayColumn.classList.add('today');
            }

            displayWeekEventsForTimeSlot(dayColumn, currentDay, timeSlot);

            dayColumn.addEventListener('click', () => {
                handleDayClick(currentDay, dayColumn);
            });

            weekGrid.appendChild(dayColumn);
        }
    });

    console.log('시간대별 그리드 생성 완료');
}

// 일정이 특정 시간대에 속하는지 확인
function isEventInTimeSlot(event, timeSlot) {
    if (event.isAllDay) {
        return timeSlot.id === 'all-day';
    }

    if (timeSlot.id === 'all-day') {
        return false;
    }

    let hour = null;

    if (event.startTime) {
        hour = parseInt(event.startTime.split(':')[0]);
    } else if (event.time) {
        hour = parseInt(event.time.split(':')[0]);
    }

    if (hour === null || isNaN(hour)) {
        return timeSlot.id === 'morning'; // 기본 오전
    }

    return hour >= timeSlot.startHour && hour < timeSlot.endHour;
}
// ===== AI 어시스턴트 관련 함수들 =====

// AI 어시스턴트 토글
function toggleAI() {
    const aiAssistant = document.getElementById('aiAssistant');
    aiAssistant.classList.toggle('minimized');
}

// 메시지 전송
function sendMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 사용자 메시지 추가
    addMessage(message, 'user');
    input.value = '';
    
    // AI 응답 처리
    processAICommand(message);
}

// 메시지 추가
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender}`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// AI 명령 처리
function processAICommand(message) {
    // 간단한 패턴 매칭으로 명령 분석
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('일정 추가') || lowerMessage.includes('약속') || lowerMessage.includes('회의')) {
        handleAddEvent(message);
    } else if (lowerMessage.includes('일정 보여') || lowerMessage.includes('스케줄')) {
        handleShowSchedule();
    } else if (lowerMessage.includes('삭제') || lowerMessage.includes('취소')) {
        addMessage("죄송해요, 일정 삭제는 아직 지원하지 않아요. 직접 캘린더에서 삭제해주세요.", 'assistant');
    } else {
        addMessage("일정 추가, 조회 등을 도와드릴 수 있어요. 예: '내일 오후 2시에 회의 추가해줘'", 'assistant');
    }
}

// 일정 추가 처리 (개선된 날짜 파싱)
function handleAddEvent(message) {
    const today = new Date();
    let targetDate = new Date(today);
    let dateFound = false;
    
    // 구체적인 날짜 추출 (6월 25일, 25일 등)
    const specificDateMatch = message.match(/(\d{1,2})월\s*(\d{1,2})일|(\d{1,2})일/);
    if (specificDateMatch) {
        let month, day;
        
        if (specificDateMatch[1] && specificDateMatch[2]) {
            // "6월 25일" 형태
            month = parseInt(specificDateMatch[1]) - 1; // 0부터 시작
            day = parseInt(specificDateMatch[2]);
        } else if (specificDateMatch[3]) {
            // "25일" 형태 (현재 월로 가정)
            month = today.getMonth();
            day = parseInt(specificDateMatch[3]);
        }
        
        targetDate = new Date(today.getFullYear(), month, day);
        
        // 날짜가 과거면 다음 년도로
        if (targetDate < today) {
            targetDate.setFullYear(today.getFullYear() + 1);
        }
        
        dateFound = true;
        console.log(`구체적 날짜 파싱: ${month + 1}월 ${day}일 -> ${formatDate(targetDate)}`);
    }
    // 상대적 날짜 (내일, 모레 등)
    else if (message.includes('내일')) {
        targetDate.setDate(today.getDate() + 1);
        dateFound = true;
    } else if (message.includes('모레')) {
        targetDate.setDate(today.getDate() + 2);
        dateFound = true;
    } else if (message.includes('다음주')) {
        targetDate.setDate(today.getDate() + 7);
        dateFound = true;
    }
    
    // 시간 추출 개선
    let startHour = 9; // 기본값
    let endHour = 10;
    
    const timeMatch = message.match(/(\d{1,2})시/);
    if (timeMatch) {
        startHour = parseInt(timeMatch[1]);
        
        // 오후 처리
        if (message.includes('오후') && startHour < 12) {
            startHour += 12;
        }
        // 오전 명시적 처리
        else if (message.includes('오전') && startHour === 12) {
            startHour = 0;
        }
        
        endHour = startHour + 1;
    }
    
    // 시간 범위 추출 (예: "2시부터 4시까지")
    const timeRangeMatch = message.match(/(\d{1,2})시(?:부터|에서|\~|-)?\s*(\d{1,2})시/);
    if (timeRangeMatch) {
        startHour = parseInt(timeRangeMatch[1]);
        endHour = parseInt(timeRangeMatch[2]);
        
        if (message.includes('오후')) {
            if (startHour < 12) startHour += 12;
            if (endHour < 12) endHour += 12;
        }
    }
    
    // 일정 제목 추출 개선
    let title = '새 일정';
    if (message.includes('회의')) title = '회의';
    else if (message.includes('약속')) title = '약속';
    else if (message.includes('미팅')) title = '미팅';
    else if (message.includes('수업')) title = '수업';
    else if (message.includes('운동')) title = '운동';
    else if (message.includes('식사') || message.includes('밥')) title = '식사';
    else if (message.includes('병원')) title = '병원';
    else if (message.includes('데이트')) title = '데이트';
    
    // 일정 추가
    const dateKey = formatDate(targetDate);
    const newEvent = {
        id: Date.now(),
        title: title,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        isAllDay: false,
        color: 'blue',
        description: `AI로 추가된 일정: ${message}`,
        priority: 'normal',
        createdAt: new Date().toISOString()
    };
    
    if (!events[dateKey]) {
        events[dateKey] = [];
    }
    
    events[dateKey].push(newEvent);
    saveEventsToStorage();
    renderCalendar();
    
    // 응답 메시지 개선
    const koreanDate = targetDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
    
    addMessage(`✅ ${koreanDate}에 "${title}" 일정을 추가했어요! (${startHour}:00-${endHour}:00)`, 'assistant');
}
