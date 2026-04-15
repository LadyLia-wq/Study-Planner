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
  renderTasks();

  // Clear inputs
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
}

// Delete task
function handleDelete(id) {
  const element = event.target.closest(".task-item");

  element.classList.add("fade-out");

  setTimeout(() => {
    tasks = deleteTask(tasks, id);
    saveTasks(tasks);
    renderTasks();
  }, 300);
}

// Render tasks
function renderTasks() {
  populateFilter();
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

  if (daysLeft > 0) {
    countdownText = `${daysLeft} day(s) left`;
  } else if (daysLeft === 0) {
    countdownText = "Due today!";
  } else {
    countdownText = "Overdue!";
  }

  div.innerHTML = `
    <div>
      <div class="task-title ${task.completed ? 'completed' : ''}">
        ${task.title}
      </div>
      <div class="task-meta">
        ${task.subject} • ${task.date}
      </div>
      <div style="font-size: 0.8rem; margin-top: 4px; color: ${
        daysLeft < 0 ? 'red' : daysLeft === 0 ? 'orange' : 'green'
      };">
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

//populate dropdown
function populateFilter() {
  const subjects = [...new Set(tasks.map(task => task.subject))];

  filterSubject.innerHTML = '<option value="all">All Subjects</option>';

  subjects.forEach(subject => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    filterSubject.appendChild(option);
  });
}

filterSubject.addEventListener("change", renderTasks);

// Load tasks on page start
renderTasks();

//PLANNER VIEW
function renderPlanner() {
  plannerContainer.innerHTML = "";

  // Group tasks by date
  const grouped = {};

  tasks.forEach(task => {
    if (!grouped[task.date]) {
      grouped[task.date] = [];
    }
    grouped[task.date].push(task);
  });

  // Sort dates
  const sortedDates = Object.keys(grouped).sort();

  sortedDates.forEach(date => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("planner-day");

    const dateHeader = document.createElement("h3");
    dateHeader.textContent = new Date(date).toDateString();

    dayDiv.appendChild(dateHeader);

    grouped[date].forEach(task => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("planner-task");

      taskItem.textContent = `• ${task.title} (${task.subject})`;

      dayDiv.appendChild(taskItem);
    });

    plannerContainer.appendChild(dayDiv);
  });
}
renderPlanner();

// Event listener
addTaskBtn.addEventListener("click", addTask);

async function fetchQuote() {
  try {
    const response = await fetch("https://api.allorigins.win/raw?url=https://zenquotes.io/api/random");
    const data = await response.json();

    const quoteText = data[0].q;
    const quoteAuthor = data[0].a;

    document.getElementById("quote").textContent =
      `"${quoteText}" — ${quoteAuthor}`;
  } catch (error) {
    document.getElementById("quote").textContent =
      "Stay focused and keep going!";
  }
}
fetchQuote();

window.toggleComplete = toggleComplete;
window.deleteTask = deleteTask;