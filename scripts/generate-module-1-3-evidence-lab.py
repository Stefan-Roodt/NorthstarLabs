from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "media" / "course-resources" / "module-1-3-origins-of-bitcoin-evidence-lab.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
INK, BLUE, LIME, PEACH, MUTED, RULE, WHITE = map(HexColor, ["#171827", "#3556d8", "#d9ff65", "#ffbd8a", "#666575", "#ddd4c8", "#ffffff"])
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="K", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=BLUE, spaceAfter=7, tracking=1.2))
styles.add(ParagraphStyle(name="T", fontName="Helvetica-Bold", fontSize=28, leading=31, textColor=INK, spaceAfter=11))
styles.add(ParagraphStyle(name="B", fontName="Helvetica", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=8))
styles.add(ParagraphStyle(name="H", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=INK, spaceBefore=6, spaceAfter=5))
styles.add(ParagraphStyle(name="S", fontName="Helvetica", fontSize=7.6, leading=10.5, textColor=MUTED))
styles.add(ParagraphStyle(name="TH", fontName="Helvetica-Bold", fontSize=6.4, leading=8, textColor=WHITE))
styles.add(ParagraphStyle(name="Cover", fontName="Helvetica-Bold", fontSize=33, leading=36, textColor=WHITE, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="CoverS", fontName="Helvetica", fontSize=11, leading=16, textColor=HexColor("#d8dae5"), alignment=TA_CENTER))

def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(RULE); canvas.line(22*mm, 16*mm, 188*mm, 16*mm)
    canvas.setFont("Helvetica", 7); canvas.setFillColor(MUTED)
    canvas.drawString(22*mm, 10*mm, "COGNIZEN CONSULTING  |  MODULE 1.3 EVIDENCE LAB")
    canvas.drawRightString(188*mm, 10*mm, str(doc.page)); canvas.restoreState()

def lines(rows, height=8*mm):
    table = Table([[""] for _ in range(rows)], colWidths=[166*mm], rowHeights=[height]*rows)
    table.setStyle(TableStyle([("LINEBELOW", (0,0), (-1,-1), .6, RULE), ("BACKGROUND", (0,0), (-1,-1), WHITE)]))
    return table

def grid(data, widths, heights):
    table = Table(data, colWidths=widths, rowHeights=heights)
    table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), .6, RULE), ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("BACKGROUND", (0,0), (-1,-1), WHITE), ("BACKGROUND", (0,0), (-1,0), INK),
    ]))
    return table

story = [
    Table([[Spacer(1,32*mm)], [Paragraph("THE ORIGINS<br/>OF BITCOIN", styles["Cover"])], [Spacer(1,6*mm)],
           [Paragraph("MODULE 1.3 EVIDENCE LAB", styles["CoverS"])], [Spacer(1,34*mm)],
           [Paragraph("Problem. Components. Claims. Boundaries.", styles["CoverS"])], [Spacer(1,20*mm)],
           [Paragraph("COGNIZEN CONSULTING", styles["CoverS"])]],
          colWidths=[166*mm], style=TableStyle([("BACKGROUND", (0,0), (-1,-1), INK),
          ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("LEFTPADDING", (0,0), (-1,-1), 14),
          ("RIGHTPADDING", (0,0), (-1,-1), 14)])), PageBreak()
]

story += [Paragraph("01  THE CONFLICT TRACE", styles["K"]), Paragraph("Why a signature is not enough", styles["T"]),
          Paragraph("Trace two transactions that try to spend the same input. The goal is to identify the exact decision the network must make.", styles["B"])]
rows = [[Paragraph(x, styles["TH"]) for x in ["EVENT", "WHAT CAN BE VERIFIED?", "WHAT REMAINS UNRESOLVED?", "RULE NEEDED"]]]
for event in ["Alice signs payment to Bob", "Alice signs conflicting payment to Carol", "Bob sees his transaction first", "Carol sees hers first", "A block includes one transaction", "A later block extends that history"]:
    rows.append([Paragraph(event, styles["S"]), "", "", ""])
story += [grid(rows, [39*mm, 43*mm, 43*mm, 41*mm], [12*mm] + [22*mm]*6), Spacer(1, 5*mm),
          Paragraph("One-sentence design problem", styles["H"]), lines(2), PageBreak()]

story += [Paragraph("02  THE ANCESTRY MAP", styles["K"]), Paragraph("A system, not one magic ingredient", styles["T"]),
          Paragraph("Map each component to its direct job. Then explain how the components reinforce one another.", styles["B"])]
