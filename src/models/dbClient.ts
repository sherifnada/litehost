import pg from 'pg';


class DbClient {
  pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'admin',
    });
  }

  singleQuery = async (query, params) => {
    const result = await this.pool.query(query, params);
    return result;
  }

  getClient = () => {
    /**
     * Use for running transactions
     */
    return this.pool.connect();
  }

}

export default DbClient;
