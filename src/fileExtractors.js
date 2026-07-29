import JSZip from "jszip";

const PPTX_SLIDE_PATH = /^ppt\/slides\/slide(\d+)\.xml$/;
const PPTX_NOTES_PATH = /^ppt\/notesSlides\/notesSlide(\d+)\.xml$/;
const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".pptx"]);

export function getExtension(filename = "") {
  const normalized = filename.toLowerCase();
  const dotIndex = normalized.lastIndexOf(".");
  return dotIndex >= 0 ? normalized.slice(dotIndex) : "";
}

export function isSupportedFile(filename = "") {
  return SUPPORTED_EXTENSIONS.has(getExtension(filename));
}

export async function extractTextFromUpload(file) {
  if (!file) {
    return { text: "", source: "none", warning: null };
  }

  const extension = getExtension(file.originalname);
  if (extension === ".txt" || extension === ".md") {
    return {
      text: normalizeWhitespace(file.buffer.toString("utf8")),
      source: file.originalname,
      warning: null
    };
  }

  if (extension === ".pptx") {
    return {
      text: normalizeWhitespace(await extractTextFromPptx(file.buffer)),
      source: file.originalname,
      warning: null
    };
  }

  if (extension === ".ppt") {
    return {
      text: "",
      source: file.originalname,
      warning: "暂不支持二进制 .ppt 文件，请另存为 .pptx 后上传。"
    };
  }

  return {
    text: "",
    source: file.originalname,
    warning: "暂仅支持 .pptx、.txt、.md 文件。"
  };
}

export async function extractTextFromPptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files)
    .filter((entry) => !entry.dir && (PPTX_SLIDE_PATH.test(entry.name) || PPTX_NOTES_PATH.test(entry.name)))
    .sort((a, b) => {
      const aNumber = Number((a.name.match(/(\d+)\.xml$/) || [])[1] || 0);
      const bNumber = Number((b.name.match(/(\d+)\.xml$/) || [])[1] || 0);
      return aNumber - bNumber || a.name.localeCompare(b.name);
    });

  const parts = [];
  for (const entry of entries) {
    const xml = await entry.async("string");
    const text = extractTextFromXml(xml);
    if (text) {
      parts.push(text);
    }
  }

  return parts.join("\n\n");
}

export function extractTextFromXml(xml = "") {
  const matches = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
  return matches
    .map((match) => decodeXmlEntities(match[1]))
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n");
}

export function normalizeWhitespace(value = "") {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeXmlEntities(value = "") {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}
