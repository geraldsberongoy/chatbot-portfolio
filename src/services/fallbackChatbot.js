// Fallback chatbot responses when OpenAI API is unavailable
export class FallbackChatbot {
  constructor(portfolioData) {
    this.portfolioData = portfolioData;
  }

  // Enhanced keyword matching with better accuracy
  matchesKeywords(message, keywords) {
    // Add common synonyms for better matching
    const synonyms = {
      "education": ["school", "university", "college", "academic", "studying", "learning"],
      "project": ["app", "application", "system", "software", "website", "program"],
      "skill": ["technology", "tech", "programming", "coding", "development", "language"],
      "experience": ["work", "job", "career", "employment", "position", "role"],
      "contact": ["reach", "connect", "email", "linkedin", "github", "social"]
    };

    // Check direct keyword matches
    const hasDirectMatch = keywords.some(keyword => message.includes(keyword));
    
    // Check synonym matches
    const hasSynonymMatch = keywords.some(keyword => {
      if (synonyms[keyword]) {
        return synonyms[keyword].some(synonym => message.includes(synonym));
      }
      return false;
    });

    return hasDirectMatch || hasSynonymMatch;
  }

  // Generate response based on keywords and portfolio data
  generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for out-of-scope questions first
    if (this.isOutOfScope(lowerMessage)) {
      return this.getOutOfScopeResponse();
    }

    // Education related questions
    if (this.matchesKeywords(lowerMessage, ["education", "school", "university", "degree", "study", "student"])) {
      return this.getEducationResponse();
    }
    
    // Projects related questions
    if (this.matchesKeywords(lowerMessage, ["project", "projects", "built", "created", "developed", "app", "application"])) {
      return this.getProjectsResponse();
    }
    
    // Skills related questions
    if (this.matchesKeywords(lowerMessage, ["skill", "skills", "programming", "language", "framework", "technology", "tech"])) {
      return this.getSkillsResponse();
    }
    
    // Experience related questions
    if (this.matchesKeywords(lowerMessage, ["experience", "work", "job", "role", "position", "career"])) {
      return this.getExperienceResponse();
    }
    
    // Contact related questions
    if (this.matchesKeywords(lowerMessage, ["contact", "email", "reach", "linkedin", "github", "connect"])) {
      return this.getContactResponse();
    }
    
    // Certifications
    if (this.matchesKeywords(lowerMessage, ["certificate", "certification", "certified", "credential"])) {
      return this.getCertificationsResponse();
    }
    
    // About Gerald
    if (this.matchesKeywords(lowerMessage, ["about", "who", "gerald", "background", "bio", "introduction"])) {
      return this.getAboutResponse();
    }
    
