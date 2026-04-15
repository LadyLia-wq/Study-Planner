// Select elements
const taskTitle = document.getElementById("taskTitle");
const taskSubject = document.getElementById("taskSubject");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskContainer = document.getElementById("taskContainer");
const filterSubject = document.getElementById("filterSubject");
const plannerContainer = document.getElementById("plannerContainer");

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Add task
function addTask() {
  const title = taskTitle.value.trim();
  const subject = taskSubject.value.trim();
  const date = taskDate.value;

  if (title === "" || subject === "" || date === "") {
    alert("Please fill in all fields");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    subject,
    date,
    completed: false
  };

  tasks.push(task);
  saveTasks();

  // Repopulate filter without resetting the selected value
  populateFilter();
  renderTasks();
  renderPlanner();

  taskTitle.value = "";
  taskSubject.value = "";
  taskDate.value = "";
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Toggle complete
function toggleComplete(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
  renderPlanner();
}

// Delete task
function deleteTask(id) {
  const element = event.target.closest(".task-item");

  element.classList.add("fade-out");

  setTimeout(() => {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    populateFilter();
    renderTasks();
    renderPlanner();
  }, 300);
}

// Populate filter dropdown — preserves the currently selected value
function populateFilter() {
  const currentValue = filterSubject.value;
  const subjects = [...new Set(tasks.map(task => task.subject))];

  filterSubject.innerHTML = '<option value="all">All Subjects</option>';

  subjects.forEach(subject => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    filterSubject.appendChild(option);
  });

  // Restore previously selected subject if it still exists
  if (subjects.includes(currentValue)) {
    filterSubject.value = currentValue;
  }
}

// Render tasks
function renderTasks() {
  const selectedSubject = filterSubject.value;

  let filteredTasks = tasks;

  if (selectedSubject !== "all") {
    filteredTasks = tasks.filter(task => task.subject === selectedSubject);
  }

  taskContainer.innerHTML = "";

  filteredTasks.forEach(task => {
    const div = document.createElement("div");
    div.classList.add("task-item");

    // Calculate countdown
    const today = new Date();
    const dueDate = new Date(task.date);
    const timeDiff = dueDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let countdownText = "";
    let countdownColor = "";

    if (daysLeft > 0) {
      countdownText = `${daysLeft} day(s) left`;
      countdownColor = "green";
    } else if (daysLeft === 0) {
      countdownText = "Due today!";
      countdownColor = "orange";
    } else {
      countdownText = "Overdue!";
      countdownColor = "red";
    }

    div.innerHTML = `
      <div>
        <div class="task-title ${task.completed ? 'completed' : ''}">
          ${task.title}
        </div>
        <div class="task-meta">
          ${task.subject} • ${task.date}
        </div>
        <div style="font-size: 0.8rem; margin-top: 4px; color: ${countdownColor};">
          ${countdownText}
        </div>
      </div>
      <div style="margin-top: 8px;">
        <button onclick="toggleComplete(${task.id})">
          ${task.completed ? "Undo" : "Complete"}
        </button>
        <button onclick="deleteTask(${task.id})" style="background:#ef4444; margin-top:5px;">
          Delete
        </button>
      </div>
    `;

    taskContainer.appendChild(div);
  });
}

// Render planner — each task in its own card
function renderPlanner() {
  plannerContainer.innerHTML = "";

  const grouped = {};

  tasks.forEach(task => {
    if (!grouped[task.date]) {
      grouped[task.date] = [];
    }
    grouped[task.date].push(task);
  });

  const sortedDates = Object.keys(grouped).sort();

  sortedDates.forEach(date => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("planner-day");

    const dateHeader = document.createElement("h3");
    dateHeader.textContent = new Date(date).toDateString();
    dayDiv.appendChild(dateHeader);

    grouped[date].forEach(task => {
      const taskCard = document.createElement("div");
      taskCard.classList.add("planner-task");
      taskCard.textContent = `• ${task.title} (${task.subject})`;
      dayDiv.appendChild(taskCard);
    });

    plannerContainer.appendChild(dayDiv);
  });
}

// Filter change — preserve selected value naturally since renderTasks reads it directly
filterSubject.addEventListener("change", renderTasks);

// Event listener
addTaskBtn.addEventListener("click", addTask);

// Initial render
populateFilter();
renderTasks();
renderPlanner();

// Quote fetcher
async function fetchQuote() {
  try {
    const response = await fetch("https://api.allorigins.win/raw?url=https://zenquotes.io/api/random");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    document.getElementById("quote").textContent =
      `"${data[0].q}" — ${data[0].a}`;
  } catch (error) {
    document.getElementById("quote").textContent =
      "Stay focused and keep going!";
  }
}
fetchQuote();

window.toggleComplete = toggleComplete;
window.deleteTask = deleteTask;