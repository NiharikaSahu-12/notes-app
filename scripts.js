// Check for saved user preference in localStorage
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    document.body.classList.add('dark-mode');
}

// Toggle dark mode on button click
document.getElementById('darkModeToggle').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    
    // Save user preference in localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});


let notes = [];
let currentNoteId = null;
const categories = [
    { name: 'Uncategorized', icon: 'fas fa-asterisk' },
    { name: 'Work', icon: 'fas fa-briefcase' },
    { name: 'Personal', icon: 'fas fa-user' },
    { name: 'Ideas', icon: 'fas fa-lightbulb' }
];

const notesList = document.querySelector('.notes-list');
const noteTitle = document.querySelector('.note-title');
const noteBody = document.querySelector('.note-body');
const saveNoteBtn = document.querySelector('.save-note-btn');
const newNoteBtn = document.querySelector('.new-note-btn');

// Load notes from localStorage when the app starts
function loadNotes() {
    const notesFromStorage = localStorage.getItem('notes');
    if (notesFromStorage) {
        notes = JSON.parse(notesFromStorage);
        renderNotesList();
    }
}

// Add event listeners for drag and drop on notes
function addDragListeners(noteItem) {
    noteItem.setAttribute('draggable', true);
    noteItem.addEventListener('dragstart', handleDragStart);
    noteItem.addEventListener('dragend', handleDragEnd);
}

// Handle drag start
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

// Handle drag end
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Add event listeners for categories to handle dragover and drop events
document.querySelectorAll('.category').forEach(category => {
    category.addEventListener('dragover', e => {
        e.preventDefault();
        category.classList.add('dragover');
    });

    category.addEventListener('dragleave', e => {
        category.classList.remove('dragover');
    });

    category.addEventListener('drop', e => {
        e.preventDefault();
        const noteId = e.dataTransfer.getData('text/plain');
        const note = notes.find(note => note.id == noteId);
        note.category = category.dataset.category;
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotesList(); // Re-render notes to update categories
        category.classList.remove('dragover');
    });
});

// Render the list of notes
const searchBar = document.getElementById('search-bar');

searchBar.addEventListener('input', () => {
    const searchText = searchBar.value.toLowerCase();
    renderNotesList(searchText);
});

// Update the renderNotesList function to include filtering logic
// Category colors mapping
const categoryColors = {
    'Uncategorized': 'grey',
    'Work': 'blue',
    'Personal': 'green',
    'Ideas': 'yellow'
};

// Updated renderNotesList function to include category colors
function renderNotesList(filterText = '', category = null) {
    notesList.innerHTML = '';

    notes
        .filter(note => 
            (!category || note.category === category) &&
            (note.title.toLowerCase().includes(filterText) ||
            note.body.toLowerCase().includes(filterText))
        )
        .forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.dataset.id = note.id;
            
            // Set note left border color based on category
            noteItem.style.borderLeft = `4px solid ${categoryColors[note.category] || '#ffffff'}`;

            const timestamp = new Date(note.timestamp);
            const formattedTimestamp = timestamp.toLocaleDateString() + ' ' + 
                timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            noteItem.innerHTML = `
                <span>${note.title} <small class="note-timestamp">(${formattedTimestamp})</small></span>
                <div class="note-buttons">
                    <button onclick="editNote(${note.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteNote(${note.id})">
                        <i class="fas fa-trash-alt"></i> 
                    </button>
                </div>
            `;

            noteItem.addEventListener('click', () => {
                viewNote(note.id);
            });

            addDragListeners(noteItem);
            notesList.appendChild(noteItem);
        });
}

// Event listener for "All Notes" button
const allNotesBtn = document.querySelector('.all-notes-btn');

allNotesBtn.addEventListener('click', () => {
    searchBar.value = ''; // Clear the search bar
    renderNotesList(); // Call renderNotesList without any filter
});


// Create a new note
newNoteBtn.addEventListener('click', () => {
    currentNoteId = null;
    noteTitle.value = '';
    noteBody.value = '';
});

// Save note function
saveNoteBtn.addEventListener('click', () => {
    const title = noteTitle.value;
    const body = noteBody.value;

    if (title.trim() === '' || body.trim() === '') {
        alert('Title and body cannot be empty.');
        return;
    }

    const timestamp = new Date();

    if (currentNoteId !== null) {
        // Update existing note
        const note = notes.find(note => note.id === currentNoteId);
        note.title = title;
        note.body = body;
        note.timestamp = timestamp;
    } else {
        // Create new note
        const note = {
            id: Date.now(),
            title,
            body,
            category: 'Uncategorized',
            timestamp
        };
        notes.push(note);
    }

    // Save notes to localStorage
    localStorage.setItem('notes', JSON.stringify(notes));

    renderNotesList();
    noteTitle.value = '';
    noteBody.value = '';
});

// View note function
function viewNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        currentNoteId = id;
        noteTitle.value = note.title;
        noteBody.value = note.body;
    }
}

// Edit note function
function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        currentNoteId = id;
        noteTitle.value = note.title;
        noteBody.value = note.body;
    }
}

// Delete note function
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    // Save the updated notes to localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotesList();
}

// Load notes when the application starts
loadNotes();

// Click event on category to filter notes
document.querySelectorAll('.category').forEach(category => {
    category.addEventListener('click', () => {
        const categoryName = category.dataset.category;
        renderNotesList('', categoryName);
    });
});
