// Database Types
export interface DatabaseConfig {
  provider: string;
  connection: string;
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

export interface Query {
  sql: string;
  params?: any[];
}

export interface Schema {
  tables: Table[];
}