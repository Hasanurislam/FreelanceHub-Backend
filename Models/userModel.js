const mongoose=require('mongoose');
const {Schema} =mongoose;

const UserSchema= new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        img:{
            type:String,
            required:false
        },
        country:{
            type:String,
            required:true
        },
        desc:{
            type:String,
            required:false
        },
        isSeller:{
            type:Boolean,
            default:false
        },
    },{
        timestamps:true
    }
)
module.exports=mongoose.model('user',UserSchema)