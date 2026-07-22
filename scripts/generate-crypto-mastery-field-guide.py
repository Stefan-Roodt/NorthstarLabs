from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "media" / "course-resources" / "crypto-mastery-field-guide.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

INK = HexColor("#171827")
BLUE = HexColor("#3556d8")
ACID = HexColor("#d9ff65")
PEACH = HexColor("#ffbd8a")
PAPER = HexColor("#fbf7f1")
MUTED = HexColor("#666575")
RULE = HexColor("#ddd4c8")


class Rule(Flowable):
    def __init__(self, color=RULE, thickness=0.8, space=6):
        super().__init__()
        self.color = color
        self.thickness = thickness
        self.space = space
        self.height = space * 2
        self.width = 0

    def wrap(self, available_width, available_height):
        self.width = available_width
        return available_width, self.height

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.space, self.width, self.space)


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Kicker", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=BLUE, spaceAfter=7, tracking=1.4))
styles.add(ParagraphStyle(name="TitleBig", fontName="Helvetica-Bold", fontSize=34, leading=35, textColor=INK, spaceAfter=14))
styles.add(ParagraphStyle(name="H1Guide", fontName="Helvetica-Bold", fontSize=24, leading=26, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle(name="H2Guide", fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=INK, spaceBefore=8, spaceAfter=6))
styles.add(ParagraphStyle(name="BodyGuide", fontName="Helvetica", fontSize=10, leading=15, textColor=MUTED, spaceAfter=8))
styles.add(ParagraphStyle(name="SmallGuide", fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name="CardTitle", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=INK, spaceAfter=4))
styles.add(ParagraphStyle(name="CardBody", fontName="Helvetica", fontSize=8.5, leading=12, textColor=MUTED))
styles.add(ParagraphStyle(name="QuoteGuide", fontName="Helvetica-Bold", fontSize=14, leading=20, textColor=INK, leftIndent=12, borderColor=PEACH, borderWidth=0, borderPadding=8))
styles.add(ParagraphStyle(name="Cover", parent=styles["TitleBig"], alignment=TA_CENTER, fontSize=39, leading=40, textColor=HexColor("#ffffff")))
styles.add(ParagraphStyle(name="CoverSmall", parent=styles["BodyGuide"], alignment=TA_CENTER, textColor=HexColor("#d8dae5"), fontSize=11, leading=17))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(RULE)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(22 * mm, 10 * mm, "COGNIZEN CONSULTING  |  CRYPTO MASTERY: FOUNDATIONS")
    canvas.drawRightString(188 * mm, 10 * mm, f"{doc.page}")
    canvas.restoreState()


def write_lines(count=3, height=10 * mm):
    data = [[""] for _ in range(count)]
    table = Table(data, colWidths=[166 * mm], rowHeights=[height] * count)
    table.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.6, RULE),
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#ffffff")),
    ]))
    return table


def card(title, body, number, color=BLUE):
    return Table([
        [Paragraph(number, ParagraphStyle(name=f"N{number}", fontName="Helvetica-Bold", fontSize=10, textColor=color)),
         Paragraph(f"<b>{title}</b><br/>{body}", styles["CardBody"])],
    ], colWidths=[14 * mm, 68 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#ffffff")),
        ("BOX", (0, 0), (-1, -1), 0.7, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))


story = []
story.append(Table([[Spacer(1, 35 * mm)], [Paragraph("CRYPTO MASTERY", styles["Cover"])], [Paragraph("FIELD GUIDE", styles["Cover"])], [Spacer(1, 7 * mm)], [Paragraph("Purpose. Evidence. Safety. Progress.", styles["CoverSmall"])], [Spacer(1, 38 * mm)], [Paragraph("COGNIZEN CONSULTING", styles["CoverSmall"])], [Paragraph("Powered by NorthstarLabs", styles["CoverSmall"])]], colWidths=[166 * mm], style=TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), INK),
    ("BOX", (0, 0), (-1, -1), 0, INK),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ("RIGHTPADDING", (0, 0), (-1, -1), 14),
])))
story.append(PageBreak())

