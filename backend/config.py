# Central configuration for the AI Career Companion Agent for Internship Matching and Interview Preparation backend

# --- LLM Routing ---
# Groq: ultra-fast inference — used for RAG match evaluation and skill gap analysis
GROQ_MODEL = "groq/compound-mini"  # fastest available on this account (llama-3.1-8b-instant deprecated)

# Gemini: multimodal + long-form — used for native PDF resume parsing and cover letter generation
GEMINI_MODEL = "gemini-2.5-flash"    # Pinned stable version — best speed/quality for cover letters

# Number of top internship matches to retrieve from FAISS
TOP_K_MATCHES = 3
