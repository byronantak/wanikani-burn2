// ==UserScript==
// @name        Wanikani Burn Reviews 2
// @namespace   wkburnreview2
// @description Adds a space on the main page that reviews random burned items.
// @version     0.0.1
// @author      Byron Antak
// @license     Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0); http://creativecommons.org/licenses/by-nc/4.0/
// @include     http://www.wanikani.com/
// @include     https://www.wanikani.com/
// @include     http://www.wanikani.com/dashboard
// @include     https://www.wanikani.com/dashboard
// @require     https://greasyfork.org/scripts/19781-wanakana/code/WanaKana.js?version=126349
// @grant       none
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

//#region Constants
const API_ROOT = 'https://api.wanikani.com/v2';

const localStorageKeys = {
    apiKey: 'waniKaniBurnApiKey',
    userLevel: 'waniKaniBurnUserLevel',
    filter: 'waniKaniBurnFilter'
}

const questionTypes = {
    meaning: 'meaning',
    reading: 'reading',
}
//#endregion Constants

// #region Helper functions
function getValue(key, defaultValue) {
    var value = localStorage.getItem(key);
    if (!value) {
        return defaultValue;
    }
    return value;
}

function setValue(key, value) {
    localStorage.setItem(key, value);
}

function setValueObject(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
}

function getValueObject(key, defaultValue) {
    try {
        return JSON.parse(localStorage.getItem(key));
    }
    catch {
        return defaultValue;
    }
}
//#endregion Helper

// #region API

//#region Models
class ResourceResponse {
    id = 0;
    object = null;
    url = '';
    dataUpdatedAt = null;
    data = null;

    constructor({ id, object, url, data_updated_at, data }) {
        this.id = id;
        this.object = object;
        this.url = url;
        this.dataUpdatedAt = data_updated_at;
        this.data = data;
    }
}

class CollectionResponse {
    object = null;
    url = '';
    dataUpdatedAt = null;
    data = null;
    totalCount = 0;
    pages = null;

    constructor({ object, url, pages, total_count, data_updated_at, data }) {
        this.object = object;
        this.url = url;
        this.dataUpdatedAt = data_updated_at;
        this.data = data;
        this.totalCount = total_count;
        this.pages = pages;
    }
}

class BurnFilter {
    levels = [];
    types = [];

    constructor({ levels, types }) {
        this.levels = levels;
        this.types = types;
    }

    static default({ userLevel }) {
        const levels = [...Array(userLevel).keys()];
        const types = [
            'radical',
            'vocabulary',
            'kanji'
        ];
        return new BurnFilter({ levels, types });
    }

    toObject() {
        return {
            levels: this.levels,
            types: this.types
        }
    }
}

class BurnedSubject {
    burnedAt = null;
    hidden = false;
    subjectId = 0;
    subjectType = '';

    constructor({ burned_at, hidden, subject_id, subject_type }) {
        this.burnedAt = burned_at;
        this.hidden = hidden;
        this.subjectId = subject_id;
        this.subjectType = subject_type;
    }

    static fromObject(obj) {
        return new BurnedSubject(obj);
    }
}

class Reading {
    type = '';
    primary = false;
    reading = '';
    acceptedAnswer = true;


    constructor({ type, primary, reading, accepted_answer }) {
        this.type = type;
        this.primary = primary;
        this.reading = reading;
        this.acceptedAnswer = accepted_answer;
    }

    static fromObject(obj) {
        return new Reading(obj);
    }
}

class Meaning {
    meaning = '';
    primary = false;
    acceptedAnswer = true;

    constructor({ meaning, primary, accepted_answer }) {
        this.meaning = meaning;
        this.primary = primary;
        this.acceptedAnswer = accepted_answer;
    }

    static fromObject(obj) {
        return new Meaning(obj);
    }
}

class SubjectDetail {
    id = 0;
    characters = '';
    documentUrl = '';
    level = 0;
    meaningMnemonic = '';
    meanings = [];
    auxiliaryMeanings = [];
    readings = [];
    readingMnemonic = '';

    constructor({ id, level, document_url, characters, meaning_mnemonic, reading_mnemonic, auxiliary_meanings, meanings, readings }) {
        this.id = id;
        this.level = level;
        this.documentUrl = document_url;
        this.characters = characters;
        this.meaningMnemonic = meaning_mnemonic;
        this.readingMnemonic = reading_mnemonic;
        this.auxiliaryMeanings = auxiliary_meanings;
        this.meanings = meanings.map(x => Meaning.fromObject(x));
        this.readings = readings.map(x => Reading.fromObject(x));
    }

