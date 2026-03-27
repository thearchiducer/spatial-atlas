import { buildDesignDirectionPacket } from "./designDirectionPacket";
import { normalizeEntryIds } from "./boardUtils";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueBy(items, keyBuilder) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = keyBuilder(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function termListFromEntries(entries) {
  return uniqueBy(
    safeArray(entries).map((entry) => ({
      id: entry?.id || "",
      term: entry?.term || "Untitled",
      type: entry?.type || "—",
    })),
    (item) => item.id || item.term,
  );
}

function titleList(items) {
  return uniqueBy(
    safeArray(items).map((item) => ({
      title: item?.title || "Untitled",
      description: item?.description || "",
    })),
    (item) => item.title,
  );
}

function diffByKey(leftItems, rightItems, key) {
  const left = safeArray(leftItems);
  const right = safeArray(rightItems);

  return {
    onlyInLeft: left.filter(
      (leftItem) =>
        !right.some((rightItem) => rightItem[key] === leftItem[key]),
    ),
    onlyInRight: right.filter(
      (rightItem) => !left.some((leftItem) => leftItem[key] === rightItem[key]),
    ),
  };
}

function buildSnapshotLabel(board, packet) {
  const boardName = board?.name || "Untitled board";
  const identityTitle = packet?.identity?.title || "Unlabeled direction";
  return `${boardName} · ${identityTitle}`;
}

export function buildDirectionVersionSnapshot(board) {
  if (!board?.id) return null;

  const packet = buildDesignDirectionPacket(board);
  const now = new Date().toISOString();

  return {
    id:
      "direction-version-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2, 8),
    savedAt: now,
    savedAtLabel: new Date(now).toLocaleString(),
    boardId: board.id,
    boardName: board.name || "Untitled board",
    label: buildSnapshotLabel(board, packet),
    board: {
      id: board.id,
      name: board.name || "Untitled board",
      description: board.description || "",
      notes: board.notes || "",
      intentSummaryLabel: board.intentSummaryLabel || "",
      entryIds: normalizeEntryIds(board),
      comparePairs: safeArray(board.comparePairs),
    },
    packet: {
      summary: packet.summary,
      identity: packet.identity,
      spatialTranslator: packet.spatialTranslator,
      entries: termListFromEntries(packet.entries),
      comparePairs: safeArray(packet.comparePairs),
      gapSignals: titleList(packet.summary?.gapSignals),
      tensions: titleList(packet.summary?.tensions),
      nextMoves: titleList(packet.summary?.nextMoves),
    },
  };
}

export function compareDirectionVersionSnapshots(leftSnapshot, rightSnapshot) {
  if (!leftSnapshot || !rightSnapshot) return null;

  const leftPacket = leftSnapshot.packet || {};
  const rightPacket = rightSnapshot.packet || {};

  const entryDiff = diffByKey(leftPacket.entries, rightPacket.entries, "id");
  const gapDiff = diffByKey(
    leftPacket.gapSignals,
    rightPacket.gapSignals,
    "title",
  );
  const tensionDiff = diffByKey(
    leftPacket.tensions,
    rightPacket.tensions,
    "title",
  );
  const moveDiff = diffByKey(
    leftPacket.nextMoves,
    rightPacket.nextMoves,
    "title",
  );

  return {
    left: leftSnapshot,
    right: rightSnapshot,
    summary: {
      identityChanged:
        leftPacket.identity?.title !== rightPacket.identity?.title,
      strengthChanged:
        leftPacket.identity?.strength !== rightPacket.identity?.strength,
      privacyChanged:
        leftPacket.summary?.privacyModel !== rightPacket.summary?.privacyModel,
      socialChanged:
        leftPacket.summary?.socialModel !== rightPacket.summary?.socialModel,
      circulationChanged:
        leftPacket.summary?.circulationModel !==
        rightPacket.summary?.circulationModel,
      serviceChanged:
        leftPacket.summary?.serviceStrategy !==
        rightPacket.summary?.serviceStrategy,
    },
    entryDiff,
    gapDiff,
    tensionDiff,
    moveDiff,
  };
}
