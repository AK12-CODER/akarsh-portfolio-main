/**
 * Intelligent local knowledge engine that generates responses based on Akarsh's CV data.
 * Used as a fallback when Gemini API key is invalid/missing or when network calls fail.
 */
export function generateLocalAnswer(
  userQuestion: string,
  _inquiredRole: string = "Not Specified Yet",
  messageHistory: { sender: "user" | "bot"; text: string }[] = []
): string {
  const q = userQuestion.toLowerCase().trim();
  const isFirstOrSecondMsg = messageHistory.length <= 3;

  // Unrelated profession guardrail
  const matchesUnrelated = /accountant|chef|cook|doctor|nurse|architect|lawyer|pilot|singer|actor|graphic designer|plumber|electrician/i.test(
    q
  );

  if (matchesUnrelated && isFirstOrSecondMsg) {
    return `Akarsh's background is focused on Machine Learning, Data Science, AI Research, and Software Engineering, so he doesn't have professional experience as a ${userQuestion}. Would you like me to share details about his experience in AI, Data Science, or Software Development instead?`;
  }

  // Small Talk & Greetings
  if (/^(hi|hello|hey|hey there|hi there|good morning|good afternoon|good evening|howdy|greetings|what'?s up|yo)$/i.test(q)) {
    return "Hey there! 👋 Welcome to Akarsh's portfolio! I'm his personal AI assistant. How's your day going? Feel free to ask me anything about his ML research, tech stack, or background!";
  }

  if (/how are you|how'?s it going|how do you do/i.test(q)) {
    return "I'm doing great, thank you for asking! 😊 I'm here to help answer any questions you have about Akarsh's work in Machine Learning, research projects, publications, or background. What would you like to explore today?";
  }

  if (/who are you|what are you|your name|what can you do|about you/i.test(q)) {
    return "I'm Akarsh's personal AI assistant! I represent Akarsh on his portfolio and can answer questions about his M.Sc. research at INRS, deep learning projects, publications, technical skills, and how to get in touch with him.";
  }

  if (/thank|thanks|awesome|great|cool|perfect|got it/i.test(q)) {
    return "You're very welcome! 😊 Let me know if there's anything else about Akarsh's research, skills, or projects I can help you with!";
  }

  // 1. Education
  if (/education|degree|university|college|gpa|study|studied|m\.?sc|b\.?tech|inrs|srm/i.test(q)) {
    return (
      "Akarsh has a solid academic foundation in Computer Science and Applied Machine Learning!\n\n" +
      "🎓 M.Sc. (recherche) in Applied Science — INRS (Québec, Canada, 2024 – Present | GPA: 3.4/4.0)\n" +
      "His thesis focuses on correcting systematic bias in environmental forecast models using deep learning architectures like LSTMs and CNNs.\n\n" +
      "🎓 B.Tech in Computer Science & Engineering — SRM Institute of Science & Technology (2019 – 2023 | GPA: 8.64/10)\n" +
      "Alongside core CS coursework in AI, OOP, and networks, he served as the CodeChef Club Leader, managing 50 team members and mentoring 100+ students in competitive programming.\n\n" +
      "Would you like to hear more about his research work at INRS or his technical skills?"
    );
  }

  // 2. Experience / Work / Jobs / Internships
  if (/experience|work|job|role|internship|intern|inrs|researcher|position|history/i.test(q)) {
    return (
      "Akarsh brings a strong blend of advanced ML research and practical data engineering experience:\n\n" +
      "🔬 Graduate Researcher @ INRS (Québec, Canada | Sep 2024 – Present)\n" +
      "He designed a modular LSTM deep learning framework for meteorological forecast bias correction that reduced prediction error by over 80% compared to baseline models, directly feeding into hydrological pipelines like HYDROTEL.\n\n" +
      "🌍 Research Intern @ INRS (Québec, Canada | Jun 2023 – Sep 2023)\n" +
      "Selected for the prestigious MITACS Globalink Research Internship ($9,000 CAD award). He developed statistical and time-series models for wind speed distributions under non-stationary climate conditions, processing terabyte-scale environmental data.\n\n" +
      "💻 WordPress Developer @ Inspired by Dream Foundation (Dec 2020 – Jan 2021)\n" +
      "Enhanced client-facing NGO web platforms and digital presence.\n\n" +
      "Is there a specific project or role you'd like to dive deeper into?"
    );
  }

  // 3. Technical Skills / Tech Stack / Tools
  if (/skill|skills|tech|technology|stack|programming|languages|python|pytorch|tensorflow|tools|c\+\+|javascript|react/i.test(q)) {
    return (
      "Akarsh's technical toolkit spans core Machine Learning, Data Science, and Software Engineering:\n\n" +
      "🐍 ML & Data Science: Python, PyTorch, TensorFlow, JAX, NumPy, Pandas, scikit-learn, Time-Series Forecasting (LSTM/CNN), Feature Engineering, Model Benchmarking.\n" +
      "🤖 GenAI & LLMs: Prompt Engineering, Agentic AI, NLP, Embeddings.\n" +
      "💻 Software & Web: C, C++, JavaScript, TypeScript, React, HTML/CSS.\n" +
      "🛢️ Databases & Pipelines: PostgreSQL, MySQL, MongoDB, Snowflake, Data Cleaning, EDA.\n" +
      "🛠️ Infrastructure & Tools: Git, Linux (Ubuntu), Docker, Jupyter, VS Code.\n\n" +
      "Are you interested in how he applied any of these tools in his research?"
    );
  }

  // 4. Publications / Research Papers
  if (/publication|publications|paper|papers|research|ieee|ecs|thesis/i.test(q)) {
    return (
      "Akarsh has published research across deep learning, IoT, and mobile systems:\n\n" +
      "📄 'Application of Deep Learning for Bias Correction of Meteorological Forecasts Used for Hydrological Forecasting' — (In preparation for journal submission)\n" +
      "📄 'Battery Swapping System for Electric Vehicles' — Published in IEEE\n" +
      "📄 'An Android Application for an Efficient Method of Tracking and Managing Pharmacies' — Published in ECS Transactions\n\n" +
      "Would you like me to share more details on his deep learning methodology or publications?"
    );
  }

  // 5. Projects / LSTM / Wind Speed / Forecasts
  if (/project|projects|lstm|forecast|wind|bias|hydrotel|mitacs/i.test(q)) {
    return (
      "Here are some highlight projects Akarsh has built:\n\n" +
      "1️⃣ Deep Learning Forecast Bias Correction (INRS):\n" +
      "Custom PyTorch/TensorFlow LSTM architectures that cut weather forecasting error by over 80% for downstream hydrological forecasting models (HYDROTEL).\n\n" +
      "2️⃣ Non-Stationary Climate Wind Speed Modeling (MITACS):\n" +
      "Analyzed terabyte-scale environmental data to model changing wind distributions under non-stationary climate conditions.\n\n" +
      "3️⃣ EV Battery Swapping & Healthcare Management Systems:\n" +
      "Authored research on smart IoT & mobile systems published in IEEE and ECS Transactions.\n\n" +
      "Which of these would you like to know more about?"
    );
  }

  // 6. Leadership / Community / CodeChef
  if (/leader|leadership|codechef|mentor|club|community/i.test(q)) {
    return (
      "Akarsh has a proven track record in community leadership and technical mentorship:\n\n" +
      "🏆 CodeChef Club Leader @ SRMIST (2019 – 2023)\n" +
      "• Managed a core team of 50 student developers and leaders.\n" +
      "• Mentored 100+ students in competitive programming, data structures, algorithms, and software engineering practices."
    );
  }

  // 7. Contact / Resume / Hire / Email
  if (/contact|email|reach|hire|resume|cv|linkedin|github|location|canada|quebec/i.test(q)) {
    return (
      "Akarsh is currently based in Québec, Canada and is open to roles in Applied Machine Learning, Data Science, AI Research, and Software Development!\n\n" +
      "📍 Location: Québec, Canada & India\n" +
      "✉️ Contact: You can message Akarsh directly using the contact section on this portfolio or reach out on LinkedIn.\n\n" +
      "Would you like me to guide you to any specific part of his portfolio?"
    );
  }

  // 8. General Profile / About Akarsh
  if (/tell me about|intro|introduction|about akarsh|summary|background|profile/i.test(q)) {
    return (
      "Akarsh Kumar Singh is an Applied Machine Learning Researcher & Data Scientist currently completing his M.Sc. in Applied Science at INRS in Québec, Canada.\n\n" +
      "He specializes in Deep Learning (LSTM/CNN), Time-Series Forecasting, Data Analysis, and Software Engineering. His recent research reduced meteorological forecast errors by over 80% using deep learning models.\n\n" +
      "What area of his work are you most interested in learning about?"
    );
  }

  // Default friendly invitation
  return (
    "I'd love to help you learn more about Akarsh! You can ask me about:\n\n" +
    "• 🎓 Education & Master's Research\n" +
    "• 🔬 Work & Graduate Research Experience\n" +
    "• 🛠️ Technical Skills & ML Stack\n" +
    "• 📄 Publications & Deep Learning Projects\n" +
    "• ✉️ How to contact or hire Akarsh"
  );
}

