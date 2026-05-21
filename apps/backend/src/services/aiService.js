const { Annotation, StateGraph } = require("@langchain/langgraph");
const { v4: uuidv4 } = require("uuid");
const ClaimSessionModel = require("../models/ClaimSession");
const geminiService = require("./geminiService");
const huggingfaceService = require("./huggingfaceService");
const groqService = require("./groqService");
const { buildCredentialCalldata } = require("./calldataBuilder");
const { buildMetadata } = require("../utils/credentialMetadata");

const inMemorySessions = new Map();

async function safeSessionFindOne(sessionId) {
  try {
    const doc = await ClaimSessionModel.findOne({ sessionId });
    return doc;
  } catch {
    return inMemorySessions.get(sessionId) || null;
  }
}

async function safeSessionCreate(data) {
  try {
    const doc = await ClaimSessionModel.create(data);
    return doc;
  } catch {
    const fallback = {
      ...data,
      messages: data.messages || [],
      save: async function () { inMemorySessions.set(data.sessionId, this); return this; }
    };
    inMemorySessions.set(data.sessionId, fallback);
    return fallback;
  }
}

async function safeSessionSave(session) {
  try {
    if (typeof session.save === "function") {
      await session.save();
    }
  } catch {
    if (session.sessionId) {
      inMemorySessions.set(session.sessionId, session);
    }
  }
}

const CREDENTIAL_CATEGORIES = [
  "medical_training",
  "academic_credential",
  "professional_certification",
  "continuing_education",
  "not_a_credential",
];

const VALID_CREDENTIAL_TYPES = [
  "medical_training",
  "academic_credential",
  "professional_certification",
  "continuing_education",
  "clinical_rotation",
  "research_publication",
  "workshop_seminar",
  "license_renewal",
  "volunteer_service",
];

const CredentialState = Annotation.Root({
  claimText: Annotation({ reducer: (_, b) => b, default: () => "" }),
  walletAddress: Annotation({ reducer: (_, b) => b, default: () => "" }),
  sessionId: Annotation({ reducer: (_, b) => b, default: () => "" }),
  userRole: Annotation({ reducer: (_, b) => b, default: () => "learner" }),
  claimCategory: Annotation({ reducer: (_, b) => b, default: () => "" }),
  categoryConfidence: Annotation({ reducer: (_, b) => b, default: () => 0 }),
  rawCredential: Annotation({ reducer: (_, b) => b, default: () => null }),
  validCredential: Annotation({ reducer: (_, b) => b, default: () => null }),
  calldata: Annotation({ reducer: (_, b) => b, default: () => null }),
  contractAddress: Annotation({ reducer: (_, b) => b, default: () => null }),
  reply: Annotation({ reducer: (_, b) => b, default: () => "" }),
  confidence: Annotation({ reducer: (_, b) => b, default: () => 0 }),
  modelUsed: Annotation({ reducer: (_, b) => b, default: () => "" }),
  steps: Annotation({ reducer: (a, b) => [...a, ...b], default: () => [] }),
  sessionHistory: Annotation({ reducer: (_, b) => b, default: () => [] }),
  error: Annotation({ reducer: (_, b) => b, default: () => null }),
});

async function loadMemory(state) {
  const steps = [{ node: "loadMemory", timestamp: Date.now(), status: "started" }];

  try {
    let sessionId = state.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
    }

    let session = await safeSessionFindOne(sessionId);

    if (!session) {
      session = await safeSessionCreate({
        userAddress: state.walletAddress,
        sessionId,
        messages: [],
        isActive: true,
      });
    }

    if (!session.messages) session.messages = [];

    session.messages.push({
      role: "user",
      content: state.claimText,
      timestamp: new Date(),
    });
    await safeSessionSave(session);

    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    steps[0].status = "completed";
    steps[0].sessionId = sessionId;
    steps[0].messageCount = history.length;

    return {
      sessionId,
      sessionHistory: history,
      steps,
    };
  } catch (err) {
    steps[0].status = "error";
    steps[0].error = err.message;
    return {
      sessionId: state.sessionId || uuidv4(),
      steps,
    };
  }
}

