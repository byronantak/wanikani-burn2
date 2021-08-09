
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
(async function () {
    'use strict';
    var service = new Services.QuestionAskingService(Utilities.getValue(Constants.localStorageKeys.apiKey, null));
    await service.doSomething();
})();