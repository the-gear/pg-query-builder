// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

export type SqlFragment = string;

export default class SelectBuilder {
  private command: SqlFragment = 'SELECT';
  private selection: SqlFragment[] = [];
  private tableSource: SqlFragment | null;
  private joins: SqlFragment[] = [];
  private wheres: SqlFragment[] = [];
  private limit: number | null = null;
  private orderColumns: SqlFragment[] = [];
  private params: any[] = [];

  constructor(tableSource: SqlFragment | null = null) {
    this.tableSource = tableSource;
  }

  setCommand(command: SqlFragment) {
    this.command = command;
    return this;
  }

  select(...columns: SqlFragment[]) {
    this.selection = this.selection.concat(columns);
    return this;
  }

  from(tableSource: SqlFragment) {
    this.tableSource = tableSource;
    return this;
  }

  join(join: SqlFragment) {
    this.joins.push(join);
    return this;
  }

  where(condition: SqlFragment, ...params: any[]) {
    let matches = condition.match(/\$\$/g);

    const matchesLength: number = matches ? matches.length : 0;

    if (matchesLength !== params.length) {
      throw new Error('Missing/Too many params for condition');
    }

    for (let param of params) {
      this.params.push(param);
      condition = condition.replace('$$', '$' + this.params.length);
    }

    this.wheres.push(condition);

    return this;
  }

  setLimit(maxRows: number) {
    this.limit = maxRows;
    return this;
  }

  orderBy(...orderColumns: SqlFragment[]) {
    this.orderColumns = this.orderColumns.concat(orderColumns);
    return this;
  }

  createQuery() {
    let sql: SqlFragment[] = [
      this.command, // usually 'SELECT'
      this.selection.join(', '),
      this.tableSource ? `FROM ${this.tableSource}` : '',
      ...this.joins,
    ];

    if (this.wheres.length) {
      sql.push(`WHERE (${this.wheres.join(')\n  AND (')})`);
    }

    if (this.orderColumns.length) {
      sql.push(`ORDER BY ${this.orderColumns.join(', ')}`);
    }

    if (this.limit) {
      sql.push(`LIMIT ${this.limit}`);
    }

    sql = sql.filter(x => x);

    return { query: sql.join('\n'), params: this.params };
  }
}
