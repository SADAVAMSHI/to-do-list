document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const inputBox = document.getElementById("input-box");
    const addButton = document.getElementById("add-button");
    const listContainer = document.getElementById("list-container");
    const themeToggle = document.getElementById("theme-toggle");
    const clock = document.getElementById("clock");
    const pendingCount = document.getElementById("pending-count");
    const completedCount = document.getElementById("completed-count");
    const congratulations = document.getElementById("congratulations");
    const datePicker = document.getElementById("date-picker");
    const streakCount = document.getElementById("streak-count");

    // --- State Management ---
    let isDarkMode = true;
    // Load data from LocalStorage or initialize empty object
    let appData = JSON.parse(localStorage.getItem("todoData")) || {};
    
    // Set today's date in YYYY-MM-DD format
    const getTodayString = () => new Date().toLocaleDateString('en-CA'); 
    let selectedDate = getTodayString();
    datePicker.value = selectedDate;

    // --- Initialization ---
    updateClock();
    setInterval(updateClock, 1000);
    renderTasks();
    updateStreak();

    // --- Event Listeners ---
    themeToggle.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        document.body.className = isDarkMode ? "dark" : "light";
        themeToggle.textContent = isDarkMode ? "🌙" : "🔆";
    });

    datePicker.addEventListener("change", (e) => {
        selectedDate = e.target.value;
        renderTasks();
    });

    addButton.addEventListener("click", addTask);
    inputBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });

    // Event Delegation for dynamically created list items
    listContainer.addEventListener("click", (e) => {
        const id = Number(e.target.closest("li")?.dataset.id);
        if (!id) return;

        if (e.target.type === "checkbox") {
            toggleTask(id, e.target.checked);
        } else if (e.target.classList.contains("delete-btn")) {
            deleteTask(id);
        }
    });

    // --- Core Functions ---
    function updateClock() {
        clock.textContent = new Date().toLocaleTimeString();
    }

    function saveData() {
        localStorage.setItem("todoData", JSON.stringify(appData));
        updateStreak();
    }

    function addTask() {
        const text = inputBox.value.trim();
        if (!text) return alert("Please enter a task!");

        if (!appData[selectedDate]) appData[selectedDate] = [];
        
        appData[selectedDate].push({
            id: Date.now(),
            text: text,
            completed: false
        });

        inputBox.value = "";
        saveData();
        renderTasks();
    }

    function toggleTask(id, isCompleted) {
        const task = appData[selectedDate].find(t => t.id === id);
        if (task) {
            task.completed = isCompleted;
            saveData();
            renderTasks();
        }
    }

    function deleteTask(id) {
        appData[selectedDate] = appData[selectedDate].filter(t => t.id !== id);
        // Clean up empty dates to save storage space
        if (appData[selectedDate].length === 0) delete appData[selectedDate];
        saveData();
        renderTasks();
    }

    function renderTasks() {
        listContainer.innerHTML = "";
        const tasks = appData[selectedDate] || [];
        let completed = 0;

        tasks.forEach(task => {
            if (task.completed) completed++;
            
            const li = document.createElement("li");
            li.dataset.id = task.id;
            if (task.completed) li.classList.add("completed");

            li.innerHTML = `
                <input type="checkbox" ${task.completed ? "checked" : ""}>
                <span>${task.text}</span>
                <button class="delete-btn">Delete</button>
            `;
            listContainer.appendChild(li);
        });

        // Update Stats UI
        pendingCount.textContent = tasks.length - completed;
        completedCount.textContent = completed;

        // Show congratulations if all tasks are done (and there is at least 1 task)
        if (tasks.length > 0 && tasks.length === completed) {
            congratulations.classList.remove("hidden");
        } else {
            congratulations.classList.add("hidden");
        }
    }

    // --- Streak Logic ---
    function updateStreak() {
        let streak = 0;
        let dateToCheck = new Date(); // Start from today
        
        // 1. Check Today
        let dateStr = dateToCheck.toLocaleDateString('en-CA');
        let tasks = appData[dateStr] || [];
        
        if (tasks.length > 0 && tasks.every(t => t.completed)) {
            streak++; // Today's tasks are fully completed
        } else if (tasks.length > 0 && !tasks.every(t => t.completed)) {
            // Today has incomplete tasks. We do NOT break the streak yet because the day isn't over,
            // but we don't add to the streak. We will just check previous days.
        }

        // 2. Iterate backwards through previous days
        dateToCheck.setDate(dateToCheck.getDate() - 1);
        
        while (true) {
            dateStr = dateToCheck.toLocaleDateString('en-CA');
            tasks = appData[dateStr];
            
            // If the past day had tasks AND all were completed
            if (tasks && tasks.length > 0 && tasks.every(t => t.completed)) {
                streak++;
                dateToCheck.setDate(dateToCheck.getDate() - 1); // Go back another day
            } else {
                // If a past day had incomplete tasks, or no tasks at all, the streak is broken.
                break; 
            }
        }

        streakCount.textContent = streak;
    }
});
