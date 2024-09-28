export type RuleStatusDTO = "Untested" | "Enforced" | "Bypassed" | "Unexpected";
export type RoleRuleDTO = {
  type: "RoleRule";
  roleId: string;
  hasAccess: boolean;
  status: RuleStatusDTO;
};

export type UserRuleDTO = {
  type: "UserRule";
  userId: string;
  hasAccess: boolean;
  status: RuleStatusDTO;
};

export type TemplateDTO = {
  id: string;
  authSuccessRegex: string;
  rules: (RoleRuleDTO | UserRuleDTO)[];
  requestId: string;
  meta: {
    host: string;
    port: number;
    path: string;
    isTls: boolean;
    method: string;
  };
};

export type AnalysisRequestDTO = {
  id: string;
  userId: string;
  requestId: string;
  templateId: string;
};

export type RoleDTO = {
  id: string;
  name: string;
  description: string;
};

export type SettingsDTO = {
  autoCaptureRequests: "off" | "all" | "inScope";
  autoRunAnalysis: boolean;
};

export type UserAttributeDTO = {
  id: string;
  name: string;
  value: string;
  kind: "Cookie" | "Header";
};

export type UserDTO = {
  id: string;
  name: string;
  roleIds: string[];
  attributes: UserAttributeDTO[];
};
