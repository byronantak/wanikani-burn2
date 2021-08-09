/// <reference path="./interfaces.ts" />

namespace Interfaces {
    export interface ResourceResponse<T> {
        id: number;
        object: string;
        url: string;
        data: T;
        data_updated_at: Date;
    }
}
