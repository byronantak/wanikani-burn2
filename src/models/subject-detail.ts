/// <reference path="./models.ts" />

namespace Models {
    export class Meaning {
        meaning = '';
        primary = false;
        acceptedAnswer = true;

        constructor({ meaning, primary, accepted_answer }) {
            this.meaning = meaning;
            this.primary = primary;
            this.acceptedAnswer = accepted_answer;
        }

        public static fromObject(obj: any) {
            return new Meaning(obj);
        }
    }

    export class Reading {
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

        static fromObject(obj: any) {
            return new Reading(obj);
        }
    }

    export class SubjectDetail {
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

        public static fromObject(id: string, obj: any) {
            return new SubjectDetail({ ...obj, id });
        }
    }
}
