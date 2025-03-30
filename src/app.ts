// ======================
// 1. Deklarasi Variabel dan Selector DOM
// ======================
interface Todo {
    id: number;
    title: string;
    items: Array<{ id: number; text: string; completed: boolean }>;
}

const menuButton = document.querySelector('#menuButton');
const searchBar = document.querySelector('.searchBar');
const importAllButton = document.querySelector('#importAllButton');
const exportAllButton = document.querySelector('#exportAllButton');
const signoutButton = document.querySelector('#signoutButton');
const newTodoInput = document.querySelector('#newTodoInput');
const addTodoButton = document.querySelector('#addTodoButton');
const importButton = document.querySelector('#importButton');
const todoContainer = document.querySelector('.todoContainer');
// const alertElement = document.querySelector('#alert');
const body = document.querySelector('body');

// ======================
// 2. Inisialisasi Data
// ======================
/**
 * Array to store all todos
 * - Initialized from localStorage if exists, otherwise empty array
 * - Each todo follows the Todo interface with id, title and items (array of objects with id, text, completed)
 */
let todoList = JSON.parse(localStorage.getItem("todoList") || "[]") as Todo[];

// ======================
// 3. Fungsi Utilitas
// ======================
/**
 * Saves the current todo list to localStorage
 */
function setLocalStorage() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
}

/**
 * Displays an alert message that automatically disappears after 2 seconds
 * @param message - The message to display
 */
function setAlertMessage(message: string) {
    let alertWrapper = document.createElement('div');
    alertWrapper.id = 'alertWrapper';
    let alertMessage = document.createElement('p');
    alertMessage.innerText = message;
    alertWrapper.appendChild(alertMessage);
    // prepend() tersedia di interface Element, jadi tidak perlu as HTMLElement
    document.querySelector('main')!.prepend(alertWrapper);
    setTimeout(() => {
        alertWrapper.remove();
    }, 2000);
}

/**
 * Finds the first parent element with the specified class name
 * @param element - The element to start searching from
 * @param className - The class name to search for
 * @returns The first parent element with the given class name, or null if not found
 */
function findParentByClass(element: Element, className: string) {
    // Mulai dari element yang diberikan
    let currentElement: Element | null = element;
    
    // Selama masih ada element dan belum menemukan class yang dicari
    while (currentElement && !currentElement.classList.contains(className)) {
        // Pindah ke parent element
        currentElement = currentElement.parentElement;
    }
    
    // Jika element ditemukan dan memiliki class yang dicari, kembalikan element tersebut
    if (currentElement && currentElement.classList.contains(className)) {
        return currentElement;
    }
    
    // Jika tidak ditemukan, kembalikan null
    return null;
}

// ======================
// 4. Fungsi Utama - Manajemen Todo
// ======================
/**
 * Toggles the visibility of the sidebar containing todo titles
 * - If sidebar doesn't exist: Creates and shows sidebar with todo titles
 * - If sidebar exists: Removes it and resets layout
 * - Clicking todo titles shows corresponding todo popup
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');

    if (!sidebar) {
        const sidebarElement = document.createElement('div');
        sidebarElement.className = 'sidebar';

        todoList.forEach((todo: Todo) => {
            const todoTitleElement = document.createElement('div');
            todoTitleElement.className = 'sidebarTodoTitle';
            todoTitleElement.innerText = todo.title;
            todoTitleElement.addEventListener('click', () => showTodoPopup(todo.id));
            sidebarElement.prepend(todoTitleElement);
        });

        document.querySelector('main')!.prepend(sidebarElement);
        document.querySelector('main')!.style.display = 'grid';
        document.querySelector('main')!.style.gridTemplateColumns = '250px auto';
        document.querySelector('main')!.style.gridTemplateRows = 'auto auto';
        (document.querySelector('.newTodo') as HTMLElement)!.style.gridColumn = '2';
        (document.querySelector('.newTodo') as HTMLElement)!.style.gridRow = '1';
        (document.querySelector('.todoContainer') as HTMLElement)!.style.gridColumn = '2';
        (document.querySelector('.todoContainer') as HTMLElement)!.style.gridRow = '2';
        sidebarElement.style.gridRow = '1 / 3';
        sidebarElement.style.gridColumn = '1';
    } else {
        sidebar.remove();
        document.querySelector('main')!.style.display = '';
    }
}

menuButton!.addEventListener('click', toggleSidebar);

/**
 * Renders all todos in the todoContainer element
 * - Shows header and main elements
 * - Clears todoContainer
 * - Creates and displays todo cards
 */
