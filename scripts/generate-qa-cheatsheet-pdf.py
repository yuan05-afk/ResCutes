"""Generate AnimalHack 2026 Q&A prep PDF (Times New Roman, 1.5 spacing, B&W)."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "AnimalHack-2026-QA-Cheatsheet.pdf"
FONTS = Path(r"C:\Windows\Fonts")

pdfmetrics.registerFont(TTFont("TNR", str(FONTS / "times.ttf")))
pdfmetrics.registerFont(TTFont("TNR-Bold", str(FONTS / "timesbd.ttf")))
pdfmetrics.registerFont(TTFont("TNR-Italic", str(FONTS / "timesi.ttf")))
pdfmetrics.registerFont(TTFont("TNR-BoldItalic", str(FONTS / "timesbi.ttf")))

BLACK = colors.black
WHITE = colors.white
GRAY = colors.Color(0.35, 0.35, 0.35)
RULE = colors.Color(0.15, 0.15, 0.15)
LIGHT = colors.Color(0.94, 0.94, 0.94)

BODY_SIZE = 11
BODY_LEADING = 16.5  # 1.5 line spacing
SMALL_SIZE = 10
SMALL_LEADING = 15


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    s: dict[str, ParagraphStyle] = {}

    s["cover_title"] = ParagraphStyle(
        "cover_title",
        parent=base["Normal"],
        fontName="TNR-Bold",
        fontSize=22,
        leading=30,
        alignment=TA_CENTER,
        textColor=BLACK,
        spaceAfter=8,
    )
    s["cover_sub"] = ParagraphStyle(
        "cover_sub",
        parent=base["Normal"],
        fontName="TNR",
        fontSize=13,
        leading=19.5,
        alignment=TA_CENTER,
        textColor=BLACK,
        spaceAfter=6,
    )
    s["cover_meta"] = ParagraphStyle(
        "cover_meta",
        parent=base["Normal"],
        fontName="TNR-Italic",
        fontSize=11,
        leading=16.5,
        alignment=TA_CENTER,
        textColor=GRAY,
        spaceAfter=4,
    )
    s["h1"] = ParagraphStyle(
        "h1",
        parent=base["Normal"],
        fontName="TNR-Bold",
        fontSize=14,
        leading=21,
        textColor=BLACK,
        spaceBefore=16,
        spaceAfter=8,
    )
    s["h2"] = ParagraphStyle(
        "h2",
        parent=base["Normal"],
        fontName="TNR-Bold",
        fontSize=12,
        leading=18,
        textColor=BLACK,
        spaceBefore=12,
        spaceAfter=6,
    )
    s["body"] = ParagraphStyle(
        "body",
        parent=base["Normal"],
        fontName="TNR",
        fontSize=BODY_SIZE,
        leading=BODY_LEADING,
        alignment=TA_JUSTIFY,
        textColor=BLACK,
        spaceAfter=6,
    )
    s["body_left"] = ParagraphStyle(
        "body_left",
        parent=s["body"],
        alignment=TA_LEFT,
    )
    s["quote"] = ParagraphStyle(
        "quote",
        parent=base["Normal"],
        fontName="TNR-Italic",
        fontSize=BODY_SIZE,
        leading=BODY_LEADING,
        alignment=TA_JUSTIFY,
        textColor=BLACK,
        leftIndent=14,
        rightIndent=14,
        spaceBefore=6,
        spaceAfter=10,
    )
    s["qa_q"] = ParagraphStyle(
        "qa_q",
        parent=base["Normal"],
        fontName="TNR-Bold",
        fontSize=BODY_SIZE,
        leading=BODY_LEADING,
        textColor=BLACK,
        spaceBefore=10,
        spaceAfter=3,
    )
    s["qa_a"] = ParagraphStyle(
        "qa_a",
        parent=base["Normal"],
        fontName="TNR",
        fontSize=BODY_SIZE,
        leading=BODY_LEADING,
        alignment=TA_JUSTIFY,
        textColor=BLACK,
        leftIndent=8,
        spaceAfter=4,
    )
    s["bullet"] = ParagraphStyle(
        "bullet",
        parent=base["Normal"],
        fontName="TNR",
        fontSize=BODY_SIZE,
        leading=BODY_LEADING,
        textColor=BLACK,
        leftIndent=12,
        spaceAfter=3,
    )
    s["table_cell"] = ParagraphStyle(
        "table_cell",
        parent=base["Normal"],
        fontName="TNR",
        fontSize=SMALL_SIZE,
        leading=SMALL_LEADING,
        textColor=BLACK,
    )
    s["table_head"] = ParagraphStyle(
        "table_head",
        parent=base["Normal"],
        fontName="TNR-Bold",
        fontSize=SMALL_SIZE,
        leading=SMALL_LEADING,
        textColor=BLACK,
    )
    s["note"] = ParagraphStyle(
        "note",
        parent=base["Normal"],
        fontName="TNR-Italic",
        fontSize=10,
        leading=15,
        alignment=TA_CENTER,
        textColor=GRAY,
        spaceBefore=8,
        spaceAfter=8,
    )
    s["checklist"] = ParagraphStyle(
        "checklist",
        parent=base["Normal"],
        fontName="TNR",
        fontSize=BODY_SIZE,
        leading=BODY_LEADING,
        textColor=BLACK,
        leftIndent=6,
        spaceAfter=3,
    )
    return s


def hr() -> HRFlowable:
    return HRFlowable(width="100%", thickness=0.8, color=RULE, spaceBefore=4, spaceAfter=8)


def thin_hr() -> HRFlowable:
    return HRFlowable(width="100%", thickness=0.4, color=GRAY, spaceBefore=2, spaceAfter=8)


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


def make_table(
    rows: list[list[str]],
    col_widths: list[float],
    st: dict[str, ParagraphStyle],
    header: bool = True,
) -> Table:
    data = []
    for i, row in enumerate(rows):
        style = st["table_head"] if header and i == 0 else st["table_cell"]
        data.append([Paragraph(cell, style) for cell in row])

    t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.4, BLACK),
    ]
    if header:
        cmds.append(("BACKGROUND", (0, 0), (-1, 0), LIGHT))
    t.setStyle(TableStyle(cmds))
    return t


def qa(q: str, a: str, st: dict[str, ParagraphStyle]) -> list:
    return [
        KeepTogether(
            [
                p(f"Q: {q}", st["qa_q"]),
                p(f"<b>A:</b> {a}", st["qa_a"]),
            ]
        )
    ]


def add_page_number(canvas, doc) -> None:
    canvas.saveState()
    page = canvas.getPageNumber()
    if page > 1:
        canvas.setStrokeColor(BLACK)
        canvas.setLineWidth(0.5)
        y = 0.55 * inch
        canvas.line(0.75 * inch, y + 14, letter[0] - 0.75 * inch, y + 14)
        canvas.setFont("TNR", 9)
        canvas.setFillColor(GRAY)
        canvas.drawCentredString(
            letter[0] / 2,
            y,
            f"ResCutes | AnimalHack 2026 Q&A Prep | Page {page}",
        )
    canvas.restoreState()


def build() -> None:
    st = styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.85 * inch,
        title="AnimalHack 2026 - Team Q&A Prep Sheet (ResCutes)",
        author="ResCutes Team",
        subject="Internal Q&A preparation for AnimalHack 2026",
    )

    story: list = []
    usable = letter[0] - 1.5 * inch

    # Cover
    story.append(Spacer(1, 1.6 * inch))
    story.append(hr())
    story.append(p("ANIMALHACK 2026", st["cover_sub"]))
    story.append(p("Team Q&amp;A Prep Sheet", st["cover_title"]))
    story.append(p("ResCutes", st["cover_sub"]))
    story.append(thin_hr())
    story.append(
        p(
            "Internal briefing for the presentation slot<br/>"
            "(~10 minutes total | ~3 minutes Q&amp;A)",
            st["cover_meta"],
        )
    )
    story.append(Spacer(1, 0.35 * inch))
    story.append(
        p(
            "Share with teammates privately. Do not publish on the public GitHub judges browse.",
            st["note"],
        )
    )
    story.append(Spacer(1, 0.5 * inch))
    story.append(
        p(
            "<i>Purpose:</i> help judges understand the work, the tradeoffs, "
            "and how it serves animal welfare. Listen first. Answer honestly. "
            "Offer a demo when it helps. We are guests in their review.",
            st["quote"],
        )
    )
    story.append(Spacer(1, 0.8 * inch))
    story.append(
        p(
            "Team: Yuan Andrei Mariano | Mark Adrian Bautista | "
            "Raphael Edrian Tan | Ivan Mu\u00f1oz Untalan",
            st["cover_meta"],
        )
    )
    story.append(p("Live demo: https://rescutes.vercel.app/", st["cover_meta"]))
    story.append(p("Repo: https://github.com/Rapnunu/ResCutes", st["cover_meta"]))
    story.append(PageBreak())

    # 0 Format
    story.append(p("0. Format reminder", st["h1"]))
    story.append(hr())
    story.append(
        make_table(
            [
                ["Item", "Fact"],
                ["Total slot", "~10 minutes (talk + Q&amp;A)"],
                ["Q&amp;A budget", "~3 minutes"],
                [
                    "Submit + register",
                    "Devpost + presentation form by <b>12pm Sept 12, 2026 EST</b>",
                ],
                ["Present", "<b>Sept 13, 2026 EST</b>"],
                [
                    "Must show",
                    "Public link with <b>actual outcome</b> (live app and/or GitHub), "
                    "not only a proposal",
                ],
                ["Live demo", "https://rescutes.vercel.app/"],
                ["Repo", "https://github.com/Rapnunu/ResCutes"],
                ["Track fit", "Supporting animal shelters, rescues, and foster programs"],
            ],
            [1.55 * inch, usable - 1.55 * inch],
            st,
        )
    )
    story.append(Spacer(1, 10))
    story.append(
        p(
            "<b>Judging criteria</b> (keep in mind; do not force into every sentence): "
            "<b>Impact</b> | <b>Creativity &amp; innovation</b> | <b>Execution</b> | "
            "<b>Presentation</b>. Respect the organizers' process and the judges' time. "
            "Short answers leave room for follow-ups.",
            st["body"],
        )
    )

    # 1 Rules
    story.append(p("1. How we answer (team rules)", st["h1"]))
    story.append(hr())
    rules = [
        (
            "<b>One lead speaker answers first</b> (about 15-25 seconds). "
            "Others add only if asked, or if the lead invites them by name."
        ),
        (
            "Structure: <b>Claim -&gt; brief proof -&gt; offer to show.</b> Example: "
            '"Urgency is rule-based and explainable: injury, danger, vulnerability, '
            'and wait time. We can open a high-urgency case if that would help."'
        ),
        (
            'If you don\'t know: "We haven\'t measured that yet. Here\'s what we '
            '<i>did</i> check: ..." Never invent metrics or shelter endorsements.'
        ),
        (
            "If the demo glitches: stay calm. Use seeded roles, README screenshots, "
            "or narrate while a teammate recovers the tab. Thank the judges for their patience."
        ),
        (
            'Never say "AI built this" or "Cursor did it." Say "we built," '
            '"we implemented," "our team."'
        ),
        "Keep answers short. Aim to leave space for 2-4 questions.",
        (
            "Credit the ecosystem. Informal rescuers, Facebook groups, and WhatsApp "
            "threads already save animals. We add operational structure; we do not "
            "replace community care."
        ),
    ]
    for i, r in enumerate(rules, 1):
        story.append(p(f"{i}. {r}", st["bullet"]))

    story.append(p("Suggested coverage (fill in before the call)", st["h2"]))
    story.append(
        make_table(
            [
                ["Theme", "Who owns answers", "Backup"],
                ["Problem / Philippines context / impact", "_______________", "_______________"],
                ["Urgency scoring + shelter routing", "_______________", "_______________"],
                ["Mobile vs web / roles / demo path", "_______________", "_______________"],
                ["Stack / auth / DB / deploy", "_______________", "_______________"],
                ["Limits / next steps / ethics", "_______________", "_______________"],
            ],
            [2.7 * inch, 2.15 * inch, 2.15 * inch],
            st,
        )
    )

    # 2 Pitch
    story.append(p("2. Short team pitch", st["h1"]))
    story.append(hr())
    story.append(
        p(
            "ResCutes helps coordinate Philippine animal rescue from a citizen report through "
            "shelter intake, vet clearance, and adoption readiness. Citizens and rescuers use a "
            "mobile PWA; staff and vets use a web dashboard. Same Next.js app, Neon database, and "
            "auth. Beyond collecting forms, we score urgency with readable reasons, and suggest "
            "shelters by capacity, capability, species, distance, and workload. We built this as a "
            "working demo for evaluation, and we still have polish and real-world onboarding ahead.",
            st["quote"],
        )
    )

    # 3 Impact
    story.append(p("3. Impact questions", st["h1"]))
    story.append(hr())
    story.extend(
        qa(
            "Why does this matter? / Who is this for?",
            "Animals and people get stuck between social posts and informal chats, and shelters "
            "sometimes receive animals they cannot house or treat well. Our users are citizens, "
            "volunteer rescuers, shelter staff, and vets. The track we aimed at is shelters, rescues, "
            "and foster/adoption support.",
            st,
        )
    )
    story.extend(
        qa(
            "What is the scale of the problem?",
            "We do not claim national statistics we did not measure. What we see locally: reports "
            "scatter across social media, DMs, and calls, which can mean duplicates, delayed response, "
            "mismatched shelters, and lost handoff details. ResCutes tries to keep one auditable case "
            "thread from report toward clearance. We would need partner data before claiming "
            "population-level impact.",
            st,
        )
    )
    story.extend(
        qa(
            "How is this different from Facebook groups / WhatsApp?",
            "Those channels matter a lot for awareness and mobilizing help. We respect that. Where we "
            "try to add value is operations: roles and permissions, a case status pipeline, urgency "
            "with explanations, capacity-aware shelter suggestions, medical clearance before adoption, "
            "and a map of field cases and shelters. Chat alone rarely shows which shelter still has "
            "space and can treat a trapped nursing dog.",
            st,
        )
    )
    story.extend(
        qa(
            "Will shelters actually adopt this?",
            "Fair question. Today this is a demo-ready ops tool for hackathon evaluation, not a signed "
            "shelter pilot. Next barriers would include onboarding real shelter data, training, and "
            "better support for weak connectivity in the field. Judges can walk the full path on the "
            "live demo with five roles.",
            st,
        )
    )
    story.extend(
        qa(
            "How do you help adoption / foster specifically?",
            "After medical clearance, animals can move toward adoption or foster readiness. Staff "
            "review applications on the web; citizens and rescuers can browse or swipe on mobile. Our "
            "view is that rescue work is unfinished until the animal has a safer next step.",
            st,
        )
    )

    # 4 Innovation
    story.append(p("4. Creativity &amp; innovation questions", st["h1"]))
    story.append(hr())
    story.extend(
        qa(
            "What is innovative here? Is this just a CRUD app?",
            "Much of any ops tool is CRUD, and we own that. Two pieces go further: "
            "(1) <b>Explainable urgency</b> (injury, environmental danger, vulnerability, wait after "
            "verify) -&gt; score 0-100, level, and plain-language factors. "
            "(2) <b>Shelter suggestions</b> weighted by capability 35%, capacity 25%, species 20%, "
            "distance 15%, workload 5% - each with reasons and warnings. We are happy to show either "
            "engine live.",
            st,
        )
    )
    story.extend(
        qa(
            "How does urgency scoring work? Give an example.",
            "Points add up (cap 100). Example: severe injury <b>28</b> + traffic <b>25</b> + nursing "
            "<b>18</b> = <b>71 -&gt; High</b>; wait time after verification can raise it further. Staff "
            "can override with a written reason when field judgment differs. The goal is transparency "
            "for volunteers, not a black box.",
            st,
        )
    )
    story.append(Spacer(1, 6))
    story.append(
        make_table(
            [
                ["Factor", "Max", "Memorable examples"],
                ["Injury", "35", "moderate 20, critical 35"],
                ["Danger", "30", "traffic 25, trapped 30"],
                ["Vulnerability", "20", "juvenile 12, nursing 18"],
                ["Wait after verified", "15", "rises with hours waiting"],
            ],
            [2.0 * inch, 0.7 * inch, usable - 2.7 * inch],
            st,
        )
    )
    story.extend(
        qa(
            "Why not use ML / computer vision for injury?",
            "A deliberate MVP choice. Transparent rules are easier for staff to audit and explain. "
            "Vision models would need labeled Philippine street-animal data and careful trust "
            "calibration. We prioritized explainability and a working end-to-end path first. We are "
            "open to learning from stronger approaches later.",
            st,
        )
    )
    story.extend(
        qa(
            "How do you avoid sending animals to the wrong shelter?",
            "Suggestions check species accepted, free capacity, needed capabilities (for example wound "
            "care or emergency care), distance, and workload. Recommendations surface gaps "
            '("no capacity", "missing emergency surgery") so staff are not guessing from a static '
            "list. Final choice stays with people who know the ground.",
            st,
        )
    )
    story.extend(
        qa(
            "Map / Philippines angle?",
            "Mapbox maps centered on a Metro Manila-style demo; a Philippines shelter directory "
            "(dozens of listings, verified plus OSM-sourced partners). Seeded cases use local street "
            "contexts so the story matches where we built it. We treat directory data carefully and "
            "would verify further with real partners.",
            st,
        )
    )

    # 5 Execution
    story.append(p("5. Execution questions", st["h1"]))
    story.append(hr())
    story.extend(
        qa(
            "Does it actually work? Can you show us?",
            "Yes - please try https://rescutes.vercel.app/ with the demo roles (<b>demo1234</b>). The "
            "repo also has Vitest and Playwright tests. After an internal QA pass and fixes (create "
            "routes, validation, RBAC mobile gate, narrow layouts), a post-remediation re-audit scored "
            "<b>90/100</b> on 8 Sep 2026 (baseline <b>64/100</b>). That is our own hardening checklist, "
            "not an external certification. Residual polish remains on medical tabs and map legend at "
            "very small widths.",
            st,
        )
    )
    story.append(p("Workflow in one sentence each", st["h2"]))
    steps = [
        "Citizen reports on mobile (photo, location, phone).",
        "Staff verify or reject (reason required).",
        "Urgency is computed; staff may override with a reason.",
        "Rescuer is assigned -&gt; accept or decline -&gt; mark secured.",
        "Shelter is suggested -&gt; handoff -&gt; intake.",
        "Vet exam -&gt; medical clearance -&gt; adoption / foster path.",
    ]
    for i, step in enumerate(steps, 1):
        story.append(p(f"{i}. {step}", st["bullet"]))

    story.extend(
        qa(
            "Why two interfaces?",
            "Field work fits a phone PWA (report, map, assignments). Ops needs tables, medical queue, "
            "dispatch, and adoption review. Same codebase, role-gated: staff and vets are redirected "
            "away from /mobile; citizens do not use the web ops dashboard.",
            st,
        )
    )
    story.extend(
        qa(
            "What is the tech stack?",
            "Next.js 15, React 19, TypeScript, Tailwind, Neon Auth + Neon Postgres (Drizzle), Mapbox, "
            "Zod validation, Vitest + Playwright, deployed on Vercel (Singapore region for PH latency).",
            st,
        )
    )
    story.extend(
        qa(
            "How do you handle auth / data safety?",
            "Neon Auth sessions; roles enforced server-side, not only by hiding UI. Reporter contact is "
            "for authorized field roles. Photos use Vercel Blob when configured. Demo uses seeded "
            "accounts. A real public launch would need org onboarding and a stricter PII policy. We "
            "take that seriously.",
            st,
        )
    )
    story.extend(
        qa(
            "What if the demo looks empty or broken?",
            "Use seeded accounts; hard refresh. Demo data lives in Neon. If a case modal fails, open "
            "<b>Rescue Cases -&gt; full case page</b>, or switch role (staff vs rescuer). README "
            "screenshots show the UI. We can narrate while a teammate recovers the tab. Thank you for "
            "bearing with us if something hiccups live.",
            st,
        )
    )

    story.append(p("Demo path to rehearse (~90 seconds)", st["h2"]))
    demo = [
        "Landing -&gt; Login as <b>citizen@rescutes.demo</b> -&gt; /mobile/report (show fields).",
        "Logout -&gt; <b>staff@rescutes.demo</b> -&gt; /rescue-cases -&gt; open a case -&gt; Verify / Dispatch / Urgency.",
        "Optional: /shelters capacity, /medical queue, /adoption.",
        "Logout -&gt; <b>rescuer@rescutes.demo</b> -&gt; map layers + assignment accept.",
    ]
    for i, d in enumerate(demo, 1):
        story.append(p(f"{i}. {d}", st["bullet"]))
    story.append(p("Password for all: <b>demo1234</b>", st["body_left"]))

    # 6 Hard questions
    story.append(p("6. Hard questions (stay calm and honest)", st["h1"]))
    story.append(hr())
    story.extend(
        qa(
            "This looks ambitious. What is done vs planned?",
            "Done and demoable: report -&gt; verify -&gt; assign -&gt; secure -&gt; handoff / intake -&gt; "
            "medical clearance -&gt; adoption surfaces; urgency and routing engines; role gates; live "
            "deploy. Honest gaps: not a signed shelter pilot; mobile still has polish items from QA; "
            "we want CI smoke tests on a dedicated test DB so demo data stays clean. We would rather "
            "under-claim than over-promise.",
            st,
        )
    )
    story.extend(
        qa(
            "Did you copy another product (Petfinder, etc.)?",
            "Adoption boards already exist and serve an important need. Our focus is <b>field rescue "
            "coordination before</b> listing. Urgency plus capacity and capability routing into intake "
            "is the gap we targeted for informal Philippine rescue networks. We learned from existing "
            "tools; we are not claiming to replace them.",
            st,
        )
    )
    story.extend(
        qa(
            "Privacy / reporter safety?",
            "Contact (phone / email) is for authorized roles so rescuers can reach reporters. Location "
            "can be approximate in public map contexts. We would strengthen consent and retention "
            "before a real public launch.",
            st,
        )
    )
    story.extend(
        qa(
            "Offline / low connectivity?",
            "Mobile is PWA-oriented; some draft resilience exists for interrupted reporting. Full "
            "offline sync is a next step, not a claim for today.",
            st,
        )
    )
    story.extend(
        qa(
            "Cost / who pays?",
            "Hackathon MVP on Vercel + Neon + Mapbox free or developer tiers. Real shelters would need "
            "a lightweight SaaS or NGO-sponsored model. We have not locked pricing; impact and trust "
            "come first.",
            st,
        )
    )
    story.extend(
        qa(
            "Ethics - does tech delay care?",
            "Our intent is the opposite: faster triage and better shelter fit so animals bounce less "
            "between facilities. Urgency rises with wait time after verification so stalled cases "
            "surface. We welcome critique if any step adds friction; that would be a bug for us to fix.",
            st,
        )
    )
    story.extend(
        qa(
            "Why should you win / which award fits?",
            "<b>Stay humble. Do not lobby for a trophy.</b> If asked, map work to criteria: "
            "<b>Social Impact</b> (fragmented reports -&gt; coordinated pipeline); "
            "<b>Innovation</b> (explainable urgency + routing with reasons); "
            "<b>Execution</b> (live multi-role demo, tests, internal QA 90/100); "
            "<b>Team Work</b> (four CS Data Science students, shared mobile + web codebase). "
            "Awards are the judges' decision. Our job is to present clearly and answer honestly.",
            st,
        )
    )

    # 7 Team
    story.append(p("7. Team / process questions", st["h1"]))
    story.append(hr())
    story.extend(
        qa(
            "Who are you?",
            "BS Computer Science (Data Science specialization). Team: Yuan Andrei Mariano, Mark Adrian "
            "Bautista, Raphael Edrian Tan, Ivan Mu\u00f1oz Untalan.",
            st,
        )
    )
    story.extend(
        qa(
            "How did you divide work?",
            'Stay truthful to how you actually worked. Safe phrasing: "We shared one repo (main / '
            'develop), paired on workflows (rescue, medical, maps, adoption), and integrated against '
            'one Neon demo database." Do not invent titles you cannot defend.',
            st,
        )
    )
    story.extend(
        qa(
            "What would you build in another week?",
            "(1) More polish on smallest phone frames (medical tabs + map legend). "
            "(2) CI smoke tests on a dedicated Neon branch. "
            "(3) Re-run full QA (including XSS create re-check) with evidence beyond the current 90/100.",
            st,
        )
    )

    # 8 Pocket lines
    story.append(p("8. Pocket lines (calm and specific)", st["h1"]))
    story.append(hr())
    story.append(
        make_table(
            [
                ["Trigger", "Line"],
                [
                    '"So what?"',
                    "One case thread from street report toward a cleared, adoption-ready animal.",
                ],
                [
                    '"Show us."',
                    "Live demo, five roles, password demo1234. Happy to walk it with you.",
                ],
                [
                    '"What\'s new?"',
                    "Explainable urgency, plus shelter ranking with reasons and warnings.",
                ],
                [
                    '"Is it real?"',
                    "Deployed app, GitHub, automated tests, and an internal QA re-audit (90/100 after fixes).",
                ],
                [
                    '"Philippines?"',
                    "Built around local informal rescue patterns; PH shelter directory + Metro Manila-style maps.",
                ],
                [
                    '"Just students?"',
                    "Yes - a student team. The demo is what we ask judges to try themselves.",
                ],
            ],
            [1.4 * inch, usable - 1.4 * inch],
            st,
        )
    )

    # 9 Closing
    story.append(p("9. Closing if time runs out", st["h1"]))
    story.append(hr())
    story.append(
        p(
            "Thank you for the questions. We're glad to open the live demo after - citizen report on "
            "mobile, staff dispatch on web, same case ID end to end. Links are in our Devpost and "
            "README. We appreciate AnimalHack for the chance to present.",
            st["quote"],
        )
    )

    # 10 Checklist
    story.append(p("10. Pre-flight checklist (night before)", st["h1"]))
    story.append(hr())
    checks = [
        "Devpost submitted + presentation Google Form done (before <b>12pm Sept 12 EST</b>)",
        "Public link works; landing reachable; demo accounts tested",
        "Two people can share screen; backup hotspot ready",
        "Browser tabs pre-opened: landing, login, mobile, rescue-cases, shelters, medical",
        "Password remembered: <b>demo1234</b>",
        "This sheet on a second device (not the demo screen)",
        "Agreed who answers Impact / Innovation / Execution / Stack",
        "Practiced 10-minute talk ending by <b>minute 7</b> so Q&amp;A is not crushed",
        "Tone check: grateful, specific, no invented metrics",
    ]
    for c in checks:
        story.append(p(f"[ ]  {c}", st["checklist"]))

    # 11 Practice
    story.append(p("11. Practice prompts (drill each other)", st["h1"]))
    story.append(hr())
    story.append(
        p(
            "Have a teammate fire these cold; answer in 25 seconds or less:",
            st["body_left"],
        )
    )
    prompts = [
        "What problem do you solve in one sentence?",
        "Give a concrete urgency score example.",
        "How do you choose a shelter?",
        "Why mobile <i>and</i> web?",
        "What is your weakest claim today?",
        "Show me where a rescuer accepts an assignment.",
        "How is this animal-welfare work, not only software?",
        "What did QA still flag after remediation?",
        "How do you speak about Facebook / WhatsApp without dismissing them?",
        "If a judge asks why you should win, how do you answer without lobbying?",
    ]
    for i, pr in enumerate(prompts, 1):
        story.append(p(f"{i}. {pr}", st["bullet"]))

    story.append(Spacer(1, 16))
    story.append(thin_hr())
    story.append(
        p(
            "Internal team prep for AnimalHack 2026. Prefer humility over hype. Prefer a working demo "
            "over a perfect speech. Prefer thanking the judges over arguing with them.",
            st["note"],
        )
    )

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
