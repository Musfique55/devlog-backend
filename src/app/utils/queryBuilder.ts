import { IQueryParams } from "../types/queryBuilder.types";

export class QueryBuilder<T extends Record<string, any>> {
  private query: Record<string, any>;
  constructor(private queryParams : IQueryParams) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip : 0,
      take : 10
    };
  }

  search(fields: string[] = []): this {
    const searchTerm = this.queryParams.searchTerm;
    if (searchTerm) {
      const refined = searchTerm.split("-").join(" ");
      this.query.where!.OR = fields.map((field) => {
        return {
          [field]: {
            contains: refined,
            mode: "insensitive",
          },
        };
      });
    }

    return this;
  }

  filter(filers: Record<string, any>): this {
    this.query.where = {
      ...this.query.where,
      ...filers,
    };

    return this;
  }

  include(relations: string, allowed: string[] = []): this {
    relations.split(",").forEach((relation) => {
      if (allowed.includes(relation)) {
        this.query.include![relation] = true;
      }
    });

    return this;
  }

  sort(sortBy: string = "createdAt", sortOrder: string = "desc"): this {
    this.query.orderBy[sortBy] = sortOrder;
    return this;
  }

  fields(fieldParams: string, allowed: string[] = []): this {
    if (fieldParams) {
      const fields = fieldParams.split(",");
      const select: Record<string, any> = {};

      fields.forEach((field) => {
        const trimmed = field.trim();
        if (!allowed.includes(trimmed)) return;

        if (trimmed.includes(".")) {
          const [parent, child] = trimmed.split(".");
          if (!select[parent!]) {
            select[parent!] = { select: {} };
          }
          select[parent!].select[child!] = true;
        } else {
          select[trimmed] = true;
        }
      });

      if (Object.keys(select).length > 0) {
        this.query.select = select;
        delete this.query.include;
      }
    }
    return this;
  }

  build(): T {
    return this.query as T;
  }

  getWhere() {
    return this.query.where;
  }

  paginate(): this {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;

    this.query.skip = (page - 1) * limit;
    this.query.take = limit;

    return this;
  }
}
