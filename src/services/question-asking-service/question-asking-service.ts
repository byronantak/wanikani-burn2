/// <reference path="../api/wani-kani-api-service.ts" />

namespace Services {
    const questionTypes = {
        meaning: 'meaning',
        reading: 'reading',
    }

    export class QuestionAskingService {
        public waniKaniApiService: Services.WaniKaniApiService = null;
        private apiKey: string = null;

        constructor(apiKey: string) {
            this.apiKey = apiKey;
            this.waniKaniApiService = new Services.WaniKaniApiService(apiKey);
        }

        randomizeSubject(subjectCount) {
            return Utilities.getRandomInt(0, subjectCount);
        }

        randomizeQuestionType() {
            const randomInt = Utilities.getRandomInt(0, 1);
            if (randomInt === 0) {
                return questionTypes.meaning;
            }
            return questionTypes.reading;
        }

        async doSomething() {
            window.alert(`You API Key is: '${this.apiKey}'`);
            const userLevel = await this.waniKaniApiService.getUserLevel();
            Utilities.setValue(Constants.localStorageKeys.userLevel, String(userLevel));
            console.log('getUserLevel()', userLevel);
            const burnFilter = Utilities.getValue(Constants.localStorageKeys.filter, Models.BurnFilter.default({ userLevel }));
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
}