function renderTodo() {
    (document.querySelector('header') as HTMLElement)!.style.display = '';
    (document.querySelector('main') as HTMLElement)!.style.display = '';
    (todoContainer as HTMLElement)!.innerHTML = '';
    todoList.forEach((element: Todo) => {
        let todoCard = createTodoCard(element.id, element.title, element.items);
        (todoContainer as HTMLElement)!.prepend(todoCard);
    });
}

/**
 * Creates a card element for a todo item
 * @param id - The todo's ID
 * @param title - The todo's title
 * @param items - The todo's items
 * @returns A div element containing the todo card
 */
function createTodoCard(id: number, title: string, items: Array<{ id: number; text: string; completed: boolean }>) {
    let todoCard = document.createElement("div");
    todoCard.classList.add("todoCard");
    todoCard.id = id.toString();

    let todoTitle = document.createElement("h3");
    todoTitle.classList.add("todoTitle");
    todoTitle.innerText = title;

    todoCard.appendChild(todoTitle);
    todoCard.appendChild(createTaskList(items));

    return todoCard;
}

/**
 * Searches todos based on keyword input
 * - Filters todos by title or item text
 * - Updates display with matching results
 */
function searchTodo() {
    let keyword = (searchBar as HTMLInputElement).value.toLowerCase();

    let result = todoList.filter((todo: Todo) => {
        return todo.title.toLowerCase().includes(keyword) || 
               todo.items.some((item: { text: string }) => item.text.toLowerCase().includes(keyword));
    });

    (todoContainer as HTMLElement)!.innerHTML = '';

    result.forEach((element: Todo) => {
        let todoCard = createTodoCard(element.id, element.title, element.items);
        (todoContainer as HTMLElement)!.prepend(todoCard);
    });
}

/**
 * Adds a new todo to the list
 * @returns The ID of the newly created todo, or undefined if creation failed
 */
function addTodo() {
    if (!(newTodoInput as HTMLInputElement).value) {
        setAlertMessage("Please input a title");
        (newTodoInput as HTMLInputElement).focus();
    } else {
        let newTodo = {
            id: Date.now(),
            title: (newTodoInput as HTMLInputElement).value,
            items: [],
        };
        
        todoList.push(newTodo);
        setLocalStorage();
        
        if (document.querySelector('.sidebar')) {
            toggleSidebar()
        };
        
        showTodoPopup(newTodo.id);
        renderTodo();
        
        (newTodoInput as HTMLInputElement).value = '';
        
        return newTodo.id;
    }
}

/**
 * Creates an input field for adding new tasks
 * @param id - The ID of the todo to add tasks to
 * @returns An input element for new task entry
 */
function createNewTaskInput(id: number) {
    let newTaskInput = document.createElement('input');
    newTaskInput.placeholder = "Add a new task";
    newTaskInput.onkeyup = (event) => {
        if (event.key === 'Enter') {
            newTaskInput.focus();
            addNewTask(id, newTaskInput.value);
        }
    };

    return newTaskInput;
}

/**
 * Creates a task element with checkbox and text
 * @param taskData - The task data including id, text, and completion status
 * @returns A list item element containing the task
 */
function createTask(taskData: { id: number; text: string; completed: boolean }) {
    let li = document.createElement("li");
    let task = document.createElement("div");
    let taskName = document.createElement("p");
    let checkbox = document.createElement("i");
    checkbox.id = taskData.id.toString();
    checkbox.addEventListener('click', (event) => toggleTaskCompletion(event.target as Element));

    if (taskData.completed) {
        checkbox.classList.add("fa-regular", "fa-square-check");
        taskName.style.textDecoration = "line-through";
    } else {
        checkbox.classList.add("fa-regular", "fa-square");
    }

    task.classList.add("task");
    taskName.innerText = taskData.text;
    task.appendChild(checkbox);
    task.appendChild(taskName);
    li.appendChild(task);
    return li;
}

