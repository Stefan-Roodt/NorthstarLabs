export type PortableZipEntry = {
  path: string;
  size: number;
  modifiedAt?: number;
  open: () => ReadableStream<Uint8Array> | Promise<ReadableStream<Uint8Array>>;
};

type CentralEntry = {
  name: Uint8Array;
  crc: number;
  size: bigint;
  offset: bigint;
  dosDate: number;
  dosTime: number;
};

const encoder = new TextEncoder();
const CRC_TABLE = new Uint32Array(256);

for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC_TABLE[index] = value >>> 0;
}

function updateCrc(current: number, chunk: Uint8Array) {
  let value = current;
  for (const byte of chunk) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return value >>> 0;
}

function setU16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function setU32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

function setU64(view: DataView, offset: number, value: bigint) {
  view.setUint32(offset, Number(value & 0xffffffffn), true);
  view.setUint32(offset + 4, Number((value >> 32n) & 0xffffffffn), true);
}

function zipDate(value = Date.now()) {
  const date = new Date(value);
  const year = Math.min(2107, Math.max(1980, date.getUTCFullYear()));
  return {
    dosDate: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
    dosTime: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2),
  };
}

function validatedName(path: string) {
  const normalised = path.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalised || normalised.includes("../") || normalised.includes("\0")) {
    throw new Error(`Unsafe archive path: ${path}`);
  }
  const name = encoder.encode(normalised);
  if (name.length > 65_535) throw new Error(`Archive path is too long: ${path}`);
  return name;
}

function localHeader(name: Uint8Array, size: bigint, dosDate: number, dosTime: number) {
  const extraLength = 20;
  const bytes = new Uint8Array(30 + name.length + extraLength);
  const view = new DataView(bytes.buffer);
  setU32(view, 0, 0x04034b50);
  setU16(view, 4, 45);
  setU16(view, 6, 0x0808); // UTF-8 names and a trailing data descriptor.
  setU16(view, 8, 0); // Stored without compression so original media can stream.
  setU16(view, 10, dosTime);
  setU16(view, 12, dosDate);
  setU32(view, 14, 0);
  setU32(view, 18, 0xffffffff);
  setU32(view, 22, 0xffffffff);
  setU16(view, 26, name.length);
  setU16(view, 28, extraLength);
  bytes.set(name, 30);
  const extra = 30 + name.length;
  setU16(view, extra, 0x0001);
  setU16(view, extra + 2, 16);
  setU64(view, extra + 4, size);
  setU64(view, extra + 12, size);
  return bytes;
}

function dataDescriptor(crc: number, size: bigint) {
  const bytes = new Uint8Array(24);
  const view = new DataView(bytes.buffer);
  setU32(view, 0, 0x08074b50);
  setU32(view, 4, crc);
  setU64(view, 8, size);
  setU64(view, 16, size);
  return bytes;
}

function centralHeader(entry: CentralEntry) {
  const extraLength = 28;
  const bytes = new Uint8Array(46 + entry.name.length + extraLength);
  const view = new DataView(bytes.buffer);
  setU32(view, 0, 0x02014b50);
  setU16(view, 4, 45);
  setU16(view, 6, 45);
  setU16(view, 8, 0x0808);
  setU16(view, 10, 0);
  setU16(view, 12, entry.dosTime);
  setU16(view, 14, entry.dosDate);
  setU32(view, 16, entry.crc);
  setU32(view, 20, 0xffffffff);
  setU32(view, 24, 0xffffffff);
  setU16(view, 28, entry.name.length);
  setU16(view, 30, extraLength);
  setU16(view, 32, 0);
  setU16(view, 34, 0);
  setU16(view, 36, 0);
  setU32(view, 38, 0);
  setU32(view, 42, 0xffffffff);
  bytes.set(entry.name, 46);
  const extra = 46 + entry.name.length;
  setU16(view, extra, 0x0001);
  setU16(view, extra + 2, 24);
  setU64(view, extra + 4, entry.size);
  setU64(view, extra + 12, entry.size);
  setU64(view, extra + 20, entry.offset);
  return bytes;
}

