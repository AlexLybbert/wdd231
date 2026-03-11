/* main.js - no inline JS in HTML, defer loaded */

const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const courseGrid = document.getElementById('courseGrid');
const creditTotal = document.getElementById('creditTotal');
const filterButtons = document.querySelectorAll('.filter-btn');

navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  mainNav.classList.toggle('open');
});

const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course introduces students to the World Wide Web and to careers in web site design and development. The course is hands on with students actually participating in simple web designs and programming. It is anticipated that students who complete this course will understand the fields of web design and development and will have a good idea if they want to pursue this degree as a major.',
        technology: [
            'HTML',
            'CSS'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others; to write, call , debug, and test their own functions; and to handle errors within functions. CSE 111 students write programs with functions to solve problems in many disciplines, including business, physical science, human performance, and humanities.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce the notion of classes and objects. It will present encapsulation at a conceptual level. It will also work with inheritance and polymorphism.',
        technology: [
            'C#'
        ],
        completed: false
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: false
    }
]

function renderCourses(filter = 'all') {
  const filtered = filter === 'all' ? courses : courses.filter(course => course.subject === filter);

  courseGrid.innerHTML = filtered.map(course => {
    const statusText = course.completed ? 'Completed' : 'In progress';
    const statusClass = course.completed ? 'completed' : 'incomplete';
    const courseCode = `${course.subject} ${course.number}`;
    return `
      <article class="course-card ${statusClass}" aria-label="${courseCode} ${course.title}">
        <h3 class="course-title">${courseCode}: ${course.title}</h3>
        <div class="course-meta">
          <span>${course.credits} credits</span>
          <span class="status">${statusText}</span>
        </div>
        <p class="course-desc">${course.description}</p>
      </article>
    `;
  }).join('');

  const totalCredits = filtered.reduce((sum, course) => sum + course.credits, 0);
  creditTotal.textContent = `Total credits shown: ${totalCredits}`;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderCourses(button.dataset.filter);
  });
});

function setDateInfo() {
  const year = new Date().getFullYear();
  document.getElementById('copyrightText').textContent = `© ${year} Your Name`;
  document.getElementById('lastModified').textContent = `Last modified: ${document.lastModified}`;
}

const yearEl = document.getElementById('copyrightYear');
const modifiedEl = document.getElementById('lastModified');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (modifiedEl) {
  const modifiedDate = new Date(document.lastModified);
  modifiedEl.textContent = `Last updated: ${modifiedDate.toLocaleString()}`;
}

renderCourses();
setDateInfo();
