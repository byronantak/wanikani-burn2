namespace Interfaces {
    export interface CollectionResponse<T> {
        object: string;
        url: string,
        pages: {
            next_url?: string,
            previous_url?: string,
            per_page: number
        },
        total_count: number,
        data_updated_at: Date,
        data: T[]
    }
}


