export interface PrismaFindManyArgs{
    where? : Record<string,any>
    include? : Record<string,any>
    skip? : number
    take? : number
    orderBy? : Record<string,any>
    cursor? : Record<string,any>
    select?: Record<string,any>
    distinct? : string | string[]
    [key : string] : unknown
}


export interface IQueryParams {
    searchTerm ? : string
    sortOrder ? : string
    sortBy ? : string
    includes? : string
    page ?: string
    limit ?: string
    fields ?: string
    [key : string] : string
}
export interface IWhereConditions {
    OR ? : Record<string,unknown>[]
    NOT ? : Record<string,unknown>[]
    AND ? : Record<string,unknown>[]
    [key : string] : unknown
}



