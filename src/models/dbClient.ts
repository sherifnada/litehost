import pg from 'pg';


class DbClient {
  pool: pg.Pool;

  constructor(configuration: pg.PoolConfig) {
    this.pool = new pg.Pool(configuration);
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
