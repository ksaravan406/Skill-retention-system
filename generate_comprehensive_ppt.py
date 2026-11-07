import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme colors
    COLOR_BG = RGBColor(248, 247, 252)         # Soft lavender-white
    COLOR_PRIMARY = RGBColor(112, 71, 215)      # Royal Purple #7047d7
    COLOR_DARK = RGBColor(32, 26, 54)           # Deep slate text
    COLOR_MUTED = RGBColor(119, 114, 140)       # Gray-purple muted
    COLOR_WHITE = RGBColor(255, 255, 255)
    COLOR_CARD_BORDER = RGBColor(230, 221, 255)
    COLOR_GREEN = RGBColor(16, 163, 112)
    COLOR_RED = RGBColor(225, 29, 72)
    COLOR_NAVY = RGBColor(23, 36, 67)
    COLOR_AMBER = RGBColor(217, 119, 6)

    def add_header(slide, title_text, category_text="SKILLRETAIN • ARCHITECTURE & REVIEW GUIDE"):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = category_text.upper()
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY

        p2 = tf.add_paragraph()
        p2.text = title_text
        p2.font.size = Pt(25)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_DARK
        p2.space_before = Pt(3)

    def add_card(slide, left, top, width, height, bg_color=COLOR_WHITE, border_color=COLOR_CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
        return shape

    # =============================================================
    # SLIDE 1: Title Slide
    # =============================================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = COLOR_NAVY
    bg1.line.fill.background()

    tb = s1.shapes.add_textbox(Inches(1.0), Inches(1.3), Inches(11.3), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "CLOUD ARCHITECTURE, COST OPTIMIZATION & SYSTEM DESIGN"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(165, 140, 255)

    p = tf.add_paragraph()
    p.text = "SkillRetain"
    p.font.size = Pt(52)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "Memory-Decay Adaptive Retention Platform with Serverless AWS Cloud & Gemini AI"
    p.font.size = Pt(20)
    p.font.color.rgb = RGBColor(220, 225, 240)
    p.space_before = Pt(10)

    p = tf.add_paragraph()
    p.text = "Project Review & Viva Defense Presentation"
    p.font.size = Pt(14)
    p.font.color.rgb = RGBColor(170, 180, 210)
    p.space_before = Pt(28)

    p = tf.add_paragraph()
    p.text = "Architecture: React 18 SPA • Amazon Cognito • Amazon API Gateway • AWS Lambda • Amazon DynamoDB • Google Gemini AI"
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(140, 155, 190)
    p.space_before = Pt(8)

    # =============================================================
    # SLIDE 2: Problem Statement & Motivation
    # =============================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Problem Statement: The Knowledge Decay Epidemic")

    c1 = add_card(s2, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.3))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "1. Ebbinghaus Forgetting Curve"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf1.add_paragraph()
    p.space_before = Pt(12)
    p.text = "• Studies prove up to 70% of technical concepts are forgotten within 48 to 72 hours without active recall.\n\n• Passive learning (watching videos or reading tutorials) produces the 'illusion of competence' with zero durable synaptic consolidation.\n\n• Learners are trapped in continuous 're-learning cycles'."
    p.font.size = Pt(12.5)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s2, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.3))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2. Traditional LMS Shortcomings"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf2.add_paragraph()
    p.space_before = Pt(12)
    p.text = "• Binary Completion Model: Platforms like Udemy, Coursera, and LeetCode mark skills as permanently 'Finished'.\n\n• Zero Time Awareness: No existing system computes how long ago a subject was practiced.\n\n• Isolated Silos: Skills are treated separately without detecting prerequisite decay (e.g., Recursion decay breaking Tree traversal)."
    p.font.size = Pt(12.5)
    p.font.color.rgb = COLOR_DARK

    c3 = add_card(s2, Inches(8.8), Inches(1.6), Inches(3.7), Inches(5.3))
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "3. SkillRetain Solution"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf3.add_paragraph()
    p.space_before = Pt(12)
    p.text = "• Dynamic Memory Decay Modeling: Replaces static checkmarks with real-time retention scores (0-100%).\n\n• Automated Revision Priority: Mathematical ranking engine calculates which skill needs immediate practice.\n\n• Serverless & AI-Powered: AWS cloud multi-tenant backend + Gemini AI for guardrails and 20-question randomized quizzes."
    p.font.size = Pt(12.5)
    p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 3: System Architecture & End-to-End Flow
    # =============================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "System Architecture: Serverless 4-Tier Cloud Design")

    tiers = [
        ("1. Presentation Tier", "React 18 + Vite SPA\nThree.js 3D Cosmos\n• Responsive Dashboard\n• 3D Retention Spheres\n• Offline Fallback System", Inches(0.8), COLOR_NAVY),
        ("2. Security & Auth", "Amazon Cognito User Pool\nRegion: ap-southeast-2\n• User Signup/Signin\n• Signed JWT Tokens\n• Multi-Tenant Isolation", Inches(3.8), COLOR_PRIMARY),
        ("3. Edge & Compute", "API Gateway + Lambda\nServerless Microservices\n• Cognito JWT Authorizer\n• HTTPS SSL Termination\n• Microservice Handlers", Inches(6.8), COLOR_DARK),
        ("4. Storage & AI Tier", "DynamoDB + Gemini AI\nHigh Speed NoSQL & LLM\n• SkillsTable (State)\n• HistoryTable (Scores)\n• Gemini AI Question Engine", Inches(9.8), RGBColor(60, 40, 110))
    ]

    for title, text, left, col in tiers:
        c = add_card(s3, left, Inches(1.6), Inches(2.7), Inches(5.3))
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col
        p = tf.add_paragraph()
        p.space_before = Pt(12)
        p.text = text
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 4: AWS Technologies Used & Why Preferred
    # =============================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "AWS Technologies Used: Purpose & Architectural Preference")

    table_shape = s4.shapes.add_table(5, 3, Inches(0.8), Inches(1.6), Inches(11.7), Inches(5.3))
    tbl = table_shape.table
    tbl.columns[0].width = Inches(2.6)
    tbl.columns[1].width = Inches(4.5)
    tbl.columns[2].width = Inches(4.6)

    headers = ["AWS Technology", "Role in SkillRetain", "Why It Is Preferred Over Alternatives"]
    for i, h in enumerate(headers):
        cell = tbl.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_PRIMARY
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_WHITE

    tech_rows = [
        ("Amazon Cognito", "Handles user registration, authentication, password policies, and issues signed OIDC/OAuth2 JWT tokens.", "Eliminates custom security vulnerabilities. Native integration with API Gateway validates tokens at edge before hitting compute. 50k MAUs free forever."),
        ("Amazon API Gateway", "Central entry point exposing REST endpoints (/skills, /history, /practice) with SSL, CORS, and JWT authorizer.", "Eliminates managing Nginx/HAProxy servers. Automatically throttles traffic, prevents DDoS attacks, and routes only verified tokens to Lambda."),
        ("AWS Lambda", "Executes event-driven serverless business logic for CRUD operations, retention computation, and quiz submissions.", "No idle server costs compared to EC2 instances. Scales automatically from 0 to thousands of requests with sub-second cold starts. 1M free requests/month."),
        ("Amazon DynamoDB", "Primary serverless NoSQL database storing user skill state, retention percentages, and practice history.", "Single-digit millisecond latency at any scale. Schema flexibility for varying skill dependencies. Zero server management and zero idle cost.")
    ]

    for r_idx, (col0, col1, col2) in enumerate(tech_rows, start=1):
        for c_idx, text in enumerate([col0, col1, col2]):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = text
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(255, 255, 255) if r_idx % 2 == 1 else RGBColor(245, 242, 255)
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(11.5)
            p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 5: Why DynamoDB Over Other Databases?
    # =============================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Deep Dive: Why DynamoDB is Preferred Over RDBMS / Document DBs")

    reasons_db = [
        ("1. Perfect Access Pattern Match", "• Access pattern is strictly Key-Value:\n  Partition Key (PK): userId\n  Sort Key (SK): skillId / timestamp\n\n• Relational DBs (MySQL/PostgreSQL) require complex joins, multi-table indexing, and foreign key overhead that are completely unnecessary for this workload.\n\n• DynamoDB delivers deterministic, single-digit millisecond response times (GetItem/PutItem) irrespective of dataset size.", Inches(0.8), Inches(1.6)),
        ("2. Serverless Connection Scaling", "• Lambda Connection Exhaustion: Relational databases have strict connection pool limits. A sudden spike of 500 concurrent Lambdas will crash a traditional PostgreSQL/MySQL database unless expensive RDS Proxy is added.\n\n• DynamoDB is stateless and HTTP-based. Lambdas interact via AWS SDK without holding open database sockets, effortlessly scaling to thousands of concurrent users.", Inches(6.8), Inches(1.6)),
        ("3. Zero-Idle Cost vs $25+/Mo RDS", "• Cost Efficiency: Amazon RDS requires a dedicated instance running 24/7 (db.t4g.micro costs ~$15-30/month minimum) even when no students are practicing.\n\n• DynamoDB On-Demand Mode charges $0.00 when idle. AWS Free Tier includes 25 GB of storage and 25 write/read capacity units forever, making operational cost effectively $0.", Inches(0.8), Inches(4.4)),
        ("4. Schema Agility & Native TTL", "• Unpredictable Schemas: Different skills have varying dependency arrays, category tags, and dynamic question payloads. DynamoDB's flexible JSON-document attributes accommodate changes without schema migrations.\n\n• Automatic Lifecycle (TTL): Built-in Time-to-Live automatically purges practice history entries older than 90 days at zero CPU cost.", Inches(6.8), Inches(4.4))
    ]

    for title, text, l, t in reasons_db:
        c = add_card(s5, l, t, Inches(5.7), Inches(2.6))
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = COLOR_PRIMARY
        p = tf.add_paragraph()
        p.space_before = Pt(6)
        p.text = text
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 6: Cost Optimization Techniques
    # =============================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Cloud Cost Optimization: Maximizing Performance at $0 Idle Cost")

    c1 = add_card(s6, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "AWS Infrastructure Cost Optimization"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf1.add_paragraph()
    p.space_before = Pt(12)
    p.text = "1. 100% Serverless Execution Model:\n   • Eliminates 24/7 EC2 provisioning. Compute cost is billed only for the exact milliseconds a Lambda runs (typically 40-120ms per API call).\n\n2. DynamoDB On-Demand Capacity:\n   • Replaces fixed capacity provisioning. Billed strictly per million read/write request units, avoiding over-provisioned idle spend.\n\n3. Free-Tier Maximization:\n   • Amazon Cognito: 50,000 Monthly Active Users (MAUs) free.\n   • AWS Lambda: 1 Million free invocations + 3.2M seconds compute.\n   • DynamoDB: 25 GB free storage + 25 RCU/WCU.\n\n4. JWT Token Client Caching:\n   • Validated Cognito tokens are stored in browser memory, avoiding redundant auth network calls on every navigation."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s6, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Gemini AI Cost & Token Optimization"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf2.add_paragraph()
    p.space_before = Pt(12)
    p.text = "1. Flash-Lite Model Tiering:\n   • Leverages lightweight models (gemini-3.1-flash-lite & gemini-3.5-flash) providing 90% lower token cost than Pro models while retaining high question quality.\n\n2. Strict Structured JSON Schemas:\n   • Enforces direct JSON mode output without conversational filler tokens, reducing output token consumption by ~35%.\n\n3. Heuristic Pre-Validation Filter:\n   • Client executes regex checks for obvious keyboard spam (e.g. repeated characters) before calling Gemini API, saving API quota.\n\n4. Resilient Multi-Model Failover:\n   • Automatically falls back between models upon 503 demand spikes, preventing paid retry loops and failed sessions."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 7: Mathematical Model & Retention Decay
    # =============================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Mathematical Foundation: Ebbinghaus Time-Decay & Priority Index")

    c1 = add_card(s7, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "Time-Decayed Retention Formula"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    p = tf1.add_paragraph()
    p.space_before = Pt(10)
    p.text = "R(t) = max( 0, min( 100, R_base - Δt * decayRate ) )"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    p = tf1.add_paragraph()
    p.space_before = Pt(10)
    p.text = "Parameters:\n• Δt: Days elapsed since last practice timestamp.\n• decayRate: Calibrated to user proficiency:\n    - Beginner: 4% per day (fragile mental schema)\n    - Intermediate: 3% per day (moderate retention)\n    - Advanced: 2% per day (durable consolidation)\n\n• Scoring Recovery:\n  Completing a quiz and scoring 100% resets retention to 100% and resets the decay timer.\n  Partial scores restore retention proportionally to assessment accuracy."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s7, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Multi-Factor Priority Index Formula"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    p = tf2.add_paragraph()
    p.space_before = Pt(10)
    p.text = "Priority(S) = (100 - R_S) + min(Δt * 2, 30) + P_prof + P_dep"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    p = tf2.add_paragraph()
    p.space_before = Pt(10)
    p.text = "Components:\n• (100 - R_S): Primary mastery deficit (loss of retention)\n• min(Δt * 2, 30): Inactivity penalty capped at 30 points\n• P_prof: Beginner revision boost (+5 points)\n• P_dep (Prerequisite Dependency Guard):\n    If any prerequisite skill (e.g. Recursion) has R < 70%, adds +15 points to prioritize foundational recovery.\n\n• Outcome: Automatically bubbles the most vulnerable, high-impact skill to the top of the user's dashboard."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 8: Gemini AI Integration: Guardrails & Dynamic Quizzes
    # =============================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Gemini AI Engine: Input Guardrails & 20-Question Assessments")

    c1 = add_card(s8, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "1. AI Skill Validation (Anti-Nonsense Guardrail)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf1.add_paragraph()
    p.space_before = Pt(10)
    p.text = "• Problem: Users could enter nonsense or keyboard spam (e.g., 'asdfghjk', '123444444', 'zzzxxyy').\n\n• Solution: Gemini evaluates skill name and category before persistence.\n\n• Behavior:\n  - Nonsense Detected: Error modal pops up explaining the input is unrecognized, preventing invalid database records.\n  - Valid Skill Verified: Skill is added to cloud database, and 'Skill added successfully!' popup appears."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s8, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2. Level-Calibrated 20-Question Generator"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf2.add_paragraph()
    p.space_before = Pt(10)
    p.text = "• Dynamic 20 Questions: Generates fresh, randomized questions each time practice is clicked (different seed token each session).\n\n• Strict Level Calibration:\n  - Beginner: Core syntax, basic concepts, definitions.\n  - Intermediate: Practical code reasoning, debugging, patterns.\n  - Advanced: Deep internals, memory mechanics, optimization.\n\n• Real-Time Answer Highlighting: Correct options highlight green (✓), chosen wrong options highlight red (✗), with immediate explanation banner."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 9: Post-Quiz Analysis & Concept Mastery Breakdown
    # =============================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Post-Quiz Feedback & Concept Mastery Analysis")

    c1 = add_card(s9, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "Performance Classification & Retake Policy"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf1.add_paragraph()
    p.space_before = Pt(10)
    p.text = "• Score >= 70% ('Nice Work'):\n  - Positive feedback badge ('Nice Work' / 'Outstanding Mastery').\n  - Green score circle displaying exact score (e.g. 18 / 20 Correct).\n  - Option to return or practice again with fresh questions.\n\n• Score < 70% ('Needs Improvement'):\n  - Warning badge & red score indicator.\n  - Retake Callout: Informs learner that score is below target retention threshold.\n  - Prominent Primary Button: '🔄 Retake Test' immediately generates a fresh 20-question challenge to solidify retention."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s9, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Concept Breakdown: Mastered vs To Improve"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf2.add_paragraph()
    p.space_before = Pt(10)
    p.text = "• Fine-Grained Topic Tagging:\n  Every question tracks its tested subtopic (e.g. Garbage Collection, Descriptors, Recursion Base Cases).\n\n• Dual Breakdown Columns:\n  1. Mastered Concepts (✓): List of subtopics answered correctly with green badges and confirmation checkmarks.\n  2. Concepts to Improve (⚠️): List of missed subtopics with specific correction notes stating the exact right answer.\n\n• Value: Gives learners clear actionable insight on exact study areas instead of just a raw number."
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 10: Typical Review Points & Viva Evaluation Q&A
    # =============================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Typical Review Points & Viva Defense Questions")

    qa_list = [
        ("Q1: How is multi-tenant security guaranteed?", "Cognito extracts user identity ('sub' claim) into a signed JWT. API Gateway verifies the signature at the edge. Lambda extracts userId directly from the verified claims context and queries DynamoDB using that exact partition key. Users can never access or tamper with another learner's skills.", Inches(0.8), Inches(1.6)),
        ("Q2: Why not run an EC2 instance or Docker container?", "EC2 requires continuous provisioned server spend ($15-50/mo), security patching, OS updates, and manual auto-scaling configuration. Serverless Lambda and DynamoDB cost $0 when idle, scale instantly to burst traffic, and require zero infrastructure maintenance.", Inches(6.8), Inches(1.6)),
        ("Q3: What happens if Gemini API or AWS is temporarily unreachable?", "SkillRetain implements an Offline-Resilient Fallback architecture. The client maintains local state, uses regex sanity checks for skill validation, and falls back to a curated 20-question bank if the cloud endpoint is unreachable, ensuring zero user disruption.", Inches(0.8), Inches(4.4)),
        ("Q4: How does the system handle high-concurrency exams?", "DynamoDB On-Demand handles up to tens of thousands of requests per second without throttling. Lambda scales horizontally with concurrent executions, and static frontend assets are served via CDN edge caching with sub-millisecond delivery.", Inches(6.8), Inches(4.4))
    ]

    for title, text, l, t in qa_list:
        c = add_card(s10, l, t, Inches(5.7), Inches(2.6))
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = COLOR_PRIMARY
        p = tf.add_paragraph()
        p.space_before = Pt(6)
        p.text = text
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_DARK

    # =============================================================
    # SLIDE 11: Summary & Conclusion
    # =============================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Project Summary & Future Expansion")

    c1 = add_card(s11, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.3))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "Key Project Achievements"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf1.add_paragraph()
    p.space_before = Pt(12)
    p.text = "• Scientifically Grounded Learning: Built-in Ebbinghaus decay model actively fights knowledge loss instead of passive progress tracking.\n\n• Enterprise-Grade Serverless Cloud: Seamless AWS integration (Amplify, Cognito, API Gateway, Lambda, DynamoDB) achieves maximum uptime with $0 idle cost.\n\n• Intelligent AI Co-Processor: Gemini integration provides intelligent input guardrails, randomized 20-question level-adaptive tests, and fine-grained concept mastery analysis."
    p.font.size = Pt(12.5)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s11, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Future Roadmap (Review 3 & Production)"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf2.add_paragraph()
    p.space_before = Pt(12)
    p.text = "1. Automated Retention Alerts (AWS EventBridge + SNS):\n   Scheduled background cron jobs sending automated email/SMS reminders when a skill's retention drops below 60%.\n\n2. Voice & Conversational Practice (Gemini Live / Amazon Polly):\n   Verbal technical interviews with real-time speech evaluation for speaking skills.\n\n3. Edge Global Deployment:\n   Global distribution on AWS CloudFront CDN backed by Amazon S3 edge origins for sub-50ms global latency."
    p.font.size = Pt(12.5)
    p.font.color.rgb = COLOR_DARK

    # Output file
    output_path = os.path.abspath("SkillRetain_Comprehensive_Project_Review.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_presentation()
