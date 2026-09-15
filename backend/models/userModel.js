const db=require('../config/db')

const TABLE="sellers"

const Seller={
    async create(userData){
        const [user]=await db(TABLE).insert(userData).returning('*');
        return user;
    },

    async getTransferRecipientCode(phone_no){
        const recipientcode=await db(TABLE).select('transfer_recipient').where({phone_no})
        return recipientcode
    },

    async getSellerId(phone_no){
        const seller_id=await db(TABLE).select('seller_id').where({phone_no})
        return seller_id
    }
}

module.exports=Seller