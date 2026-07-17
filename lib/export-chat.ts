import type { ThreadMessage } from "@assistant-ui/react";

export type ChatExportMessage = {
  role: string;
  content: string;
  createdAt?: string;
};

export type ChatExportPayload = {
  title: string;
  exportedAt: string;
  messages: ChatExportMessage[];
};

export function threadMessagesToExport(
  messages: readonly ThreadMessage[],
  title = "ARIA chat",
): ChatExportPayload {
  return {
    title: title.trim() || "ARIA chat",
    exportedAt: new Date().toISOString(),
    messages: messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: getMessageText(m),
        createdAt:
          m.createdAt instanceof Date
            ? m.createdAt.toISOString()
            : undefined,
      }))
      .filter((m) => m.content.trim().length > 0),
  };
}

function getMessageText(message: ThreadMessage): string {
  if (message.role !== "user" && message.role !== "assistant") return "";
  return message.content
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n\n")
    .trim();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "aria-chat"
  );
}

export function downloadChatAsJson(payload: ChatExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `${slugify(payload.title)}.json`);
}

export function downloadChatAsCsv(payload: ChatExportPayload) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["role", "content", "createdAt"].map(escape).join(","),
    ...payload.messages.map((m) =>
      [m.role, m.content, m.createdAt ?? ""].map(escape).join(","),
    ),
  ];
  const blob = new Blob([rows.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `${slugify(payload.title)}.csv`);
}

export async function downloadChatAsPdf(payload: ChatExportPayload) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const maxWidth = 612 - margin * 2;
  let y = margin;

  const write = (text: string, options?: { bold?: boolean; size?: number }) => {
    doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    doc.setFontSize(options?.size ?? 11);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      if (y > 742) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += (options?.size ?? 11) * 1.35;
    }
  };

  write(payload.title, { bold: true, size: 16 });
  y += 8;
  write(`Exported ${new Date(payload.exportedAt).toLocaleString()}`, {
    size: 9,
  });
  y += 16;

  for (const message of payload.messages) {
    write(message.role === "user" ? "User" : "ARIA", {
      bold: true,
      size: 12,
    });
    y += 4;
    write(message.content);
    y += 14;
  }

  doc.save(`${slugify(payload.title)}.pdf`);
}

export async function downloadChatAsDocx(payload: ChatExportPayload) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import(
    "docx"
  );
  const children = [
    new Paragraph({
      text: payload.title,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Exported ${new Date(payload.exportedAt).toLocaleString()}`,
          italics: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({ text: "" }),
  ];

  for (const message of payload.messages) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: message.role === "user" ? "User" : "ARIA",
            bold: true,
          }),
        ],
      }),
      ...message.content.split(/\n+/).map(
        (line) =>
          new Paragraph({
            children: [new TextRun(line)],
          }),
      ),
      new Paragraph({ text: "" }),
    );
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${slugify(payload.title)}.docx`);
}

export async function downloadChatAsPptx(payload: ChatExportPayload) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.author = "ARIA";
  pptx.title = payload.title;

  const titleSlide = pptx.addSlide();
  titleSlide.addText(payload.title, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 1,
    fontSize: 28,
    bold: true,
  });
  titleSlide.addText("ARIA research chat export", {
    x: 0.5,
    y: 3.2,
    w: 9,
    h: 0.4,
    fontSize: 14,
    color: "666666",
  });

  for (const message of payload.messages) {
    const slide = pptx.addSlide();
    slide.addText(message.role === "user" ? "User" : "ARIA", {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: "888888",
    });
    slide.addText(message.content.slice(0, 1200), {
      x: 0.5,
      y: 1,
      w: 9,
      h: 4.5,
      fontSize: 16,
      valign: "top",
    });
  }

  await pptx.writeFile({ fileName: `${slugify(payload.title)}.pptx` });
}

export async function downloadChatAsXlsx(payload: ChatExportPayload) {
  const XLSX = await import("xlsx");
  const rows = payload.messages.map((m) => ({
    Role: m.role,
    Content: m.content,
    CreatedAt: m.createdAt ?? "",
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Chat");
  XLSX.writeFile(book, `${slugify(payload.title)}.xlsx`);
}

export type DownloadFormat =
  | "pdf"
  | "docx"
  | "pptx"
  | "xlsx"
  | "csv"
  | "json";

export async function downloadChat(
  format: DownloadFormat,
  payload: ChatExportPayload,
) {
  switch (format) {
    case "pdf":
      return downloadChatAsPdf(payload);
    case "docx":
      return downloadChatAsDocx(payload);
    case "pptx":
      return downloadChatAsPptx(payload);
    case "xlsx":
      return downloadChatAsXlsx(payload);
    case "csv":
      return downloadChatAsCsv(payload);
    case "json":
      return downloadChatAsJson(payload);
  }
}
