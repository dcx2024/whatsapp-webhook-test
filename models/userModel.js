const db=require('../config/db')

const TABLE="sellers"

const Seller={
    async create(userData){
        const [user]=await db(TABLE).insert(userData).returning('*');
        return user;
    }
}