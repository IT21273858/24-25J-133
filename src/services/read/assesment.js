const { Prisma } = require("@prisma/client");
const { prisma } = require("../../utils/db");


const createAssesmenttoReader = async (data)=>{
   try {
    const assesment = await prisma.assessment.create({
        data:data
    })
    
    if(assesment)
        return assesment
   } catch (error) {
    console.error("Assesment Creation Error")
    console.error(error)
    
   }

}


module.exports = {
    createAssesmenttoReader
}