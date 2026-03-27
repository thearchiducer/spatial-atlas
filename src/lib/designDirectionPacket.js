import { buildDirectionSummary } from "./designDirection";
import { buildDirectionIdentity } from "./directionIdentity";
import { buildSpatialMoves } from "./spatialMoves";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function buildDesignDirectionPacket(board) {
  const safeBoard = board || {};
  const entries = safeArray(safeBoard.entries);
  const comparePairs = safeArray(safeBoard.comparePairs);

  const summary = buildDirectionSummary(entries);
  const identity = buildDirectionIdentity(summary, entries);
  const spatialTranslator = buildSpatialMoves(summary, identity, entries);

  return {
    board: safeBoard,
    entries,
    comparePairs,
    summary,
    identity,
    spatialTranslator,
  };
}
