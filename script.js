const bookShelf = [];
const RENDER = 'render_book'
const BOOK_CACHE = 'cache_book_saved'
const modalWindow = document.getElementById('modalPlaceholder');

function checkStorage (){
    if(typeof(Storage) === undefined){
        alert('Browser anda tidak mendukung local storage, semua data akan terhapus ketika reload!');
        return false;
    }
    return true;
}

function generateObject (id, title, author, year, isComplete){
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function generateId(){
    return +new Date();
}

function findItem (itemId){
    for (let book of bookShelf){
        if (itemId == book.id){
            return book;
        }
    }
    return null;
}


function markDoneEvent(bookId){
    const item = findItem(bookId);
    item.isComplete = true;
    if (item == null) return;
    document.dispatchEvent(new Event(RENDER));
    saveBookToLocal();
}

function markUndoneEvent(bookId){
    const item = findItem(bookId);
    item.isComplete = false;
    if (item == null) return;
    document.dispatchEvent(new Event(RENDER));
    saveBookToLocal();
}

function deleteBookEvent (bookId){
    for(let i in bookShelf){
        if (bookShelf[i].id == bookId){
            bookShelf.splice(i, 1)
        }
    }
    document.dispatchEvent(new Event(RENDER));
    saveBookToLocal();
}

function editBookEvent (bookId){
    const item = findItem(bookId);
    editModal(item);

    document.dispatchEvent(new Event(RENDER));
    saveBookToLocal();
}

function addBook (){
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('date').value;
    const generateID = generateId();
    const bookObject = generateObject(generateID, title, author, year, false); 
    bookShelf.push(bookObject);
    document.dispatchEvent(new Event(RENDER));
    saveBookToLocal();
}

function bookItem(bookObject){
    const container = document.createElement('div');
    container.setAttribute('id', `Books-${bookObject.id}`)
    container.setAttribute('class', 'books');
    const title = document.createElement('h3');
    title.innerText = bookObject.title;
    const author = document.createElement('p');
    author.innerText = bookObject.author;
    const year = document.createElement('p');
    year.innerText = bookObject.year;
    container.append(title, author, year);
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('class', 'buttonGroup');
    const deleteBook = document.createElement('button');
    deleteBook.setAttribute('class', 'box submitbox warn');
    deleteBook.innerText = 'Delete this book';
    deleteBook.addEventListener('click', () => {
        askDeleteConfirmation(bookObject.id);
    })
    const editButton = document.createElement('button');
    editButton.setAttribute('class', 'edit');
    editButton.innerHTML = '<img src="assets/Edit.svg" />';
    editButton.addEventListener('click', () => {
        editBookEvent(bookObject.id);
    })
    if(!bookObject.isComplete){
        const markDone = document.createElement('button');
        markDone.setAttribute('class', 'box submitbox');
        markDone.innerText = 'Mark as done'
        markDone.addEventListener('click', () => {
            markDoneEvent(bookObject.id);
        })
        buttonContainer.append(markDone, deleteBook, editButton);
    } else {
        const markUndone = document.createElement('button');
        markUndone.setAttribute('class', 'box submitbox');
        markUndone.innerText = 'Mark as undone'
        markUndone.addEventListener('click', () => {
            markUndoneEvent(bookObject.id);
        })
        buttonContainer.append(markUndone, deleteBook, editButton);
    }
    container.append(buttonContainer);
    return container;
}

const cancelButton = document.createElement('button');
cancelButton.setAttribute('class', 'box submitbox');
cancelButton.innerText = 'Cancel';
cancelButton.addEventListener('click', () => {
    modalWindow.classList.remove('active');
    clearList(modalWindow);
})

function askDeleteConfirmation(bookId){
    modalWindow.classList.add('active');
    const delModalContainer = document.createElement('div');
    delModalContainer.setAttribute('class', 'delModal');
    const delQuestion = document.createElement('p');
    delQuestion.innerText = 'Are you sure to delete this book?';
    const confirmDelButton = document.createElement('button');
    confirmDelButton.setAttribute('class', 'box submitbox warn');
    confirmDelButton.innerText = 'Yes';
    const confirmDelButtonContainer =  document.createElement('div');
    confirmDelButtonContainer.setAttribute('class', 'buttonGroup');
    confirmDelButtonContainer.append(cancelButton, confirmDelButton);
    delModalContainer.append(delQuestion, confirmDelButtonContainer);
    modalWindow.append(delModalContainer);
    confirmDelButton.addEventListener('click', () => {
        deleteBookEvent(bookId);
        modalWindow.classList.remove('active');
        clearList(modalWindow);
    })
}

function editModal(bookToEdit){
    modalWindow.classList.add('active');
    const editForm = document.createElement('form');
    editForm.setAttribute('class', 'formGroup editModal');
    const editTitle = document.createElement('input');
    editTitle.setAttribute('type', 'text');
    editTitle.setAttribute('class', 'box');
    editTitle.setAttribute('placeholder', `${bookToEdit.title}`);
    const editAuthor = document.createElement('input');
    editAuthor.setAttribute('type', 'text');
    editAuthor.setAttribute('class', 'box');
    editAuthor.setAttribute('placeholder', `${bookToEdit.author}`);
    const editYear = document.createElement('input');
    editYear.setAttribute('type', 'number');
    editYear.setAttribute('class', 'box');
    editYear.setAttribute('placeholder', `${bookToEdit.year}`);
    const confirmEditButton = document.createElement('button');
    confirmEditButton.setAttribute('class', 'box submitbox warn');
    confirmEditButton.innerText = 'Edit';
    const confirmEditButtonContainer =  document.createElement('div');
    confirmEditButtonContainer.setAttribute('class', 'buttonGroup');
    confirmEditButtonContainer.append(cancelButton, confirmEditButton);
    editForm.append(editTitle, editAuthor, editYear, confirmEditButtonContainer);
    modalWindow.append(editForm);
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        confirmEditButton.addEventListener('click', () => {
            let editedTitle, editedAuthor, editedYear;
            const newId = generateId();
            editTitle.value.length > 0 ? editedTitle = editTitle.value : editedTitle = bookToEdit.title;
            editAuthor.value.length > 0 ? editedAuthor = editAuthor.value : editedAuthor = bookToEdit.author;
            editYear.value.length > 0 ? editedYear =  editYear.value : editedYear = bookToEdit.year;
            const state = bookToEdit.isComplete;
            for(let i in bookShelf){
                if (bookShelf[i].id == bookToEdit.id){
                    bookShelf.splice(i, 1, generateObject(newId, editedTitle, editedAuthor, editedYear, state));
                }
            }
            modalWindow.classList.remove('active');
            clearList(modalWindow);
            document.dispatchEvent(new Event(RENDER));
            saveBookToLocal();
        })
    })
}

