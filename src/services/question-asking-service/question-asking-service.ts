
namespace Services {
    const questionTypes = {
        meaning: 'meaning',
        reading: 'reading',
    }

    export class QuestionAskingService {
        waniKaniApiService = null;
        apiKey = null;

        constructor(apiKey) {
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

        async doSomething() {
            window.alert(`You API Key is: '${this.apiKey}'`);
            const userLevel = await this.waniKaniApiService.getUserLevel();
            Utilities.setValue(Constants.localStorageKeys.userLevel, userLevel);
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