/**
 * Toggles the completion status of a task
 * @param checkboxElement - The checkbox element that was clicked
 */
function toggleTaskCompletion(checkboxElement: Element) {
    // Cari parent element dengan class 'popupContent' untuk mendapatkan todo yang sedang dibuka
    const todoElement = findParentByClass(checkboxElement, 'popupContent');
    // Cari parent element dengan class 'popupContainer' untuk menghapus popup nanti
    const popUpContainerElement = findParentByClass(checkboxElement, 'popupContainer');
    
    // Cari todo yang sesuai dengan ID dari popupContent
    let todoToChange = todoList.find((todo: Todo) => todo.id === parseInt(todoElement!.id));
    
    if (todoToChange) {
        // Cari task yang sesuai dengan ID dari checkbox yang di-klik
        let taskToToggle = todoToChange.items.find((task: { id: number }) => task.id === parseInt(checkboxElement.id));

        if (taskToToggle) {
            // Toggle status completed (true jadi false, false jadi true)
            taskToToggle.completed = !taskToToggle.completed;
            // Simpan perubahan ke localStorage
            setLocalStorage();
            // Hapus popup yang sedang terbuka
            popUpContainerElement!.remove();
            // Tampilkan popup yang sama dengan status yang sudah di-update
            showTodoPopup(parseInt(todoElement!.id));
            // Update tampilan todo list
            renderTodo();
        }
    }
}

/**
 * Creates an input field for editing a todo's title
 * @param todo - The todo item to edit
 * @returns An input element with the todo's title
 */
function createTitle(todo: Todo) {
    const title = document.createElement('input');
    title.classList.add('todoPopupTitle');
    title.value = todo.title;
    title.addEventListener('blur', () => updateTodoTitle(todo.id, title.value)); 
    title.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            updateTodoTitle(todo.id, title.value);
            title.blur();
        }
    });

    return title;
}

/**
 * Creates a list of task elements
 * @param itemsArray - Array of task objects
 * @returns A list element containing all tasks
 */
function createTaskList(itemsArray: Array<{ id: number; text: string; completed: boolean }>) {
    const itemList = document.createElement('ul');  
    itemList.classList.add('todoItems');

    const uncompletedTasks: Array<Element> = [];
    const completedTasks: Array<Element> = [];

    itemsArray.forEach((item: { id: number; text: string; completed: boolean }) => {
        const task = createTask(item);
        if (item.completed) {
            completedTasks.push(task);
        } else {
            uncompletedTasks.push(task);
        }
    });

    uncompletedTasks.reverse().forEach((task: Element) => itemList.appendChild(task));
    completedTasks.forEach((task: Element) => itemList.appendChild(task));

    if (itemsArray.length === 0) {
        const noTasksMessage = document.createElement('p');
        noTasksMessage.innerText = 'No tasks available';
        itemList.appendChild(noTasksMessage);
    }
    
    return itemList;
}

/**
 * Shows a confirmation dialog for deleting a todo
 * @param todoId - The ID of the todo to delete
 */
function deleteTodo(todoId: number) {
    const deletePopup = document.createElement('div');
    deletePopup.className = 'deletePopup';
    deletePopup.innerHTML = `
        <p>Are you sure you want to delete this list?</p>
        <button class="deleteYes">Yes</button>
        <button class="deleteNo">No</button>
    `;

    (document.querySelector('.popupContent') as HTMLElement)!.appendChild(deletePopup);

    const yesButton = deletePopup.querySelector('.deleteYes');
    const noButton = deletePopup.querySelector('.deleteNo');

    yesButton!.addEventListener('click', () => {
        const todoIndex = todoList.findIndex((todo: Todo) => todo.id === todoId);
        todoList.splice(todoIndex, 1);
        setLocalStorage();
        (document.querySelector('.popupContainer') as HTMLElement)!.remove();
        renderTodo();
    });

    noButton!.addEventListener('click', () => {
        (document.querySelector('.popupContainer') as HTMLElement)!.remove();
        showTodoPopup(todoId);
    });
}

/**
 * Shows a popup for editing a todo
 * @param todoCardId - The ID of the todo to edit
 */
