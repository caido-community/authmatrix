import type { AnalysisRequestDTO } from "shared";

export class AnalysisStore {
  private static _store?: AnalysisStore;

  private requests: Map<string, AnalysisRequestDTO>;

  private analysisLookup: Map<string, boolean>;

  private constructor() {
    this.requests = new Map();
    this.analysisLookup = new Map();
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

  getResultHash(templateId: string, userId: string): string {
    return `${templateId}-${userId}`;
  }

  resultExists(templateId: string, userId: string): boolean {
    return this.resultExistsByResultHash(this.getResultHash(templateId, userId));
  }

  resultExistsByResultHash(resultHash: string): boolean {
    return this.analysisLookup.get(resultHash) === true;
  }

  addRequest(result: AnalysisRequestDTO) {
    let resultHash = this.getResultHash(result.templateId, result.userId);
    if (this.resultExistsByResultHash(resultHash)) {
      return;
    }
    this.requests.set(result.id, result);
    this.analysisLookup.set(resultHash, true);
  }

  deleteRequest(requestId: string) {
    let result = this.requests.get(requestId);
    if (!result) {
      return;
    }
    this.analysisLookup.delete(this.getResultHash(result.templateId, result.userId));
    this.requests.delete(requestId);
  }

  clearRequests() {
    this.requests.clear();
    this.analysisLookup.clear();
  }
}