story += [Paragraph("01  YOUR JOURNEY", styles["Kicker"]), Paragraph("Thirty-one modules, five stages", styles["H1Guide"]), Paragraph("Use this map to see where each topic belongs. The orientation is your starting line; Module 1.31 is your proof point.", styles["BodyGuide"]), Spacer(1, 3 * mm)]
journey = [
    ("ORIENT", "1.1-1.4", "Money, digital assets, Bitcoin origins and cryptocurrency definitions."),
    ("MECHANICS", "1.5-1.20", "Blockchains, decentralisation, assets, keys, wallets, exchanges, transactions, fees and stablecoins."),
    ("EVALUATE", "1.21-1.24", "Price, supply, tokenomics, volatility and the language used to frame claims."),
    ("PROTECT", "1.25-1.30", "Security, fraud, investment risk, responsible participation, regulation, tax and personal safety."),
    ("PROVE", "1.31", "A capstone decision and a next-stage learning plan."),
]
journey_rows = [[Paragraph(f"<b>{a}</b>", styles["CardTitle"]), Paragraph(f"<b>{b}</b>", styles["CardTitle"]), Paragraph(c, styles["CardBody"])] for a, b, c in journey]
journey_table = Table(journey_rows, colWidths=[32 * mm, 26 * mm, 108 * mm], rowHeights=[25 * mm] * 5)
journey_table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.6, RULE), ("BACKGROUND", (0, 0), (-1, -1), HexColor("#ffffff")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8)]))
story += [journey_table, Spacer(1, 6 * mm), Paragraph("The programme is educational. It does not promise a financial outcome and no exercise requires an asset purchase.", styles["SmallGuide"]), PageBreak()]

story += [Paragraph("02  THE METHOD", styles["Kicker"]), Paragraph("Learn. Do. Prove.", styles["H1Guide"]), Paragraph("Every lesson should leave you with more than recognition. Use this rhythm to turn a short explanation into durable capability.", styles["BodyGuide"]), Spacer(1, 4 * mm)]
method = Table([[card("LEARN", "Build one useful mental model and name the distinction that matters.", "01"), card("DO", "Commit to a classification, decision, calculation or scenario before reading feedback.", "02", PEACH)], [card("PROVE", "Keep a reusable explanation, checklist, score, decision rule or capstone artefact.", "03", HexColor("#5a8c64")), card("REVIEW", "Use missed answers and uncertainty as a map for revision and contextual help.", "04", HexColor("#a54f46"))]], colWidths=[82 * mm, 82 * mm], hAlign="LEFT")
method.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
story += [method, Spacer(1, 7 * mm), Paragraph("MY WEEKLY RHYTHM", styles["H2Guide"]), Paragraph("I will study on these days and times:", styles["BodyGuide"]), write_lines(2), Spacer(1, 5 * mm), Paragraph("The proof item I will keep from each module is:", styles["BodyGuide"]), write_lines(2), PageBreak()]

story += [Paragraph("03  MY LEARNING CONTRACT", styles["Kicker"]), Paragraph("Choose a capability, not a prediction", styles["H1Guide"]), Paragraph("A clear purpose helps you decide what to notice, what to practise and what evidence to keep.", styles["BodyGuide"]), Rule(), Paragraph("I am taking Crypto Mastery so that I can...", styles["H2Guide"]), write_lines(4), Spacer(1, 5 * mm), Paragraph("I will know I am progressing when I can...", styles["H2Guide"]), write_lines(4), Spacer(1, 5 * mm), Paragraph("A real situation in which this capability matters is...", styles["H2Guide"]), write_lines(3), Spacer(1, 5 * mm), Paragraph("Date and commitment", styles["H2Guide"]), write_lines(2), PageBreak()]

