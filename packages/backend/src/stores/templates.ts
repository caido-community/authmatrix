import type { Template } from "shared";

export class TemplateStore {
  private static _store?: TemplateStore;

  private templates: Map<string, Template>;

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

  addTemplate(template: Template) {
    this.templates.set(template.id, template);
  }

  deleteTemplate(templateId: string) {
    this.templates.delete(templateId);
  }

  toggleTemplateRole(templateId: string, roleId: string) {
    const template = this.templates.get(templateId);
    if (template) {
      if (template.roleIds.includes(roleId)) {
        template.roleIds = template.roleIds.filter((id) => id !== roleId);
      } else {
        template.roleIds.push(roleId);
      }

      return template;
    }
  }

  toggleTemplateUser(templateId: string, userId: string) {
    const template = this.templates.get(templateId);
    if (template) {
      if (template.userIds.includes(userId)) {
        template.userIds = template.userIds.filter((id) => id !== userId);
      } else {
        template.userIds.push(userId);
      }

      return template;
    }
  }
}

