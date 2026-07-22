from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "media" / "course-resources" / "module-1-4-what-is-cryptocurrency-design-map.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

INK, BLUE, LIME, PEACH, MUTED, RULE, WHITE = map(
    HexColor, ["#171827", "#3556d8", "#d9ff65", "#ffbd8a", "#666575", "#ddd4c8", "#ffffff"]
)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="K", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=BLUE, spaceAfter=7, tracking=1.2))
styles.add(ParagraphStyle(name="T", fontName="Helvetica-Bold", fontSize=30, leading=34, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle(name="B", fontName="Helvetica", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=8))
styles.add(ParagraphStyle(name="H", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=INK, spaceBefore=8, spaceAfter=6))
styles.add(ParagraphStyle(name="S", fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name="TH", fontName="Helvetica-Bold", fontSize=6.5, leading=8, textColor=WHITE))
styles.add(ParagraphStyle(name="Cover", fontName="Helvetica-Bold", fontSize=34, leading=36, textColor=WHITE, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="CoverS", fontName="Helvetica", fontSize=11, leading=16, textColor=HexColor("#d8dae5"), alignment=TA_CENTER))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(RULE)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(22 * mm, 10 * mm, "COGNIZEN CONSULTING  |  MODULE 1.4 DESIGN MAP")
    canvas.drawRightString(188 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()

def lines(rows, height=9 * mm):
    t = Table([[""] for _ in range(rows)], colWidths=[166 * mm], rowHeights=[height] * rows)
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), .6, RULE), ("BACKGROUND", (0, 0), (-1, -1), WHITE)]))
    return t

def grid(data, widths, heights):
    t = Table(data, colWidths=widths, rowHeights=heights)
    t.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), .6, RULE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("BACKGROUND", (0, 0), (-1, 0), INK),
            ]
        )
    )
    return t

story = [
    Table(
        [
            [Spacer(1, 32 * mm)],
            [Paragraph("WHAT IS A CRYPTOCURRENCY?", styles["Cover"])],
            [Spacer(1, 6 * mm)],
            [Paragraph("MODULE 1.4 DESIGN MAP", styles["CoverS"])],
            [Spacer(1, 35 * mm)],
            [Paragraph("Definition before labels. Control before confidence.", styles["CoverS"])],
            [Spacer(1, 20 * mm)],
            [Paragraph("COGNIZEN CONSULTING", styles["CoverS"])],
        ],
        colWidths=[166 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), INK),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ]
        ),
    ),
    PageBreak(),
]

story += [
    Paragraph("01  DEFINITION ENGINE", styles["K"]),
    Paragraph("A token is a design claim", styles["T"]),
    Paragraph("Use these five checks before comparing projects.", styles["B"]),
]
rows = [[Paragraph(x, styles["TH"]) for x in ["DIMENSION", "QUESTION", "CHECK", "EVIDENCE SOURCE"]]]
for item in [
    ("Unit", "What is the tracked claim or unit?", "Specify redemption, reward, access or settlement meaning.", "Whitepaper / protocol docs"),
    ("Ledger", "Who tracks ownership?", "Define on-chain records, database records and custody rights.", "Explorer / architecture references"),
    ("Validation", "Who validates changes?", "Check node diversity, consensus and policy rules.", "Consensus and node docs"),
    ("Control", "Who changes critical rules?", "Map governance and emergency mechanisms.", "Governance docs"),
    ("Purpose", "Why is it used repeatedly?", "Identify practical utility, fee flows and participant incentives.", "Usage model and economics"),
]:
    rows.append([Paragraph(item[0], styles["S"]), Paragraph(item[1], styles["S"]), Paragraph(item[2], styles["S"]), Paragraph(item[3], styles["S"])])
story += [
    grid(rows, [30 * mm, 47 * mm, 52 * mm, 37 * mm], [12 * mm] + [20 * mm] * 5),
    Spacer(1, 4 * mm),
    Paragraph("Draft a one-sentence definition from these five checks.", styles["H"]),
    lines(2),
    PageBreak(),
]

