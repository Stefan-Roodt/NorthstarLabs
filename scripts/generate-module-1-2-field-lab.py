from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "media" / "course-resources" / "module-1-2-evolution-of-money-field-lab.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
INK, BLUE, MUTED, RULE, WHITE = map(HexColor, ["#171827", "#3556d8", "#666575", "#ddd4c8", "#ffffff"])
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
    canvas.saveState(); canvas.setStrokeColor(RULE); canvas.line(22*mm, 16*mm, 188*mm, 16*mm)
    canvas.setFont("Helvetica", 7); canvas.setFillColor(MUTED)
    canvas.drawString(22*mm, 10*mm, "COGNIZEN CONSULTING  |  MODULE 1.2 FIELD LAB"); canvas.drawRightString(188*mm, 10*mm, str(doc.page)); canvas.restoreState()

def lines(rows, height=9*mm):
    t = Table([[""] for _ in range(rows)], colWidths=[166*mm], rowHeights=[height]*rows)
    t.setStyle(TableStyle([("LINEBELOW", (0,0), (-1,-1), .6, RULE), ("BACKGROUND", (0,0), (-1,-1), WHITE)])); return t

def grid(data, widths, heights):
    t = Table(data, colWidths=widths, rowHeights=heights)
    t.setStyle(TableStyle([("GRID",(0,0),(-1,-1),.6,RULE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),("BACKGROUND",(0,0),(-1,-1),WHITE),("BACKGROUND",(0,0),(-1,0),INK)])); return t

story = [Table([[Spacer(1,35*mm)],[Paragraph("THE EVOLUTION<br/>OF MONEY",styles["Cover"])],[Spacer(1,6*mm)],[Paragraph("MODULE 1.2 FIELD LAB",styles["CoverS"])],[Spacer(1,35*mm)],[Paragraph("Problem solved. Dependency added. Risk transformed.",styles["CoverS"])],[Spacer(1,20*mm)],[Paragraph("COGNIZEN CONSULTING",styles["CoverS"])]], colWidths=[166*mm], style=TableStyle([("BACKGROUND",(0,0),(-1,-1),INK),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),14),("RIGHTPADDING",(0,0),(-1,-1),14)])), PageBreak()]

story += [Paragraph("01  THE SYSTEM TIMELINE",styles["K"]),Paragraph("Follow the coordination problem",styles["T"]),Paragraph("For each stage, name the problem reduced and the new dependency introduced. Avoid claiming that one form simply replaced all earlier forms.",styles["B"])]
rows=[[Paragraph(x,styles["TH"]) for x in ["SYSTEM","PROBLEM REDUCED","DEPENDENCY ADDED","WHAT CAN FAIL?"]]]
for x in ["Obligation / credit","Commodity money","Standardised coin","Representative note","Bank deposit","Fiat currency","Cryptocurrency"]: rows.append([Paragraph(x,styles["S"]),"","",""])
story += [grid(rows,[34*mm,44*mm,44*mm,44*mm],[12*mm]+[21*mm]*7),Spacer(1,5*mm),Paragraph("Which stages coexist in your life today?",styles["H"]),lines(2),PageBreak()]

story += [Paragraph("02  CLAIM, LEDGER, AUTHORITY",styles["K"]),Paragraph("Locate the trust boundary",styles["T"]),Paragraph("A payment object tells only part of the story. Trace the claim, the record keeper and the rule-changing authority.",styles["B"])]
rows=[[Paragraph(x,styles["TH"]) for x in ["FORM","WHAT DOES THE HOLDER HAVE?","WHO KEEPS THE RECORD?","WHO CAN CHANGE THE RULES?"]]]
for x in ["Metal coin","Redeemable note","Commercial-bank deposit","Central-bank money","Public-chain asset"]: rows.append([Paragraph(x,styles["S"]),"","",""])
story += [grid(rows,[36*mm,46*mm,42*mm,42*mm],[12*mm]+[27*mm]*5),Spacer(1,5*mm),Paragraph("The most important difference I found",styles["H"]),lines(3),PageBreak()]

story += [Paragraph("03  THE INNOVATION SCORECARD",styles["K"]),Paragraph("Compare the trade, not the slogan",styles["T"]),Paragraph("Choose two payment systems for one real situation. Score only after you define the user's need.",styles["B"]),Paragraph("Situation and user",styles["H"]),lines(2)]
rows=[[Paragraph(x,styles["TH"]) for x in ["DIMENSION","SYSTEM A","SYSTEM B","EVIDENCE / LIMIT"]]]
for x in ["Access","Settlement speed","Cost predictability","Reversibility","Privacy","Resilience","Governance clarity"]: rows.append([Paragraph(x,styles["S"]),"","",""])
story += [Spacer(1,4*mm),grid(rows,[40*mm,28*mm,28*mm,70*mm],[12*mm]+[17*mm]*7),Spacer(1,5*mm),Paragraph("My bounded conclusion",styles["H"]),lines(2),PageBreak()]

story += [Paragraph("04  PROOF OF LEARNING",styles["K"]),Paragraph("Explain change without mythology",styles["T"]),Paragraph("Use complete sentences. A strong answer names both the improvement and its dependency.",styles["B"])]
for prompt in ["Barter is an incomplete origin story because...","Coinage improved exchange, but introduced...","Fiat money is not commodity-backed, yet depends on...","Cryptocurrency's distinctive change is...","A new monetary form does not guarantee replacement because..."]:
    story += [Paragraph(prompt,styles["H"]),lines(2,8*mm),Spacer(1,2*mm)]
story += [Table([[Paragraph("KEEP THIS",styles["K"]),Paragraph("Monetary progress is a sequence of changing trust boundaries, not a march toward risk-free money.",styles["H"])]],colWidths=[30*mm,136*mm],style=TableStyle([("BACKGROUND",(0,0),(-1,-1),HexColor("#eef0ff")),("BOX",(0,0),(-1,-1),.7,BLUE),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9)]))]

doc=SimpleDocTemplate(str(OUTPUT),pagesize=A4,rightMargin=22*mm,leftMargin=22*mm,topMargin=21*mm,bottomMargin=22*mm,title="Module 1.2 Evolution of Money Field Lab",author="CogniZen Consulting")
doc.build(story,onFirstPage=lambda canvas,doc:None,onLaterPages=footer)
print(f"Created {OUTPUT}")
