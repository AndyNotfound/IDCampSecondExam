const bookShelf = [];
const RENDER = 'render_book'
const BOOK_CACHE = 'cache_book_saved'

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

function askConfirmation(bookId){
    const modalWindow = document.getElementById('modalPlaceholder');
    const modal = document.getElementById('modal');
    modalWindow.classList.add('active');
    modal.classList.add('active');
    const cancel = document.getElementById('cancelDelete');
    cancel.addEventListener('click', () => {
        modalWindow.classList.remove('active');
        modal.classList.remove('active');
    })
    const confirm = document.getElementById('confirmDelete')
    confirm.addEventListener('click', () => {
        deleteBookEvent(bookId);
        modalWindow.classList.remove('active');
        modal.classList.remove('active');
    })
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
    deleteBook.innerText = 'Delete this book'
    deleteBook.addEventListener('click', () => {
        askConfirmation(bookObject.id);
    })
    if(!bookObject.isComplete){
        const markDone = document.createElement('button');
        markDone.setAttribute('class', 'box submitbox');
        markDone.innerText = 'Mark as done'
        markDone.addEventListener('click', () => {
            markDoneEvent(bookObject.id);
        })
        buttonContainer.append(markDone, deleteBook);
    } else {
        const markUndone = document.createElement('button');
        markUndone.setAttribute('class', 'box submitbox');
        markUndone.innerText = 'Mark as undone'
        markUndone.addEventListener('click', () => {
            markUndoneEvent(bookObject.id);
        })
        buttonContainer.append(markUndone, deleteBook);
    }
    container.append(buttonContainer);
    return container;
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