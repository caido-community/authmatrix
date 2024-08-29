import type { AnalysisResult } from "shared";

export class AnalysisStore {
  private static _store?: AnalysisStore;

  private results: Map<string, AnalysisResult>;

  private constructor() {
    this.results = new Map();
  }

  static get(): AnalysisStore {
    if (!AnalysisStore._store) {
      AnalysisStore._store = new AnalysisStore();
    }

    return AnalysisStore._store;
  }

  getResults() {
    return [...this.results.values()];
  }

  addResult(result: AnalysisResult) {
    this.results.set(result.id, result);
  }

  deleteResult(resultId: string) {
    this.results.delete(resultId);
  }
}