async function classifyClaim(state) {
  const steps = [{ node: "classifyClaim", timestamp: Date.now(), status: "started" }];

  try {
    const result = await huggingfaceService.classify(
      state.claimText,
      CREDENTIAL_CATEGORIES
    );

    steps[0].status = "completed";
    steps[0].category = result.category;
    steps[0].confidence = result.confidence;

    return {
      claimCategory: result.category,
      categoryConfidence: result.confidence,
      steps,
    };
  } catch (err) {
    steps[0].status = "fallback";
    steps[0].error = err.message;

    const text = state.claimText.toLowerCase();
    let category = "professional_certification";

    if (text.includes("medical") || text.includes("clinical") || text.includes("patient") || text.includes("hipaa") || text.includes("acls") || text.includes("bls") || text.includes("cpr")) {
      category = "medical_training";
    } else if (text.includes("degree") || text.includes("university") || text.includes("bachelor") || text.includes("master") || text.includes("phd") || text.includes("diploma")) {
      category = "academic_credential";
    } else if (text.includes("course") || text.includes("training") || text.includes("workshop") || text.includes("seminar") || text.includes("hours")) {
      category = "continuing_education";
    } else if (text.includes("hello") || text.includes("hi ") || text.includes("what") || text.includes("how are")) {
      category = "not_a_credential";
    }

    steps[0].fallbackCategory = category;

    return {
      claimCategory: category,
      categoryConfidence: 0.5,
      steps,
    };
  }
}

function localExtractCredential(claimText, category) {
  const text = claimText.toLowerCase();

  const hoursMatch = claimText.match(/(\d+)[\s-]*(hours?|hrs?|hour)/i);
  const hoursCompleted = hoursMatch ? parseInt(hoursMatch[1]) : 0;

  const certKeywords = [
    { pattern: /acls/i, title: "Advanced Cardiac Life Support (ACLS)", skills: ["ACLS", "Cardiac Care", "Emergency Medicine"] },
    { pattern: /bls/i, title: "Basic Life Support (BLS)", skills: ["BLS", "CPR", "First Aid"] },
    { pattern: /hipaa/i, title: "HIPAA Compliance Training", skills: ["HIPAA", "Healthcare Compliance", "Patient Privacy"] },
    { pattern: /cpr/i, title: "CPR Certification", skills: ["CPR", "First Aid", "Emergency Response"] },
    { pattern: /pals/i, title: "Pediatric Advanced Life Support (PALS)", skills: ["PALS", "Pediatric Care", "Emergency Medicine"] },
    { pattern: /first\s*aid/i, title: "First Aid Certification", skills: ["First Aid", "Emergency Care"] },
    { pattern: /aws/i, title: "AWS Cloud Certification", skills: ["AWS", "Cloud Computing", "DevOps"] },
    { pattern: /python/i, title: "Python Programming Certification", skills: ["Python", "Programming", "Software Development"] },
    { pattern: /javascript|js /i, title: "JavaScript Development Certification", skills: ["JavaScript", "Web Development"] },
    { pattern: /react/i, title: "React Development Certification", skills: ["React", "Frontend Development", "JavaScript"] },
    { pattern: /data\s*science/i, title: "Data Science Certification", skills: ["Data Science", "Machine Learning", "Analytics"] },
    { pattern: /machine\s*learning|ml /i, title: "Machine Learning Certification", skills: ["Machine Learning", "AI", "Data Science"] },
    { pattern: /project\s*management|pmp/i, title: "Project Management Professional (PMP)", skills: ["Project Management", "Leadership", "Agile"] },
    { pattern: /scrum/i, title: "Scrum Master Certification", skills: ["Scrum", "Agile", "Project Management"] },
    { pattern: /cyber\s*security/i, title: "Cybersecurity Certification", skills: ["Cybersecurity", "Information Security", "Network Security"] },
    { pattern: /compliance/i, title: "Compliance Training Certification", skills: ["Compliance", "Regulatory Standards", "Risk Management"] },
    { pattern: /pediatric/i, title: "Pediatric Fellowship", skills: ["Pediatrics", "Child Healthcare"] },
    { pattern: /medical\s*degree/i, title: "Medical Degree", skills: ["Medicine", "Clinical Practice", "Patient Care"] },
  ];

  let title = "";
  let skills = [];

  for (const cert of certKeywords) {
    if (cert.pattern.test(claimText)) {
      title = cert.title;
      skills = cert.skills;
      break;
    }
  }

  if (!title) {
    const words = claimText.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 3);
    const stopWords = ["completed", "finished", "earned", "received", "passed", "took", "attended", "hours", "hour", "training", "certification", "certificate", "from", "with", "that", "this", "have", "been", "last", "week", "month", "year"];
    const meaningful = words.filter(w => !stopWords.includes(w.toLowerCase()));
    title = meaningful.slice(0, 4).join(" ") || "Professional Credential";
    title = title.charAt(0).toUpperCase() + title.slice(1);
    skills = meaningful.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  }

  let issuerName = "Self-Reported";
  const issuerPatterns = [
    /(?:at|from|by|through)\s+(?:the\s+)?([A-Z][A-Za-z\s&]+(?:Hospital|University|College|Institute|Center|Academy|School|Foundation|Association|Organization|Corp|Inc|LLC|System|Health))/,
    /(?:at|from|by|through)\s+(?:the\s+)?([A-Z][A-Za-z\s&]{2,30})/,
  ];

  for (const pat of issuerPatterns) {
    const match = claimText.match(pat);
    if (match && match[1]) {
      issuerName = match[1].trim();
      break;
    }
  }

  const credentialType = VALID_CREDENTIAL_TYPES.includes(category)
    ? category
    : "professional_certification";

  return {
    title,
    issuerName,
    credentialType,
    hoursCompleted,
    skills,
    description: `${title} issued by ${issuerName}`,
    confidence: 0.4,
    expiryYears: credentialType === "medical_training" ? 2 : null,
  };
}

