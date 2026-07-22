from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "media" / "course-resources" / "module-1-1-money-and-digital-assets-field-lab.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

INK = HexColor("#171827")
BLUE = HexColor("#3556d8")
ACID = HexColor("#d9ff65")
PEACH = HexColor("#ffbd8a")
MUTED = HexColor("#666575")
RULE = HexColor("#ddd4c8")
WHITE = HexColor("#ffffff")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="K", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=BLUE, spaceAfter=7, tracking=1.2))
styles.add(ParagraphStyle(name="T", fontName="Helvetica-Bold", fontSize=29, leading=31, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle(name="B", fontName="Helvetica", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=8))
styles.add(ParagraphStyle(name="H", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=INK, spaceBefore=7, spaceAfter=5))
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
    canvas.drawString(22 * mm, 10 * mm, "COGNIZEN CONSULTING  |  MODULE 1.1 FIELD LAB")
    canvas.drawRightString(188 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


def lines(rows, row_height=11 * mm):
    table = Table([[""] for _ in range(rows)], colWidths=[166 * mm], rowHeights=[row_height] * rows)
    table.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.6, RULE), ("BACKGROUND", (0, 0), (-1, -1), WHITE)]))
    return table


def grid(data, widths, heights=None, header=True):
    table = Table(data, colWidths=widths, rowHeights=heights)
    commands = [("GRID", (0, 0), (-1, -1), 0.6, RULE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7), ("BACKGROUND", (0, 0), (-1, -1), WHITE)]
    if header:
        commands += [("BACKGROUND", (0, 0), (-1, 0), INK), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, 0), 7)]
    table.setStyle(TableStyle(commands))
    return table


story = [Table([[Spacer(1, 35 * mm)], [Paragraph("MONEY AND<br/>DIGITAL ASSETS", styles["Cover"])], [Spacer(1, 6 * mm)], [Paragraph("MODULE 1.1 FIELD LAB", styles["CoverS"])], [Spacer(1, 35 * mm)], [Paragraph("Name the job. Locate the ledger. Test the claim.", styles["CoverS"])], [Spacer(1, 20 * mm)], [Paragraph("COGNIZEN CONSULTING", styles["CoverS"])]], colWidths=[166 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), INK), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14)])), PageBreak()]

story += [Paragraph("01  MONEY HAS JOBS", styles["K"]), Paragraph("Classify the immediate function", styles["T"]), Paragraph("An object may perform several monetary functions. For each situation, name the function being used right now and explain your reasoning.", styles["B"])]
money_rows = [[Paragraph("SITUATION", styles["TH"]), Paragraph("MEDIUM OF EXCHANGE / UNIT OF ACCOUNT / STORE OF VALUE", styles["TH"]), Paragraph("WHY?", styles["TH"])]]
for situation in ["A cafe lists coffee at R38.", "A learner pays the cafe by card.", "A household keeps an emergency reserve.", "Two laptops are compared at R12,000 and R18,000.", "A business records revenue and expenses in rand."]:
    money_rows.append([Paragraph(situation, styles["S"]), "", ""])
story += [grid(money_rows, [50 * mm, 66 * mm, 50 * mm], [12 * mm] + [28 * mm] * 5), Spacer(1, 7 * mm), Paragraph("Where does trust sit in these examples?", styles["H"]), lines(3), PageBreak()]

story += [Paragraph("02  THE LEDGER TEST", styles["K"]), Paragraph("Compare three digital balances", styles["T"]), Paragraph("Digital does not mean decentralised. Complete each column before deciding which system is preferable for a particular purpose.", styles["B"])]
ledger_rows = [[Paragraph("QUESTION", styles["TH"]), Paragraph("BANK DEPOSIT", styles["TH"]), Paragraph("CENTRAL-BANK MONEY", styles["TH"]), Paragraph("CRYPTOASSET", styles["TH"])]]
for question in ["Who maintains the record?", "What claim does the holder have?", "Who controls access?", "How can an error be resolved?", "What is the main failure mode?"]:
    ledger_rows.append([Paragraph(question, styles["S"]), "", "", ""])
story += [grid(ledger_rows, [42 * mm, 42 * mm, 42 * mm, 40 * mm], [12 * mm] + [28 * mm] * 5), Spacer(1, 6 * mm), Paragraph("Best system for this situation - and why", styles["H"]), lines(3), PageBreak()]

story += [Paragraph("03  THE SCARCITY CLAIM", styles["K"]), Paragraph("Scarcity is one input, not a verdict", styles["T"]), Paragraph("Choose a real or fictional digital asset. Score the evidence without turning the exercise into a price forecast.", styles["B"])]
scarcity_rows = [[Paragraph("DIMENSION", styles["TH"]), Paragraph("0-100", styles["TH"]), Paragraph("EVIDENCE", styles["TH"]), Paragraph("WHAT WOULD CHANGE MY SCORE?", styles["TH"])]]
for dimension in ["Supply rule credibility", "Ownership verification", "Sustained demand", "Operational security", "Rule durability"]:
    scarcity_rows.append([Paragraph(dimension, styles["S"]), "", "", ""])
story += [grid(scarcity_rows, [40 * mm, 20 * mm, 56 * mm, 50 * mm], [12 * mm] + [25 * mm] * 5), Spacer(1, 5 * mm), Paragraph("My conclusion, stated with limits", styles["H"]), lines(3, 9 * mm), PageBreak()]

story += [Paragraph("04  PROOF OF LEARNING", styles["K"]), Paragraph("Explain the module without slogans", styles["T"]), Paragraph("Complete this page after the quiz. If you can explain these distinctions clearly, you have a usable foundation for Module 1.2.", styles["B"]), Paragraph("Money is a system because...", styles["H"]), lines(2, 9 * mm), Spacer(1, 3 * mm), Paragraph("A bank balance is digital but differs from a cryptoasset because...", styles["H"]), lines(2, 9 * mm), Spacer(1, 3 * mm), Paragraph("Digital scarcity matters, but does not guarantee value, because...", styles["H"]), lines(2, 9 * mm), Spacer(1, 3 * mm), Paragraph("The trust question I will carry into the next module is...", styles["H"]), lines(2, 9 * mm), Spacer(1, 5 * mm), Table([[Paragraph("KEEP THIS", styles["K"]), Paragraph("Name the function, locate the authority, and test every value claim against evidence.", styles["H"])]], colWidths=[30 * mm, 136 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), HexColor("#eef0ff")), ("BOX", (0, 0), (-1, -1), 0.7, BLUE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9), ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9)]))]

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=22 * mm, leftMargin=22 * mm, topMargin=21 * mm, bottomMargin=22 * mm, title="Module 1.1 Money and Digital Assets Field Lab", author="CogniZen Consulting")
doc.build(story, onFirstPage=lambda canvas, doc: None, onLaterPages=footer)
print(f"Created {OUTPUT}")
