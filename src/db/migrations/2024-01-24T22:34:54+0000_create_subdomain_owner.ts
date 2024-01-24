import {Kysely} from 'kysely';

export async function up(db: Kysely<any>){
    await db.schema.createTable('subdomain_owner')
        .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
        .addColumn('subdomain', "text", (col) => col.unique().notNull())
        .addColumn('owner', 'text', (col) => col.notNull())
        .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo('NOW()')).execute();

    await db.schema.createIndex('idx_subdomain').on('subdomain_owner').column('subdomain').execute();
    await db.schema.createIndex('idx_owner').on('subdomain_owner').column('owner').execute();
}

export async function down(db: Kysely<any>){
    await db.schema.dropTable('subdomain_owner').execute();
}

