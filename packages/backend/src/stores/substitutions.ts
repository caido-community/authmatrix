import type { SubstitutionDTO } from "shared";

export class SubstitutionStore {
  private static _store?: SubstitutionStore;

  private substitutions: Map<string, SubstitutionDTO>;

  private constructor() {
    this.substitutions = new Map();
  }

  static get(): SubstitutionStore {
    if (!SubstitutionStore._store) {
      SubstitutionStore._store = new SubstitutionStore();
    }
    return SubstitutionStore._store;
  }

  addSubstitution(substitution: SubstitutionDTO): void {
    this.substitutions.set(substitution.id, substitution);
  }

  updateSubstitution(
    id: string,
    fields: Omit<SubstitutionDTO, "id">,
  ): SubstitutionDTO | undefined {
    const existing = this.substitutions.get(id);
    if (!existing) return undefined;

    const updated: SubstitutionDTO = { ...existing, ...fields };
    this.substitutions.set(id, updated);
    return updated;
  }

  deleteSubstitution(id: string): boolean {
    return this.substitutions.delete(id);
  }

  getSubstitutions(): SubstitutionDTO[] {
    return Array.from(this.substitutions.values());
  }

  getSubstitution(id: string): SubstitutionDTO | undefined {
    return this.substitutions.get(id);
  }

  clear(): void {
    this.substitutions.clear();
  }
}
