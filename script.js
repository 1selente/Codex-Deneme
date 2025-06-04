const courses = {};

const courseInput = document.getElementById('courseInput');
const addCourseBtn = document.getElementById('addCourseBtn');
const courseSelect = document.getElementById('courseSelect');
const topicInput = document.getElementById('topicInput');
const addTopicBtn = document.getElementById('addTopicBtn');
const topicSelect = document.getElementById('topicSelect');
const qaInput = document.getElementById('qaInput');
const addQABtn = document.getElementById('addQABtn');

const cardContainer = document.getElementById('cardContainer');
const card = document.getElementById('card');
const questionDiv = document.getElementById('question');
const answerDiv = document.getElementById('answer');
const nextBtn = document.getElementById('nextBtn');

let currentQA = [];
let currentIndex = 0;

function addCourse() {
    const name = courseInput.value.trim();
    if (!name) return;
    if (!courses[name]) courses[name] = {};
    updateCourseSelect();
    courseInput.value = '';
}

function addTopic() {
    const course = courseSelect.value;
    const topic = topicInput.value.trim();
    if (!course || !topic) return;
    if (!courses[course][topic]) courses[course][topic] = [];
    updateTopicSelect();
    topicInput.value = '';
}

function addQA() {
    const course = courseSelect.value;
    const topic = topicSelect.value;
    if (!course || !topic) return;
    const lines = qaInput.value.split(/\n/);
    lines.forEach(line => {
        const [q, a] = line.split('|');
        if (q && a) courses[course][topic].push({q: q.trim(), a: a.trim()});
    });
    qaInput.value = '';
    if (courses[course][topic].length > 0) showCard();
}

function updateCourseSelect() {
    courseSelect.innerHTML = '<option value="">Kurs Seç</option>';
    Object.keys(courses).forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        courseSelect.appendChild(opt);
    });
}

function updateTopicSelect() {
    const course = courseSelect.value;
    topicSelect.innerHTML = '<option value="">Konu Seç</option>';
    if (!course) return;
    Object.keys(courses[course]).forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        topicSelect.appendChild(opt);
    });
}

function showCard() {
    const course = courseSelect.value;
    const topic = topicSelect.value;
    if (!course || !topic) return;
    currentQA = courses[course][topic];
    currentIndex = 0;
    if (currentQA.length === 0) return;
    cardContainer.classList.remove('hidden');
    displayQA();
}

function displayQA() {
    if (currentIndex >= currentQA.length) currentIndex = 0;
    questionDiv.textContent = currentQA[currentIndex].q;
    answerDiv.textContent = currentQA[currentIndex].a;
    card.classList.remove('flip');
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex >= currentQA.length) currentIndex = 0;
    displayQA();
}

addCourseBtn.addEventListener('click', addCourse);
addTopicBtn.addEventListener('click', addTopic);
addQABtn.addEventListener('click', addQA);
courseSelect.addEventListener('change', () => {
    updateTopicSelect();
    showCard();
});
topicSelect.addEventListener('change', showCard);
nextBtn.addEventListener('click', nextQuestion);

card.addEventListener('click', () => {
    card.classList.toggle('flip');
});

let startX = 0, startY = 0;
card.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
}, false);
card.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        card.classList.toggle('flip');
    }
}, false);
