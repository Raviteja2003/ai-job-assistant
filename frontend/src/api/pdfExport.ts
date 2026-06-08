const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const downloadPdf = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportResumeVersionPdf = async (
  versionId: number,
  versionName: string,
  token: string
): Promise<void> => {
  const res = await fetch(
    `${API_BASE}/export/resume-version/${versionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const filename = versionName.replace(/\s+/g, "_").replace(/—/g, "-") + ".pdf";
  downloadPdf(blob, filename);
};

export const exportCoverLetterPdf = async (
  company: string,
  role: string,
  content: string,
  tone: string,
  token: string
): Promise<void> => {
  const res = await fetch(`${API_BASE}/export/cover-letter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ company, role, content, tone }),
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const filename = `Cover_Letter_${company}_${role}.pdf`.replace(/\s+/g, "_");
  downloadPdf(blob, filename);
};