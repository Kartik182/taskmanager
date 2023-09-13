const updateClock = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    const clockElement = document.querySelector("#digital-clock");
    clockElement.textContent = formattedDate;
};

updateClock();
setInterval(updateClock, 1000);


window.addEventListener('load', () => {
    const form = document.querySelector("#f1");
    const input = document.querySelector("#inf");
    const dateInput = document.querySelector("#date");
    const categorySelect = document.querySelector("#category");
    const list_el = document.querySelector("#tasks");
    const sortingControls = document.querySelector("#sorting-controls");
    const tasks = []; 
    const filterCategory = document.querySelector("#filter-category");
    const filterButton = document.querySelector("#filter-button");
    const searchInput = document.querySelector("#search-input");
    const searchButton = document.querySelector("#search-button");
    

    
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

    
    const saveTasksToLocalStorage = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };
    
    const addTaskToDOM = (taskObj) => {
        const task_el = document.createElement('div');
        task_el.classList.add('task');

        const task_content_el = document.createElement('div');
        task_content_el.classList.add('content');

        const task_description = document.createElement('p');
        task_description.textContent = ` (Date: ${taskObj.taskDate}, Category: ${taskObj.category})`;

        task_content_el.appendChild(task_description);

        const task_input_el = document.createElement('input');
        task_input_el.classList.add('text');
        task_input_el.type = 'text';
        task_input_el.value = taskObj.task;
        task_input_el.setAttribute('readonly', 'readonly');

        task_content_el.appendChild(task_input_el);

        const task_actions_el = document.createElement('div');
        task_actions_el.classList.add('actions');

        const task_edit_el = document.createElement('button');
        task_edit_el.classList.add('edit');
        task_edit_el.innerText = 'Edit';

        const task_complete_el = document.createElement('button');
        task_complete_el.classList.add('complete');
        task_complete_el.innerText = 'Complete';

        const task_delete_el = document.createElement('button');
        task_delete_el.classList.add('delete');
        task_delete_el.innerText = 'Delete';

        task_actions_el.appendChild(task_edit_el);
        task_actions_el.appendChild(task_complete_el);
        task_actions_el.appendChild(task_delete_el);

        task_el.appendChild(task_content_el);
        task_el.appendChild(task_actions_el);

        list_el.appendChild(task_el);

        
     
        task_complete_el.addEventListener('click', () => {
            taskObj.completed = !taskObj.completed;

            task_el.classList.toggle('completed', taskObj.completed);
            tasks.forEach((item, index) => {
                if (item === taskObj) {
                    tasks[index].completed = taskObj.completed;
                    return false;
                }
            });
        
            saveTasksToLocalStorage();
            
        });

        task_edit_el.addEventListener('click', (e) => {
            if (task_edit_el.innerText.toLowerCase() == "edit") {
                task_edit_el.innerText = "Save";
                task_input_el.removeAttribute("readonly");
                task_input_el.focus();
            } else {
                task_edit_el.innerText = "Edit";
                task_input_el.setAttribute("readonly", "readonly");
                tasks.find((task)=>{
                    if(task.task == taskObj.task){
                        task.task = task_input_el.value;
                    }
                })
                saveTasksToLocalStorage()
            }

        });

        task_delete_el.addEventListener('click', (e) => {
            list_el.removeChild(task_el);
           
            const index = tasks.findIndex(item => item === taskObj);
            if (index !== -1) {
                tasks.splice(index, 1);
                saveTasksToLocalStorage();
            }
        });
    };
   
    const displaySortedTasks = (sortedTasks) => {
        
        list_el.innerHTML = '';

      
        sortedTasks.forEach((taskObj) => {
            addTaskToDOM(taskObj);
        });
    };

const searchTasks = () => {
    const searchQuery = searchInput.value.toLowerCase();
    const matchedTasks = tasks.filter(task =>
        task.task.toLowerCase().includes(searchQuery) ||
        task.category.toLowerCase().includes(searchQuery) ||
        task.taskDate.toLowerCase().includes(searchQuery)
    );
    displaySortedTasks(matchedTasks);
};


searchButton.addEventListener('click', searchTasks);


searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchTasks();
    }
});

    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const task = input.value;
        const taskDate = dateInput.value;
        const category = categorySelect.value;
        const taskObj = { task, taskDate, category, completed: false };
        tasks.push(taskObj);
        saveTasksToLocalStorage();
        addTaskToDOM(taskObj);
        input.value = '';
        dateInput.value = '';
    });

    
    document.getElementById('sort-by-due-date').addEventListener('click', () => {
        const sortedByDueDate = [...tasks].sort((a, b) => new Date(a.taskDate) - new Date(b.taskDate));
        displaySortedTasks(sortedByDueDate);
    });


    document.getElementById('sort-by-category').addEventListener('click', () => {
        const sortedByCategory = [...tasks].sort((a, b) => a.category.localeCompare(b.category));
        displaySortedTasks(sortedByCategory);
    });


 
filterButton.addEventListener('click', () => {
    const selectedCategory = filterCategory.value;

 
    let filteredTasks;
    if (selectedCategory === "all") {
        filteredTasks = tasks; 
    } else {
        filteredTasks = tasks.filter(task => task.category === selectedCategory);
    }

    displaySortedTasks(filteredTasks);
});
  
    storedTasks.forEach((taskObj) => {
        tasks.push(taskObj);
        addTaskToDOM(taskObj);
    });
});

const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
if (!isSpeechRecognitionSupported) {
    alert('Speech recognition is not supported in this browser.');
} else {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    recognition.continuous = false; 
    recognition.lang = 'en-US'; 
    
    const searchInput = document.querySelector('#search-input');
    const voiceSearchButton = document.querySelector('#voice-search-button');
    
    voiceSearchButton.addEventListener('click', () => {
        recognition.start();
    });
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        searchTasks();
    };
    
    recognition.onend = () => {
        console.log('Voice recognition ended.');
    };
}