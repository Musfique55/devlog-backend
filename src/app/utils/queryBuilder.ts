import { array, number } from "zod";
import {
  IConfigs,
  IPrismaModelDelegate,
  IQueryParams,
  IQueryResult,
  PrismaCountQueryArgs,
  PrismaFindManyArgs,
} from "../types/queryBuilder.types";

export class QueryBuilder<
  T,
  TWhereInput = Record<string, any>,
  TInclude = Record<string, any>,
> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountQueryArgs;
  private page: number = 1;
  private limit: number = 10;
  private skip: number = 0;
  private orderBy: "asc" | "desc" = "desc";
  private sortBy: string = "createdAt";
  private selectFields: Record<string, boolean> | undefined;

  constructor(
    private model: IPrismaModelDelegate,
    private queryParams: IQueryParams,
    private config: IConfigs,
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };
    this.countQuery = {
      where: {},
      include: {},
    };
  }

  paginate(): this {
    const { page, limit } = this.queryParams;
    if (page && limit) {
      this.page = parseInt(page);
      this.limit = parseInt(limit);
      this.skip = (parseInt(page) - 1) * parseInt(limit);
      this.query.skip = this.skip;
      this.query.take = this.limit;
    }
    return this;
  }

  async count(): Promise<number> {
    return await this.model.count(
      this.countQuery as Parameters<typeof this.model.count>[0],
    );
  }

  sort(): this {
    const {sortableFields} = this.config;
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder || "desc";
    
    if(sortableFields && sortableFields.length > 0 && !sortableFields.includes(sortBy)){
      return this;
    }

    this.sortBy = sortBy;
    this.orderBy = sortOrder === "asc" ? "asc" : "desc";

    if(sortBy.includes(".")){
      const parts = sortBy.split(".");
      if(parts.length === 2){
        const [relation,field] = parts;
        this.query.orderBy = {
          [relation as string] : {
            [field as string] : sortOrder
          }
        }
    }else if(parts.length === 3){
      const [nestedRelation,relation,field] = parts;
      this.query.orderBy = {
        [nestedRelation as string] : {
          [relation as string] : {
            [field as string] : sortOrder
          }
        } 
      }
    }
  } else {
    this.query.orderBy = {
      [sortBy] : sortOrder
    }
  }
    
    return this;
  }

  filter () : this {
    const {filterableFields} = this.config;
    const excludedFields = [
      'searchTerm',
      'sortOrder',
      'sortBy',
      'include',
      'page',
      'limit',
      'fields',
    ];

    const filterableParams : Record<string,any> = {};

    for (const key in this.queryParams) {
      if (!excludedFields.includes(key)) {
        filterableParams[key] = this.queryParams[key];
      }
    }

    const queryWhere = this.query.where as Record<string,any>;
    const queryCountWhere = this.countQuery.where as Record<string,any>;


    for(const key in filterableParams){
      const value = filterableParams[key];
      
      if(value === undefined || value === null || value === ''){
        continue;
      }

      if(filterableFields && filterableFields.length > 0 && !filterableFields.includes(key)){
        continue;
      }

      const parsedValue = this.parsedFilterValue(value);

      if(key.includes(".")){
        const parts = key.split(".");
        if(filterableFields && !filterableFields.includes(key)){
          continue;
        }

        if(parts.length === 2){
          const [relation,fields] = parts;

          if(!queryWhere[relation!]){
            queryWhere[relation!] = {};
            queryCountWhere[relation!] = {};
          }

          const queryRelation = queryWhere[relation!] as Record<string,any>;
          const queryCountRelation = queryCountWhere[relation!] as Record<string,any>;

          queryRelation[fields!] = parsedValue;
          queryCountRelation[fields!] = parsedValue;
        }else if(parts.length === 3){
          const [relation,nestedRelation,fields] = parts;

          if(!queryWhere[relation!]){
            queryWhere[relation!] = {
              some : {}
            };
            queryCountWhere[relation!] = {
              some : {}
            };
          }

          const queryRelation = queryWhere[relation!] as Record<string,any>;
          const queryCountRelation = queryCountWhere[relation!] as Record<string,any>;

          if(!queryRelation.some){
            queryRelation.some = {};
            queryCountRelation.some = {};
          }

          const querySome = queryRelation.some as Record<string,any>;
          const queryCountSome = queryCountRelation.some as Record<string,any>;

          if(!querySome[nestedRelation!]){
            querySome[nestedRelation!] = {};
            queryCountSome[nestedRelation!] = {};
          }

          const queryNestedRelation = querySome[nestedRelation!] as Record<string,any>;
          const queryCountNestedRelation = queryCountSome[nestedRelation!] as Record<string,any>;

          queryNestedRelation[fields!] = parsedValue;
          queryCountNestedRelation[fields!] = parsedValue;
          
        }
      }

      // range filter
      if(typeof value === "object" && value !== null && !Array.isArray(value)){
        queryWhere[key] = this.parsedRangeFilter(value);
        queryCountWhere[key] = this.parsedRangeFilter(value);
      }else{
        queryWhere[key] = parsedValue;
        queryCountWhere[key] = parsedValue;
      }   
    }

    return this;
  }

  private parsedFilterValue(value : unknown) : unknown {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) return Number(value);
    if(Array.isArray(value)){
      return {
        in : value.map((val) => this.parsedFilterValue(val))
      }
    }
    return value;
  }

  private parsedRangeFilter(value : Record<string,any>) : Record<string,any> {
    
    const parsedValue : Record<string,any> = {};

    for(const key in value){
      const val : string | number  = typeof value[key] === 'string' && !isNaN(Number(value[key])) ? Number(value[key]) : value[key];
     
      const filteredOperators = [
        'lt',
        'lte',
        'gt',
        'gte',
        'not',
        'contains',
        'startsWith',
        'endsWith',
      ]

      if(filteredOperators.includes(key)){
        parsedValue[key] = val;
      }else if(['in','notIn'].includes(key)){
        parsedValue[key] = val;
      }else{
        parsedValue[key] = val
      }

    }

    return parsedValue;

  }

  

  search(): this {
    return this;
  }

  async execute(): Promise<IQueryResult<T>> {
    const [data, total] = await Promise.all([
      this.model.findMany(
        this.query as Parameters<typeof this.model.findMany>[0],
      ),
      this.model.count(
        this.countQuery as Parameters<typeof this.model.count>[0],
      )
    ]);

    const totalPage = Math.ceil(total / this.limit);

    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPage,
      },
    };
  }
}
