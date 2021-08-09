/// <reference path="./models.ts" />

namespace Models {
    export class BurnFilter {
        levels = [];
        types = [];

        constructor({ levels, types }) {
            this.levels = levels;
            this.types = types;
        }

        public static default({ userLevel }) {
            const levels = [...Array(userLevel).keys()];
            const types = [
                'radical',
                'vocabulary',
                'kanji'
            ];
            return new BurnFilter({ levels, types });
        }

        public toObject() {
            return {
                levels: this.levels,
                types: this.types
            }
        }
    }
}
