from difflib import SequenceMatcher
from weasyprint import HTML


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def _merge_bullets(
    experience: list[dict],
    improved_bullets: list[dict],
) -> list[dict]:
    """
    Return experience entries with improved bullets swapped in where matched.
    Each bullet is tagged so the PDF can highlight AI-improved ones.
    """
    merged = [
        {**entry, "bullets": [{"text": b, "improved": False} for b in entry.get("bullets", [])]}
        for entry in experience
    ]
    for improvement in improved_bullets:
        original = improvement.get("original", "")
        improved = improvement.get("improved", "")
        best_score = 0.0
        best_entry_idx = -1
        best_bullet_idx = -1
        for ei, entry in enumerate(merged):
            for bi, bullet in enumerate(entry["bullets"]):
                score = _similarity(original, bullet["text"])
                if score > best_score:
                    best_score = score
                    best_entry_idx = ei
                    best_bullet_idx = bi
        if best_score >= 0.6 and best_entry_idx >= 0:
            merged[best_entry_idx]["bullets"][best_bullet_idx] = {
                "text": improved,
                "improved": True,
            }
    return merged


def generate_resume_pdf(
    version_name: str,
    resume_raw: dict,
    improved_bullets: list[dict],
) -> bytes:
    name      = resume_raw.get("name", "") or ""
    contact   = resume_raw.get("contact", {}) or {}
    summary   = resume_raw.get("summary", "") or ""
    experience = resume_raw.get("experience", [])
    projects   = resume_raw.get("projects", [])
    education  = resume_raw.get("education", [])
    skills     = resume_raw.get("skills", [])

    merged_experience = _merge_bullets(experience, improved_bullets)

    # ── Header ────────────────────────────────────────────────────────────────
    contact_parts = []
    if contact.get("email"):
        contact_parts.append(contact["email"])
    if contact.get("phone"):
        contact_parts.append(contact["phone"])
    if contact.get("location"):
        contact_parts.append(contact["location"])
    if contact.get("linkedin"):
        contact_parts.append(contact["linkedin"])

    contact_html = " &nbsp;·&nbsp; ".join(contact_parts) if contact_parts else ""

    header_html = f"""
    <div class="header">
        <div class="candidate-name">{name or version_name}</div>
        {f'<div class="contact-line">{contact_html}</div>' if contact_html else ""}
        {f'<div class="tailored-badge">Tailored for: {version_name}</div>' if name else ""}
    </div>"""

    # ── Summary ───────────────────────────────────────────────────────────────
    summary_html = f"""
    <div class="summary-block">
        {summary}
    </div>""" if summary else ""

    # ── Skills ────────────────────────────────────────────────────────────────
    skills_html = "".join(
        f'<span class="skill-pill">{s}</span>'
        for s in skills
    ) if skills else "<span style='color:#9CA3AF;'>—</span>"

    # ── Experience ────────────────────────────────────────────────────────────
    experience_html = ""
    for entry in merged_experience:
        bullets_html = "".join(
            f'<li class="{"bullet-improved" if b["improved"] else "bullet-normal"}">'
            f'{b["text"]}'
            f'{"<span class=\'ai-badge\'>AI improved</span>" if b["improved"] else ""}'
            f'</li>'
            for b in entry.get("bullets", [])
        )
        experience_html += f"""
        <div class="entry">
            <div class="entry-header">
                <div>
                    <span class="entry-title">{entry.get('title', '')}</span>
                    <span class="entry-sub"> · {entry.get('company', '')}</span>
                </div>
                <span class="entry-dates">{entry.get('dates', '')}</span>
            </div>
            <ul class="bullet-list">{bullets_html}</ul>
        </div>"""

    # ── Projects ──────────────────────────────────────────────────────────────
    projects_html = ""
    for proj in projects:
        tech_pills = "".join(
            f'<span class="tech-pill">{t}</span>'
            for t in proj.get("tech", [])
        )
        proj_bullets = "".join(
            f'<li class="bullet-normal">{b}</li>'
            for b in proj.get("bullets", [])
        ) if proj.get("bullets") else ""
        projects_html += f"""
        <div class="entry">
            <div class="entry-header">
                <span class="entry-title">{proj.get('name', '')}</span>
                <span class="entry-dates">{proj.get('dates', '')}</span>
            </div>
            {f'<p class="proj-desc">{proj.get("description", "")}</p>' if proj.get("description") else ""}
            {f'<div class="tech-row">{tech_pills}</div>' if tech_pills else ""}
            {f'<ul class="bullet-list">{proj_bullets}</ul>' if proj_bullets else ""}
        </div>"""

    # ── Education ─────────────────────────────────────────────────────────────
    education_html = ""
    for edu in education:
        education_html += f"""
        <div class="entry">
            <div class="entry-header">
                <div>
                    <span class="entry-title">{edu.get('institution', '')}</span>
                    <span class="entry-sub"> · {edu.get('degree', '')}</span>
                </div>
                <span class="entry-dates">{edu.get('dates', '')}</span>
            </div>
        </div>"""

    # ── Section wrapper ───────────────────────────────────────────────────────
    def section(title: str, body: str) -> str:
        return f"""
        <div class="section">
            <div class="section-title">{title}</div>
            {body}
        </div>"""

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: #fff;
    color: #111827;
    padding: 36px 44px;
    font-size: 13px;
    line-height: 1.5;
  }}

  /* ── Header ── */
  .header {{
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #111827;
  }}
  .candidate-name {{
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.02em;
    margin-bottom: 5px;
  }}
  .contact-line {{
    font-size: 12px;
    color: #6B7280;
    margin-bottom: 4px;
  }}
  .tailored-badge {{
    display: inline-block;
    margin-top: 5px;
    font-size: 11px;
    color: #1D4ED8;
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 20px;
    padding: 2px 10px;
  }}

  /* ── Summary ── */
  .summary-block {{
    font-size: 13px;
    color: #374151;
    line-height: 1.7;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: #F8F9FA;
    border-left: 3px solid #2563EB;
    border-radius: 0 6px 6px 0;
  }}

  /* ── Sections ── */
  .section {{
    margin-bottom: 20px;
  }}
  .section-title {{
    font-size: 10.5px;
    font-weight: 700;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    border-bottom: 1.5px solid #E5E7EB;
    padding-bottom: 4px;
    margin-bottom: 12px;
  }}

  /* ── Entries ── */
  .entry {{
    margin-bottom: 14px;
  }}
  .entry-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
  }}
  .entry-title {{
    font-size: 13.5px;
    font-weight: 600;
    color: #111827;
  }}
  .entry-sub {{
    font-size: 13px;
    color: #6B7280;
  }}
  .entry-dates {{
    font-size: 11.5px;
    color: #9CA3AF;
    white-space: nowrap;
    margin-left: 12px;
  }}

  /* ── Bullets ── */
  .bullet-list {{
    margin: 5px 0 0 16px;
    padding: 0;
  }}
  .bullet-normal {{
    font-size: 12.5px;
    color: #374151;
    line-height: 1.65;
    margin-bottom: 3px;
  }}
  .bullet-improved {{
    font-size: 12.5px;
    color: #1D4ED8;
    line-height: 1.65;
    margin-bottom: 3px;
    font-weight: 500;
  }}
  .ai-badge {{
    display: inline-block;
    margin-left: 6px;
    font-size: 9.5px;
    font-weight: 600;
    color: #1D4ED8;
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 4px;
    padding: 1px 5px;
    vertical-align: middle;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }}

  /* ── Skills ── */
  .skill-pill {{
    display: inline-block;
    padding: 3px 9px;
    background: #F3F4F6;
    color: #374151;
    border-radius: 4px;
    font-size: 11.5px;
    font-weight: 500;
    margin: 3px 4px 3px 0;
  }}

  /* ── Projects ── */
  .proj-desc {{
    font-size: 12.5px;
    color: #6B7280;
    margin: 3px 0 4px;
  }}
  .tech-row {{
    margin: 4px 0;
  }}
  .tech-pill {{
    display: inline-block;
    padding: 2px 7px;
    background: #EFF6FF;
    color: #1D4ED8;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 500;
    margin: 2px 3px 2px 0;
    border: 1px solid #BFDBFE;
  }}

  /* ── Footer ── */
  .footer {{
    margin-top: 28px;
    font-size: 9.5px;
    color: #D1D5DB;
    text-align: center;
    border-top: 1px solid #F1F2F4;
    padding-top: 10px;
  }}
