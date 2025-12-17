import type { SDK } from "caido:plugin";

import { getDb } from "../db/client";
import { RoleStore } from "../stores/roles";
import { TemplateStore } from "../stores/templates";
import { UserStore } from "../stores/users";

export const getActiveProject = async (sdk: SDK) => {
  const project = await sdk.projects.getCurrent();
  if (!project) {
    return {
      type: "Err" as const,
      message: "No project selected",
    };
  }

  return {
    type: "Ok" as const,
    id: project.getId(),
  };
};

export const deleteProjectData = async (sdk: SDK, projectId: string) => {
  const db = await getDb(sdk);

  const deleteRoles = await db.prepare(
    `DELETE FROM roles WHERE project_id = ?`,
  );
  await deleteRoles.run(projectId);

  const deleteUsers = await db.prepare(
    `DELETE FROM users WHERE project_id = ?`,
  );
  await deleteUsers.run(projectId);

  const deleteUserRoles = await db.prepare(
    `DELETE FROM user_roles WHERE project_id = ?`,
  );
  await deleteUserRoles.run(projectId);

  const deleteUserAttributes = await db.prepare(
    `DELETE FROM user_attributes WHERE project_id = ?`,
  );
  await deleteUserAttributes.run(projectId);

  const deleteTemplateRules = await db.prepare(
    `DELETE FROM template_rules WHERE project_id = ?`,
  );
  await deleteTemplateRules.run(projectId);

  const deleteTemplates = await db.prepare(
    `DELETE FROM templates WHERE project_id = ?`,
  );
  await deleteTemplates.run(projectId);

  const roleStore = RoleStore.get();
  const templateStore = TemplateStore.get();
  const userStore = UserStore.get();

  roleStore.clear();
  templateStore.clearTemplates();
  userStore.clear();
};

export const sendToReplay = async (sdk: SDK, requestId: string) => {
  try {
    const collections = await sdk.replay.getCollections();
    const collection = collections.find((c) => c.getName() === "AuthMatrix");

    const session = await sdk.replay.createSession(requestId, collection);

    return {
      type: "Ok" as const,
      sessionId: session.getId(),
    };
  } catch {
    return {
      type: "Err" as const,
      message: "Failed to send to Replay",
    };
  }
};
