import { clerkClient} from "@clerk/express"
import {v2 as cloudinary} from 'cloudinary'
import Course from "../models/Course.js"
import Purchase from "../models/Purchase.js"; 
import User from "../models/User.js";


// updaterole to educator

export const updateRoleToEducator = async (req,res)=>{
    try{
        const userId = "user_2xgpzpbfybiTOZsPnL7DMpyOPEi"
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata:{
                role: 'educator',
            }
        })
        res.json({ success: true, message: 'You can publish a course now'})
    }catch(error){
         res.json({ success : false, message: error.message })
    }

}

// Add New Course
export const addCourse = async (req,res)=>{
    try{
        const {courseData} = req.body
        const imageFile = req.file
        const educatorId = "user_2xgpzpbfybiTOZsPnL7DMpyOPEi"

         if(!imageFile){
            return res.json({success : false, message: 'Thumbnail is Not Attached'})
         }

         const parsedCourseData = await JSON.parse(courseData)
         parsedCourseData.educator = educatorId
         const newCourse = await Course.create(parsedCourseData)
         const imageUpload=await cloudinary.uploader.upload(imageFile.path)
         newCourse.courseThumbnail=imageUpload.secure_url
         await newCourse.save()
         res.json({success: true, message:'Course Added'})
    } catch(error){
         res.json({success: false, message: error.message})
    }
}

//Get Educator Courses

export const getEducatorCourses = async (req,res)=>{
    try{
        const educator = "user_2xgpzpbfybiTOZsPnL7DMpyOPEi"
        const courses = await Course.find({educator})
        res.json({success : true, courses})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}

//Get Educator Dashboard Data

export const educatorDashboardData = async(req,res)=>{
  try{
    const educator = "user_2xgpzpbfybiTOZsPnL7DMpyOPEi";

    const courses = await Course.find({educator});
    const totalCourses = courses.length;
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed'
    });

    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const totalEnrolments = purchases.length;

    // Fetch students via populated Purchase data
    const populatedPurchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed'
    }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

    const enrolledStudentsData = populatedPurchases.map(purchase => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle
    }));

    res.json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEarnings,
        totalEnrolments,
        enrolledStudentsData
      }
    });
  } catch(error){
    res.json({success: false, message: error.message});
  }
};


//Get Enrolled Students Data with Purchase Data

export const getEnrolledStudentsData = async(req,res)=>{
    try{
        const educator = "user_2xgpzpbfybiTOZsPnL7DMpyOPEi";
        const courses = await Course.find({educator});
        const courseIds = courses.map(course=> course._id);

        const purchases = await Purchase.find({
            courseId:{$in: courseIds},
            status:'completed'
        }).populate('userId','name imageUrl').populate('courseId','courseTitle')
        const enrolledStudents = purchases.map(purchase =>({
            student: purchase.userId,
            courseTitle:purchase.courseId.courseTitle,
            purchaseData:purchase.createdAt
        }));
        res.json({success:true, enrolledStudents})
    } catch(error){
          res.json({success: false, message: error.message});
    }
}