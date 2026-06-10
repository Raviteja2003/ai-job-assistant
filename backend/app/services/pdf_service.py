from difflib import SequenceMatcher
from weasyprint import HTML


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def _merge_bullets(
    experience: list[dict],
    improved_bullets: list[dict],
) -> list[dict]:
    """Return experience entries with improved bullets swapped in where matched."""
    merged = [
        {**entry, "bullets": list(entry.get("bullets", []))}
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
                score = _similarity(original, bullet)
                if score > best_score:
                    best_score = score
                    best_entry_idx = ei
                    best_bullet_idx = bi
        if best_score >= 0.6 and best_entry_idx >= 0:
            merged[best_entry_idx]["bullets"][best_bullet_idx] = improved
    return merged


def generate_resume_pdf(
    version_name: str,
    resume_raw: dict,
    improved_bullets: list[dict],
) -> bytes:
    experience = resume_raw.get("experience", [])
    projects   = resume_raw.get("projects", [])
    education  = resume_raw.get("education", [])
    skills     = resume_raw.get("skills", [])

    merged_experience = _merge_bullets(experience, improved_bullets)

    # ── Skills ────────────────────────────────────────────────────────────────
    skills_html = "".join(
        f'<span style="display:inline-block;padding:3px 10px;background:#F3F4F6;'
        f'color:#374151;border-radius:4px;font-size:12px;margin:3px 4px 3px 0;">'
        f'{s}</span>'
        for s in skills
    ) if skills else "<p style='color:#9CA3AF;font-size:13px;'>—</p>"

    # ── Experience ────────────────────────────────────────────────────────────
    experience_html = ""
    for entry in merged_experience:
        bullets_html = "".join(
            f'<li style="font-size:13px;color:#374151;line-height:1.65;'
            f'margin-bottom:4px;">{b}</li>'
            for b in entry.get("bullets", [])
        )
        experience_html += f"""
        <div style="margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
                <div>
                    <span style="font-size:14px;font-weight:600;color:#111827;">
                        {entry.get('title', '')}
                    </span>
                    <span style="font-size:13px;color:#6B7280;margin-left:6px;">
                        · {entry.get('company', '')}
                    </span>
                </div>
                <span style="font-size:12px;color:#9CA3AF;white-space:nowrap;">
                    {entry.get('dates', '')}
                </span>
            </div>
            <ul style="margin:8px 0 0 16px;padding:0;">
                {bullets_html}
            </ul>
        </div>"""

    # ── Projects ──────────────────────────────────────────────────────────────
    projects_html = ""
    for proj in projects:
        proj_bullets = "".join(
            f'<li style="font-size:13px;color:#374151;line-height:1.65;'
            f'margin-bottom:4px;">{b}</li>'
            for b in proj.get("bullets", [])
        ) if proj.get("bullets") else ""
        projects_html += f"""
        <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
                <span style="font-size:14px;font-weight:600;color:#111827;">
                    {proj.get('name', '')}
                </span>
                <span style="font-size:12px;color:#9CA3AF;">
                    {proj.get('dates', '')}
                </span>
            </div>
            {f'<p style="font-size:13px;color:#6B7280;margin:4px 0 0;">{proj.get("description","")}</p>'
              if proj.get("description") else ""}
            {f'<ul style="margin:6px 0 0 16px;padding:0;">{proj_bullets}</ul>'
              if proj_bullets else ""}
        </div>"""

    # ── Education ─────────────────────────────────────────────────────────────
    education_html = ""
    for edu in education:
        education_html += f"""
        <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
                <div>
                    <span style="font-size:14px;font-weight:600;color:#111827;">
                        {edu.get('institution', '')}
                    </span>
                    <span style="font-size:13px;color:#6B7280;margin-left:6px;">
                        · {edu.get('degree', '')}
                    </span>
                </div>
                <span style="font-size:12px;color:#9CA3AF;">
                    {edu.get('dates', '')}
                </span>
            </div>
        </div>"""

    # ── Section helper ────────────────────────────────────────────────────────
    def section(title: str, body: str) -> str:
        return f"""
        <div style="margin-bottom:24px;">
            <div style="font-size:11px;font-weight:600;color:#9CA3AF;
                        text-transform:uppercase;letter-spacing:0.07em;
                        border-bottom:1.5px solid #E5E7EB;padding-bottom:5px;
                        margin-bottom:12px;">
                {title}
            </div>
            {body}
        </div>"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8"/>
    <style>
      * {{ box-sizing: border-box; margin: 0; padding: 0; }}
      body {{
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background: #fff;
        color: #111827;
        padding: 40px 48px;
        font-size: 14px;
      }}
      .header {{
        margin-bottom: 28px;
        padding-bottom: 16px;
        border-bottom: 2px solid #111827;
      }}
      .name {{
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 6px;
      }}
      .tagline {{
        font-size: 13px;
        color: #6B7280;
      }}
      .footer {{
        margin-top: 32px;
        font-size: 10px;
        color: #D1D5DB;
        text-align: center;
        border-top: 1px solid #F1F2F4;
        padding-top: 12px;
      }}
    </style>
    </head>
    <body>
      <div class="header">
        <div class="name">{version_name.split('—')[1].strip() if '—' in version_name else version_name}</div>
        <div class="tagline">Tailored for {version_name}</div>
      </div>

      {section("Skills", skills_html) if skills else ""}
      {section("Experience", experience_html) if merged_experience else ""}
      {section("Projects", projects_html) if projects else ""}
      {section("Education", education_html) if education else ""}

      <div class="footer">Generated by AI Job Assistant · Tailored Resume</div>
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
        f'<p style="margin-bottom:14px;line-height:1.75;'
        f'font-size:13.5px;color:#374151;">{p.strip()}</p>'
        for p in content.strip().split("\n")
        if p.strip()
    )

    html = f"""
    <!DOCTYPE html>
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