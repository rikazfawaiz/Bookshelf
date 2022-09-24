const books = []
let statusEdit = false;
const BOOK_KEY = "BOOKS";
const SAVED_EVENT = 'save-books';
const RENDER_EVENT = 'render-bookshelf';

const buttonDownloadReadBook = document.getElementById('readDownload');
const buttonDownloadUnReadBook = document.getElementById('unReadDownload');

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        editDataStatus(statusEdit);
    });

    if (isStorageExist()) {
        loadDataBookFromStorage();
    }
});

const editDataStatus = (status) => (status) ? updateData() : addBookData();


document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('searchBook');
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        searchBook();
    });
});

buttonDownloadReadBook.addEventListener('click', () => {
    downloadDataReadBook();
});

buttonDownloadUnReadBook.addEventListener('click', () => {
    downloadDataUnReadBook();
});

const searchBook = () => {
    const searchData = document.getElementById('searchBookTitle').value;
    const bookData = JSON.parse(localStorage.getItem(BOOK_KEY))
    const result = bookData.filter(book => book.title.toLowerCase().includes(searchData.toLowerCase()));

    if (result.length !== 0) {
        loadSearchData(result);
    } else {
        alert(`${searchData} tidak ditemukan`);
        loadSearchData(bookData);
        
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT))
}

const loadSearchData = (dataBook) => {
    books.length = 0;
    for (const book of dataBook) {
        books.push(book);
    }
}

const addBookData = () => {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const genre = document.getElementById('inputBookGenre').value.split(',');
    const year = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const id = generatedId();
    const newBook = generatedObject(id, title, author, genre, year, isComplete);
    books.push(newBook);

    alert(`Buku ${title} berhasil ditambahkan.`);
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();
    clearFormInput();
};

const clearFormInput = () => {
    document.getElementById('inputBook').reset()
}

const generatedId = () => +new Date();

const generatedObject = (id, title, author, genre, year, isComplete) => {
    return {id, title, author, genre, year, isComplete}
}

const getBookList = () => {
    if (isStorageExist()) {
        return JSON.parse(localStorage.getItem(BOOK_KEY)) || [];
    } else {
        return [];
    }
}

const isStorageExist = () => typeof(Storage) !== null;