</style>
</head>
<body>

  {header_html}
  {summary_html}

  {section("Skills", skills_html) if skills else ""}
  {section("Experience", experience_html) if merged_experience else ""}
  {section("Projects", projects_html) if projects else ""}
  {section("Education", education_html) if education else ""}

  <div class="footer">
    Generated by AI Job Assistant &nbsp;·&nbsp; AI-improved bullets highlighted in blue
  </div>

</body>
</html>"""

    return HTML(string=html).write_pdf()


def generate_cover_letter_pdf(
    company: str,
    role: str,
    content: str,
    tone: str,
) -> bytes:
    paragraphs = "".join(
        f'<p style="margin-bottom:14px;line-height:1.75;font-size:13.5px;color:#374151;">'
        f'{p.strip()}</p>'
        for p in content.strip().split("\n")
        if p.strip()
    )

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: #fff; color: #111827;
          padding: 48px 56px; font-size: 14px; }}
  .header {{ margin-bottom: 32px; }}
  h1 {{ font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 4px; }}
  .meta {{ font-size: 12px; color: #9CA3AF; }}
  .tone-badge {{ display:inline-block; padding: 2px 10px;
                 background: #EFF6FF; color: #1D4ED8;
                 border-radius: 20px; font-size: 11px;
                 font-weight: 500; margin-top: 6px; }}
  .divider {{ height: 1px; background: #F1F2F4; margin: 24px 0; }}
  .footer {{ margin-top: 32px; font-size: 11px; color: #9CA3AF;
             text-align: center; border-top: 1px solid #F1F2F4;
             padding-top: 16px; }}
</style>
</head>
<body>
  <div class="header">
    <h1>Cover Letter — {role} at {company}</h1>
    <p class="meta">Generated by AI Job Assistant</p>
    <span class="tone-badge">{tone.capitalize()} tone</span>
  </div>
  <div class="divider"></div>
  <div>{paragraphs}</div>
  <div class="footer">AI Job Assistant — AI-generated cover letter.</div>
</body>
</html>"""

    return HTML(string=html).write_pdf()