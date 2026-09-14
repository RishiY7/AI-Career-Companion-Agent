"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Layers, FileText, Target, Hexagon, Mail, Lock, ArrowRight, Sparkles, Brain, Zap } from "lucide-react";

interface Opportunity {
  title: string;
  company: string;
  location: string;
  duration: string;
  skills: string;
  description: string;
}

export default function Home() {
  // ── view state: "landing" | "auth" ──────────────────────────────
  const [view, setView] = useState<"landing" | "auth">("landing");

  // ── auth state ───────────────────────────────────────────────────
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ── opportunities ─────────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const router = useRouter();
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/opportunities")
      .then((r) => r.json())
      .then((data) => setOpportunities(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Scroll into auth section when view flips to "auth"
  useEffect(() => {
    if (view === "auth" && authRef.current) {
      setTimeout(() => {
        authRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [view]);

  const goToAuth = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError("");
    setSuccess("");
    setView("auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const endpoint = isLogin ? "/api/login" : "/api/register";
    try {
      const body = isLogin
        ? { email, password }
        : { email, password, full_name: fullName, phone, university };
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        setLoading(false);
        return;
      }

      if (!isLogin) {
        if (fullName) localStorage.setItem("user_full_name", fullName);
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setFullName("");
        setPhone("");
        setUniversity("");
        setSuccess("Account created! Please sign in.");
        setLoading(false);
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      router.push("/dashboard");
    } catch {
      setError("Could not connect to the server");
      setLoading(false);
    }
  };

  const locationStyle = (loc: string) => {
    if (loc.toLowerCase().includes("remote")) return { bg: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "rgba(16,185,129,0.25)" };
    if (loc.toLowerCase().includes("hybrid")) return { bg: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "rgba(245,158,11,0.25)" };
    return { bg: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "rgba(99,102,241,0.25)" };
  };

  const features = [
    { icon: <Layers size={16} strokeWidth={2.5} />, label: "Semantic Matching", sub: "FAISS vector search aligns your skills to open roles.", color: "#818cf8" },
    { icon: <FileText size={16} strokeWidth={2.5} />, label: "AI Cover Letters", sub: "Tailored drafts generated in seconds with Gemini.", color: "#34d399" },
    { icon: <Target size={16} strokeWidth={2.5} />, label: "Skill Gap Analysis", sub: "Know exactly what to learn to land the job.", color: "#f472b6" },
  ];

  const landingFeatures = [
    {
      icon: <Brain size={28} strokeWidth={1.8} />,
      title: "Resume Intelligence",
      desc: "Upload once. Our AI parses your resume and extracts skills, experience, and education in seconds.",
      color: "#818cf8",
      glow: "rgba(129,140,248,0.15)",
    },
    {
      icon: <Zap size={28} strokeWidth={1.8} />,
      title: "Instant Matching",
      desc: "FAISS semantic search finds internships that truly fit your profile — not just keyword matches.",
      color: "#34d399",
      glow: "rgba(52,211,153,0.15)",
    },
    {
      icon: <Sparkles size={28} strokeWidth={1.8} />,
      title: "Interview Preparation",
      desc: "AI-generated technical questions, HR prep, and a personalised roadmap to ace any interview.",
      color: "#f472b6",
      glow: "rgba(244,114,182,0.15)",
    },
    {
      icon: <FileText size={28} strokeWidth={1.8} />,
      title: "AI Cover Letters",
      desc: "Gemini crafts tailored cover letters for every role in seconds — just pick and send.",
      color: "#38bdf8",
      glow: "rgba(56,189,248,0.15)",
    },
  ];

  // ─────────────────────────────────────────────────────────────────
  // LANDING VIEW
  // ─────────────────────────────────────────────────────────────────
  const LandingPage = () => (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #05050f 0%, #0a0a1a 50%, #050510 100%)", position: "relative", overflow: "hidden" }}>

      {/* Background decorative glows */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-15%", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: "60%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Grid mesh */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* ── NAV ─────────────────────────────────── */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 3rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}>
            <Hexagon size={20} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "1.05rem", fontWeight: 800, background: "linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            AI Career Companion
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={() => goToAuth(true)}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(200,210,255,0.75)", padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.5)"; (e.target as HTMLButtonElement).style.color = "white"; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.target as HTMLButtonElement).style.color = "rgba(200,210,255,0.75)"; }}
          >
            Sign In
          </button>
          <button
            onClick={() => goToAuth(false)}
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", border: "none", color: "white", padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", fontFamily: "inherit" }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: "860px", margin: "0 auto", textAlign: "center", padding: "6rem 2rem 4rem" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)", borderRadius: "50px", padding: "0.35rem 1rem", marginBottom: "1.75rem" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#818cf8", display: "inline-block", boxShadow: "0 0 8px #818cf8" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "1px" }}>
            Powered by Groq · Gemini · FAISS
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", color: "white", marginBottom: "1.25rem" }}>
          Your Dream Internship,{" "}
          <span style={{ background: "linear-gradient(135deg, #a5b4fc 0%, #38bdf8 50%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Powered by AI.
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{ fontSize: "1.1rem", color: "rgba(200,210,255,0.65)", lineHeight: 1.75, maxWidth: "580px", margin: "0 auto 2.5rem" }}>
          Upload your resume. Get matched to top internships in seconds. Prepare for interviews with a personal AI coach.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => goToAuth(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)", backgroundSize: "200% 200%", border: "none", color: "white", padding: "0.9rem 2rem", borderRadius: "12px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(99,102,241,0.4)", fontFamily: "inherit", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 30px rgba(99,102,241,0.4)"; }}
          >
            Get Started Free <ArrowRight size={18} />
          </button>
          <button
            onClick={() => goToAuth(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(220,225,255,0.85)", padding: "0.9rem 2rem", borderRadius: "12px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(8px)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            Sign In
          </button>
        </div>

        {/* Social proof */}
        <p style={{ marginTop: "1.75rem", fontSize: "0.8rem", color: "rgba(160,170,220,0.45)", fontWeight: 500 }}>
          No credit card required · Free forever for students
        </p>
      </div>

      {/* ── FEATURE CARDS ─────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: "1100px", margin: "0 auto", padding: "0 2rem 6rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}>
        {landingFeatures.map((f, i) => (
          <div
            key={i}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(8px)", transition: "border-color 0.2s, background 0.2s", cursor: "default" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}40`; (e.currentTarget as HTMLDivElement).style.background = f.glow; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: "1rem" }}>
              {f.icon}
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>{f.title}</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(180,190,240,0.6)", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM CTA STRIP ─────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 5, borderTop: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.04)", padding: "3rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", marginBottom: "1rem", letterSpacing: "-0.5px" }}>
          Ready to land your dream internship?
        </p>
        <button
          onClick={() => goToAuth(false)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", border: "none", color: "white", padding: "0.85rem 2rem", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(99,102,241,0.35)", fontFamily: "inherit" }}
        >
          Create Free Account <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // AUTH + OPPORTUNITIES VIEW  (existing layout, unchanged)
  // ─────────────────────────────────────────────────────────────────
  const AuthPage = () => (
    <main className="auth-layout" style={{ flexDirection: "column" }}>
      <div ref={authRef} style={{ display: "flex", flex: "1 0 auto", width: "100%", minHeight: "100vh" }}>

        {/* ── LEFT PANEL ──────────────────────────────────── */}
        <div className="auth-sidebar" style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", flex: 1.1 }}>
          {/* Decorative glows */}
          <div style={{ position: "absolute", top: "-15%", left: "-15%", width: "380px", height: "380px", background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "480px", height: "480px", background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "40%", left: "50%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* Grid mesh */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", padding: "3rem" }}>

            {/* Logo — clicking goes back to landing */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "2.5rem", cursor: "pointer" }}
              onClick={() => setView("landing")}
              title="Back to home"
            >
              <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>
                <Hexagon size={22} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.3px", background: "linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                AI Career Companion Agent for Internship Matching and Interview Preparation
              </span>
            </div>

            {/* Hero text */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "50px", padding: "0.3rem 0.8rem", marginBottom: "1rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a5b4fc", display: "inline-block" }} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Powered by Groq + Gemini
                </span>
              </div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", color: "white", marginBottom: "0.85rem" }}>
                Your Dream Internship,{" "}
                <span style={{ background: "linear-gradient(135deg, #a5b4fc 0%, #38bdf8 50%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Just One Click Away.
                </span>
              </h1>
              <p style={{ fontSize: "0.95rem", color: "rgba(200,210,255,0.7)", lineHeight: 1.7, maxWidth: "380px" }}>
                Upload your resume. AI extracts your skills and instantly matches you to the best open opportunities.
              </p>
            </div>

            {/* Feature bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "0.75rem 0.9rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px" }}>
                  <div style={{ background: `${f.color}20`, border: `1px solid ${f.color}35`, color: f.color, width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "0.1rem" }}>{f.label}</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(200,210,255,0.6)" }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT AUTH PANEL ───────────────────────────── */}
        <div className="auth-content">
          <div className="auth-box">
            <div style={{ background: "rgba(22,22,31,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "2.5rem", boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08)" }}>

              {/* Tab toggle */}
              <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px", marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                {["Sign In", "Sign Up"].map((tab, i) => {
                  const active = (i === 0) === isLogin;
                  return (
                    <button
                      key={tab}
                      onClick={() => { setIsLogin(i === 0); setError(""); }}
                      style={{ flex: 1, padding: "0.55rem", borderRadius: "7px", fontSize: "0.85rem", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s", background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", color: active ? "white" : "rgba(160,160,200,0.6)", boxShadow: active ? "0 4px 12px rgba(99,102,241,0.3)" : "none", fontFamily: "inherit" }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f0f0ff", marginBottom: "0.3rem", letterSpacing: "-0.4px" }}>
                {isLogin ? "Welcome back 👋" : "Create your account"}
              </h2>
              <p style={{ color: "rgba(160,160,200,0.65)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                {isLogin ? "Sign in to access your personalized dashboard." : "Join thousands landing top internships with AI."}
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {error && <div className="error-box">{error}</div>}
                {success && (
                  <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", borderRadius: "8px", padding: "0.65rem 1rem", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>
                    ✓ {success}
                  </div>
                )}

                {/* Register-only fields */}
                {!isLogin && (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="full-name">Full Name</label>
                      <input id="full-name" name="full_name" type="text" required className="form-input" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone</label>
                        <input id="phone" name="phone" type="tel" className="form-input" placeholder="+1 555-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="university">University</label>
                        <input id="university" name="university" type="text" className="form-input" placeholder="e.g. MIT, IIT" value={university} onChange={(e) => setUniversity(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="email-address">Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(160,160,200,0.4)", pointerEvents: "none" }} />
                    <input id="email-address" name="email" type="email" required className="form-input" style={{ paddingLeft: "2.5rem" }} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label" htmlFor="password">Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(160,160,200,0.4)", pointerEvents: "none" }} />
                    <input id="password" name="password" type="password" required className="form-input" style={{ paddingLeft: "2.5rem" }} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem", fontWeight: 700, borderRadius: "10px", border: "none", cursor: loading ? "not-allowed" : "pointer", backgroundImage: loading ? "none" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)", backgroundColor: loading ? "rgba(99,102,241,0.4)" : "transparent", backgroundSize: "200% 200%", color: "white", transition: "all 0.3s", boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.35)", animation: loading ? "none" : "gradient-shift 4s ease infinite", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
                >
                  {loading ? (
                    <>
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Processing…
                    </>
                  ) : isLogin ? (
                    <>Sign In to Dashboard →</>
                  ) : (
                    <>Create Account →</>
                  )}
                </button>
              </form>

              <div style={{ marginTop: "1.5rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
                <span style={{ color: "rgba(160,160,200,0.5)", fontSize: "0.875rem" }}>
                  {isLogin ? "New here? " : "Already have an account? "}
                </span>
                <button
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", color: "#818cf8", fontFamily: "inherit" }}
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                >
                  {isLogin ? "Sign up free" : "Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BELOW: LIVE OPPORTUNITIES ───────────────────────────── */}
      <div style={{ width: "100%", padding: "4rem 3rem", background: "linear-gradient(to bottom, #0a0a10, #000)", position: "relative", zIndex: 1, borderTop: "1px solid rgba(99,102,241,0.15)" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
            <span style={{ position: "relative", display: "inline-flex", width: "12px", height: "12px" }}>
              <span className="opp-ping" style={{ width: "12px", height: "12px" }} />
              <span style={{ position: "relative", display: "inline-flex", borderRadius: "50%", width: "12px", height: "12px", background: "#22c55e" }} />
            </span>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "1px", textTransform: "uppercase", color: "rgba(200,210,255,0.9)" }}>
              Live Internships — {opportunities.length} Open Now
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {opportunities.length === 0 ? (
              <div style={{ color: "rgba(160,160,200,0.5)", fontSize: "1rem", paddingTop: "1.5rem" }}>Loading opportunities…</div>
            ) : (
              opportunities.map((opp, i) => {
                const lc = locationStyle(opp.location);
                const skillList = opp.skills.split(",");
                return (
                  <div key={i} className="opp-card" style={{ padding: "1.25rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#e0e7ff", lineHeight: 1.3, marginBottom: "0.2rem" }}>{opp.title}</div>
                        <div style={{ fontSize: "0.85rem", color: "rgba(160,170,240,0.7)", fontWeight: 500 }}>{opp.company}</div>
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "50px", background: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {opp.location.split(" - ")[0]}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(200,210,255,0.6)", marginBottom: "1rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {opp.description}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "rgba(130,140,200,0.6)", marginRight: "0.5rem" }}>⏱ {opp.duration}</span>
                      {skillList.slice(0, 4).map((s, si) => (
                        <span key={si} style={{ fontSize: "0.7rem", background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: 600 }}>
                          {s.trim()}
                        </span>
                      ))}
                      {skillList.length > 4 && (
                        <span style={{ fontSize: "0.7rem", color: "rgba(130,140,200,0.5)" }}>+{skillList.length - 4}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );

  return view === "landing" ? <LandingPage /> : <AuthPage />;
}
