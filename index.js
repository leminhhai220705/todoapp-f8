const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const taskModal = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const taskTitle = $("#taskTitle");
const formModal = $(".todo-app-form");
const todoList = $("#todoList");
const modalTitle = $(".modal-title");
const btnSubmit = $(".btn-submit");
const searchInput = $(".search-input");
const completedBtn = $(".completed-btn");
const activeBtn = $(".active-btn");

let cardIndex = null;

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    completedBtn.classList.remove("active");
    activeBtn.classList.remove("active");
    renderTask();
  }
});

const filterCompletedTask = (button1, button2) => {
  if (
    button1.classList.contains("active") ||
    button2.classList.contains("active")
  ) {
    button1.classList.remove("active");
    button2.classList.remove("active");
  }
  const taskCards = $$(".task-card");
  if (button1 === completedBtn && button2 === activeBtn) {
    taskCards.forEach((task, index) => {
      if (task.classList.contains("completed")) {
        task.hidden = true;
      } else {
        task.hidden = false;
      }
    });
  } else {
    taskCards.forEach((task, index) => {
      if (task.classList.contains("completed")) {
        task.hidden = false;
      } else {
        task.hidden = true;
      }
    });
  }
};

completedBtn.onclick = (e) => {
  filterCompletedTask(activeBtn, completedBtn);
  if (e.target === completedBtn) {
    completedBtn.classList.add("active");
  }
};

activeBtn.onclick = (e) => {
  filterCompletedTask(completedBtn, activeBtn);
  if (e.target === activeBtn) {
    activeBtn.classList.add("active");
  }
};

// Search Title card
searchInput.oninput = (e) => {
  const taskCards = $$(".task-card");
  taskCards.forEach((task, index) => {
    const input = e.target.value.trim();
    const taskTitle = todoTasks[index].title.trim();

    taskTitle.toLowerCase().startsWith(input.toLowerCase())
      ? (task.hidden = false)
      : (task.hidden = true);
  });
};

// Handle open addTask modal
const openModal = () => {
  setTimeout(() => {
    taskTitle.focus();
  }, 100);
  taskModal.classList.add("show");
};

// Handle close addTask modal
const closeModal = () => {
  if (taskModal.classList.contains("show")) {
    taskModal.classList.remove("show");
  }

  if (modalTitle && btnSubmit) {
    setTimeout(() => {
      delete modalTitle.dataset.rootText;
      delete btnSubmit.dataset.rootText;
      modalTitle.textContent = modalTitle.dataset.rootText ?? "Add New Task";
      btnSubmit.textContent = btnSubmit.dataset.rootText ?? "Add Task";
    }, 300);
  }

  cardIndex = null;
};

// Click add Task for opening Modal
addBtn.onclick = () => {
  formModal.reset();
  openModal();
};

// Click cancel button and modalClose button for closing Modal
modalClose.onclick = closeModal;
btnCancel.onclick = closeModal;

// List of tasks
const todoTasks = JSON.parse(localStorage.getItem("tasks")) ?? [];

// Handle form submission
formModal.onsubmit = (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(formModal));
  formData.isCompleted = false;

  const checkDuplication = todoTasks.some((task) => {
    const currentTitle = formData.title.trim();
    const title = task.title.trim();
    return title.toLowerCase() === currentTitle.toLowerCase();
  });

  if (cardIndex && !checkDuplication) {
    const tempIndex = cardIndex;
    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire("Saved!", "", "success");
        todoTasks[tempIndex] = formData;
        renderTask();
        if (completedBtn.classList.contains("active")) {
          filterCompletedTask(activeBtn, completedBtn);
          completedBtn.classList.add("active");
        } else {
          filterCompletedTask(completedBtn, activeBtn);
          activeBtn.classList.add("active");
        }
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  } else if (!checkDuplication) {
    Swal.fire({
      title: "Added Successfully!",
      icon: "success",
      draggable: true,
    });
    todoTasks.unshift(formData);
    renderTask();
    if (completedBtn.classList.contains("active")) {
      filterCompletedTask(activeBtn, completedBtn);
      completedBtn.classList.add("active");
    } else {
      filterCompletedTask(completedBtn, activeBtn);
      activeBtn.classList.add("active");
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: `${formData.title} has already existed, please try another task`,
    });

    return;
  }

  // renderTask();

  closeModal();
};

