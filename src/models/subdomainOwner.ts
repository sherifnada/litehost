import postgres from 'postgres';

// Define a type for the SubdomainOwner row
type SubdomainOwner = {
    subdomain: string;
    id: string; // UUIDs are strings in JavaScript/TypeScript
    owner: string;
    created_at: Date;
};

// SubdomainOwnerModel class
class SubdomainOwnerModel {
    private dbQueryFn: postgres.Sql;

    constructor(dbQueryFn: postgres.Sql) {
        this.dbQueryFn = dbQueryFn;
    }

    // Method to get a row for a given subdomain
    async getSubdomainAndOwner(subdomain: string): Promise<SubdomainOwner | null> {
        const query = await this.dbQueryFn`
            SELECT * FROM subdomain_owner WHERE subdomain = ${ subdomain }
        `;
        return query[0] as SubdomainOwner
    }

    // Method to get rows for a given owner
    async getRowsForOwner(owner: string): Promise<SubdomainOwner[]> {
        const query = 'SELECT * FROM subdomain_owner WHERE owner = $1';
        const result = await this.dbQueryFn.query(query, [owner]);
        return result.rows;
    }
}

export { SubdomainOwner, SubdomainOwnerModel, PostgresClient };
