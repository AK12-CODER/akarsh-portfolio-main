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

  // First interaction role check
  const isFirstOrSecondMsg = messageHistory.length <= 3;
  const matchesUnrelated = /accountant|chef|cook|doctor|nurse|architect|lawyer|pilot|singer|actor|graphic designer|plumber|electrician/i.test(
    q
  );

  if (matchesUnrelated && isFirstOrSecondMsg) {
    return `Akarsh's background is specialized in Machine Learning, Data Science, AI Research, and Software Engineering. He does not have professional experience as a ${userQuestion}. Would you like to explore his experience in Machine Learning, Data Science, or Software Development instead?`;
  }

  // 1. Education
  if (/education|degree|university|college|gpa|study|studied|m\.?sc|b\.?tech|inrs|srm/i.test(q)) {
    return (
      "Akarsh's Educational Background:\n\n" +
      "🎓 M.Sc. (recherche) in Applied Science — INRS (Institut national de la recherche scientifique), Québec, Canada (Sep 2024 – Present) | GPA: 3.4/4.0\n" +
      "• Thesis: Bias correction of ensemble environmental forecasts using deep learning (LSTM).\n" +
      "• Focus: Numerical modeling, deep learning (LSTM/CNN), scientific data analysis.\n\n" +
      "🎓 B.Tech in Computer Science & Engineering — SRM Institute of Science & Technology, India (2019 – 2023) | GPA: 8.64/10\n" +
      "• Coursework: AI, Object-Oriented Programming, Computer Networks.\n" +
      "• Leadership: CodeChef Club Leader, managing 50 core members and mentoring 100+ students."
    );
  }

  // 2. Experience / Work / Jobs / Internships
  if (/experience|work|job|role|internship|intern|inrs|researcher|position|history/i.test(q)) {
    return (
      "Akarsh's Professional & Research Experience:\n\n" +
      "🔬 Graduate Researcher @ INRS (Québec, Canada | Sep 2024 – Present):\n" +
      "• Designed & validated a modular LSTM-based deep learning framework to correct systematic bias in ensemble meteorological forecasts, reducing error by >80% vs baseline.\n" +
      "• Benchmarked deep learning models against classical statistical techniques (Delta Change).\n" +
      "• Integrated model outputs into downstream hydrological modeling pipelines (HYDROTEL).\n\n" +
      "🌍 Research Intern @ INRS (Québec City, Canada | Jun 2023 – Sep 2023):\n" +
      "• Optimized time-series and statistical models for Non-stationary Modelling of Wind Speed.\n" +
      "• Processed multi-terabyte environmental datasets.\n" +
      "• Awarded prestigious MITACS Globalink Research Internship ($9,000 CAD).\n\n" +
      "💻 WordPress Developer @ Inspired by Dream Foundation (Dec 2020 – Jan 2021):\n" +
      "• Enhanced client-facing websites and maintained NGO digital presence."
    );
  }

  // 3. Technical Skills / Tech Stack / Tools
  if (/skill|skills|tech|technology|stack|programming|languages|python|pytorch|tensorflow|tools|c\+\+|javascript|react/i.test(q)) {
    return (
      "Akarsh's Technical Expertise & Tooling:\n\n" +
      "🐍 Machine Learning & Data Science: Python, PyTorch, TensorFlow, JAX, NumPy, Pandas, scikit-learn, Time-Series Forecasting (LSTM/CNN), Feature Engineering, Model Benchmarking.\n" +
      "🤖 GenAI & LLMs: LLMs, NLP, Prompt Engineering, Agentic AI, Embeddings.\n" +
      "💻 Software & Web Development: C, C++, JavaScript, TypeScript, HTML, CSS, React, Node.js.\n" +
      "🛢️ Databases & Data Pipelines: PostgreSQL, MySQL, MongoDB, Snowflake, Data Cleaning, EDA.\n" +
      "🛠️ Tools & Infrastructure: Git, Linux (Ubuntu), Docker, Jupyter, VS Code."
    );
  }

  // 4. Publications / Research Papers
  if (/publication|publications|paper|papers|research|ieee|ecs|thesis/i.test(q)) {
    return (
      "Akarsh's Publications & Research Contributions:\n\n" +
      "📄 'Application of Deep Learning for Bias Correction of Meteorological Forecasts Used for Hydrological Forecasting' — (In Preparation for journal submission)\n" +
      "📄 'Battery Swapping System for Electric Vehicles' — Published in IEEE\n" +
      "📄 'An Android Application for an Efficient Method of Tracking and Managing Pharmacies' — Published in ECS Transactions"
    );
  }

  // 5. Projects / LSTM / Wind Speed / Forecasts
  if (/project|projects|lstm|forecast|wind|bias|hydrotel|mitacs/i.test(q)) {
    return (
      "Key Projects & Innovations by Akarsh:\n\n" +
      "1️⃣ Deep Learning Forecast Bias Correction (INRS):\n" +
      "   Developed custom PyTorch/TensorFlow LSTM architectures that reduced meteorological forecasting error by over 80% and directly feeds into hydrological models (HYDROTEL).\n\n" +
      "2️⃣ Non-Stationary Wind Speed Climate Modeling (INRS / MITACS):\n" +
      "   Analyzed multi-TB climate datasets to model wind speed distribution changes under non-stationary climate conditions.\n\n" +
      "3️⃣ EV Battery Swapping & Pharmacy Management Systems:\n" +
      "   Authored IEEE & ECS Transactions research on smart IoT & mobile systems."
    );
  }

  // 6. Leadership / Community / CodeChef
  if (/leader|leadership|codechef|mentor|club|community/i.test(q)) {
    return (
      "Leadership & Community Experience:\n\n" +
      "🏆 CodeChef Club Leader @ SRMIST (2019 – 2023):\n" +
      "• Managed a core team of 50 student leaders and developers.\n" +
      "• Mentored 100+ students in competitive programming, data structures, algorithms, and software engineering."
    );
  }

  // 7. Contact / Resume / Hire / Email
  if (/contact|email|reach|hire|resume|cv|linkedin|github|location|canada|quebec/i.test(q)) {
    return (
      "Contact & Overview:\n\n" +
      "📍 Location: Québec, Canada & India\n" +
      "✉️ Contact: You can reach Akarsh directly via his portfolio contact section or LinkedIn.\n" +
      "💼 Suitable Roles: Applied Machine Learning Engineer, Data Scientist, ML Researcher, Environmental Analyst, Software Developer."
    );
  }

  // 8. Casual Greetings (Friendly & Concise, no profile dump)
  if (/^(hi|hello|hey|hey there|hi there|good morning|good afternoon|good evening|howdy|greetings|what'?s up)$/i.test(q)) {
    return "Hello! 👋 Welcome to Akarsh's portfolio. I'm Akarsh's AI Assistant. How can I help you today? Feel free to ask me about his experience in Machine Learning, Data Science, AI Research, or Software Engineering!";
  }

  // 9. Explicit Profile / About / Introduction Requests
  if (/who are you|tell me about|intro|introduction|about akarsh|summary|background|profile/i.test(q)) {
    return (
      "Akarsh Kumar Singh is an Applied Machine Learning Researcher & Data Scientist currently pursuing his M.Sc. in Applied Science at INRS (Québec, Canada).\n\n" +
      "He specializes in Deep Learning (LSTM/CNN), Time-Series Forecasting, Data Analysis, and Software Engineering. How can I help you learn more about his work, research, or skills?"
    );
  }

  // Default friendly response inviting specific questions
  return (
    "How can I assist you regarding Akarsh's background?\n\n" +
    "Feel free to ask about his:\n" +
    "• 🎓 Education & GPA\n" +
    "• 🔬 Research & Work Experience\n" +
    "• 🛠️ Technical Skills & Tools\n" +
    "• 📄 Publications & Projects"
  );
}
