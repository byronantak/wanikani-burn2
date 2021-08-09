/// <reference path="../services.ts" />

namespace Services {
    export class WaniKaniApiService {
        private apiKey: string;
        private apiRoot = 'https://api.wanikani.com/v2';

        constructor(api_key: string) {
            if (this.isValidApiKey(api_key)) {
                this.apiKey = api_key;
            }
            else {
                throw new Error('NO API KEY FOUND');
            }
        }

        public async getUserProfile(): Promise<Models.UserProfile> {
            const response = await fetch(`${this.apiRoot}/user`, {
                method: 'get',
                headers: new Headers({
                    'Authorization': 'Bearer ' + this.apiKey
                }),
            })
            const json = await response.json() as Interfaces.ResourceResponse<Models.UserProfile>;
            return json.data;
        }

        public async getUserLevel(): Promise<number> {
            const userProfile = await this.getUserProfile();
            return userProfile.level;
        }

        public async getBurnProgressionJson(burnFilter) {
            const paramString = this.buildBurnedQueryParameterString(burnFilter);
            const response = await fetch(`${this.apiRoot}/assignments${paramString}`, {
                method: 'get',
                headers: new Headers({
                    'Authorization': 'Bearer ' + this.apiKey
                }),
            })
            const json = await response.json();
            return json;
        }


        public async getAllBurnProgressionItems(burnFilter): Promise<Models.BurnedSubject[]> {
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

        public async getSubjectDetails(subjectId): Promise<Models.SubjectDetail> {
            const response = await fetch(`${this.apiRoot}/subjects/${subjectId}`, {
                method: 'get',
                headers: new Headers({
                    'Authorization': 'Bearer ' + this.apiKey
                }),
            });
            const json = await response.json();
            return Models.SubjectDetail.fromObject(subjectId, json.data);
        }

        private buildBurnedQueryParameterString(burnFilter): string {
            if (!burnFilter) {
                return '';
            }

            const params: Record<string, string> = {
                "burned": "true",
                "started": "true",
                "unlocked": "true",
                "subject_types": burnFilter.types,
                "levels": burnFilter.levels
            }
            return '?' + new URLSearchParams({
                ...params
            }).toString();
        }

        private isValidApiKey(api_key): boolean {
            return typeof api_key === 'string' && api_key.length === 36;
        }

        private async makeNextPageRequest(url, method = 'get') {
            const response = await fetch(url, {
                method,
                headers: new Headers({
                    'Authorization': 'Bearer ' + this.apiKey
                }),
            })
            return response.json();
        }

        private appendBurnedSubjects(burnedItems: Models.BurnedSubject[], json): Models.BurnedSubject[] {
            return [...burnedItems, ...json.data.map(x => Models.BurnedSubject.fromObject(x.data))];
        }
    }
}
