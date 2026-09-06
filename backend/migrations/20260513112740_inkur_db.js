/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    await knex.schema.createTable('sellers', table=>{
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('seller_name').notNullable();
        table.string('transfer_recipient').notNullable();
        table.string('phone_no').notNullable();
        table.timestamp('created_at')
    })


    await knex.schema.createTable('orders',table=>{
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('payment_ref').notNullable;
        table.decimal('amount',10,2).defaultTo(0);
        table.string('otp_hash');
        table.string('transfer_recipient');//add transfer reference under
        table.string('customer_phone_no').notNullable();
        table.string('status').notNullable().defaultTo('pending')
        table.timestamp(true,true)
        table.check("status in('pending','paid','dispatched','delivered')")
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('sellers');
  await knex.schema.dropTableIfExists('orders');
};



ami-0b1161e6982092e4d

vpc-05943ab41b91df494

"GroupId": "sg-0caa3c182730ecdb9",

    3.250.30.35/32