const saveData = () => {
    if (isStorageExist()) {
        const parsedBook = JSON.stringify(books)
        localStorage.setItem(BOOK_KEY, parsedBook);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(RENDER_EVENT, () => {
    const uncompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    uncompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const book of books) {
        const bookElement = bookLists(book);
        if (!book.isComplete) {
            uncompleteBookshelfList.append(bookElement);
        } else {
            completeBookshelfList.append(bookElement);
        }
    }
});

const bookLists = (bookObject) => {;

    const tempID = document.createElement('p');
    tempID.setAttribute('id','tempID');
    tempID.innerText = bookObject.id;

    const article = document.createElement('article');
    article.classList.add('book_item');
    
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookObject.year}`;

    article.append(textTitle, textAuthor, textYear, tempID);

    const containerButton = document.createElement('div');
    containerButton.classList.add('action');

    if (bookObject.isComplete) {
        const buttonStatusRead = document.createElement('button');
        buttonStatusRead.classList.add('green');
        buttonStatusRead.innerText = "Belum selesai di Baca";

        buttonStatusRead.addEventListener('click', () => {
            undoBookFromCompletedRead(bookObject.id);
        })
    
        const buttonDelete = document.createElement('button');
        buttonDelete.classList.add('red');
        buttonDelete.innerText = "🗑 Hapus buku";
        
        buttonDelete.addEventListener('click', () => {
            removeBooks(bookObject.id);
        });

        const buttonEdit = document.createElement('button');
        buttonEdit.classList.add('blue');
        buttonEdit.innerText = "✍ Edit data";

        buttonEdit.addEventListener('click', () => {
            editDataBook(bookObject.id);
        })

        containerButton.append(buttonStatusRead, buttonDelete, buttonEdit);
        article.append(containerButton);
    } else {
        const buttonStatusRead = document.createElement('button');
        buttonStatusRead.classList.add('green');
        buttonStatusRead.innerText = "Selesai dibaca";

        buttonStatusRead.addEventListener('click', () => {
            undoBookFromUnCompletedRead(bookObject.id);
        });

        const buttonDelete = document.createElement('button');
        buttonDelete.classList.add('red');
        buttonDelete.innerText = "🗑 Hapus buku";

        buttonDelete.addEventListener('click', () => {
            removeBooks(bookObject.id);
        });

        const buttonEdit = document.createElement('button');
        buttonEdit.classList.add('blue');
        buttonEdit.innerText = "✍ Edit data";

        buttonEdit.addEventListener('click', () => {
            editDataBook(bookObject.id);
        })

        containerButton.append(buttonStatusRead, buttonDelete, buttonEdit);
        article.append(containerButton);
    }

    return article;
}

const findBook = (bookId) => {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

const removeBooks = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    alert(`Buku ${bookTarget.title} berhasil dihapus.`);
    saveData();
}

const editDataBook = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget === -1) return;

    statusEdit = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDataToForm(bookTarget);
}

const setDataToForm = (objectBook) => {
    document.getElementById('tempID').value = objectBook.id;
    document.querySelector('.changeTitle').innerText = "Edit Data";
    document.getElementById('inputBookTitle').value = objectBook.title;
    document.getElementById('inputBookAuthor').value = objectBook.author;
    document.getElementById('inputBookGenre').value = objectBook.genre;
    document.getElementById('inputBookYear').value = objectBook.year;
    document.getElementById('inputBookIsComplete').checked = objectBook.isComplete;   
}

const updateData = () => {
    const id = document.getElementById('tempID').value;
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const genre = document.getElementById('inputBookGenre').value.split(',');
    const year = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const newBook = generatedObject(id, title, author, genre, year, isComplete);
    
    const bookTarget = findBook(id);
    books.splice(bookTarget, 1);

    books.push(newBook);

    statusEdit = false;
    document.querySelector('.changeTitle').innerText = "Masukkan Buku Baru";

    alert(`Buku ${title} berhasil diperbarui.`);

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();
    clearFormInput();
}

const undoBookFromCompletedRead = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget === -1) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

const undoBookFromUnCompletedRead = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget === -1) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

const loadDataBookFromStorage = () => {
    const dataBooks = JSON.parse(localStorage.getItem(BOOK_KEY));

    if (dataBooks !== null) {
        for (const book of dataBooks) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const downloadToFileCSV = (data, fileName) => {
    const blob = new Blob([data], {type: "text/csv"});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download',   `${fileName}.csv`);
    link.click()
}

const csvString = (objectData) => {
    const csvRows = [
        [
            "Judul",
            "Penulis",
            "Genre",
            "Tahun",
            "Status"
        ],
        ...objectData.map(item => [
            item.title,
            item.author,
            item.genre,
            item.year,
            item.isComplete === true ? 'Sudah Dibaca' : 'Belum Dibaca'
        ])
    ].map(e => e.join(","))
    .join("\n");

    return csvRows;
} 

const downloadDataReadBook = () => {
    const dataBooks = JSON.parse(localStorage.getItem(BOOK_KEY));
    const readBooks = dataBooks.filter((book) => book.isComplete === true);
    const csv = csvString(readBooks);
    downloadToFileCSV(csv, 'Data_Buku_Selesai_Dibaca');
}

const downloadDataUnReadBook = () => {
    const dataBooks = JSON.parse(localStorage.getItem(BOOK_KEY));
    const unReadBooks = dataBooks.filter((book) => book.isComplete === false);
    const csv = csvString(unReadBooks);
    downloadToFileCSV(csv, 'Data_Buku_Belum_Selesai_Dibaca');
}









