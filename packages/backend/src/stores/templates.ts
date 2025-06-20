import type { RoleRuleDTO, TemplateDTO, UserRuleDTO } from "shared";

export class TemplateStore {
  private static _store?: TemplateStore;

  private templates: Map<string, TemplateDTO>;

  private constructor() {
    this.templates = new Map();
  }

  static get(): TemplateStore {
    if (!TemplateStore._store) {
      TemplateStore._store = new TemplateStore();
    }

    return TemplateStore._store;
  }

  getTemplates() {
    return [...this.templates.values()];
  }

  templateExists(id: string): boolean {
    return this.templates.get(id) !== undefined;
  }

  addTemplate(template: TemplateDTO) {
    this.templates.set(template.id, template);
  }

  updateTemplate(id: string, fields: Omit<TemplateDTO, "id">) {
    const template = this.templates.get(id);
    if (template) {
      Object.assign(template, fields);
      return template;
    }
  }

  deleteTemplate(templateId: string) {
    this.templates.delete(templateId);
  }

  toggleTemplateRole(templateId: string, roleId: string) {
    const template = this.templates.get(templateId);
    if (template) {
      const currRule = template.rules.find((rule) => {
        return rule.type === "RoleRule" && rule.roleId === roleId;
      });

      if (currRule) {
        this.toggleRule(currRule);
      } else {
        template.rules.push({
          type: "RoleRule",
          roleId,
          hasAccess: true,
          status: "Untested",
        });
      }
    }

    return template;
  }

  toggleRule(currRule: RoleRuleDTO | UserRuleDTO) {
    currRule.hasAccess = !currRule.hasAccess;
    if (currRule.status === "Bypassed" && currRule.hasAccess) {
      currRule.status = "Enforced";
    } else if (currRule.status === "Enforced" && !currRule.hasAccess) {
      currRule.status = "Bypassed";
    }
  }

  toggleTemplateUser(templateId: string, userId: string) {
    const template = this.templates.get(templateId);
    if (template) {
      const currRule = template.rules.find((rule) => {
        return rule.type === "UserRule" && rule.userId === userId;
      });

      if (currRule) {
        this.toggleRule(currRule);
      } else {
        template.rules.push({
          type: "UserRule",
          userId,
          hasAccess: true,
          status: "Untested",
        });
      }
    }

    return template;
  }

  clearTemplates() {
    this.templates.clear();
  }
}
