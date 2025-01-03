document.addEventListener("DOMContentLoaded", () => {
    const inputBox = document.getElementById("input-box");
    const addButton = document.getElementById("add-button");
    const listContainer = document.getElementById("list-container");
    const themeToggle = document.getElementById("theme-toggle");
    const clock = document.getElementById("clock");
    const pendingCount = document.getElementById("pending-count");
    const completedCount = document.getElementById("completed-count");
    const congratulations = document.getElementById("congratulations");

    let isDarkMode = false;

    // Clock Update
    function updateClock() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Theme Toggle
    themeToggle.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        document.body.className = isDarkMode ? "dark" : "light";
        themeToggle.textContent = isDarkMode ? "🌙" : "🔆";
    });

    // Add Task
    addButton.addEventListener("click", addTask);

    function addTask() {
        const taskText = inputBox.value.trim();
        if (taskText === "") {
            alert("Please enter a task!");
            return;
        }

        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        const span = document.createElement("span");
        const deleteButton = document.createElement("button");

        checkbox.type = "checkbox";
        span.textContent = taskText;
        deleteButton.textContent = "Delete";

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);
        listContainer.appendChild(li);

        checkbox.addEventListener("change", updateTaskCounts);
        deleteButton.addEventListener("click", () => {
            listContainer.removeChild(li);
            updateTaskCounts();
        });

        inputBox.value = "";
        updateTaskCounts();
    }

    // Update Task Counts
    function updateTaskCounts() {
        const tasks = listContainer.querySelectorAll("li");
        const completedTasks = listContainer.querySelectorAll("input[type='checkbox']:checked");

        pendingCount.textContent = tasks.length - completedTasks.length;
        completedCount.textContent = completedTasks.length;

        if (tasks.length > 0 && completedTasks.length === tasks.length) {
            congratulations.classList.remove("hidden");
        } else {
            congratulations.classList.add("hidden");
        }
    }
});
