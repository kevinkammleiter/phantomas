/**
 * Support for session-/localStorage injection.
 */
"use strict";

module.exports = function (phantomas) {
    phantomas.on("init", async (page) => {
        const sessionStorage = phantomas.getParam("sessionStorage");
        const localStorage = phantomas.getParam("localStorage");

        if (sessionStorage) {
            phantomas.log("Injecting sessionStorage: %j", JSON.stringify(sessionStorage));
            await injectStorage(page, sessionStorage, "sessionStorage");
        }
        if (localStorage) {
            phantomas.log("Injecting localStorag: %j", JSON.stringify(localStorage));
            await injectStorage(page, localStorage, "localStorage");
        }
    });

    /**
     * Inject the given storage into the specified page storage.
     * Either localStorage or sessionStorage
     * 
     * @param {Page} page in which page the storage should be injected
     * @param {Map} storage the JSON object consisting of the storage keys and values
     * @param {string} storageType either localStorage or sessionStorage
     */
    async function injectStorage(page, storage, storageType) {
        if (!page || !storage || !storageType) {
            return;
        }

        await page.evaluateOnNewDocument((storage, storageType) => {
            const keys = Object.keys(storage);
            const values = Object.values(storage);
            if (storageType === "sessionStorage") {
                for (let i = 0; i < keys.length; i++) {
                    sessionStorage.setItem(keys[i], values[i]);
                }
            }
            if (storageType === "localStorage") {
                for (let i = 0; i < keys.length; i++) {
                    localStorage.setItem(keys[i], values[i]);
                }
            }
        }, storage, storageType);
    }
};