async function extractCredential(state) {
  const steps = [{ node: "extractCredential", timestamp: Date.now(), status: "started" }];

  if (state.claimCategory === "not_a_credential") {
    steps[0].status = "skipped";
    steps[0].reason = "Not a credential claim";
    return {
      rawCredential: null,
      reply: "It looks like your message isn't a credential claim. Could you describe a certification, course, or training you've completed? For example: 'I completed Advanced Cardiac Life Support (ACLS) certification from the American Heart Association, 16 hours.'",
      confidence: 0,
      steps,
    };
  }

  let extracted = null;
  let modelUsed = "gemini-2.5-flash";

  try {
    extracted = await geminiService.extract(geminiService.SYSTEM_PROMPT, state.claimText);
    steps[0].status = "completed";
    steps[0].model = "gemini";
  } catch (geminiErr) {
    steps[0].geminiError = geminiErr.message;

    try {
      extracted = await groqService.extract(state.claimText);
      modelUsed = "groq-llama-3.1-8b";
      steps[0].status = "completed-fallback";
      steps[0].model = "groq";
    } catch (groqErr) {
      steps[0].groqError = groqErr.message;
      extracted = localExtractCredential(state.claimText, state.claimCategory);
      modelUsed = "local-extraction";
      steps[0].status = "completed-local";
      steps[0].model = "local";
    }
  }

  return {
    rawCredential: extracted,
    confidence: extracted.confidence || 0.7,
    modelUsed,
    steps,
  };
}

