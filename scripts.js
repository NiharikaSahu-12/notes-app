const toolbarOptions = [
    ['bold', 'italic', 'underline'],        
    [{ 'header': [1, 2, 3, false] }],
    [{ 'font': [] }],

    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    
    [{ 'color': [] }, { 'background': [] }],          
    [{ 'align': [] }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],          
    ['link', 'image', 'video'],
];

const quill = new Quill('#quill-editor', {
    modules: {
      toolbar: toolbarOptions
    },
    theme: 'snow'
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
const saveNoteBtn = document.querySelector('.save-note-btn');
const newNoteBtn = document.querySelector('.new-note-btn');
const searchBar = document.getElementById('search-bar');

// Category colors mapping
const categoryColors = {
    'Uncategorized': 'grey',
    'Work': 'blue',
    'Personal': 'green',
    'Ideas': 'yellow'
};

// Load notes from localStorage when the app starts
function loadNotes() {
    const notesFromStorage = localStorage.getItem('notes');
    if (notesFromStorage) {
        notes = JSON.parse(notesFromStorage);
        renderNotesList();
    }
}

// Updated renderNotesList function to include drag and drop
function renderNotesList(filterText = '', selectedCategory = '') {
    notesList.innerHTML = '';

    notes
        .filter(note => note.title.toLowerCase().includes(filterText) && 
                (selectedCategory === '' || note.category === selectedCategory))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort notes by latest timestamp
        .forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.dataset.id = note.id;
            noteItem.draggable = true; // Make the note item draggable

            const categoryColor = categoryColors[note.category] || 'grey'; // Use category color or default

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

            // Set border-left color dynamically
            noteItem.style.borderLeft = `8px solid ${categoryColor}`;

            // Add event listeners for drag and drop
            addDragListeners(noteItem); // Attach drag events

            notesList.appendChild(noteItem);
        });
}

// Add drag event listeners for notes
function addDragListeners(noteItem) {
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

    category.addEventListener('dragleave', () => {
        category.classList.remove('dragover');
    });

    category.addEventListener('drop', e => {
        e.preventDefault();
        const noteId = e.dataTransfer.getData('text/plain');
        const note = notes.find(note => note.id == noteId);
        if (note) {
            note.category = category.dataset.category;
            localStorage.setItem('notes', JSON.stringify(notes)); // Save the updated category
            renderNotesList(); // Re-render notes to update categories
        }
        category.classList.remove('dragover');
    });
});

// Handle search functionality
searchBar.addEventListener('input', () => {
    const searchText = searchBar.value.toLowerCase();
    renderNotesList(searchText);
});

// Create a new note
newNoteBtn.addEventListener('click', () => {
    currentNoteId = null;
    noteTitle.value = '';
    quill.root.innerHTML = ''; // Clear the Quill editor
});

// Save note function
saveNoteBtn.addEventListener('click', () => {
    const title = noteTitle.value;
    const body = quill.root.innerHTML; // Get content from the Quill editor
    const category = 'Uncategorized'; // Default category

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
            category, // Assign the category here
            timestamp
        };
        notes.push(note);
    }

    // Save notes to localStorage
    localStorage.setItem('notes', JSON.stringify(notes));

    renderNotesList();
    noteTitle.value = '';
    quill.root.innerHTML = ''; // Clear the Quill editor
});

// View note function
function viewNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        currentNoteId = id;
        noteTitle.value = note.title;
        quill.root.innerHTML = note.body; // Load content into the Quill editor
    }
}

// Edit note function
function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        currentNoteId = id;
        noteTitle.value = note.title;
        quill.root.innerHTML = note.body;
    }
}

// Delete note function
function deleteNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        const confirmDelete = confirm(`Are you sure you want to delete the note titled "${note.title}"?`);
        
        if (confirmDelete) {
            notes = notes.filter(note => note.id !== id);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotesList();
        }
    } else {
        alert('Note not found.');
    }
}

// Event listener for "All Notes" button
const allNotesBtn = document.querySelector('.all-notes-btn');
allNotesBtn.addEventListener('click', () => {
    searchBar.value = ''; // Clear the search bar
    renderNotesList(); // Call renderNotesList without any filter
});

// Click event on category to filter notes
document.querySelectorAll('.category').forEach(category => {
    category.addEventListener('click', () => {
        const categoryName = category.dataset.category;
        renderNotesList('', categoryName);
    });
});

// Load notes when the application starts
loadNotes();