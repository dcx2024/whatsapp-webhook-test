const crypto=require('node:crypto')

const token= crypto.randomBytes(32).toString('hex')
console.log(token)