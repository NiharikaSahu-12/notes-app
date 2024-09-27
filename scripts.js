let notes = [];
let currentNoteId = null;

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

// Render the list of notes
const searchBar = document.getElementById('search-bar');

searchBar.addEventListener('input', () => {
    const searchText = searchBar.value.toLowerCase();
    renderNotesList(searchText);
});

// Update the renderNotesList function to include filtering logic
function renderNotesList(filterText = '') {
    notesList.innerHTML = '';

    notes
        .filter(note => 
            note.title.toLowerCase().includes(filterText) ||
            note.body.toLowerCase().includes(filterText)
        )
        .forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';

            // Format the timestamp
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

            notesList.appendChild(noteItem);
        });
}


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
