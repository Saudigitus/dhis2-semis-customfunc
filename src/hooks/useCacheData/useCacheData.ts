interface TableName {
    tableName: "programs" | "optionGroups" | "programRules" | "programRuleVariables" | "organisationUnitGroups"
}

export const useCacheData = () => {

    const initializeDB = () => {
        const idb = window.indexedDB || (window as any).mozIndexedBD ||
            (window as any).webkitIndexedDB || (window as any).msIndexedBD ||
            (window as any).shimIndexedDB;

        const dbPromise = idb.open("semis-db", 2);

        dbPromise.onupgradeneeded = (event: any) => {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('programs')) {
                db.createObjectStore('programs', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('optionGroups')) {
                db.createObjectStore('optionGroups', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('programRules')) {
                db.createObjectStore('programRules', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('programRuleVariables')) {
                db.createObjectStore('programRuleVariables', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('organisationUnitGroups')) {
                db.createObjectStore('organisationUnitGroups', { keyPath: "id" })
            }
        }


        dbPromise.onsuccess = (event: any) => {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('programs')) {
                db.createObjectStore('programs', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('optionGroups')) {
                db.createObjectStore('optionGroups', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('programRules')) {
                db.createObjectStore('programRules', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('programRuleVariables')) {
                db.createObjectStore('programRuleVariables', { keyPath: "id" })
            }

            if (!db.objectStoreNames.contains('organisationUnitGroups')) {
                db.createObjectStore('organisationUnitGroups', { keyPath: "id" })
            }
        }
    }

    const saveDataToDB = (data: any, tableName: TableName["tableName"] ) => {
        const idb = window.indexedDB || (window as any).mozIndexedBD ||
            (window as any).webkitIndexedDB || (window as any).msIndexedBD ||
            (window as any).shimIndexedDB;

        const dbPromise = idb.open("semis-db", 2);
        dbPromise.onsuccess = () => {
            const db = dbPromise.result;
            const tx = db.transaction(tableName, "readwrite");
            const options = tx.objectStore(tableName);

            const option = options.put(data)

            option.onsuccess = () => {
                tx.oncomplete = () => {
                    db.close()
                }
            }
        }
    }

    const getDataFromDB = (tableName: TableName["tableName"], id: string): Promise<any | null> => {
        return new Promise((resolve) => {
            const idb = window.indexedDB || (window as any).mozIndexedBD ||
                (window as any).webkitIndexedDB || (window as any).msIndexedBD ||
                (window as any).shimIndexedDB;

            const dbPromise = idb.open("semis-db", 2);
            dbPromise.onsuccess = () => {
                const db = dbPromise.result;
                const tx = db.transaction(tableName, "readonly");
                const store = tx.objectStore(tableName);
                const request = store.get(id);

                request.onsuccess = () => {
                    resolve(request.result ?? null);
                };
                request.onerror = () => {
                    resolve(null);
                };
                tx.oncomplete = () => {
                    db.close();
                };
            };
            dbPromise.onerror = () => resolve(null);
        });
    }

    return {
        initializeDB,
        saveDataToDB,
        getDataFromDB
    }

}