async function validateEnrich(state) {
  const steps = [{ node: "validateEnrich", timestamp: Date.now(), status: "started" }];

  if (!state.rawCredential) {
    steps[0].status = "skipped";
    steps[0].reason = "No raw credential to validate";
    return { validCredential: null, steps };
  }

  const raw = state.rawCredential;
  const validated = {
    title: raw.title || "Untitled Credential",
    issuerName: raw.issuerName || "Unknown Issuer",
    credentialType: VALID_CREDENTIAL_TYPES.includes(raw.credentialType)
      ? raw.credentialType
      : state.claimCategory !== "not_a_credential"
        ? state.claimCategory
        : "professional_certification",
    hoursCompleted: Math.max(0, Math.min(50000, parseInt(raw.hoursCompleted) || 0)),
    skills: Array.isArray(raw.skills) ? raw.skills.slice(0, 20) : [],
    description: raw.description || `${raw.title || "Credential"} issued by ${raw.issuerName || "Unknown"}`,
    confidence: raw.confidence || state.confidence || 0.5,
    expiresAt: null,
    issuedAt: new Date(),
    holderAddress: state.walletAddress,
    rawClaimText: state.claimText,
    aiModel: state.modelUsed || "gemini-2.5-flash",
    aiConfidence: raw.confidence || state.confidence || 0.5,
    status: "pending",
  };

  if (raw.expiryYears && typeof raw.expiryYears === "number" && raw.expiryYears > 0) {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + raw.expiryYears);
    validated.expiresAt = expiry;
  }

  const issues = [];
  if (validated.title === "Untitled Credential") issues.push("missing_title");
  if (validated.issuerName === "Unknown Issuer") issues.push("missing_issuer");
  if (validated.hoursCompleted === 0) issues.push("missing_hours");
  if (validated.skills.length === 0) issues.push("missing_skills");

  if (issues.length > 2) {
    validated.confidence = Math.max(0.1, validated.confidence - 0.2);
  }

  const metadata = buildMetadata(validated);
  validated.metadata = metadata;
  validated.metadataURI = "";

  steps[0].status = "completed";
  steps[0].issues = issues;
  steps[0].confidence = validated.confidence;

  return {
    validCredential: validated,
    confidence: validated.confidence,
    steps,
  };
}

async function buildCalldataNode(state) {
  const steps = [{ node: "buildCalldata", timestamp: Date.now(), status: "started" }];

  if (!state.validCredential) {
    steps[0].status = "skipped";
    steps[0].reason = "No valid credential for calldata";
    return { calldata: null, contractAddress: null, steps };
  }

  try {
    const result = buildCredentialCalldata(state.validCredential, state.walletAddress);

    steps[0].status = "completed";
    steps[0].calldataLength = result.calldata.length;

    return {
      calldata: result.calldata,
      contractAddress: result.contractAddress,
      steps,
    };
  } catch (err) {
    steps[0].status = "error";
    steps[0].error = err.message;
    return {
      calldata: null,
      contractAddress: null,
      steps,
    };
  }
}

