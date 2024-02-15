import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../database.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
const salt = 10;

const User = sequelize.define('user',{
    //defining attributes
    id:{
        type:DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull:false,
        primaryKey: true,
        readOnly:true,
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate:{
            isEmail: {
                args: true,
                msg: 'Please provide a valid email address.'
            },
        }
    },
    password:{
        type:DataTypes.STRING,
        allowNull: false,
        writeOnly:true,
        validate: {
            is: {
                args: /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/,
                msg: 'Password must be at least 8 characters long and include an uppercase letter and a special character.'
            }
          },
    },
    firstName:{
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            is: {
                args: /^[A-Za-z]+$/,
                msg: 'firstName must have only letters.'
            }
        },
    },
    lastName:{
        type:DataTypes.STRING,
        allowNull: false,
        validate: {
            is: {
                args: /^[A-Za-z]+$/,
                msg: 'lastName must have only letters.'
            }
        },
    }, 
    accountCreated:{
        type:DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        field: 'account_created',
        readOnly:true,
    },
    accountUpdated:{
        type:DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        field: 'account_updated',
        readOnly:true,
    }
}, {
    timestamps: false,
});
//hooks
User.beforeCreate((user,options)=>{
    return bcrypt.hash(user.password,salt)
    .then(hash =>{
        user.password =hash;
    })
    .catch(err=>{
        throw new Error();
    })
})

User.beforeUpdate((user,options)=>{
    if(user.changed('password')){
        return bcrypt.hash(user.password, salt)
        .then(hash =>{
            user.password=hash;
        })
        .catch(err=>{
            throw new Error();
        })
    }
})
export default User;