story += [Paragraph("04  THE CLAIM TEST", styles["Kicker"]), Paragraph("Separate evidence from excitement", styles["H1Guide"]), Paragraph("Use these questions whenever a lesson, influencer, project or market headline makes a strong claim.", styles["BodyGuide"])]
claim_rows = [[Paragraph(f"<b>{i:02d}</b>", styles["CardTitle"]), Paragraph(q, styles["CardBody"]), "NOTES"] for i, q in enumerate([
    "What exactly is being claimed - technical fact, economic opinion or future prediction?",
    "What source supports it, and can I inspect the original evidence?",
    "What assumptions must remain true for the conclusion to hold?",
    "Who benefits if I believe or act on this claim?",
    "What evidence would change my mind?",
    "What important risk, dependency or alternative explanation is missing?",
], 1)]
claim_table = Table(claim_rows, colWidths=[14 * mm, 92 * mm, 60 * mm], rowHeights=[24 * mm] * 6)
claim_table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.6, RULE), ("BACKGROUND", (0, 0), (-1, -1), HexColor("#ffffff")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 7)]))
story += [claim_table, PageBreak()]

story += [Paragraph("05  SAFETY BOUNDARIES", styles["Kicker"]), Paragraph("Protect the learner before the lesson", styles["H1Guide"]), Paragraph("These boundaries apply throughout the programme and should survive urgency, excitement and social pressure.", styles["BodyGuide"])]
safety = [
    ("SECRETS", "Never share a password, private key, recovery phrase, one-time code or authentication backup."),
    ("MONEY", "No course exercise requires you to buy an asset, use leverage or risk real funds."),
    ("LINKS", "Verify the destination and source before connecting a wallet, signing or downloading software."),
    ("IDENTITY", "Minimise personal information in public posts and screenshots."),
    ("ADVICE", "Education is not personalised legal, tax or financial advice. Use qualified professionals where needed."),
    ("PAUSE", "Urgency is a risk signal. Stop, verify independently and ask for contextual help."),
]
story += [Table([[Paragraph(f"<b>{a}</b>", styles["CardTitle"]), Paragraph(b, styles["CardBody"])] for a, b in safety], colWidths=[34 * mm, 132 * mm], rowHeights=[22 * mm] * 6, style=TableStyle([("GRID", (0, 0), (-1, -1), 0.6, RULE), ("BACKGROUND", (0, 0), (-1, -1), HexColor("#ffffff")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8)])), Spacer(1, 7 * mm), Paragraph("MY NON-NEGOTIABLE BOUNDARY", styles["H2Guide"]), write_lines(3), PageBreak()]

story += [Paragraph("06  PROGRESS RECORD", styles["Kicker"]), Paragraph("Keep one proof item per stage", styles["H1Guide"]), Paragraph("Record the strongest output, the remaining uncertainty and the next action. This is more useful than a list of pages completed.", styles["BodyGuide"])]
tracker = [["STAGE", "BEST PROOF ITEM", "WHAT REMAINS UNCLEAR", "NEXT ACTION"]]
for name in ["Orient", "Understand", "Evaluate", "Protect", "Prove"]:
    tracker.append([name, "", "", ""])
tracker_table = Table(tracker, colWidths=[27 * mm, 47 * mm, 47 * mm, 45 * mm], rowHeights=[12 * mm] + [27 * mm] * 5)
tracker_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, 0), 7), ("GRID", (0, 0), (-1, -1), 0.6, RULE), ("BACKGROUND", (0, 1), (-1, -1), HexColor("#ffffff")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 1), (-1, -1), 7)]))
story += [tracker_table, Spacer(1, 7 * mm), Paragraph("A strong finish is not certainty. It is a conclusion whose evidence, assumptions, limits and next actions are visible.", styles["QuoteGuide"])]

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=22 * mm, leftMargin=22 * mm, topMargin=21 * mm, bottomMargin=22 * mm, title="Crypto Mastery Field Guide", author="CogniZen Consulting")
doc.build(story, onFirstPage=lambda canvas, doc: None, onLaterPages=footer)
print(f"Created {OUTPUT}")
