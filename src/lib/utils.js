import jwt from "jsonwebtoken"

export const generateToken=(userId,res)=>{
    const token=jwt.sign({userId}, process.env.JWT_SECRET,{
     expiresIn:"7d"   
    });
    console.log("hitted")
    console.log("✅ JWT Token Generated:", token);
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"None",
        // secure:process.env.NODE_ENV !== "development",
        secure: true   
    })
    return token;
}