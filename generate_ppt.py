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
    COLOR_GREEN = RGBColor(33, 132, 91)
    COLOR_RED = RGBColor(200, 75, 96)
    COLOR_NAVY = RGBColor(23, 36, 67)

    def add_header(slide, title_text, category_text="SKILLRETAIN • PROJECT REVIEW 2"):
        # Header banner text box
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.1))
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
        p2.font.size = Pt(26)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_DARK
        p2.space_before = Pt(4)

    def add_card(slide, left, top, width, height, bg_color=COLOR_WHITE, border_color=COLOR_CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
        return shape

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = COLOR_NAVY
    bg1.line.fill.background()

    # Title box
    tb = s1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(11), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "CLOUD-NATIVE INTELLIGENT RETENTION PLATFORM"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(165, 140, 255)

    p = tf.add_paragraph()
    p.text = "SkillRetain"
    p.font.size = Pt(56)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.space_before = Pt(8)

    p = tf.add_paragraph()
    p.text = "Memory-Decay Adaptive Skill Retention System with Serverless AWS Cloud Architecture"
    p.font.size = Pt(22)
    p.font.color.rgb = RGBColor(220, 225, 240)
    p.space_before = Pt(12)

    p = tf.add_paragraph()
    p.text = "Project Review 2  |  Department of Computer Science & Engineering"
    p.font.size = Pt(14)
    p.font.color.rgb = RGBColor(170, 180, 210)
    p.space_before = Pt(40)

    p = tf.add_paragraph()
    p.text = "Stack: React 18 • AWS Amplify • AWS Cognito • API Gateway • AWS Lambda • DynamoDB"
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(140, 155, 190)
    p.space_before = Pt(8)

    # -------------------------------------------------------------
    # SLIDE 2: Problem Statement & Motivation
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "The Problem: The 'Illusion of Competence' & Knowledge Decay")

    # Card 1: Ebbinghaus Curve
    c1 = add_card(s2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "1. Ebbinghaus Forgetting Curve"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf1.add_paragraph()
    p.space_before = Pt(14)
    p.text = "• Cognitive research confirms that up to 70% of non-practiced technical knowledge is forgotten within 48 to 72 hours.\n\n• Traditional tutorials provide temporary familiarity rather than lasting neural retention.\n\n• Without systematic recall, users constantly re-learn the same fundamentals from scratch."
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_DARK

    # Card 2: LMS Limitations
    c2 = add_card(s2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2. Shortcomings of Existing Platforms"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf2.add_paragraph()
    p.space_before = Pt(14)
    p.text = "• Binary 'Completed' Model: Coursera, Udemy, and LeetCode treat completion as permanently done.\n\n• Zero Time-Decay Awareness: Once a certificate or badge is issued, no system tracks memory erosion.\n\n• Disconnected Skills: Learning complex topics fails when unseen foundational prerequisites decay silently."
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_DARK

    # Card 3: Our Objective
    c3 = add_card(s2, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0))
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "3. SkillRetain's Mission"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf3.add_paragraph()
    p.space_before = Pt(14)
    p.text = "• Continuous Knowledge Modeling: Replace static progress bars with active retention percentages (0-100%).\n\n• Algorithmic Revision: Automatically compute exact urgency scores based on recency, mastery, and dependencies.\n\n• Frictionless Cloud Engine: Serverless cloud tier that guarantees fast, secure, multi-tenant persistence."
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 3: What Does The Application Do?
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "System Capabilities: Core Functional Modules")

    cards_s3 = [
        ("Dynamic Retention Engine", "Monitors time elapsed since last practice and applies proficiency-based decay rates to compute current real retention percentage in real-time.", Inches(0.8), Inches(1.8)),
        ("Prerequisite Dependency Graph", "Links skills hierarchically. If a foundational skill (e.g., Recursion) decays below 70%, connected skills (e.g., Trees) automatically raise alarm priority.", Inches(6.8), Inches(1.8)),
        ("Interactive Practice Quizzes", "Skill-tailored interactive assessments. Scoring algorithms evaluate comprehension and dynamically restore retention back to peak levels upon completion.", Inches(0.8), Inches(4.3)),
        ("Priority Recommendations & Analytics", "Intelligent priority ranking identifies the #1 skill needing review. Features 7-day session distribution graphs and category performance breakdowns.", Inches(6.8), Inches(4.3))
    ]

    for title, desc, l, t in cards_s3:
        c = add_card(s3, l, t, Inches(5.7), Inches(2.2))
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = COLOR_PRIMARY
        p = tf.add_paragraph()
        p.space_before = Pt(8)
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 4: Novelty & Unique Contributions
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Innovation & Novelty: Why SkillRetain is Distinct")

    table_shape = s4.shapes.add_table(5, 3, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.9))
    tbl = table_shape.table
    tbl.columns[0].width = Inches(3.2)
    tbl.columns[1].width = Inches(4.2)
    tbl.columns[2].width = Inches(4.3)

    headers = ["Evaluation Metric", "Conventional Platforms (LeetCode, Udemy)", "SkillRetain (Our System)"]
    for i, h in enumerate(headers):
        cell = tbl.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_PRIMARY
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = COLOR_WHITE

    rows = [
        ("Retention Model", "Binary: Completed vs Not Completed. Static.", "Dynamic mathematical decay over elapsed time."),
        ("Proficiency Adaptability", "Identical syllabus pace for all users.", "Proficiency-calibrated decay (Beginner = 4%/day, Advanced = 2%/day)."),
        ("Skill Interdependence", "Modules treated as isolated silos.", "Dependency Graph with automatic cascading priority penalties."),
        ("Revision Prioritization", "Passive user choice; learner must guess what to review.", "Algorithmic Priority Index scoring the exact next best review.")
    ]

    for r_idx, (col0, col1, col2) in enumerate(rows, start=1):
        for c_idx, text in enumerate([col0, col1, col2]):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = text
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(255, 255, 255) if r_idx % 2 == 1 else RGBColor(245, 242, 255)
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(12)
            p.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 5: Mathematical Modeling & Algorithms
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Mathematical Foundation: Retention Decay & Priority Index")

    c1 = add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "1. Time-Decayed Retention Formula"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    p = tf1.add_paragraph()
    p.space_before = Pt(12)
    p.text = "R(t) = max( 0, min( 100, R_base - Δt * decayRate ) )"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    p = tf1.add_paragraph()
    p.space_before = Pt(10)
    p.text = "Where:\n• Δt = Days elapsed since last practice session\n• decayRate is inversely proportional to expertise:\n    - Beginner: 4% per day (fragile mental schema)\n    - Intermediate: 3% per day\n    - Advanced: 2% per day (stable schema)\n\n• Immediate Feedback: Taking a quiz and scoring 100% replenishes retention to 100% and updates the lastPracticed timestamp."
    p.font.size = Pt(12.5)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2. Multi-Factor Priority Index Formula"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    p = tf2.add_paragraph()
    p.space_before = Pt(12)
    p.text = "Priority(S) = (100 - R_S) + min(Δt * 2, 30) + P_prof + P_dep"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    p = tf2.add_paragraph()
    p.space_before = Pt(10)
    p.text = "Where:\n• (100 - R_S): Primary mastery deficit (loss of retention)\n• min(Δt * 2, 30): Inactivity penalty cap of 30 points\n• P_prof: Beginner revision boost (+5 points)\n• P_dep (Dependency Guard):\n    For each prerequisite skill with R < 70%, adds +15 points to prioritize foundational recovery.\n\n• Result: Dynamically bubbles the most vulnerable skill to the top of the user's dashboard."
    p.font.size = Pt(12.5)
    p.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 6: AWS Cloud Architecture
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Cloud Architecture: Serverless AWS Multi-Tier Design")

    # 4 Architecture stages
    stages = [
        ("1. Client Tier", "React 18 + Vite SPA\nAWS Amplify SDK\n• Local State & Routing\n• Responsive Dashboard\n• Offline Fallback", Inches(0.8), COLOR_NAVY),
        ("2. Identity Tier", "Amazon Cognito\nPool: ap-southeast-2\n• User Authentication\n• JWT Token Issuance\n• Multi-Tenant Isolation", Inches(3.8), COLOR_PRIMARY),
        ("3. Gateway & API", "Amazon API Gateway\nvujdg9i4ob.execute-api\n• HTTPS SSL Termination\n• Cognito JWT Authorizer\n• RESTful Routing & CORS", Inches(6.8), COLOR_DARK),
        ("4. Compute & Data", "AWS Lambda + DynamoDB\nServerless Microservices\n• /skills (CRUD)\n• /practice (Scoring)\n• /history (Analytics)", Inches(9.8), RGBColor(60, 40, 110))
    ]

    for title, text, left, col in stages:
        c = add_card(s6, left, Inches(1.8), Inches(2.7), Inches(5.0), bg_color=COLOR_WHITE)
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = col
        p = tf.add_paragraph()
        p.space_before = Pt(14)
        p.text = text
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 7: Why AWS Architecture Was Chosen
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Architectural Justification: Why This AWS Stack?")

    reasons = [
        ("Amazon Cognito: Zero-Friction Security", "• Why: Avoids storing plaintext passwords or rolling custom hashing/session code.\n• Impact: Issues signed OIDC/OAuth 2.0 JWT tokens with claims verified directly at the API Gateway level.\n• Security: User IDs (sub) strictly isolate multi-tenant data."),
        ("Amazon API Gateway: Managed Edge Gateway", "• Why: Eliminates manual reverse proxy setup (Nginx/HAProxy) and custom certificate managers.\n• Impact: Native Cognito Authorizers validate incoming Bearer tokens before requests ever touch Lambda compute.\n• Resilience: Built-in throttling, DDoS defense, and CORS control."),
        ("AWS Lambda: True Event-Driven Serverless Compute", "• Why: Traditional EC2 instances incur 24/7 idle server costs when users aren't practicing.\n• Impact: Zero idle cost; scales instantly from 0 to 10,000 requests during exam/revision peaks.\n• Agility: Independent microservices for skills, practice submissions, and history."),
        ("Amazon DynamoDB: High-Speed NoSQL Persistence", "• Why: Unpredictable schema needs (dynamic arrays of dependencies and quiz metadata).\n• Impact: Single-digit millisecond response times. Key-value access pattern: PK = userId, SK = skillId.\n• Reliability: Fully managed high availability with automatic replication.")
    ]

    for idx, (title, text) in enumerate(reasons):
        l = Inches(0.8) if idx % 2 == 0 else Inches(6.8)
        t = Inches(1.8) if idx < 2 else Inches(4.4)
        c = add_card(s7, l, t, Inches(5.7), Inches(2.3))
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
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 8: Complete End-to-End Data Flow
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "End-to-End Execution Flow: Practice & Recalibration")

    steps = [
        ("Step 1: Auth Handshake", "User authenticates through AWS Amplify UI -> Cognito User Pool validates credentials and returns signed JWT Access Token.", Inches(0.8), Inches(1.8)),
        ("Step 2: Authorized Request", "React frontend invokes authorizedFetch() -> Dispatches HTTPS request to API Gateway with Authorization: Bearer <token>.", Inches(0.8), Inches(3.0)),
        ("Step 3: Gateway Verification", "API Gateway evaluates token authenticity against Cognito Authorizer -> Routes valid request to target Lambda microservice.", Inches(0.8), Inches(4.2)),
        ("Step 4: Persistence & Decay Update", "Lambda reads/updates Amazon DynamoDB (SkillsTable & HistoryTable) -> Client recalculates retention & priorities and renders dashboard.", Inches(0.8), Inches(5.4))
    ]

    for title, text, l, t in steps:
        c = add_card(s8, l, t, Inches(11.7), Inches(1.0))
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = COLOR_PRIMARY
        p = tf.add_paragraph()
        p.space_before = Pt(3)
        p.text = text
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 9: Review 2 Implementation Status
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Review 2 Deliverables: Implementation Status")

    modules = [
        ("Frontend & UX", "Completed", [
            "React 18 SPA built with Vite for sub-second hot reload",
            "Dashboard with real-time stats and retention health widgets",
            "Full Skill Management (Create, Edit, Delete, Filter, Search)",
            "Practice Engine with real-time scoring and retention recovery",
            "Skills by Category distribution analytics panel"
        ], Inches(0.8)),
        ("Cloud Infrastructure", "Completed & Integrated", [
            "AWS Amplify configured for Asia Pacific (ap-southeast-2)",
            "Cognito User Pool authentication with JWT token lifecycle",
            "REST API Gateway routing: /skills, /practice, /history",
            "CORS and token-based multi-tenant user isolation",
            "Client error boundaries with offline fallback resilience"
        ], Inches(4.8)),
        ("Algorithmic Engine", "Fully Implemented", [
            "Continuous Ebbinghaus time-decay mathematical model",
            "Proficiency-calibrated decay rates (2% to 4% per day)",
            "Recursive prerequisite dependency degradation penalty",
            "Dynamic Priority Index calculating exact revision needs",
            "Rolling 7-day practice activity distribution tracking"
        ], Inches(8.8))
    ]

    for title, status, bullets, l in modules:
        c = add_card(s9, l, Inches(1.8), Inches(3.7), Inches(5.0))
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = COLOR_PRIMARY

        p_status = tf.add_paragraph()
        p_status.text = f"Status: {status}"
        p_status.font.size = Pt(11)
        p_status.font.bold = True
        p_status.font.color.rgb = COLOR_GREEN
        p_status.space_before = Pt(4)

        p_body = tf.add_paragraph()
        p_body.space_before = Pt(12)
        p_body.text = "\n\n".join([f"• {b}" for b in bullets])
        p_body.font.size = Pt(11.5)
        p_body.font.color.rgb = COLOR_DARK

    # -------------------------------------------------------------
    # SLIDE 10: Conclusion & Roadmap (Review 3)
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Summary & Future Roadmap (Toward Review 3)")

    c1 = add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "Key Takeaways from Review 2"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf1.add_paragraph()
    p.space_before = Pt(14)
    p.text = "• Proactive Learning Retention: SkillRetain successfully transforms standard static learning trackers into an active, scientifically grounded memory decay engine.\n\n• True Serverless Scalability: Leveraging Amazon Cognito, API Gateway, AWS Lambda, and DynamoDB achieves high availability with zero server administration.\n\n• Verified Architecture: Successfully validates end-to-end data pipelines from authentication to dynamic priority calculation."
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_DARK

    c2 = add_card(s10, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Roadmap for Final Review (Review 3)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p = tf2.add_paragraph()
    p.space_before = Pt(14)
    p.text = "1. Automated Retention Alerts (AWS EventBridge + SNS):\n    Scheduled background cron jobs sending SMS/Email reminders when a skill's retention drops below 60%.\n\n2. AI-Powered Dynamic Assessments (Amazon Bedrock):\n    Integrate generative AI to synthesize context-aware practice questions rather than static banks.\n\n3. Production Edge CDN Deployment:\n    Deploy Vite SPA on AWS Amplify Hosting or Amazon CloudFront + S3 with global edge caching."
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_DARK

    # Output file
    output_path = os.path.abspath("SkillRetain_Project_Review_2.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_presentation()
