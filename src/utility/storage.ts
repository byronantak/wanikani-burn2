/// <reference path="./utilities.ts" />

namespace Utilities {
    export function getValue<T>(key: string, defaultValue: T) {
        var value = localStorage.getItem(key);
        if (!value) {
            return defaultValue;
        }
        return value;
    }

    export function setValue(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    export function setValueObject<T>(key: string, object: T) {
        localStorage.setItem(key, JSON.stringify(object));
    }

    export function getValueObject<T>(key: string, defaultValue: T) {
        try {
            return JSON.parse(localStorage.getItem(key));
        }
        catch {
            return defaultValue;
        }
    }

}