function saveBookToLocal (){
    if (checkStorage()){
        const parsedData = JSON.stringify(bookShelf);
        localStorage.setItem(BOOK_CACHE, parsedData);
    }
}

function loadLocalData (){
    if (checkStorage()){
        const data = localStorage.getItem(BOOK_CACHE);
        const bookCache = JSON.parse(data);
        if (bookCache !== null){
            for (let book of bookCache){
                bookShelf.push(book);
            }
        }
        document.dispatchEvent(new Event(RENDER));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addBook();
    })
    if(checkStorage()){
        loadLocalData();
    }
})

document.addEventListener(RENDER, () => {
    const read =  document.getElementById('read');
    read.innerHTML = '';
    const unread = document.getElementById('notread');
    unread.innerHTML = '';
    for (let book of bookShelf){
        let bookToShelf = bookItem(book);
        if(!book.isComplete){
            unread.append(bookToShelf);
        } else {
            read.append(bookToShelf);
        }
    }
})

const searchList = bookShelf;
const searchBar = document.getElementById('searchBar');
const searchResultList = document.getElementById('searchResult');

function searchRelevance (bookTitle, searchTerm){
    let relevance;
    if (bookTitle === searchTerm){
        relevance = 2;
    } else if (bookTitle.startsWith(searchTerm)){
        relevance = 1;
    } else if(bookTitle.includes(searchTerm)){
        relevance = 0;
    } else {
        relevance = -1;
    }
    return relevance;
}

function clearList (elem){
    while (elem.firstChild){
        elem.removeChild(elem.firstChild);
    }
}

function noSearchResult (){
    const noResultWrapper = document.createElement('div');
    noResultWrapper.setAttribute('class', 'noResult');
    const notFoundErrMsg = document.createElement('p');
    notFoundErrMsg.innerText = 'Sorry, No result can be found!';
    noResultWrapper.append(notFoundErrMsg);
    return noResultWrapper;
}

function setList (bookSearchResult){
    clearList(searchResultList);
    if (bookSearchResult.length !== 0) {
        for (let searchResult of bookSearchResult){
            const listItem = document.createElement('li');
            const bookElem = bookItem(searchResult);
            const bookListElem = listItem.appendChild(bookElem);
            searchResultList.append(bookListElem);
        }
    } else {
        const noResult = noSearchResult();
        searchResultList.append(noResult);
    }
}

searchBar.addEventListener('keyup', e => {
    const notResultWrapper = document.getElementById('wrapper');
    clearList(notResultWrapper);
    const searchQuery = e.target.value.toLowerCase().replace(/^\s+|\s+$/gm,'');
    if (searchQuery.length > 0){
        setList(searchList.filter(book => {
            const bookTitle = book.title.toLowerCase().replace(/^\s+|\s+$/gm,'');
            if(bookTitle.includes(searchQuery)){
                return book;
            }
        }).sort((a, b) => {
            return searchRelevance(a.title, searchQuery) - searchRelevance(b.title, searchQuery);
        }));
    } else {
        clearList(searchResultList);
    }
})