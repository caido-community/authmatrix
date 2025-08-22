import type { SDK } from "caido:plugin";
import { getDb } from "../db";
import { UserStore } from "../stores/users";
import { RoleStore } from "../stores/roles";

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
    `DELETE FROM roles WHERE project_id = ?`
  );
  await deleteRoles.run(projectId);

  const deleteUsers = await db.prepare(
    `DELETE FROM users WHERE project_id = ?`
  );
  await deleteUsers.run(projectId);

  const deleteUserRoles = await db.prepare(
    `DELETE FROM user_roles WHERE project_id = ?`
  );
  await deleteUserRoles.run(projectId);

  const deleteUserAttributes = await db.prepare(
    `DELETE FROM user_attributes WHERE project_id = ?`
  );
  await deleteUserAttributes.run(projectId);

  const roleStore = RoleStore.get();
  const userStore = UserStore.get();
  roleStore.clear();
  userStore.clear();
};
