/// <reference path="./models.ts" />

namespace Models {
    export class BurnedSubject {
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

        public static fromObject(obj: any) {
            return new BurnedSubject(obj);
        }
    }
}
