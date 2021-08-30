/// <reference path="../api/wani-kani-api-service.ts" />

namespace Services {
    enum QuestionType {
        Meaning = 'meaning',
        Reading = 'reading',
    }

    interface Question {
        subjectId: number;
        type: QuestionType;
        questionText: string;
    }

    interface SubjectDetailLookup {
        [id: number]: Models.SubjectDetail;
    }

    export class QuestionAskingService {
        public waniKaniApiService: Services.WaniKaniApiService = null;
        private apiKey: string = null;
        private burnedSubjects: Models.BurnedSubject[] = []
        private userLevel = 0;
        private subjectDetailCache: SubjectDetailLookup = { };
        private userIncorrectSubjectIds: number[] = [];


        constructor(apiKey: string) {
            this.apiKey = apiKey;
            this.waniKaniApiService = new Services.WaniKaniApiService(apiKey);
        }

        private randomizeSubjectId(subjectCount: number): number {
            return Utilities.getRandomInt(0, subjectCount);
        }

        private randomizeQuestionType(): QuestionType {
            const randomInt = Utilities.getRandomInt(0, 1);
            if (randomInt === 0) {
                return QuestionType.Meaning;
            }
            return QuestionType.Reading;
        }

        private async getSubjectDetails(subjectId: number): Promise<Models.SubjectDetail> {
            if (this.subjectDetailCache[subjectId]) {
                return this.subjectDetailCache[subjectId];
            }
            const subjectDetail = await this.waniKaniApiService.getSubjectDetails(subjectId);
            this.subjectDetailCache[subjectId] = subjectDetail;
            return subjectDetail;
        }

        public async getRandomQuestion(): Promise<Question> {
            const randomIndex = this.randomizeSubjectId(this.burnedSubjects.length);
            const randomizedBurnedSubject = this.burnedSubjects[randomIndex];
            const subject = await this.getSubjectDetails(randomizedBurnedSubject.subjectId);
            const questionType = this.randomizeQuestionType();
            console.log('subjects', this.burnedSubjects);
            console.log('randomNumber', randomIndex);
            console.log('detailed random', randomizedBurnedSubject);
            console.log('subject', subject);
            return {
                type: questionType,
                subjectId: randomizedBurnedSubject.subjectId,
                questionText: `Question Type: ${questionType}. What is ${subject.characters}?`
            };
        }

        private isAnswerCorrect(detail: Models.SubjectDetail, answer: string, questionType: QuestionType): boolean {
            switch (questionType) {
                case QuestionType.Meaning:
                    return detail.auxiliaryMeanings.some(x => x.meaning === answer);
                case QuestionType.Reading:
                    return detail.readings.some(x => x.reading === answer);
            }
        }

        private getCorrectAnswers(detail: Models.SubjectDetail, questionType: QuestionType): string[] {
            switch (questionType) {
                case QuestionType.Meaning:
                    return detail.auxiliaryMeanings.map(x => x.meaning);
                case QuestionType.Reading:
                    return detail.readings.map(x => x.reading);
            }
        }

        public async answerQuestion(question: Question, answer: string): Promise<void> {
            const detail = await this.getSubjectDetails(question.subjectId);

            const correctAnswers = this.getCorrectAnswers(detail, question.type);
            const answersString = correctAnswers.join(', ');
            if (!this.isAnswerCorrect(detail, answer, question.type)) {
                console.log(`Incorrect answer provided! "${answer}". Acceptable answers: ${answersString}`);
                this.userIncorrectSubjectIds.push(question.subjectId);
            }
            else {
                console.log(`Correct! "${answer}". Acceptable answers: ${answersString}`);
            }
        }

        async init(): Promise<void> {
            window.alert(`You API Key is: '${this.apiKey}'`);
            this.userLevel = await this.waniKaniApiService.getUserLevel();
            Utilities.setValue(Constants.localStorageKeys.userLevel, String(this.userLevel));
            const burnFilter = Utilities.getValue(Constants.localStorageKeys.filter, Models.BurnFilter.default({ userLevel: this.userLevel }));
            this.burnedSubjects = await this.waniKaniApiService.getAllBurnProgressionItems(burnFilter);

            console.log('getUserLevel()', this.userLevel);
            const question = await this.getRandomQuestion();
            const userAnswer = window.prompt(question.questionText);

            await this.answerQuestion(question, userAnswer);
        }
    }
}