todoList.onclick = (e) => {
  // Edit function
  const editBtn = e.target.closest(".edit-btn");
  const dataIndex = e.target.closest(".task-card").dataset.index;

  cardIndex = dataIndex;

  if (editBtn) {
    if (modalTitle && btnSubmit) {
      modalTitle.dataset.rootText = modalTitle.textContent;
      modalTitle.textContent = "Edit Task";
      btnSubmit.dataset.rootText = btnSubmit.textContent;
      btnSubmit.textContent = "Save Task";
    }

    const task = todoTasks[dataIndex];

    for (const key in task) {
      const input = $(`[name="${key}"]`);
      const value = task[key];

      if (input) {
        input.value = value;
      }
    }

    openModal();
  }

  // Delete Function
  const deleteBtn = e.target.closest(".delete-btn");
  if (deleteBtn) {
    Swal.fire({
      title: `Are you sure to delete "${todoTasks[dataIndex].title}" ?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your task has been deleted.",
          icon: "success",
        });
        todoTasks.splice(dataIndex, 1);
        renderTask();
        if (completedBtn.classList.contains("active")) {
          filterCompletedTask(activeBtn, completedBtn);
          completedBtn.classList.add("active");
        } else {
          filterCompletedTask(completedBtn, activeBtn);
          activeBtn.classList.add("active");
        }
      }
    });
  }

  // Mark-Complete Function
  const completeBtn = e.target.closest(".complete-btn");

  if (completeBtn) {
    todoTasks[dataIndex].isCompleted = !todoTasks[dataIndex].isCompleted;
    renderTask();
    if (completedBtn.classList.contains("active")) {
      filterCompletedTask(activeBtn, completedBtn);
      completedBtn.classList.add("active");
    } else {
      filterCompletedTask(completedBtn, activeBtn);
      activeBtn.classList.add("active");
    }
  }
};

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(todoTasks));
};

// Create HTML Structure for rendering
const createHtmlStructure = (tasks) => {
  if (tasks.length === 0) {
    todoList.textContent = "Unavailable tasks";
    return;
  }

  todoList.textContent = "";
  tasks.forEach((task, index) => {
    //
    // taskCard
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card", `${task.color}`);
    if (task.isCompleted) taskCard.classList.add("completed");

    taskCard.setAttribute("data-index", index);

    // taskHeader
    const taskHeader = document.createElement("div");
    taskHeader.className = "task-header";

    // taskTitle
    const taskTitle = document.createElement("h3");
    taskTitle.className = "task-title";
    taskTitle.textContent = `${task.title}`;

    // task-menu btn
    const taskMenu = document.createElement("button");
    taskMenu.className = "task-menu";

    // fa-solid fa-ellipsis fa-icon
    const ellipsis = document.createElement("i");
    ellipsis.classList.add("fa-solid", "fa-ellipsis", "fa-icon");

    // dropdown-menu
    const dropDownMenu = document.createElement("div");
    dropDownMenu.className = "dropdown-menu";

    // dropdown-item edit-btn
    const editBtn = document.createElement("div");
    editBtn.classList.add("dropdown-item", "edit-btn");

    //  <i class="fa-solid fa-pen-to-square fa-icon"></i>
    const penToSquare = document.createElement("i");
    penToSquare.classList.add("fa-solid", "fa-pen-to-square", "fa-icon");

    //  <div class="dropdown-item complete-btn" data-index="${index}">
    const completeBtn = document.createElement("div");
    completeBtn.classList.add("dropdown-item", "complete-btn");

    // <i class="fa-solid fa-check fa-icon"></i>
    const checkIcon = document.createElement("i");
    checkIcon.classList.add("fa-solid", "fa-check", "fa-icon");

    //  <div class="dropdown-item delete delete-btn" data-index="${index}">
    const deleteBtn = document.createElement("div");
    deleteBtn.classList.add("dropdown-item", "delete", "delete-btn");

    //  <i class="fa-solid fa-trash fa-icon"></i>
    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-solid", "fa-trash", "fa-icon");

    //  <p class="task-description">
    const taskDescription = document.createElement("p");
    taskDescription.className = "task-description";

    //  <div class="task-time">${task.startTime} - ${task.endTime}</div>
    const taskTime = document.createElement("div");
    taskTime.className = "task-time";

    // Append element:

    editBtn.append(penToSquare, "Edit");
    completeBtn.append(
      checkIcon,
      `${task.isCompleted ? "Mark as Active" : "Make as Complete"}`,
    );
    deleteBtn.append(trashIcon, "Delete");

    dropDownMenu.append(editBtn, completeBtn, deleteBtn);

    taskMenu.append(ellipsis, dropDownMenu);

    taskHeader.append(taskTitle, taskMenu);

    taskDescription.textContent = `${task.description}`;

    taskTime.textContent = `${task.startTime} - ${task.endTime}`;

    taskCard.append(taskHeader, taskDescription, taskTime);

    todoList.appendChild(taskCard);
  });
};

// Render to interface
const renderTask = () => {
  saveTasks();
  createHtmlStructure(todoTasks);
};

renderTask();
