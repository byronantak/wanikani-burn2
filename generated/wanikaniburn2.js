var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// @require     https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.10.2/system.min.js
// ==/UserScript==
/// <reference path="./services/question-asking-service">
(function () {
    'use strict';
    return __awaiter(this, void 0, void 0, function* () {
        debugger;
        var service = new Services.QuestionAskingService(Utilities.getValue(Constants.localStorageKeys.apiKey, null));
        yield service.doSomething();
    });
})();
var Constants;
(function (Constants) {
    Constants.localStorageKeys = {
        apiKey: 'waniKaniBurnApiKey',
        userLevel: 'waniKaniBurnUserLevel',
        filter: 'waniKaniBurnFilter'
    };
})(Constants || (Constants = {}));
var Models;
(function (Models) {
    class BurnFilter {
        constructor({ levels, types }) {
            this.levels = [];
            this.types = [];
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
            };
        }
    }
    Models.BurnFilter = BurnFilter;
})(Models || (Models = {}));
var Models;
(function (Models) {
    class BurnedSubject {
        constructor({ burned_at, hidden, subject_id, subject_type }) {
            this.burnedAt = null;
            this.hidden = false;
            this.subjectId = 0;
            this.subjectType = '';
            this.burnedAt = burned_at;
            this.hidden = hidden;
            this.subjectId = subject_id;
            this.subjectType = subject_type;
        }
        static fromObject(obj) {
            return new BurnedSubject(obj);
        }
    }
    Models.BurnedSubject = BurnedSubject;
})(Models || (Models = {}));
var Models;
(function (Models) {
    class Meaning {
        constructor({ meaning, primary, accepted_answer }) {
            this.meaning = '';
            this.primary = false;
            this.acceptedAnswer = true;
            this.meaning = meaning;
            this.primary = primary;
            this.acceptedAnswer = accepted_answer;
        }
        static fromObject(obj) {
            return new Meaning(obj);
        }
    }
    Models.Meaning = Meaning;
    class Reading {
        constructor({ type, primary, reading, accepted_answer }) {
            this.type = '';
            this.primary = false;
            this.reading = '';
            this.acceptedAnswer = true;
            this.type = type;
            this.primary = primary;
            this.reading = reading;
            this.acceptedAnswer = accepted_answer;
        }
        static fromObject(obj) {
            return new Reading(obj);
        }
    }
    Models.Reading = Reading;
    class SubjectDetail {
        constructor({ id, level, document_url, characters, meaning_mnemonic, reading_mnemonic, auxiliary_meanings, meanings, readings }) {
            this.id = 0;
            this.characters = '';
            this.documentUrl = '';
            this.level = 0;
            this.meaningMnemonic = '';
            this.meanings = [];
            this.auxiliaryMeanings = [];
            this.readings = [];
            this.readingMnemonic = '';
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
            return new SubjectDetail(Object.assign(Object.assign({}, obj), { id }));
        }
    }
    Models.SubjectDetail = SubjectDetail;
})(Models || (Models = {}));
var Models;
(function (Models) {
    class UserProfile {
    }
    Models.UserProfile = UserProfile;
})(Models || (Models = {}));
var Services;
(function (Services) {
    class WaniKaniApiService {
        constructor(api_key) {
            this.apiRoot = 'https://api.wanikani.com/v2';
            if (this.isValidApiKey(api_key)) {
                this.apiKey = api_key;
            }
            else {
                throw new Error('NO API KEY FOUND');
            }
        }
        getUserProfile() {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(`${this.apiRoot}/user`, {
                    method: 'get',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + this.apiKey
                    }),
                });
                const json = yield response.json();
                return json.data;
            });
        }
        getUserLevel() {
            return __awaiter(this, void 0, void 0, function* () {
                const userProfile = yield this.getUserProfile();
                return userProfile.level;
            });
        }
        getBurnProgressionJson(burnFilter) {
            return __awaiter(this, void 0, void 0, function* () {
                const paramString = this.buildBurnedQueryParameterString(burnFilter);
                const response = yield fetch(`${this.apiRoot}/assignments${paramString}`, {
                    method: 'get',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + this.apiKey
                    }),
                });
                const json = yield response.json();
                return json;
            });
        }
        getAllBurnProgressionItems(burnFilter) {
            return __awaiter(this, void 0, void 0, function* () {
                let items = [];
                const json = yield this.getBurnProgressionJson(burnFilter);
                items = this.appendBurnedSubjects(items, json);
                let next_url = json.pages.next_url;
                do {
                    const newResponse = yield this.makeNextPageRequest(next_url);
                    items = this.appendBurnedSubjects(items, newResponse);
                    next_url = newResponse.pages.next_url;
                } while (next_url != null);
                return items;
            });
        }
        getSubjectDetails(subjectId) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(`${this.apiRoot}/subjects/${subjectId}`, {
                    method: 'get',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + this.apiKey
                    }),
                });
                const json = yield response.json();
                return Models.SubjectDetail.fromObject(subjectId, json.data);
            });
        }
        buildBurnedQueryParameterString(burnFilter) {
            if (!burnFilter) {
                return '';
            }
            const params = {
                "burned": "true",
                "started": "true",
                "unlocked": "true",
                "subject_types": burnFilter.types,
                "levels": burnFilter.levels
            };
            return '?' + new URLSearchParams(Object.assign({}, params)).toString();
        }
        isValidApiKey(api_key) {
            return typeof api_key === 'string' && api_key.length === 36;
        }
        makeNextPageRequest(url, method = 'get') {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(url, {
                    method,
                    headers: new Headers({
                        'Authorization': 'Bearer ' + this.apiKey
                    }),
                });
                return response.json();
            });
        }
        appendBurnedSubjects(burnedItems, json) {
            return [...burnedItems, ...json.data.map(x => Models.BurnedSubject.fromObject(x.data))];
        }
    }
    Services.WaniKaniApiService = WaniKaniApiService;
})(Services || (Services = {}));
var Services;
(function (Services) {
    const questionTypes = {
        meaning: 'meaning',
        reading: 'reading',
    };
    class QuestionAskingService {
        constructor(apiKey) {
            this.waniKaniApiService = null;
            this.apiKey = null;
            this.apiKey = apiKey;
            this.waniKaniApiService = new Services.WaniKaniApiService(apiKey);
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
        doSomething() {
            return __awaiter(this, void 0, void 0, function* () {
                window.alert(`You API Key is: '${this.apiKey}'`);
                const userLevel = yield this.waniKaniApiService.getUserLevel();
                Utilities.setValue(Constants.localStorageKeys.userLevel, userLevel);
                console.log('getUserLevel()', userLevel);
                const burnFilter = Utilities.getValue(Constants.localStorageKeys.filter, Models.BurnFilter.default({ userLevel }));
                const values = yield this.waniKaniApiService.getAllBurnProgressionItems(burnFilter);
                const randomIndex = this.randomizeSubject(values.length);
                const randomizedBurnedSubject = values[randomIndex];
                const subject = yield this.waniKaniApiService.getSubjectDetails(randomizedBurnedSubject.subjectId);
                const questionType = this.randomizeQuestionType();
                const answer = window.prompt(`Question Type ${questionType}. What is ${subject.characters}?`);
                console.log('subjects', values);
                console.log('randomNumber', randomIndex);
                console.log('detailed random', randomizedBurnedSubject);
                console.log('subject', subject);
                console.log('answer', answer);
            });
        }
    }
    Services.QuestionAskingService = QuestionAskingService;
})(Services || (Services = {}));
var Utilities;
(function (Utilities) {
    function getValue(key, defaultValue) {
        var value = localStorage.getItem(key);
        if (!value) {
            return defaultValue;
        }
        return value;
    }
    Utilities.getValue = getValue;
    function setValue(key, value) {
        localStorage.setItem(key, value);
    }
    Utilities.setValue = setValue;
    function setValueObject(key, object) {
        localStorage.setItem(key, JSON.stringify(object));
    }
    Utilities.setValueObject = setValueObject;
    function getValueObject(key, defaultValue) {
        try {
            return JSON.parse(localStorage.getItem(key));
        }
        catch (_a) {
            return defaultValue;
        }
    }
    Utilities.getValueObject = getValueObject;
})(Utilities || (Utilities = {}));
