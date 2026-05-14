const db=require('../config/db')

const TABLE='orders';

const Order={
    async create(orderData){
        const [order]=await db(TABLE).insert(orderData).returning('*');
        return order
    },

    async updateStatus(id,updates){
        const [order]= await db(TABLE).where(id).update(updates).returning("*")
        return order
    },

    async findByCustomerPhone(phone_no){
        const order = await db(TABLE).select('*').where('customer_phone_no',phone_no).first()
        return order
    }
}

module.exports=Order