document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements (Standard Declaration) ---
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
    const prioritySelect = document.getElementById("priority-select");
    const timePicker = document.getElementById("time-picker");

    // --- State Management ---
    let alertedTasks = [];
    let isDarkMode = true;
    let appData = JSON.parse(localStorage.getItem("todoData")) || {};
    
    const getTodayString = () => new Date().toLocaleDateString('en-CA'); 
    let selectedDate = getTodayString();
    datePicker.value = selectedDate;

    // --- Initialization ---
    updateClock();
    setInterval(() => {
        updateClock();
        checkReminders();
    }, 1000);
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
        if (e.key === "Enter") {
            e.preventDefault();
            addTask();
        }
    });

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
        if (!text) {
            alert("Please type a task first!");
            return;
        }

        if (!appData[selectedDate]) appData[selectedDate] = [];
        
        appData[selectedDate].push({
            id: Date.now(),
            text: text,
            completed: false,
            priority: prioritySelect.value,
            time: timePicker.value
        });

        // Reset Inputs
        inputBox.value = "";
        timePicker.value = ""; 
        prioritySelect.value = "Medium"; 
        
        saveData();
        renderTasks();
        inputBox.focus(); 
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
        if (appData[selectedDate].length === 0) delete appData[selectedDate];
        saveData();
        renderTasks();
    }

    function renderTasks() {
        // Clear the list safely without innerHTML
        listContainer.replaceChildren(); 
        
        const tasks = appData[selectedDate] || [];
        let completed = 0;

        const priorityRank = { "High": 3, "Medium": 2, "Low": 1 };
        
        tasks.sort((a, b) => {
            const rankDiff = priorityRank[b.priority] - priorityRank[a.priority];
            if (rankDiff !== 0) return rankDiff;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
        });

        tasks.forEach(task => {
            if (task.completed) completed++;
            
            // 1. Create List Item container
            const li = document.createElement("li");
            li.dataset.id = task.id;
            if (task.completed) li.classList.add("completed");

            // 2. Create Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            if (task.completed) checkbox.checked = true;

            // 3. Create Task Content Wrapper
            const taskContentWrapper = document.createElement("div");
            taskContentWrapper.className = "task-content";

            // 4. Create Task Text
            const taskTextSpan = document.createElement("span");
            taskTextSpan.className = "task-text";
            taskTextSpan.textContent = task.text;

            // 5. Create Task Meta Wrapper (Priority & Time)
            const taskMetaWrapper = document.createElement("div");
            taskMetaWrapper.className = "task-meta";

            // 6. Create Priority Badge
            const priorityBadge = document.createElement("span");
            priorityBadge.className = `priority-badge priority-${task.priority}`;
            priorityBadge.textContent = task.priority;
            taskMetaWrapper.appendChild(priorityBadge);

            // 7. Create Time Display (if time was set)
            if (task.time) {
                const timeSpan = document.createElement("span");
                timeSpan.className = "task-time";
                timeSpan.textContent = `⏰ ${task.time}`;
                taskMetaWrapper.appendChild(timeSpan);
            }

            // Assemble content wrapper
            taskContentWrapper.appendChild(taskTextSpan);
            taskContentWrapper.appendChild(taskMetaWrapper);

            // 8. Create Delete Button
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";

            // 9. Attach everything to the main List Item
            li.appendChild(checkbox);
            li.appendChild(taskContentWrapper);
            li.appendChild(deleteButton);

            // 10. Add List Item to the page
            listContainer.appendChild(li);
        });

        // Update Stats
        pendingCount.textContent = tasks.length - completed;
        completedCount.textContent = completed;

        if (tasks.length > 0 && tasks.length === completed) {
            congratulations.classList.remove("hidden");
        } else {
            congratulations.classList.add("hidden");
        }
    }

    function checkReminders() {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const tasksToday = appData[todayStr] || [];
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        tasksToday.forEach(task => {
            if (task.time && !task.completed && !alertedTasks.includes(task.id)) {
                const [taskHours, taskMinutes] = task.time.split(':').map(Number);
                const timeNowInMins = (currentHours * 60) + currentMinutes;
                const taskTimeInMins = (taskHours * 60) + taskMinutes;

                if (taskTimeInMins - timeNowInMins === 5) {
                    alert(`⏰ Reminder: Your task "${task.text}" is due in 5 minutes!`);
                    alertedTasks.push(task.id); 
                }
            }
        });
    }

    function updateStreak() {
        let streak = 0;
        let dateToCheck = new Date(); 
        
        let dateStr = dateToCheck.toLocaleDateString('en-CA');
        let tasks = appData[dateStr] || [];
        
        if (tasks.length > 0 && tasks.every(t => t.completed)) {
            streak++; 
        }

        dateToCheck.setDate(dateToCheck.getDate() - 1);
        
        while (true) {
            dateStr = dateToCheck.toLocaleDateString('en-CA');
            tasks = appData[dateStr];
            
            if (tasks && tasks.length > 0 && tasks.every(t => t.completed)) {
                streak++;
                dateToCheck.setDate(dateToCheck.getDate() - 1); 
            } else {
                break; 
            }
        }

        streakCount.textContent = streak;
    }
});