function zipEnd(entryCount: bigint, centralSize: bigint, centralOffset: bigint, zip64Offset: bigint) {
  const bytes = new Uint8Array(56 + 20 + 22);
  const view = new DataView(bytes.buffer);
  setU32(view, 0, 0x06064b50);
  setU64(view, 4, 44n);
  setU16(view, 12, 45);
  setU16(view, 14, 45);
  setU32(view, 16, 0);
  setU32(view, 20, 0);
  setU64(view, 24, entryCount);
  setU64(view, 32, entryCount);
  setU64(view, 40, centralSize);
  setU64(view, 48, centralOffset);

  const locator = 56;
  setU32(view, locator, 0x07064b50);
  setU32(view, locator + 4, 0);
  setU64(view, locator + 8, zip64Offset);
  setU32(view, locator + 16, 1);

  const end = locator + 20;
  setU32(view, end, 0x06054b50);
  setU16(view, end + 4, 0);
  setU16(view, end + 6, 0);
  setU16(view, end + 8, Number(entryCount > 65_535n ? 65_535n : entryCount));
  setU16(view, end + 10, Number(entryCount > 65_535n ? 65_535n : entryCount));
  setU32(view, end + 12, centralSize > 0xffffffffn ? 0xffffffff : Number(centralSize));
  setU32(view, end + 16, centralOffset > 0xffffffffn ? 0xffffffff : Number(centralOffset));
  setU16(view, end + 20, 0);
  return bytes;
}

async function* zipGenerator(entries: PortableZipEntry[]) {
  const central: CentralEntry[] = [];
  let offset = 0n;

  for (const entry of entries) {
    if (!Number.isSafeInteger(entry.size) || entry.size < 0) throw new Error(`Invalid size for ${entry.path}.`);
    const name = validatedName(entry.path);
    const size = BigInt(entry.size);
    const { dosDate, dosTime } = zipDate(entry.modifiedAt);
    const localOffset = offset;
    const header = localHeader(name, size, dosDate, dosTime);
    offset += BigInt(header.length);
    yield header;

    const source = await entry.open();
    const reader = source.getReader();
    let readSize = 0n;
    let crc = 0xffffffff;
    try {
      for (;;) {
        const result = await reader.read();
        if (result.done) break;
        const chunk = result.value;
        readSize += BigInt(chunk.length);
        crc = updateCrc(crc, chunk);
        offset += BigInt(chunk.length);
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
    if (readSize !== size) throw new Error(`Original file size changed while exporting ${entry.path}.`);
    const finalCrc = (crc ^ 0xffffffff) >>> 0;
    const descriptor = dataDescriptor(finalCrc, size);
    offset += BigInt(descriptor.length);
    yield descriptor;
    central.push({ name, crc: finalCrc, size, offset: localOffset, dosDate, dosTime });
  }

  const centralOffset = offset;
  for (const entry of central) {
    const header = centralHeader(entry);
    offset += BigInt(header.length);
    yield header;
  }
  const centralSize = offset - centralOffset;
  const end = zipEnd(BigInt(central.length), centralSize, centralOffset, offset);
  offset += BigInt(end.length);
  yield end;
  return offset;
}

export function createPortableZip(entries: PortableZipEntry[]) {
  const iterator = zipGenerator(entries);
  let resolveCompleted!: (value: { sizeBytes: number }) => void;
  let rejectCompleted!: (reason?: unknown) => void;
  const completed = new Promise<{ sizeBytes: number }>((resolve, reject) => {
    resolveCompleted = resolve;
    rejectCompleted = reject;
  });
  let sizeBytes = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const result = await iterator.next();
        if (result.done) {
          controller.close();
          resolveCompleted({ sizeBytes });
          return;
        }
        sizeBytes += result.value.length;
        controller.enqueue(result.value);
      } catch (error) {
        controller.error(error);
        rejectCompleted(error);
      }
    },
    async cancel(reason) {
      await iterator.return?.(undefined);
      rejectCompleted(reason || new Error("Archive generation was cancelled."));
    },
  });
  return { stream, completed };
}

export function textZipEntry(path: string, content: string, modifiedAt = Date.now()): PortableZipEntry {
  const bytes = encoder.encode(content);
  return {
    path,
    size: bytes.length,
    modifiedAt,
    open: () => new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    }),
  };
}