    // Default response with suggestions
    return this.getDefaultResponse();
  }
  
  getEducationResponse() {
    const education = this.portfolioData.education;
    return "🎓 **Education**\n\n" +
           `Gerald is pursuing a **${education.degree}** at ${education.school}.\n` +
           `Expected graduation: ${education.graduation}\n\n` +
           `**Key Coursework:**\n${education.coursework.slice(0, 5).map(course => `• ${course}`).join("\n")}\n\n` +
           `**Scholarships:** ${education.scholarships.join(", ")}\n\n` +
           "Is there anything specific about Gerald's education you'd like to know more about?";
  }
  
  getProjectsResponse() {
    const projects = this.portfolioData.projects;
    return "🚀 **Gerald's Projects**\n\n" +
           projects.map((project, index) => 
             `**${index + 1}. ${project.name}**\n` +
             `Tech Stack: ${project.stack.join(", ")}\n` +
             `${project.details[0]}\n`
           ).join("\n") +
           "\nWould you like to know more details about any specific project?";
  }
  
  getSkillsResponse() {
    const skills = this.portfolioData.skills;
    return "💻 **Gerald's Technical Skills**\n\n" +
           `**Programming Languages:** ${skills.languages.join(", ")}\n\n` +
           `**Frameworks & Libraries:** ${skills.frameworks.join(", ")}\n\n` +
           `**Databases:** ${skills.databases.join(", ")}\n\n` +
           `**Tools:** ${skills.tools.join(", ")}\n\n` +
           "Gerald has experience with both frontend and backend development, as well as database management and design tools.";
  }
  
  getExperienceResponse() {
    const experience = this.portfolioData.experience;
    return "💼 **Gerald's Experience**\n\n" +
           experience.map((exp, index) => 
             `**${index + 1}. ${exp.role}**\n` +
             `${exp.organization} | ${exp.date}\n` +
             `Key highlights:\n${exp.highlights.map(h => `• ${h}`).join("\n")}\n`
           ).join("\n") +
           "\nGerald has shown leadership in web development and cloud computing through his active participation in tech communities.";
  }
  
  getContactResponse() {
    const contact = this.portfolioData.contact;
    return "📞 **Contact Gerald**\n\n" +
           `**Email:** ${contact.email}\n` +
           `**LinkedIn:** ${contact.linkedin}\n` +
           `**GitHub:** ${contact.github}\n\n` +
           "Feel free to reach out to Gerald through any of these channels. He's always open to discussing new opportunities and collaborations!";
  }
  
  getCertificationsResponse() {
    const certifications = this.portfolioData.certifications;
    return "📜 **Gerald's Certifications**\n\n" +
           certifications.map((cert, index) => 
             `**${index + 1}. ${cert.title}**\n` +
             `Issued by: ${cert.issuer} | ${cert.date}\n` +
             `${cert.note}\n`
           ).join("\n") +
           "\nGerald continues to pursue certifications to stay current with industry trends and technologies.";
  }
  
  getAboutResponse() {
    return `👋 **About Gerald**\n\n${this.portfolioData.profile}\n\n` +
           "Gerald is passionate about technology and always eager to take on new challenges. He combines his academic knowledge with practical experience gained through various projects and community involvement.\n\n" +
           "Would you like to know more about his projects, skills, or experience?";
  }
  
  getDefaultResponse() {
    return "Hi! I'm Gerald's portfolio chatbot. I can help you learn about:\n\n" +
           "🎓 **Education** - His degree and coursework\n" +
           "🚀 **Projects** - Applications and systems he's built\n" +
           "💻 **Skills** - Programming languages and technologies\n" +
           "💼 **Experience** - Work experience and roles\n" +
           "📜 **Certifications** - Professional credentials\n" +
           "📞 **Contact** - How to reach Gerald\n\n" +
           "Try asking something like:\n" +
           "• \"Tell me about Gerald's projects\"\n" +
           "• \"What skills does Gerald have?\"\n" +
           "• \"How can I contact Gerald?\"\n\n" +
           "What would you like to know?";
  }
  
  // Check if question is outside Gerald's professional scope
  isOutOfScope(message) {
    const outOfScopeKeywords = [
      "breakfast", "lunch", "dinner", "food", "eat", "meal", "favorite food",
      "weather", "temperature", "rain", "sunny",
      "movie", "film", "watch", "netflix", "entertainment", 
      "sport", "football", "basketball", "game", "play",
      "girlfriend", "boyfriend", "dating", "relationship", "family", "parents",
      "hobby", "hobbies", "fun", "leisure", "vacation", "travel",
      "politics", "religion", "personal life", "private",
      "age", "birthday", "height", "weight", "appearance",
      "music", "song", "band", "artist", "listen",
      "book", "read", "novel", "story",
      "color", "favourite color", "like", "dislike",
      "home", "house", "address", "live", "where do you live"
    ];
    
    return outOfScopeKeywords.some(keyword => message.includes(keyword));
  }
  
  getOutOfScopeResponse() {
    // Get random suggestion topics
    const suggestionSets = [
      {
        intro: "I'm Gerald's portfolio assistant and focus on his professional background! 🎯",
        suggestions: [
          "💻 **'What programming languages does Gerald know?'**",
          "🚀 **'Tell me about Gerald's projects'**",
          "🎓 **'What is Gerald studying?'**"
        ]
      },
      {
        intro: "That's outside my expertise! I specialize in Gerald's tech career. 💻",
        suggestions: [
          "⚡ **'What frameworks has Gerald used?'**", 
          "🏢 **'Where has Gerald worked?'**",
          "📜 **'Does Gerald have any certifications?'**"
        ]
      },
      {
        intro: "I focus on Gerald's professional portfolio only! 🚀", 
        suggestions: [
          "🔧 **'What tools does Gerald use?'**",
          "📱 **'What apps has Gerald built?'**", 
          "🎯 **'What are Gerald's technical skills?'**"
        ]
      },
      {
        intro: "Let's talk about Gerald's professional achievements instead! 📊",
        suggestions: [
          "💼 **'What's Gerald's work experience?'**",
          "🏆 **'What hackathons has Gerald participated in?'**",
          "📚 **'What courses has Gerald completed?'**"
        ]
      }
    ];

    const randomSet = suggestionSets[Math.floor(Math.random() * suggestionSets.length)];
    
    return `${randomSet.intro}\n\n**Try asking:**\n${randomSet.suggestions.join("\n")}\n\nWhat would you like to know? ✨`;
  }
}
