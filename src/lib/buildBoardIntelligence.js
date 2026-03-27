import { compareBoards } from "./compareBoards";
import { evaluateBoardDirection } from "./evaluateBoardDirection";
import { buildDirectionalRecommendations } from "./buildDirectionalRecommendations";
import { buildBoardTransformations } from "./buildBoardTransformations";

export function buildBoardIntelligence({
  board,
  entries = [],
  comparisonBoard = null,
  decisionProfile = null,
}) {
  if (!board) {
    return {
      analysis: null,
      recommendations: [],
      transformationPlan: null,
      comparison: null,
    };
  }

  const analysis = evaluateBoardDirection(board, entries);

  const comparison =
    comparisonBoard && comparisonBoard.id !== board.id
      ? compareBoards(board, comparisonBoard, entries, decisionProfile)
      : null;

  const recommendations = buildDirectionalRecommendations({
    board,
    entries,
    comparisonBoard,
    decisionProfile,
    existingAnalysis: analysis,
    existingComparison: comparison,
  });

  const transformationPlan =
    comparisonBoard && comparisonBoard.id !== board.id
      ? buildBoardTransformations({
          boardA: board,
          boardB: comparisonBoard,
          entries,
          decisionProfile,
          existingComparison: comparison,
        })
      : null;

  return {
    analysis,
    recommendations,
    transformationPlan,
    comparison,
  };
}