async function composeReply(state) {
  const steps = [{ node: "composeReply", timestamp: Date.now(), status: "started" }];

  let reply;

  if (state.error && !state.validCredential) {
    reply = state.reply || "I encountered an issue processing your claim. Please try again with a clearer description of your credential.";
  } else if (!state.validCredential) {
    reply = state.reply || "I couldn't identify a credential in your message. Please describe a specific certification, training, or course you've completed.";
  } else {
    const cred = state.validCredential;
    const confidencePct = Math.round((state.confidence || 0) * 100);

    const parts = [
      `✅ **Credential Identified!**\n`,
      `📜 **${cred.title}**`,
      `🏛️ Issuer: ${cred.issuerName}`,
      `📂 Type: ${cred.credentialType.replace(/_/g, " ")}`,
    ];

    if (cred.hoursCompleted > 0) {
      parts.push(`⏱️ Hours: ${cred.hoursCompleted}`);
    }

    if (cred.skills && cred.skills.length > 0) {
      parts.push(`🔧 Skills: ${cred.skills.join(", ")}`);
    }

    if (cred.expiresAt) {
      parts.push(`📅 Expires: ${new Date(cred.expiresAt).toLocaleDateString()}`);
    }

    parts.push(`\n🤖 AI Confidence: ${confidencePct}% (${state.modelUsed || "gemini"})`);

    if (state.calldata) {
      parts.push(`\n🔗 Mint transaction is ready! Review and sign the transaction in your wallet to mint this credential as an on-chain NFT.`);
    }

    reply = parts.join("\n");
  }

  try {
    const session = await safeSessionFindOne(state.sessionId);
    if (session) {
      if (!session.messages) session.messages = [];
      session.messages.push({
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      });

      if (state.validCredential) {
        session.agentMemory = {
          extractedSkills: state.validCredential.skills || [],
          mentionedOrgs: [state.validCredential.issuerName].filter(Boolean),
          estimatedLevel: estimateLevel(state.validCredential.hoursCompleted),
          conversationSummary: `Extracted ${state.validCredential.credentialType}: "${state.validCredential.title}" from ${state.validCredential.issuerName}`,
        };
      }

      await safeSessionSave(session);
    }
  } catch (err) {
    steps[0].sessionSaveError = err.message;
  }

  steps[0].status = "completed";
  steps[0].replyLength = reply.length;

  return {
    reply,
    steps,
  };
}

function estimateLevel(hours) {
  if (!hours || hours <= 0) return "unknown";
  if (hours < 20) return "beginner";
  if (hours < 100) return "intermediate";
  if (hours < 500) return "advanced";
  return "expert";
}

function buildGraph() {
  const graph = new StateGraph(CredentialState);

  graph.addNode("loadMemory", loadMemory);
  graph.addNode("classifyClaim", classifyClaim);
  graph.addNode("extractCredential", extractCredential);
  graph.addNode("validateEnrich", validateEnrich);
  graph.addNode("buildCalldata", buildCalldataNode);
  graph.addNode("composeReply", composeReply);

  graph.addEdge("__start__", "loadMemory");
  graph.addEdge("loadMemory", "classifyClaim");
  graph.addEdge("classifyClaim", "extractCredential");
  graph.addEdge("extractCredential", "validateEnrich");
  graph.addEdge("validateEnrich", "buildCalldata");
  graph.addEdge("buildCalldata", "composeReply");
  graph.addEdge("composeReply", "__end__");

  return graph.compile();
}

let compiledGraph = null;

const getGraph = () => {
  if (!compiledGraph) {
    compiledGraph = buildGraph();
  }
  return compiledGraph;
};

const runCredentialAgent = async ({ claimText, walletAddress, sessionId, userRole }) => {
  const graph = getGraph();

  const initialState = {
    claimText,
    walletAddress: walletAddress.toLowerCase(),
    sessionId: sessionId || uuidv4(),
    userRole: userRole || "learner",
  };

  const result = await graph.invoke(initialState);

  return {
    reply: result.reply,
    credential: result.validCredential,
    calldata: result.calldata,
    contractAddress: result.contractAddress,
    confidence: result.confidence,
    modelUsed: result.modelUsed,
    category: result.claimCategory,
    sessionId: result.sessionId,
    steps: result.steps,
  };
};

const explainCredential = async (type, title, hours) => {
  const prompt = `Explain what a "${title}" credential of type "${type}" with ${hours} hours means in the professional world. Keep it concise (2-3 sentences). Focus on what skills it validates and its professional value.`;

  try {
    const model = require("../config/gemini").getGeminiModel();
    const { HumanMessage } = require("@langchain/core/messages");
    const response = await model.invoke([new HumanMessage(prompt)]);
    return {
      explanation: response.content,
      type,
      title,
      hours,
    };
  } catch {
    return {
      explanation: `The "${title}" is a ${type.replace(/_/g, " ")} credential representing ${hours} hours of professional development. This credential validates specialized knowledge and skills in the field.`,
      type,
      title,
      hours,
      fallback: true,
    };
  }
};

module.exports = { runCredentialAgent, explainCredential };
