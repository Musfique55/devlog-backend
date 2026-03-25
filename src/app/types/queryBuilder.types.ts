export interface PrismaFindManyArgs{
    where? : Record<string,any>
    include? : Record<string,any>
    skip? : number
    take? : number
    orderBy? : Record<string,any>
    cursor? : Record<string,any>
    distinct? : string | string[]
    [key : string] : unknown
}

export interface PrismaCountQueryArgs{
    where? : Record<string,any>
    include? : Record<string,any>
    skip? : number
    take? : number
    orderBy? : Record<string,any>
    cursor? : Record<string,any>
    distinct? : string | string[]
    [key : string] : unknown
}

export interface IPrismaModelDelegate{
    findMany(args : any) : Promise<any[]>
    count(args : any) : Promise<number>
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

export interface IConfigs{
    filterableFields : string[]
    sortableFields : string[]
    searchableFields : string[]
}

export interface IQueryResult <t>{
    data : t[],
    meta : {
        page : number,
        limit : number,
        total : number,
        totalPage : number
    }
}

