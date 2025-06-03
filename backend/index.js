import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/connectDB.js'

dotenv.config()
const app = express()

app.use(cors({
    credentials:true,
    origin:process.env.FRONTEND_URL
}))

app.use(express.json())
// app.use(express.cookieParser())

const PORT = 8000 || process.env.PORT 

app.get('/',(req,res)=>{
    res.send("hi how are you")
})

app.post('/api/login',async(req,res)=>{
    try {
        const {email,password} = req.body;
        // const userId = req.userid;

        if(!email  || !password){
            return res.status(400).json({
                message:"Please Enter Email and Password",
                error:true,
                success:false
            })
        }
        
        const db = await connectDB()
        const user = await db.collection('Users').findOne({email});
        if(!user){
            return res.status(500).json({
                message:"User Not Registered                   !",
                error:true,
                success:false
            })
        }
         return res.status(200).json({
                message:"Login Successfull",
                error:false,
                success:true,
                data:user
            })

    } catch (error) {
         res.status(500).json({ error: 'Failed to fetch users' });
    }
})
app.post('/api/createSedB',async(req,res)=>{
    const db = await connectDB()
    const data = await db.collection('Sed_B').find().toArray()

    return res.status(200).json({
        data:data
    })
    
})
app.listen(PORT,()=>{
    console.log("Server is running");
    connectDB();
})