    static fromObject(id, obj) {
        return new SubjectDetail({ ...obj, id });
    }
}

//#endregion Models

class WaniKaniApiService {
    constructor(api_key) {
        if (this.isValidApiKey(api_key)) {
            this.apiKey = api_key;
        }
        else {
            throw new Error('NO API KEY FOUND');
        }
    }

    isValidApiKey(api_key) {
        return typeof api_key === 'string' && api_key.length === 36;
    }

    async getUserProfile() {
        const response = await fetch(`${API_ROOT}/user`, {
            method: 'get',
            headers: new Headers({
                'Authorization': 'Bearer ' + this.apiKey
            }),
        })
        const json = await response.json();
        return json.data;
    }

    async getUserLevel() {
        const userProfile = await this.getUserProfile();
        return userProfile.level;
    }

    buildBurnedQueryParameterString(burnFilter) {
        if (!burnFilter) {
            return '';
        }

        return '?' + new URLSearchParams({
            burned: true,
            started: true,
            unlocked: true,
            subject_types: burnFilter.types,
            levels: burnFilter.levels
        }).toString();
    }

    async getBurnProgressionJson(burnFilter) {
        const paramString = this.buildBurnedQueryParameterString(burnFilter);
        const response = await fetch(`${API_ROOT}/assignments${paramString}`, {
            method: 'get',
            headers: new Headers({
                'Authorization': 'Bearer ' + this.apiKey
            }),
        })
        const json = await response.json();
        return json;
    }

    async makeNextPageRequest(url, method = 'get') {
        const response = await fetch(url, {
            method,
            headers: new Headers({
                'Authorization': 'Bearer ' + this.apiKey
            }),
        })
        return response.json();
    }

    appendBurnedSubjects(burnedItems, json) {
        return [...burnedItems, ...json.data.map(x => BurnedSubject.fromObject(x.data))];
    }

    async getAllBurnProgressionItems(burnFilter) {
        let items = [];
        const json = await this.getBurnProgressionJson(burnFilter);
        items = this.appendBurnedSubjects(items, json);
        let next_url = json.pages.next_url;
        do {
            const newResponse = await this.makeNextPageRequest(next_url);
            items = this.appendBurnedSubjects(items, newResponse);
            next_url = newResponse.pages.next_url;
        } while (next_url != null);
        return items;
    }

    async getSubjectDetails(subjectId) {
        const response = await fetch(`${API_ROOT}/subjects/${subjectId}`, {
            method: 'get',
            headers: new Headers({
                'Authorization': 'Bearer ' + this.apiKey
            }),
        });
        const json = await response.json();
        return SubjectDetail.fromObject(subjectId, json.data);
    }
}

class QuestionAskingService {
    waniKaniApiService = null;
    apiKey = null;

    constructor(apiKey) {
        this.apiKey = apiKey;
        this.waniKaniApiService = new WaniKaniApiService(apiKey);
    }

    randomizeSubject(subjectCount) {
        return this.getRandomInt(0, subjectCount);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomizeQuestionType() {
        const randomInt = this.getRandomInt(0, 1);
        if (randomInt === 0) {
            return questionTypes.meaning;
        }
        return questionTypes.reading;
    }

    async doSomething() {
        window.alert(`You API Key is: '${this.apiKey}'`);
        const userLevel = await this.waniKaniApiService.getUserLevel();
        setValue(localStorageKeys.userLevel, userLevel);
        console.log('getUserLevel()', userLevel);
        const burnFilter = getValue(localStorageKeys.filter, BurnFilter.default({ userLevel }));
        const values = await this.waniKaniApiService.getAllBurnProgressionItems(burnFilter);
        const randomIndex = this.randomizeSubject(values.length);
        const randomizedBurnedSubject = values[randomIndex];
        const subject = await this.waniKaniApiService.getSubjectDetails(randomizedBurnedSubject.subjectId);
        const questionType = this.randomizeQuestionType();
        const answer = window.prompt(`Question Type ${questionType}. What is ${subject.characters}?`)

        console.log('subjects', values);
        console.log('randomNumber', randomIndex);
        console.log('detailed random', randomizedBurnedSubject);
        console.log('subject', subject);
        console.log('answer', answer);
    }
}

//#endregion API

(async function () {
    'use strict';
    var service = new QuestionAskingService(getValue(localStorageKeys.apiKey, null));
    await service.doSomething();
})();