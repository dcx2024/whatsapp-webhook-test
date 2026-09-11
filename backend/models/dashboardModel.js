const db=require('../config/db')

const TABLE='orders';

const Dashboard={
    async getTotalAmount(seller_id){
        const result=await db(TABLE).sum('amount as total_amount').where('seller_id',seller_id).first();
        return {
            total_amount:result.total_amount || 0
        } 
    }
}

module.exports= Dashboard