function saveData(data, storeName) {
    const dbRequest = indexedDB.open('db', 1);

    dbRequest.onerror = event => {
        console.error("Database error: " + event.target.errorCode);
    };

    dbRequest.onupgradeneeded = event => {
        const db = event.target.result;
        const store = db.createObjectStore(storeName, {autoIncrement: true});
    };

    dbRequest.onsuccess = event => {
        const database = event.target.result;
        console.log(database);
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        console.log("Data: ", data);
        const request = store.add(data);

        request.onerror = event => {
            console.error(event.target.errorCode);
        };

        request.onsuccess = event => {
            console.log('Dane zostały zapisane w lokalnej bazie danych.');
        };
    };
};

function getData(storeName){
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('db', 1);

        dbRequest.onerror = function (event) {
            console.error("Database error: " + event.target.errorCode);
            reject(false);
        };

        dbRequest.onupgradeneeded = function (event) {
            event.target.transaction.abort();
            reject(false);
        };

        dbRequest.onsuccess = function (event) {
            const database = event.target.result;
            const transaction = database.transaction(storeName);
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = function (event) {
                console.error(event.target.errorCode);
                reject(false);
            };

            request.onsuccess = function (event) {
                request.result ? resolve(request.result) : reject(false);
            };
        };
    });
}

function clearStore(storeName){
    const dbRequest = indexedDB.open('db', 1);

    dbRequest.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
        console.error("Database error: " + event.target.errorCode);
    };

    dbRequest.onsuccess = function (event) {
        const database = event.target.result;
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
    };
};


async function synchronizeData() {
    let globalResults = await getData('surveyResults');
    for(let i = 0; i < globalResults.length; i++){
        let res = await fetch('/survey', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(globalResults[i])
        });

        let message = await res.json();
        console.log("Przesyłam wyniki: ", message);
    }
 
    clearStore('surveyResults');
}


