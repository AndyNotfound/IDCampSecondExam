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

function generateObject (id, title, author, year, stats){
    return {
        id,
        title,
        author,
        year,
        stats
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
    item.stats = true;
    if (item == null) return;
    document.dispatchEvent(new Event(RENDER));
    saveBookToLocal();
}

function markUndoneEvent(bookId){
    const item = findItem(bookId);
    item.stats = false;
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

    if(!bookObject.stats){
        const markDone = document.createElement('button');
        markDone.setAttribute('class', 'box submitbox');
        markDone.innerText = 'Mark as done'
        markDone.addEventListener('click', () => {
            markDoneEvent(bookObject.id);
        })

        buttonContainer.append(markDone);
    } else {
        const markUndone = document.createElement('button');
        markUndone.setAttribute('class', 'box submitbox');
        markUndone.innerText = 'Mark as undone'
        markUndone.addEventListener('click', () => {
            markUndoneEvent(bookObject.id);
        })

        const deleteBook = document.createElement('button');
        deleteBook.setAttribute('class', 'box submitbox warn');
        deleteBook.innerText = 'Delete this book'
        deleteBook.addEventListener('click', () => {
            deleteBookEvent(bookObject.id);
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
        let bookFromShelf = bookItem(book);
        if(!book.stats){
            unread.append(bookFromShelf);
        } else {
            read.append(bookFromShelf);
        }
    }
})