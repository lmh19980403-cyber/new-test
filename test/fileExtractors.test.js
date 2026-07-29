import assert from "node:assert/strict";
import test from "node:test";
import { extractTextFromXml, getExtension, normalizeWhitespace } from "../src/fileExtractors.js";

test("getExtension lowercases file extension", () => {
  assert.equal(getExtension("Roadshow.PPTX"), ".pptx");
});

test("extractTextFromXml returns slide text from pptx XML", () => {
  const xml = `
    <p:sld>
      <a:t>项目名称</a:t>
      <a:t>高性能传感器 &amp; 工业应用</a:t>
    </p:sld>
  `;

  assert.equal(extractTextFromXml(xml), "项目名称\n高性能传感器 & 工业应用");
});

test("normalizeWhitespace trims noisy text", () => {
  assert.equal(normalizeWhitespace(" 第一行  \r\n\r\n\r\n第二行\t\n"), " 第一行\n\n第二行");
});
