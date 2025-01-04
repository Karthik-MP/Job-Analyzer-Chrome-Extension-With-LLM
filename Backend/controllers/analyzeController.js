const { analyzeJobDescription } = require("../services/LLMServices");
const {
  calculateSkillMatch,
  checkVisaRequirements,
  checkEducationMatch,
} = require("../services/analyzeService");
const User = require("../models/User");

class AnalyzerController {
  static async analyzeJob(req, res) {
    try {
      const { jobDescription } = req.body;
      const userId = req.user._id;

      // Get user profile
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get LLM analyze
      const llmAnalysis = await analyzeJobDescription(jobDescription, user);

      // Calculate overall match score
      const overallScore = Math.round(
        llmAnalysis?.skills[0]?.totalSkillMatch * 0.4 + // Skills weight
          (llmAnalysis?.visaMatch ? 30 : 0) + // Visa weight
          (llmAnalysis?.educationRequired ? 30 : 0) // Education weight
      );

      const analyze = {
        jobDetails: {
          title: llmAnalysis.title,
          company: llmAnalysis.company,
          location: llmAnalysis.location,
          salary: llmAnalysis.salary,
          startDate: llmAnalysis.startDate,
          contractDuration: llmAnalysis.contractDuration,
        },
        matchScore: overallScore,
        skills: llmAnalysis?.skills[0]?.matchedSkillspercentage,
        visaMatch: llmAnalysis?.visaMatch,
        educationMatch: llmAnalysis?.educationRequired,
        requirements: {
          education: llmAnalysis.educationRequired,
          experience: llmAnalysis.experienceRequired,
          workAuthorization: llmAnalysis.workAuthorization,
        },
      };

      res.json(analyze);
    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({
        message: "Error analyzing job description",
        error: error.message,
      });
    }
  }
}

module.exports = AnalyzerController;