story += [
    Paragraph("02  DECENTRALISED SPECTRUM", styles["K"]),
    Paragraph("A control surface is more useful than a slogan", styles["T"]),
    Paragraph("Score each layer independently and keep the profile honest.", styles["B"]),
]
rows = [[Paragraph(x, styles["TH"]) for x in ["SURFACE", "SCALE", "WEAK SIGNAL", "STRONG SIGNAL"]]]
for item in [
    ("Validation", "Most important layer", "Small validator concentration", "Distributed validation and policy diversity"),
    ("Custody", "User control layer", "Mostly custodial usage", "Practical private custody paths"),
    ("Governance", "Update layer", "Centralised upgrades", "Constrained multi-party process"),
    ("Infrastructure", "Operations layer", "Single cloud or API dependency", "Vendor-diverse runtime"),
    ("Development", "Upgrade path", "Single maintainer dependency", "Visible distributed maintenance"),
]:
    rows.append([Paragraph(item[0], styles["S"]), "", Paragraph(item[2], styles["S"]), Paragraph(item[3], styles["S"])])
story += [
    grid(rows, [30 * mm, 41 * mm, 58 * mm, 37 * mm], [12 * mm] + [18 * mm] * 5),
    Spacer(1, 4 * mm),
    Paragraph("Profile summary", styles["H"]),
    lines(2),
    PageBreak(),
]

story += [
    Paragraph("03  TRANSACTION FLOW", styles["K"]),
    Paragraph("Authorised is not equal to safe", styles["T"]),
    Paragraph("Capture the journey from intent to confidence.", styles["B"]),
]
rows = [[Paragraph(x, styles["TH"]) for x in ["STEP", "WHAT HAPPENS", "FAILURE MODE", "WHAT YOU CHECK"]]]
for item in [
    ("Authorise", "Holder signs a transaction with a valid key", "Wrong key/path or social engineering", "Key custody and signing hygiene"),
    ("Propagate", "Peers check format and funds", "Policy reject or relay limits", "Broadcast and mempool conditions"),
    ("Include", "Producer includes in ordered candidate", "Selection delay or temporary rejection", "Inclusion rules and fee logic"),
    ("Confirm", "Chain history extends with history depth", "Reorg risk and finality assumptions", "Probabilistic / deterministic rules"),
]:
    rows.append([Paragraph(item[0], styles["S"]), Paragraph(item[1], styles["S"]), Paragraph(item[2], styles["S"]), Paragraph(item[3], styles["S"])])
story += [
    grid(rows, [22 * mm, 47 * mm, 47 * mm, 50 * mm], [12 * mm] + [21 * mm] * 4),
    Spacer(1, 4 * mm),
    Paragraph("Design a safe user workflow for the flow above.", styles["H"]),
    lines(3),
    PageBreak(),
]

story += [
    Paragraph("04  PROOF OF LEARNING", styles["K"]),
    Paragraph("Turn understanding into a bounded conclusion", styles["T"]),
    Paragraph("Answer these prompts to convert theory into decisions.", styles["B"]),
]
for prompt in [
    "Define one project in one sentence using unit, ledger, validation, control and purpose.",
    "Rate decentralisation across five layers for that project.",
    "Explain a real risk that remains after protocol validation.",
    "Map what you will verify before using a project operationally.",
    "Write your final conclusion with two assumptions and two limits.",
]:
    story += [Paragraph(prompt, styles["H"]), lines(2), Spacer(1, 2 * mm)]
story += [
    Table(
        [
            [Paragraph("KEEP THIS", styles["K"]), Paragraph("Treat cryptocurrency as an engineering claim about control and claims, not as a slogan. A strong answer is explicit, bounded, and testable.", styles["H"])],
        ],
        colWidths=[31 * mm, 135 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), HexColor("#eef0ff")),
                ("BOX", (0, 0), (-1, -1), .7, LIME),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        ),
    )
]

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=22 * mm, leftMargin=22 * mm, topMargin=21 * mm, bottomMargin=22 * mm, title="Module 1.4 What Is Cryptocurrency Design Map", author="CogniZen Consulting")
doc.build(story, onFirstPage=lambda canvas, doc: None, onLaterPages=footer)
print(f"Created {OUTPUT}")
