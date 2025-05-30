import { clerkClient } from "@clerk/express";

//MiddleWare {protect Educator Routes}

export const protectEducator = async(req, res, next)=>{
    try{
         const userId = "user_2xgpzpbfybiTOZsPnL7DMpyOPEi"
         const response = await clerkClient.users.getUser(userId)

         if(response.publicMetadata.role !== 'educator'){
            return res.json({success: false, message:'Unauthorized Access'})
         }
         next()
    } catch (error){
        res.json({success: false, message: error.message})
    }
}