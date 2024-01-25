import {Pool} from 'pg';

class DbClient {
    pool: Pool;
    
    constructor(){
        this.pool = new Pool();
    }

    singleQuery = async(query, params) => {
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