rows = [[Paragraph(x, styles["TH"]) for x in ["COMPONENT", "DIRECT JOB", "WHAT IT CANNOT DO ALONE", "BITCOIN COMBINATION"]]]
for item in ["Digital signature", "Cryptographic hash", "Merkle tree", "Timestamp chain", "Proof of work", "Peer-to-peer network", "Node validation", "Economic incentive"]:
    rows.append([Paragraph(item, styles["S"]), "", "", ""])
story += [grid(rows, [34*mm, 42*mm, 44*mm, 46*mm], [11*mm] + [18*mm]*8), Spacer(1, 4*mm),
          Paragraph("The system-level breakthrough was...", styles["H"]), lines(2), PageBreak()]

story += [Paragraph("03  THE CLAIM AUDIT", styles["K"]), Paragraph("Separate protocol from narrative", styles["T"]),
          Paragraph("Write the claim exactly. Record the mechanism and assumption before deciding what later evidence is still required.", styles["B"])]
rows = [[Paragraph(x, styles["TH"]) for x in ["CLAIM", "SOURCE / SECTION", "MECHANISM", "ASSUMPTION", "LATER EVIDENCE"]]]
for claim in ["Peer-to-peer transfer", "Double-spend resistance", "History becomes costly to replace", "Incentives support participation", "Limited issuance", "Future market value"]:
    rows.append([Paragraph(claim, styles["S"]), "", "", "", ""])
story += [grid(rows, [32*mm, 31*mm, 35*mm, 33*mm, 35*mm], [12*mm] + [23*mm]*6), Spacer(1, 5*mm),
          Paragraph("Which claim requires the largest inferential leap? Why?", styles["H"]), lines(3), PageBreak()]

story += [Paragraph("04  CLOSE READING", styles["K"]), Paragraph("Read the white paper with boundaries", styles["T"]),
          Paragraph("Use the primary document first. Quote sparingly and record the section so another reader can check your interpretation.", styles["B"])]
for prompt in [
    "The paper's stated problem is...",
    "The proposed mechanism is...",
    "The most important security assumption is...",
    "A real-world risk outside the paper's mechanism is...",
    "A market claim that requires separate evidence is...",
]:
    story += [Paragraph(prompt, styles["H"]), lines(2, 8*mm), Spacer(1, 2*mm)]
story += [Table([[Paragraph("SOURCE CHECK", styles["K"]), Paragraph("Primary source: Satoshi Nakamoto, Bitcoin: A Peer-to-Peer Electronic Cash System. Technical context: NISTIR 8202, Blockchain Technology Overview.", styles["H"])]],
          colWidths=[31*mm, 135*mm], style=TableStyle([("BACKGROUND", (0,0), (-1,-1), HexColor("#eef0ff")),
          ("BOX", (0,0), (-1,-1), .7, BLUE), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
          ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9),
          ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9)])), PageBreak()]

story += [Paragraph("05  PROOF OF LEARNING", styles["K"]), Paragraph("Defend a bounded conclusion", styles["T"]),
          Paragraph("Prepare a two-minute explanation for a sceptical colleague. Your conclusion must remain useful without exaggeration.", styles["B"]),
          Paragraph("1. Explain the double-spend problem in plain language", styles["H"]), lines(3),
          Paragraph("2. Name four contributing technologies and their jobs", styles["H"]), lines(4),
          Paragraph("3. State one white-paper claim and one non-claim", styles["H"]), lines(3),
          Paragraph("4. Give one surviving operational risk", styles["H"]), lines(2),
          Paragraph("5. Write your final bounded conclusion", styles["H"]), lines(4), Spacer(1, 4*mm),
          Table([[Paragraph("KEEP THIS", styles["K"]), Paragraph("Bitcoin's historical importance is best understood as a coordinated system for ledger agreement—not as proof of every later story told about it.", styles["H"])]],
          colWidths=[30*mm, 136*mm], style=TableStyle([("BACKGROUND", (0,0), (-1,-1), HexColor("#f5f8df")),
          ("BOX", (0,0), (-1,-1), .7, LIME), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
          ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9),
          ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9)]))]

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=22*mm, leftMargin=22*mm, topMargin=21*mm, bottomMargin=22*mm,
                        title="Module 1.3 Origins of Bitcoin Evidence Lab", author="CogniZen Consulting")
doc.build(story, onFirstPage=lambda canvas, doc: None, onLaterPages=footer)
print(f"Created {OUTPUT}")
