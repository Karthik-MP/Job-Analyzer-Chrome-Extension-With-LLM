const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const analyzeJobDescription = async (jobDescription, userProfile) => {
  console.log(userProfile.skills)
  try {
    const prompt = `
      Analyze the following job description and extract key information. Compare it with the user profile:
      
      Job title:
      ${jobDescription?.title?.trim()}
      Job Description:
      ${jobDescription?.description?.replace("\n", " ")?.replace(/\n/g, " ")}
      Job location:
      ${jobDescription?.location?.split("·")[0]}

      User Profile:
      - Education: ${userProfile.degree} ${userProfile.major} 
      - Visa Status: ${userProfile.visaStatus}
      - Education: ${userProfile.degree} in ${userProfile.major} from ${userProfile.university }
      - Available from ${new Date(userProfile.startDate).toLocaleDateString()}
      - User Skills: ${userProfile.skills}
      
      Provide analysis in the following JSON format only:
      {
        "title": "job title",
        "company": "company name",
        "location": "job location",
        "salary": "salary range if mentioned",
        "visaMatch": "based on user visa whether visa is offered Boolean value",
        "workAuthorization":"Boolean value"
        "educationRequired": "if users and job description qualification matches or not Boolean value",
        "skills": [{"totalSkillMatch": "count","matchedSkillspercentage": "percentage", "matchedSkills": {"name": "skill name","required": boolean }, "notmatchedSkills": {"name": "skill name","required": boolean }}]
        "experienceRequired": "years of experience required",
        "startDate": "start date if mentioned",
        "contractDuration": "contract duration if mentioned"
      }
    `;
    const gemini_api_key = process.env.GEMINI_API;
    console.log(gemini_api_key);
    const googleAI = new GoogleGenerativeAI(gemini_api_key);
    const geminiConfig = {
      temperature: 0.9,
      topP: 1,
      topK: 1,
      maxOutputTokens: 4096,
    };

    const model = googleAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      geminiConfig,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonString = response.text().match(/{.*}/s)?.[0]; // Matches everything between curly braces (JSON structure)
    console.log(jsonString);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

module.exports = { analyzeJobDescription };
