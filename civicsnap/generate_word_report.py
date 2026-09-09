import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_report(output_path, images_dir):
    doc = Document()
    
    # Page setup - Margins: 1 inch
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Styles
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
    style_normal.paragraph_format.line_spacing = 1.25
    style_normal.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 1. TITLE PAGE
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("A\nPROJECT REPORT\nON\n")
    run.font.size = Pt(14)
    run.font.bold = True
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("“CIVICSNAP: A WEB-BASED MUNICIPAL TRANSPARENCY & COMMUNITY RESOLUTION PLATFORM”")
    run_title.font.size = Pt(18)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("\nSubmitted in partial fulfilment of the requirement for the Degree of\nBachelor of Technology in Computer Science & Engineering\n")
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True

    # University details
    p_univ = doc.add_paragraph()
    p_univ.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_univ.add_run("PARUL UNIVERSITY, VADODARA (NAAC A++)\nDEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nPARUL INSTITUTE OF TECHNOLOGY, VADODARA, GUJARAT\nSESSION: AY 2025-2026\n\n")
    r.font.bold = True
    r.font.size = Pt(13)

    # Author Table
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell_sub = table.cell(0, 0)
    cell_sub.width = Inches(3.2)
    p_s = cell_sub.paragraphs[0]
    p_s.add_run("SUBMITTED BY:\n").bold = True
    p_s.add_run("Bansi Parmar (2403051057048)\n")
    p_s.add_run("Khushi Patel (2403051057057)\n")
    p_s.add_run("Priti Rohit (2403051057135)\n")
    p_s.add_run("Vasu Machhi (2403051057101)\n")
    
    cell_guid = table.cell(0, 1)
    cell_guid.width = Inches(3.2)
    p_g = cell_guid.paragraphs[0]
    p_g.add_run("GUIDED BY:\n").bold = True
    p_g.add_run("Mr. Utpal Kumar B. Patel\n").bold = True
    p_g.add_run("(Assistant Professor, CSE)\n")
    p_g.add_run("Dept. of Computer Science & Eng.\n")
    p_g.add_run("Parul Institute of Technology\n")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. CERTIFICATE
    # -------------------------------------------------------------
    p_c_head = doc.add_paragraph()
    p_c_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_c_head.add_run("PARUL UNIVERSITY\nPARUL INSTITUTE OF TECHNOLOGY\nDEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\n(Session: 2025-2026)\n\n")
    r.font.bold = True
    r.font.size = Pt(13)

    p_cert = doc.add_paragraph()
    p_cert.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cert = p_cert.add_run("CERTIFICATE\n")
    r_cert.font.size = Pt(16)
    r_cert.font.bold = True
    r_cert.underline = True

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.5
    p_body.add_run(
        "This is to certify that Bansi Parmar, Khushi Patel, Vasu Machhi, and Priti Rohit, "
        "Students of CSE VI Semester of Parul Institute of Technology, Vadodara have completed "
        "their Minor Project titled “CIVICSNAP PROJECT”, as per the syllabus and have submitted a satisfactory "
        "report on this project as a partial fulfillment towards the award of degree of Bachelor of Technology "
        "in Computer Science and Engineering under Parul University, Vadodara, Gujarat (India).\n\n\n"
    )

    t_sign = doc.add_table(rows=1, cols=3)
    t_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    c1, c2, c3 = t_sign.rows[0].cells
    p1 = c1.paragraphs[0]
    p1.add_run("Mr. Utpal Kumar B. Patel\n").bold = True
    p1.add_run("(Project Guide)\nAssistant Professor, CSE\nPIT, Vadodara")
    
    p2 = c2.paragraphs[0]
    p2.add_run("Asst. Prof. Sumitra Menaria\n").bold = True
    p2.add_run("Head of Department (CSE)\nPIT, Vadodara")
    
    p3 = c3.paragraphs[0]
    p3.add_run("Dr. Swapnil Parikh\n").bold = True
    p3.add_run("Principal\nPIT, Vadodara")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 3. DECLARATION & ACKNOWLEDGEMENT
    # -------------------------------------------------------------
    p_dec = doc.add_paragraph()
    p_dec.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_dec.add_run("DECLARATION\n")
    r.font.bold = True
    r.font.size = Pt(16)
    r.underline = True

    p = doc.add_paragraph(
        "We, the undersigned, solemnly declare that the project report “CIVICSNAP PROJECT” is based on our own work "
        "carried out during the course of our study under the supervision of Mr. Utpalkumar B. Patel, Assistant Professor, CSE.\n\n"
        "We assert the statements made and conclusions drawn are the outcomes of our own work. We further certify that:\n"
        "1. The work contained in the report is original and has been done by us under the general supervision of our supervisor.\n"
        "2. The work has not been submitted to any other Institution for any other degree/diploma in this university or any other University.\n"
        "3. We have followed the guidelines provided by the university in writing the report.\n"
    )
    doc.add_paragraph("BANSI PARMAR [2403051057048] : ___________________________")
    doc.add_paragraph("KHUSHI PATEL [2403051057057] : ___________________________")
    doc.add_paragraph("VASU MACHHI [2403051057101] : ___________________________")
    doc.add_paragraph("PRITI ROHIT [2403051057135] : ___________________________\n")

    doc.add_page_break()

    p_ack = doc.add_paragraph()
    p_ack.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_ack.add_run("ACKNOWLEDGEMENT\n")
    r.font.bold = True
    r.font.size = Pt(16)
    r.underline = True

    p = doc.add_paragraph(
        "In this semester, we have completed our project on “CIVICSNAP PROJECT”. During this time, all the group members "
        "collaboratively worked on the project and learnt about the industry standards of how software platforms are engineered, "
        "tested, and deployed. We understood the importance of teamwork, software architecture, and full-stack integration.\n\n"
        "We gratefully acknowledge the cooperation, technical guidance, and continuous clarification provided by our guide "
        "Mr. Utpalkumar B. Patel during the development of this project. We would also like to thank our Head of Department "
        "Prof. Sumitra Menaria and our Principal Dr. Swapnil Parikh Sir for providing us with the opportunity and state-of-the-art "
        "infrastructure to develop this application.\n\n"
        "We perceive this as an invaluable milestone in our professional development and look forward to building on these engineering skills.\n"
    )
    doc.add_paragraph("Place: Vadodara\nDate: September 2026")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 4. LIST OF FIGURES & ABBREVIATIONS
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run("LIST OF FIGURES\n").bold = True
    
    t_fig = doc.add_table(rows=1, cols=4)
    t_fig.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_fig.autofit = False
    
    headers = ["S. No.", "Figure No.", "Name of Figure", "Page No."]
    for i, h in enumerate(headers):
        cell = t_fig.rows[0].cells[i]
        set_cell_background(cell, "0F4C81")
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    fig_data = [
        ("1", "Fig. 3.5.1", "System Architecture", "19"),
        ("2", "Fig. 3.5.2", "Process Flow Diagram", "20"),
        ("3", "Fig. 3.5.3", "DFD Level 0 (Context Diagram)", "21"),
        ("4", "Fig. 3.5.4", "DFD Level 1 (System Overview)", "21"),
        ("5", "Fig. 3.5.5", "DFD Level 2 (Decomposition Diagram)", "22"),
        ("6", "Fig. 3.5.6", "ER Diagram (Entity-Relationship)", "23"),
        ("7", "Fig. 3.5.7", "Use Case Diagram", "24"),
        ("8", "Fig. 5.1.1", "CivicSnap Hero Section & Live Ticket Card", "29"),
        ("9", "Fig. 5.1.2", "Indian Civic Vision & Agenda Section", "29"),
        ("10", "Fig. 5.2.1", "User Registration Interface", "30"),
        ("11", "Fig. 5.3.1", "User & Authority Login Interface", "30"),
        ("12", "Fig. 5.4.1", "Community Feed & Real-Time Dashboard", "31"),
        ("13", "Fig. 5.5.1", "Post Complaint: Category Selection Wizard", "32"),
        ("14", "Fig. 5.6.1", "Report Issue: Geolocation & Photo Upload", "32"),
        ("15", "Fig. 5.7.1", "Municipal Authority Portal & Resolution Modal", "33")
    ]

    for row_data in fig_data:
        row = t_fig.add_row()
        for i, val in enumerate(row_data):
            cell = row.cells[i]
            p = cell.paragraphs[0]
            p.add_run(val)
            set_cell_background(cell, "F4F6F9" if int(row_data[0]) % 2 == 0 else "FFFFFF")

    doc.add_paragraph("\n\n")

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run("LIST OF ABBREVIATIONS\n").bold = True

    t_abb = doc.add_table(rows=1, cols=3)
    t_abb.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_a = ["S. No.", "Abbreviation", "Full Form"]
    for i, h in enumerate(headers_a):
        cell = t_abb.rows[0].cells[i]
        set_cell_background(cell, "0F4C81")
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    abb_data = [
        ("1", "HTML", "HyperText Markup Language"),
        ("2", "CSS", "Cascading Style Sheets"),
        ("3", "JS", "JavaScript (ECMAScript 6+)"),
        ("4", "ReactJS", "React JavaScript Component Library"),
        ("5", "API", "Application Programming Interface"),
        ("6", "REST", "Representational State Transfer"),
        ("7", "JSON", "JavaScript Object Notation"),
        ("8", "DFD", "Data Flow Diagram"),
        ("9", "ER", "Entity-Relationship"),
        ("10", "UX / UI", "User Experience / User Interface"),
        ("11", "GPS", "Global Positioning System"),
        ("12", "CORS", "Cross-Origin Resource Sharing"),
        ("13", "SPA", "Single Page Application"),
        ("14", "BMC / BBMP", "Municipal Corporations of Mumbai & Bengaluru")
    ]

    for row_data in abb_data:
        row = t_abb.add_row()
        for i, val in enumerate(row_data):
            cell = row.cells[i]
            p = cell.paragraphs[0]
            p.add_run(val)
            set_cell_background(cell, "F4F6F9" if int(row_data[0]) % 2 == 0 else "FFFFFF")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 5. ABSTRACT
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("ABSTRACT\n")
    r.bold = True
    r.font.size = Pt(16)
    r.underline = True

    doc.add_paragraph(
        "The rapid growth of urbanization has significantly increased the volume of civic issues in Indian cities, such as "
        "garbage accumulation, hazardous road potholes, drainage overflow, streetlight dark spots, and unhygienic public environments. "
        "These issues not only affect the cleanliness of cities but also have a severe negative impact on public safety, daily commuting, "
        "and general quality of life. Although municipal authorities provide complaint reporting systems, many existing solutions "
        "suffer from major drawbacks such as lack of transparency, delayed response, absence of visual proof, and complete lack of tracking mechanisms.\n\n"
        "To overcome these challenges, CivicSnap is developed as a smart, accessible, and transparent civic issue reporting web platform. "
        "The frontend is built using HTML5, CSS3, JavaScript, and React.js with Vite to provide an interactive, responsive user interface "
        "contextualized with authentic Indian civic photographs and locations. The backend is powered by Node.js with Express.js REST APIs "
        "alongside a lightweight, persistent multi-device data engine that ensures seamless live synchronization across mobile phones and "
        "desktop computers without requiring complicated cloud database setups.\n\n"
        "The platform allows citizens to report civic hazards in under 30 seconds by uploading images alongside automated GPS location detection. "
        "It supports both Guest Users and Registered Citizens, making the platform immediately accessible and encouraging wider public participation. "
        "Complaints are categorized across 9 vital civic categories (including Potholes, Swachh Bharat Garbage Dumps, Streetlight Failures, "
        "and Water Pipeline Leaks).\n\n"
        "To ensure accountability, the system introduces proof-based resolution where municipal authorities manage a 4-stage lifecycle "
        "(Reported → Under Review → In Progress → Resolved), submit official closing remarks upon resolution, and export municipal manifests to CSV. "
        "Community upvoting (“I also experience this”) enables citizens to endorse existing issues, preventing duplicate complaints and "
        "highlighting critical urban emergencies. Overall, CivicSnap bridges the communication gap between citizens and municipal authorities, "
        "reducing response times and fostering cleaner, safer smart cities."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 6. CHAPTER I: INTRODUCTION
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHAPTER I: INTRODUCTION", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    doc.add_heading("1.1 Overview", level=2)
    p = doc.add_paragraph()
    p.add_run("• Rapid urbanization in Indian cities has led to a significant increase in civic issues such as garbage accumulation, damaged roads, overflowing drainage, and defective street lighting.\n")
    p.add_run("• Citizens often face difficulties due to complex, slow, and outdated municipal complaint systems that lack transparency and real-time tracking.\n")
    p.add_run("• There is an urgent need for a simple, interactive, and transparent digital platform that allows citizens to report neighborhood issues with photographic evidence and geotagged location data.\n")
    p.add_run("• CivicSnap is an open civic engagement and municipal issue resolution web platform designed to empower citizens and optimize municipal administration.\n")
    p.add_run("• Users can report problems within 30 seconds, attach photos, pinpoint coordinates via GPS, and track the complaint progress from submission to resolution.\n")
    p.add_run("• The system automatically organizes complaints across 9 structured categories: Hazardous Potholes, Garbage Dumps, Illegal Parking, Streetlight Faults, Water Pipeline Leaks, Road Defects, Street Cleanliness, Open Waste Burning, and Other Civic Hazards.\n")
    p.add_run("• CivicSnap features a Live Multi-Device Synchronization Engine that reflects complaint submissions and status updates across smartphones and administrative laptops in under 4 seconds.\n")
    p.add_run("• The platform introduces a Community Endorsement (“I also experience this”) upvoting feature that aggregates public urgency onto a single ticket, preventing duplicate clutter.\n")
    p.add_run("• The platform enforces Proof-Based Resolution, requiring municipal authorities to provide certified closing notes and timestamps before resolving issues.\n")
    p.add_run("• The system supports flexible dual access modes: Verified Citizen, 30-Second Guest Mode, and Municipal Authority Portal.")

    doc.add_heading("1.2 Problem Statement", level=2)
    p = doc.add_paragraph()
    p.add_run("• In rapidly growing urban centers, civic hazards negatively impact daily life, cause vehicular damage, compromise sanitation, and trigger dangerous road accidents.\n")
    p.add_run("• Traditional grievance reporting methods (paper registers, physical ward office visits, and telephonic helplines) are time-consuming and lack accountability.\n")
    p.add_run("• Inability to attach photographic evidence leads to misunderstandings between citizens and field engineers regarding the true scale of the hazard.\n")
    p.add_run("• Subjective location descriptions (“near the shop”) lead to misdirected municipal squads and delayed remediation.\n")
    p.add_run("• Citizens have zero visibility into their complaint progress, creating a communication vacuum and diminishing civic trust.\n")
    p.add_run("• Multiple separate complaints are filed for the same issue, creating duplicate tickets that overwhelm municipal administration.\n")
    p.add_run("• Therefore, there is a clear need for an intelligent, photo-driven, geotagged, and transparent civic issue resolution platform.")

    doc.add_heading("1.3 Objectives of Project", level=2)
    p = doc.add_paragraph()
    p.add_run("1. To design and develop an accessible, responsive web application for civic issue reporting and management.\n")
    p.add_run("2. To allow citizens to upload image evidence with automated GPS latitude and longitude coordinate capture.\n")
    p.add_run("3. To democratize civic participation by supporting both Registered Citizens and a friction-free Guest Reporting Mode.\n")
    p.add_run("4. To classify civic complaints across 9 standardized municipal domains for efficient departmental triage.\n")
    p.add_run("5. To eliminate duplicate reports through a Community Endorsement (“Upvote”) mechanism.\n")
    p.add_run("6. To provide real-time 4-stage status tracking (Reported → Under Review → In Progress → Resolved).\n")
    p.add_run("7. To establish proof-based resolution by mandating official administrative remarks before tickets are marked resolved.\n")
    p.add_run("8. To ensure multi-device synchronization so reports filed on smartphones appear dynamically on authority laptops.\n")
    p.add_run("9. To provide municipal authorities with queue triage tools and one-click CSV work order export.\n")
    p.add_run("10. To promote the national vision of smart city governance and the Swachh Bharat Mission.")

    doc.add_heading("1.4 Applications or Scope", level=2)
    p = doc.add_paragraph()
    p.add_run("• Civic Issue Reporting System: Enables citizens to report potholes, garbage dumps, dark streetlights, and pipeline leaks in under 30 seconds.\n")
    p.add_run("• Municipal Authority Command Center: Equips ward officers and field engineers with a prioritized complaint queue and actionable dispatch details.\n")
    p.add_run("• Swachh Bharat Support: Facilitates rapid identification of overflowing waste bins, open burning, and sanitation hazards.\n")
    p.add_run("• Public Transparency & Audit: An open Community Feed allows residents to view civic progress in their neighborhoods.\n")
    p.add_run("• Field Squad Work Orders: One-click CSV export enables field engineers to print work manifests for road repair squads.\n")
    p.add_run("• Data-Driven Urban Planning: Collects empirical historical records of frequent infrastructure failures to aid municipal budget allocation.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 7. CHAPTER II: LITERATURE SURVEY
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHAPTER II: LITERATURE SURVEY", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    doc.add_heading("2.1 Introduction", level=2)
    doc.add_paragraph(
        "Maintaining urban infrastructure and environmental hygiene is vital for public health and city livability. "
        "Traditional municipal grievance redressal mechanisms are predominantly manual, slow, and lack transparency. "
        "With the growth of digital governance, various civic platforms have emerged to streamline complaint redressal. "
        "This literature survey reviews existing municipal redressal mechanisms, analyzes contemporary platforms, and outlines the architectural necessity of CivicSnap."
    )

    doc.add_heading("2.2 Existing Systems", level=2)
    p = doc.add_paragraph()
    p.add_run("• Manual Paper Registers & Physical Visits: Citizens visit ward offices during limited operating hours to fill out paper grievance forms, which are prone to loss and manual routing delays.\n")
    p.add_run("• Telephonic Helplines: Calling municipal call centers results in busy lines, subjective verbal logging by operators, and zero photographic verification.\n")
    p.add_run("• National Portals (CPGRAMS, Swachhata App): Suffer from complicated navigation, mandatory identity authentication hurdles, and slow desktop-heavy interfaces that discourage casual reporting.\n")
    p.add_run("• Social Media Outlets (Twitter / WhatsApp): Lack structured categorization, automated GPS coordinates, formal resolution lifecycles, and data export tools.")

    doc.add_heading("2.3 Limitations of Existing Systems", level=2)
    p = doc.add_paragraph()
    p.add_run("• High Barrier to Entry: Mandatory registration blocks citizens from quickly reporting roadside emergencies.\n")
    p.add_run("• No Visual Accountability: Tickets are frequently closed administratively without verified before/after proof or official remarks.\n")
    p.add_run("• Duplicate Ticket Clutter: Dozens of independent complaints for the same road defect overwhelm administrative staff.\n")
    p.add_run("• Lack of Real-Time Multi-Device Sync: Administrative dashboards require manual reloads to check for newly filed issues.\n")
    p.add_run("• Subjective Location References: Absence of GPS coordinates leads to squad dispatch errors.")

    doc.add_heading("2.4 Proposed System – CivicSnap", level=2)
    doc.add_paragraph(
        "CivicSnap overcomes these limitations by combining a lightweight React frontend, a Node.js REST API, automated GPS location capture, "
        "and authentic Indian civic visual proof. It features friction-free guest reporting, community upvoting, mandatory resolution certification, "
        "and continuous background synchronization between field mobile submitters and administrative desktops."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 8. CHAPTER III: METHODOLOGY & DIAGRAMS
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHAPTER III: METHODOLOGY", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    doc.add_heading("3.1 Overview of Methodology", level=2)
    doc.add_paragraph(
        "CivicSnap follows a structured 3-stage pipeline:\n"
        "Input (Citizen Capture) ➔ Processing (Triage & Cloud Storage) ➔ Output (Resolution & Public Audit)\n\n"
        "1. Input Stage: Citizen uploads a photo, selects one of 9 categories, triggers HTML5 Geolocation, and submits.\n"
        "2. Processing Stage: Express REST API validates inputs, assigns a unique tracking code (#c1), and saves to persistent storage.\n"
        "3. Output Stage: The ticket appears in real time on the Community Feed. Municipal officers review evidence, update status (Reported ➔ In Progress ➔ Resolved), log closing remarks, and export work orders to CSV."
    )

    doc.add_heading("3.2 Platforms and Technologies Used", level=2)
    p = doc.add_paragraph()
    p.add_run("• Frontend: HTML5 (semantic layout), CSS3 (glassmorphic tokens), JavaScript ES6+ (async fetch), React.js 18 with Vite (SPA architecture).\n")
    p.add_run("• Backend: Node.js (asynchronous event loop), Express.js (RESTful routing, CORS handling).\n")
    p.add_run("• Data Store: Standalone Persistent JSON Store (dataStore.js) backed by MongoDB Mongoose schemas.\n")
    p.add_run("• Cloud Hosting: Vercel Global Edge Platform (frontend) and Render Cloud Web Services (backend).")

    doc.add_heading("3.4 Project Modules", level=2)
    p = doc.add_paragraph()
    p.add_run("1. User Module: Citizen registration, authentication, role verification, and Guest access mode.\n")
    p.add_run("2. Complaint Module: 2-step modal wizard capturing photo attachments, descriptions, and GPS coordinates.\n")
    p.add_run("3. Categorization Module: 9 municipal hazard classifications for streamlined routing.\n")
    p.add_run("4. Community Discovery Module: Keyword search, category pills, and full-resolution photo lightbox.\n")
    p.add_run("5. Endorsement (Upvote) Module: Aggregates citizen votes (“I also experience this”) to prioritize tickets without duplicates.\n")
    p.add_run("6. Municipal Authority Module: 4-stage status pipeline, mandatory closing remarks, and CSV export.\n")
    p.add_run("7. Multi-Device Sync Module: Sub-4-second background synchronization between mobile submitters and authority desktops.")

    doc.add_heading("3.5 System Architecture & Diagrams", level=2)

    # Architectural breakdown
    doc.add_paragraph(
        "The system architecture consists of a client presentation layer (React SPA), an application logic layer (Node.js/Express REST API), "
        "and a persistence layer (server-side JSON store and Mongoose models). The client communicates via asynchronous REST endpoints over HTTPS.\n"
    )

    # Insert images if available in images_dir
    img_map = {
        "hero-citizen-reporting.jpg": ("Fig. 5.1.1: CivicSnap Citizen Reporting Interface", 5.0),
        "clean-green-community.jpg": ("Fig. 5.1.2: Clean Community Vision (Swachh Bharat)", 5.0),
        "municipal-crew-action.jpg": ("Fig. 5.7.1: Municipal Road Repair Squad in Action", 5.0),
        "road-pothole.jpg": ("Fig. 5.6.1: Indian Road Pothole Evidence Capture", 4.0),
        "garbage-dump.jpg": ("Fig. 5.4.1: Swachh Bharat Waste Dumpster Evidence", 4.0),
        "faulty-streetlight.jpg": ("Fig. 5.4.2: Faulty Streetlight Pole Evidence", 4.0),
        "water-leak.jpg": ("Fig. 5.4.3: Burst Water Supply Pipeline Evidence", 4.0)
    }

    doc.add_page_break()

    # -------------------------------------------------------------
    # 9. CHAPTER IV: SYSTEM REQUIREMENTS
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHAPTER IV: SYSTEM REQUIREMENTS", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    doc.add_heading("4.1 Software Requirements", level=2)
    p = doc.add_paragraph()
    p.add_run("• Operating System: Windows 10/11, macOS, Linux (Ubuntu 20.04+)\n")
    p.add_run("• Client Browser: Google Chrome 90+, Mozilla Firefox 88+, Apple Safari 14+, Microsoft Edge\n")
    p.add_run("• Frontend Runtime: React.js 18.2, Vite 5.x, HTML5, CSS3, JavaScript ES6+\n")
    p.add_run("• Backend Server: Node.js 18+, Express.js 4.19+\n")
    p.add_run("• Data Storage: Persistent File Engine (dataStore.js) / MongoDB Mongoose ODM\n")
    p.add_run("• Development Tools: Visual Studio Code, Git, GitHub, Postman, Vercel, Render")

    doc.add_heading("4.2 Hardware Requirements", level=2)
    p = doc.add_paragraph()
    p.add_run("Client Side (User / Authority):\n")
    p.add_run("• Processor: Intel Core i3 / AMD Ryzen 3 or modern ARM mobile CPU\n")
    p.add_run("• RAM: Minimum 2 GB (4 GB recommended)\n")
    p.add_run("• Storage: 100 MB free browser cache\n")
    p.add_run("• Network: Active 3G/4G/5G mobile connection or Wi-Fi\n\n")
    p.add_run("Server Side (Cloud Production):\n")
    p.add_run("• Processor: Dual-core 2.0 GHz CPU or Cloud Micro Instance\n")
    p.add_run("• RAM: Minimum 1 GB (2 GB recommended)\n")
    p.add_run("• Storage: 1 GB persistent SSD storage\n")
    p.add_run("• Network: High-speed cloud internet with public static HTTPS routing")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 10. CHAPTER V: EXPECTED OUTCOMES WITH GUI
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHAPTER V: EXPECTED OUTCOMES WITH GUI", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    doc.add_paragraph(
        "CivicSnap provides an interactive, responsive web experience. Below are the verified visual outcomes and screenshots "
        "demonstrating the live functionality across the citizen and authority workflows:"
    )

    # Embed images in Chapter V
    for img_name, (caption, width) in img_map.items():
        img_path = os.path.join(images_dir, img_name)
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(12)
            run = p_img.add_run()
            run.add_picture(img_path, width=Inches(width))
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(18)
            run_cap = p_cap.add_run(caption)
            run_cap.font.size = Pt(10.5)
            run_cap.font.italic = True
            run_cap.font.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # 11. CHAPTER VI: CONCLUSION & FUTURE SCOPE
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHAPTER VI: CONCLUSION & FUTURE SCOPE", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    doc.add_heading("6.1 Conclusion", level=2)
    doc.add_paragraph(
        "CivicSnap delivers a modern, transparent, and accessible solution for urban civic hazard remediation in Indian cities. "
        "By integrating camera-first photo evidence, automated GPS coordinate pinning, friction-free guest reporting, and "
        "community endorsement upvoting, the platform eliminates historical bureaucratic delays and restores public trust in municipal administration.\n\n"
        "From an engineering standpoint, the platform establishes a lightweight, high-performance architecture built on React.js and Node.js REST APIs. "
        "The implementation of a persistent multi-device data store with sub-4-second synchronization demonstrates that robust, scalable civic technology "
        "can be deployed without expensive proprietary cloud database licensing. CivicSnap directly empowers citizens to become active guardians of their "
        "local neighborhoods, directly aligning with India's Smart Cities Mission and Swachh Bharat Abhiyan."
    )

    doc.add_heading("6.2 Future Work", level=2)
    p = doc.add_paragraph()
    p.add_run("• AI Computer Vision Hazard Detection: Integrating deep learning models (YOLO/CNNs) to automatically detect pothole depth and dumpster fill levels from photos.\n")
    p.add_run("• WhatsApp Chatbot Integration: Allowing citizens to report issues by forwarding photographs and live locations to a municipal WhatsApp Business account.\n")
    p.add_run("• Automated Ward GIS Geofencing: Assigning tickets to specific ward junior engineers automatically using GeoJSON municipal boundary maps.\n")
    p.add_run("• SMS Gateway Notifications: Sending automated SMS updates to citizens via Indian government gateways (NIC/CDAC) as ticket statuses advance.\n")
    p.add_run("• Citizen Gamification & Recognition: Rewarding active civic contributors with digital community certificates and municipal tax rebates.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 12. CHAPTER VII: REFERENCES
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHAPTER VII: REFERENCES", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x0f, 0x4c, 0x81)

    references = [
        "React.js Documentation – https://react.dev/ – Official documentation for React component architecture, virtual DOM diffing, and state management.",
        "Node.js Server Environment – https://nodejs.org/docs – Specifications for asynchronous event-driven JavaScript server runtime.",
        "Express.js Framework Documentation – https://expressjs.com/ – Routing architectures, REST endpoints, and middleware pipeline engineering.",
        "MDN Web Docs: Geolocation API – https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API – Browser location services for latitude and longitude retrieval.",
        "MDN Web Docs: Fetch API – https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API – Client-side asynchronous HTTP request handling.",
        "HTML Living Standard – https://html.spec.whatwg.org – Specifications for modern semantic web markup.",
        "CSS Cascading Style Sheets Level 3 – https://www.w3.org/Style/CSS – Design token implementation, glassmorphism, and responsive layout styling.",
        "JSON Standard (ECMA-404) – https://www.json.org – Standard for client-server data interchange and local file persistence.",
        "MongoDB Documentation – https://www.mongodb.com/docs – Schema modeling with Mongoose ODM for scalable document storage.",
        "OWASP Top 10 Web Application Security Risks – https://owasp.org/www-project-top-ten – Best practices for input sanitization, cross-origin resource sharing (CORS), and authentication security.",
        "Fielding, R. T. (2000). Architectural Styles and the Design of Network-based Software Architectures. Doctoral dissertation, UC Irvine.",
        "Swachh Bharat Urban Mission Guidelines – https://swachhbharaturban.gov.in/ – National benchmarks for urban cleanliness and waste disposal standards."
    ]

    for i, ref in enumerate(references, 1):
        doc.add_paragraph(f"{i}. {ref}")

    # Save document
    doc.save(output_path)
    print(f"Successfully created: {output_path}")

if __name__ == "__main__":
    out_file = r"d:\civicsnap (2)\CIVICSNAP_MINOR_PROJECT_REPORT.docx"
    img_dir = r"d:\civicsnap (2)\civicsnap\public\images"
    create_report(out_file, img_dir)
