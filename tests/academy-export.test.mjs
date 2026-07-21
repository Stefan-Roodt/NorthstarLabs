import assert from "node:assert/strict";
import test from "node:test";
import { createPortableZip, textZipEntry } from "../lib/zip64-stream.ts";

function uint64(view, offset) {
  return Number((BigInt(view.getUint32(offset + 4, true)) << 32n) | BigInt(view.getUint32(offset, true)));
}

async function collect(stream) {
  const chunks = [];
  let length = 0;
  const reader = stream.getReader();
  for (;;) {
    const result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    length += result.value.length;
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

function localEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const entries = new Map();
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const extraStart = nameStart + nameLength;
    assert.equal(view.getUint16(extraStart, true), 0x0001);
    const size = uint64(view, extraStart + 4);
    const dataStart = extraStart + extraLength;
    const name = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
    entries.set(name, bytes.slice(dataStart, dataStart + size));
    offset = dataStart + size + 24;
  }
  assert.equal(view.getUint32(offset, true), 0x02014b50);
  return entries;
}

test("creates a standard streaming ZIP64 archive without buffering original files", async () => {
  const original = new Uint8Array(70_000);
  for (let index = 0; index < original.length; index += 1) original[index] = index % 251;
  const { stream, completed } = createPortableZip([
    textZipEntry("README.txt", "Portable academy export"),
    {
      path: "original-files/video/example.bin",
      size: original.length,
      open: () => new ReadableStream({
        start(controller) {
          controller.enqueue(original.subarray(0, 30_000));
          controller.enqueue(original.subarray(30_000));
          controller.close();
        },
      }),
    },
  ]);
  const bytes = await collect(stream);
  const result = await completed;
  assert.equal(result.sizeBytes, bytes.length);
  const entries = localEntries(bytes);
  assert.equal(new TextDecoder().decode(entries.get("README.txt")), "Portable academy export");
  assert.deepEqual(entries.get("original-files/video/example.bin"), original);
  assert.notEqual(bytes.findIndex((_, index) => index + 4 <= bytes.length &&
    new DataView(bytes.buffer, bytes.byteOffset + index, 4).getUint32(0, true) === 0x06064b50), -1);
});

test("rejects an archive when a source changes size during export", async () => {
  const { stream, completed } = createPortableZip([{
    path: "original-files/document/changed.txt",
    size: 8,
    open: () => new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("short"));
        controller.close();
      },
    }),
  }]);
  await assert.rejects(collect(stream), /size changed/i);
  await assert.rejects(completed, /size changed/i);
});
