declare module "node:sqlite" {
  type SqlValue = string | number | bigint | null | Uint8Array;

  type RunResult = {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  };

  class StatementSync {
    all(...values: SqlValue[]): unknown[];
    get(...values: SqlValue[]): unknown;
    run(...values: SqlValue[]): RunResult;
  }

  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