function showTodoPopup(todoCardId: number) {
    const todo = todoList.find(({ id }: { id: number }) => id === todoCardId);

    if (todo) {
        const popupContainer = document.createElement('div');
        popupContainer.className = 'popupContainer';
        const popupContent = document.createElement('div');
        popupContent.className = 'popupContent';
        popupContent.id = todoCardId.toString();

        if (window.innerWidth <= 600) {
            (document.querySelector('header') as HTMLElement)!.style.display = 'none';
            (document.querySelector('main') as HTMLElement)!.style.display = 'none';
        }
        popupContainer.onclick = ({ target }) => {
            if (!popupContent.contains(target as Node)) {
                popupContainer.remove();
            }
        };

        popupContent.append(
            createTitle(todo),
            createTaskList(todo.items),
            createNewTaskInput(todoCardId),
            createPopupButtons(todoCardId)
        );

        popupContainer.appendChild(popupContent);

        if (!document.querySelector('.popupContainer')) {
            (document.body as HTMLElement).appendChild(popupContainer);
        }
    }
}

/**
 * Creates buttons for the todo popup
 * @param todoId - The ID of the todo associated with the popup
 * @returns A container element with action buttons
 */
function createPopupButtons(todoId: number) {
    // Buat container untuk menampung tombol-tombol
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'buttonContainer';

    // Menggunakan pola "Configuration Object" untuk mendefinisikan tombol-tombol
    // Keuntungan:
    // 1. Mudah dikelola: tinggal tambah object baru ke array untuk tombol baru
    // 2. Mudah dimodifikasi: setiap tombol punya properti sendiri (text, onClick)
    // 3. Mengurangi duplikasi kode: tidak perlu menulis kode untuk setiap tombol
    // 4. Lebih fleksibel: bisa dengan mudah menambah/hapus tombol
    const buttonsData = [
        { 
            text: 'Delete', 
            onClick: () => deleteTodo(todoId) // Fungsi untuk menghapus todo
        },
        { 
            text: 'Close', 
            onClick: () => {
                // Hapus popup dan update tampilan todo list
                (document.querySelector('.popupContainer') as HTMLElement)!.remove();
                renderTodo();
            }
        }
    ];

    // Buat tombol-tombol berdasarkan data
    for (const { text, onClick } of buttonsData) {
        // Buat elemen button baru
        const button = buttonContainer.appendChild(document.createElement('button'));
        // Set teks tombol
        button.textContent = text;
        // Tambahkan event listener jika ada fungsi onClick
        // { passive: true } untuk optimasi performa
        onClick && button.addEventListener('click', onClick, { passive: true });
    }

    return buttonContainer;
}

/**
 * Adds a new task to a todo
 * @param id - The ID of the todo to add the task to
 * @param newTask - The text of the new task
 */
function addNewTask(id: number, newTask: string) {
    todoList.forEach((element: Todo) => {
        if (element.id == id) {
            element.items.push({
                id: Date.now(),
                text: newTask,
                completed: false
            });
            setLocalStorage();
            (document.querySelector('.popupContainer') as HTMLElement)!.remove();
            showTodoPopup(id);
            renderTodo();
        }
    })
}

/**
 * Updates the title of a todo
 * @param id - The ID of the todo to update
 * @param newTitle - The new title text
 */
function updateTodoTitle(id: number, newTitle: string) {
    todoList.forEach((element: Todo) => {
        if (element.id == id) {
            element.title = newTitle;
        }
    });
    
    setLocalStorage();
    renderTodo();
}

// ======================
// 5. Event Listener dan Inisialisasi Aplikasi
// ======================

(newTodoInput as HTMLInputElement).addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const newId = addTodo();
        if (newId) {
            showTodoPopup(newId);
        }
    }
});

(addTodoButton as HTMLButtonElement).addEventListener('click', () => {
    addTodo();
});
(newTodoInput as HTMLInputElement).value = '';

searchBar!.addEventListener('input', searchTodo);

(todoContainer as HTMLElement).addEventListener('click', (event) => {
    const targetParent = findParentByClass(event.target as Element, 'todoCard');
    if (targetParent) {
        showTodoPopup(parseInt(targetParent.id));
    }
});

// Render todo list saat aplikasi dimuat
renderTodo();

