import type { AnalysisRequestDTO } from "shared";

export class AnalysisStore {
  private static _store?: AnalysisStore;

  private requests: Map<string, AnalysisRequestDTO>;

  private constructor() {
    this.requests = new Map();
  }

  static get(): AnalysisStore {
    if (!AnalysisStore._store) {
      AnalysisStore._store = new AnalysisStore();
    }

    return AnalysisStore._store;
  }

  getResults() {
    return [...this.requests.values()];
  }

  addRequest(result: AnalysisRequestDTO) {
    this.requests.set(result.id, result);
  }

  deleteRequest(requestId: string) {
    this.requests.delete(requestId);
  }

  clearRequests() {
    this.requests.clear();
  }
}
