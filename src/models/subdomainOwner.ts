import { QueryResult } from 'pg';
import DbClient from './dbClient.js';

// Define the TypeScript type for a row in the subdomain_owner table
type SubdomainOwner = {
  subdomain: string;
  id: string;  // UUIDs are represented as strings in JavaScript
  owner: string;
  created_at: Date;
};

class SubdomainOwnerModel {
  private client: DbClient;

  constructor(client: DbClient) {
    this.client = client;
  }

  async getRowForSubdomain(subdomain: string): Promise<SubdomainOwner | null> {
    const query = 'SELECT * FROM subdomain_owner WHERE subdomain = $1';
    const result: QueryResult = await this.client.singleQuery(query, [subdomain]);
    return result.rows.length ? result.rows[0] : null;
  }

  async getRowsForOwner(owner: string): Promise<SubdomainOwner[]> {
    const query = 'SELECT * FROM subdomain_owner WHERE owner = $1';
    const result: QueryResult = await this.client.singleQuery(query, [owner]);
    return result.rows;
  }

  async subdomainAlreadyInUse(subdomain: string): Promise<boolean> {
    return !!(await this.getRowForSubdomain(subdomain));
  }

  async associateSubdomainWithOwner(subdomain: string, owner: string) {
    const query = 'INSERT INTO subdomain_owner(subdomain, owner) VALUES($1, $2)';
    const result: QueryResult = await this.client.singleQuery(query, [subdomain, owner]);
    return result;
  }
}

export { SubdomainOwner, SubdomainOwnerModel };
