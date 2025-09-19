import type { SDK } from "caido:plugin";
import type { ID, Request, Response } from "caido:utils";
import { RequestSpec } from "caido:utils";
import type { TemplateDTO } from "shared";

import { withProject } from "../db/utils";
import {
  clearAllTemplates,
  createTemplate,
  removeTemplate,
  replaceTemplateRules,
  updateTemplateFields,
  upsertTemplateRule,
} from "../repositories/templates";
import { SettingsStore } from "../stores/settings";
import { TemplateStore } from "../stores/templates";
import type { BackendEvents } from "../types";
import { generateID, sha256Hash } from "../utils";

import { runAnalysis } from "./analysis";

export const getTemplates = (_sdk: SDK): TemplateDTO[] => {
  const store = TemplateStore.get();
  return store.getTemplates();
};

export const updateTemplateRequest = async (
  sdk: SDK<never, BackendEvents>,
  templateId: string,
  requestSpec: RequestSpec,
): Promise<TemplateDTO | undefined> => {
  const store = TemplateStore.get();
  const template = store.getTemplates().find(t => t.id === templateId);

  if (template === undefined) {
    return undefined;
  }

  try {
    // Send the updated request to create a new request/response pair
    const result = await sdk.requests.send(requestSpec);

    if (result.response === undefined) {
      return undefined;
    }

    // Update the template with the new request ID and metadata
    const updatedTemplate: TemplateDTO = {
      ...template,
      requestId: result.request.getId().toString(),
      meta: {
        host: result.request.getHost(),
        port: result.request.getPort(),
        method: result.request.getMethod(),
        isTls: result.request.getTls(),
        path: result.request.getPath(),
      },
    };

    store.updateTemplate(templateId, updatedTemplate);

    // Save to database
    await withProject(sdk, async (projectId) => {
      const { id, ...fields } = updatedTemplate;
      await updateTemplateFields(sdk, projectId, templateId, fields);
    });

    return updatedTemplate;
  } catch (error) {
    console.error("Failed to update template request:", error);
    return undefined;
  }
};

export const updateTemplateRequestRaw = async (
  sdk: SDK<never, BackendEvents>,
  templateId: string,
  requestRaw: string,
): Promise<TemplateDTO | undefined> => {
  const store = TemplateStore.get();
  const template = store.getTemplates().find(t => t.id === templateId);

  if (template === undefined) {
    return undefined;
  }

  try {
    console.log("Parsing raw request:", requestRaw.substring(0, 100) + "...");
    
    // Normalize line endings and parse the raw request
    const normalizedRequest = requestRaw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedRequest.split('\n');
    
    console.log("Request lines:", lines.length);
    
    if (lines.length === 0) {
      throw new Error("Empty request");
    }
    
    const requestLine = lines[0].trim();
    console.log("Request line:", requestLine);
    
    if (!requestLine) {
      throw new Error("Invalid request format - empty request line");
    }
    
    const parts = requestLine.split(' ');
    console.log("Request line parts:", parts);
    
    if (parts.length < 3) {
      throw new Error(`Invalid request line format - expected "METHOD URL HTTP/VERSION", got: "${requestLine}"`);
    }
    
    const method = parts[0];
    const url = parts[1];
    const protocol = parts[2];
    
    console.log("Parsed method:", method, "URL:", url, "Protocol:", protocol);
    
    if (!method || !url || !protocol) {
      throw new Error(`Invalid request line - missing method, URL, or protocol: "${requestLine}"`);
    }
    
    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(method.toUpperCase())) {
      throw new Error(`Invalid HTTP method: "${method}"`);
    }
    
    // Find the end of headers (empty line)
    let headerEndIndex = 1;
    while (headerEndIndex < lines.length && lines[headerEndIndex]?.trim() !== '') {
      headerEndIndex++;
    }
    
    console.log("Header end index:", headerEndIndex);
    
    // Extract headers
    const headerLines = lines.slice(1, headerEndIndex);
    const bodyLines = lines.slice(headerEndIndex + 1);
    
    console.log("Header lines:", headerLines.length, "Body lines:", bodyLines.length);
    
    // Create RequestSpec with parsed data
    const spec = new RequestSpec(url);
    spec.setMethod(method);
    
    // Add headers
    for (const headerLine of headerLines) {
      const colonIndex = headerLine.indexOf(':');
      if (colonIndex > 0) {
        const name = headerLine.substring(0, colonIndex).trim();
        const value = headerLine.substring(colonIndex + 1).trim();
        console.log("Adding header:", name, "=", value);
        spec.setHeader(name, value);
      }
    }
    
    // Add body
    if (bodyLines.length > 0) {
      const body = bodyLines.join('\n');
      console.log("Setting body:", body.substring(0, 50) + "...");
      spec.setBody(body);
    }

    // Send the updated request to create a new request/response pair
    const result = await sdk.requests.send(spec);

    if (result.response === undefined) {
      return undefined;
    }

    // Update the template with the new request ID and metadata
    const updatedTemplate: TemplateDTO = {
      ...template,
      requestId: result.request.getId().toString(),
      meta: {
        host: result.request.getHost(),
        port: result.request.getPort(),
        method: result.request.getMethod(),
        isTls: result.request.getTls(),
        path: result.request.getPath(),
      },
    };

    store.updateTemplate(templateId, updatedTemplate);

    // Save to database
    await withProject(sdk, async (projectId) => {
      const { id, ...fields } = updatedTemplate;
      await updateTemplateFields(sdk, projectId, templateId, fields);
    });

    return updatedTemplate;
  } catch (error) {
    console.error("Failed to update template request from raw:", error);
    console.error("Error details:", error.message);
    console.error("Request raw data:", requestRaw);
    
    // Re-throw the error with more context for the frontend
    throw new Error(`Failed to parse request: ${error.message}`);
  }
};

export const addTemplate = async (sdk: SDK<never, BackendEvents>) => {
  const project = await sdk.projects.getCurrent();
  if (!project) return;

  const newTemplate: TemplateDTO = {
    id: generateID(),
    requestId: generateID(),
    authSuccessRegex: "HTTP/1[.]1 200",
    rules: [],
    meta: {
      host: "localhost",
      port: 10134,
      path: "/",
      isTls: false,
      method: "GET",
    },
  };

  const store = TemplateStore.get();
  store.addTemplate(newTemplate);

  await withProject(sdk, async (projectId) => {
    await createTemplate(sdk, projectId, newTemplate);
    sdk.api.send("templates:created", newTemplate);
  });

  return newTemplate;
};

export const deleteTemplate = async (sdk: SDK, requestId: string) => {
  const store = TemplateStore.get();
  store.deleteTemplate(requestId);

  await withProject(sdk, async (projectId) => {
    await removeTemplate(sdk, projectId, requestId);
  });
};

export const updateTemplate = async (
  sdk: SDK<never, BackendEvents>,
  id: string,
  fields: Omit<TemplateDTO, "id">,
) => {
  const store = TemplateStore.get();
  const newTemplate = store.updateTemplate(id, fields);

  await withProject(sdk, async (projectId) => {
    await updateTemplateFields(sdk, projectId, id, fields);
    await replaceTemplateRules(sdk, projectId, id, fields.rules);
    sdk.api.send("templates:updated", newTemplate);
  });

  return newTemplate;
};

export const toggleTemplateRole = async (
  sdk: SDK<never, BackendEvents>,
  requestId: string,
  roleId: string,
) => {
  const store = TemplateStore.get();

  const newTemplate = store.toggleTemplateRole(requestId, roleId);
  sdk.api.send("templates:updated", newTemplate);
  if (!newTemplate) return undefined;

  const rule = newTemplate.rules.find((r) => {
    return r.type === "RoleRule" && r.roleId === roleId;
  });
  if (!rule) return newTemplate;

  await withProject(sdk, async (projectId) => {
    await upsertTemplateRule(sdk, projectId, requestId, rule);
  });

  return newTemplate;
};

export const toggleTemplateUser = async (
  sdk: SDK<never, BackendEvents>,
  requestId: string,
  userId: string,
) => {
  const store = TemplateStore.get();

  const newTemplate = store.toggleTemplateUser(requestId, userId);
  sdk.api.send("templates:updated", newTemplate);
  if (!newTemplate) return undefined;

  const rule = newTemplate.rules.find((r) => {
    return r.type === "UserRule" && r.userId === userId;
  });
  if (!rule) return newTemplate;

  await withProject(sdk, async (projectId) => {
    await upsertTemplateRule(sdk, projectId, requestId, rule);
  });

  return newTemplate;
};

export const clearTemplates = async (sdk: SDK<never, BackendEvents>) => {
  const store = TemplateStore.get();
  store.clearTemplates();

  await withProject(sdk, async (projectId) => {
    await clearAllTemplates(sdk, projectId);
    sdk.api.send("templates:cleared");
  });
};

export const onInterceptResponse = async (
  sdk: SDK<never, BackendEvents>,
  request: Request,
  response: Response,
) => {
  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();
  const store = TemplateStore.get();

  if (settings.autoCaptureRequests === "off") {
    return;
  }

  if (!sdk.requests.matches(settings.defaultFilterHTTPQL, request)) {
    return;
  }

  const templateId = generateTemplateId(request, settings.deDuplicateHeaders);
  if (store.templateExists(templateId)) {
    return;
  }

  const project = await sdk.projects.getCurrent();
  if (!project) return;

  switch (settings.autoCaptureRequests) {
    case "all": {
      const template = toTemplate(request, response, templateId);
      store.addTemplate(template);

      await withProject(sdk, async (projectId) => {
        await createTemplate(sdk, projectId, template);
        sdk.api.send("templates:created", template);
      });
      break;
    }
    case "inScope": {
      if (sdk.requests.inScope(request)) {
        const template = toTemplate(request, response, templateId);
        store.addTemplate(template);

        await withProject(sdk, async (projectId) => {
          await createTemplate(sdk, projectId, template);
          sdk.api.send("templates:created", template);
        });
      }
      break;
    }
  }

  if (settings.autoRunAnalysis) {
    runAnalysis(sdk);
  }
};

export const addTemplateFromContext = async (
  sdk: SDK<never, BackendEvents>,
  request_id: ID,
) => {
  const project = await sdk.projects.getCurrent();
  if (!project) return;

  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();
  const store = TemplateStore.get();

  const result = await sdk.requests.get(request_id.toString());
  if (!result) {
    return;
  }

  const request = result.request;
  const response = result.response;
  if (!response) {
    return;
  }

  const templateId = generateTemplateId(request, settings.deDuplicateHeaders);
  if (store.templateExists(templateId)) {
    return;
  }

  const template = toTemplate(request, response, templateId);
  store.addTemplate(template);
  sdk.api.send("templates:created", template);

  await createTemplate(sdk, project.getId(), template);
};

export const registerTemplateEvents = (sdk: SDK) => {
  sdk.events.onInterceptResponse(onInterceptResponse);
};

// Enhanced OpenAPI (Swagger) types for detailed parsing
type OpenApiSpec = {
  openapi?: string;
  swagger?: string;
  servers?: Array<{ url: string }>;
  schemes?: Array<"http" | "https">;
  host?: string;
  basePath?: string;
  paths?: Record<string, Record<string, Operation>>;
  definitions?: Record<string, Schema>;
};

type Operation = {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  consumes?: string[];
  produces?: string[];
  parameters?: Parameter[];
  responses?: Record<string, OpenApiResponse>;
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
};

type Parameter = {
  name: string;
  in: "query" | "header" | "path" | "formData" | "body";
  description?: string;
  required?: boolean;
  type?: string;
  format?: string;
  schema?: Schema;
  items?: Schema;
  enum?: string[];
  default?: unknown;
  example?: unknown;
  collectionFormat?: string;
};

type OpenApiResponse = {
  description: string;
  schema?: Schema;
  headers?: Record<string, Header>;
};

type Header = {
  type: string;
  format?: string;
  description?: string;
};

type Schema = {
  type?: string;
  format?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: string[];
  example?: unknown;
  $ref?: string;
  additionalProperties?: Schema;
  xml?: Record<string, unknown>;
};

const inferHostPortTls = (
  spec: OpenApiSpec,
): { host: string; port: number; isTls: boolean; basePath: string } => {
  // OpenAPI v3 preferred
  if (Array.isArray(spec.servers) && spec.servers.length > 0) {
    const first = spec.servers[0];
    const url = first && typeof first.url === "string" ? first.url : undefined;
    if (url !== undefined) {
      const m = url.match(/^(https?):\/\/([^/:]+)(?::(\d+))?([^?#]*)/);
      if (m) {
        const scheme = m[1];
        const host: string = m[2] ?? "localhost";
        const portStr = m[3];
        const path = m[4] ?? "";
        const isTls = scheme === "https";
        const port = portStr !== undefined ? Number(portStr) : isTls ? 443 : 80;
        return {
          host,
          port,
          isTls,
          basePath: path === "/" ? "" : path,
        };
      }
    }
  }

  // Swagger v2 fallback
  const scheme =
    Array.isArray(spec.schemes) && spec.schemes.includes("https")
      ? "https"
      : "http";
  const isTls = scheme === "https";
  const host = spec.host ?? "localhost";
  const basePath = spec.basePath ?? "";
  const port = isTls ? 443 : 80;
  return { host, port, isTls, basePath };
};

const generateExampleFromSchema = (
  schema: Schema,
  definitions?: Record<string, Schema>,
): unknown => {
  // Handle explicit examples first
  if (schema.example !== undefined) {
    return schema.example;
  }

  // Resolve $ref references
  if (schema.$ref !== undefined) {
    const refName = schema.$ref.replace("#/definitions/", "");
    const refSchema = definitions?.[refName];
    return refSchema ? generateExampleFromSchema(refSchema, definitions) : {};
  }

  // Generate examples based on type
  switch (schema.type) {
    case "string":
      return schema.enum?.[0] ?? schema.default ?? "string";
    case "integer":
    case "number":
      return schema.default ?? 0;
    case "boolean":
      return schema.default ?? true;
    case "array":
      return schema.items
        ? [generateExampleFromSchema(schema.items, definitions)]
        : [];
    case "object":
      return generateObjectExample(schema, definitions);
    default:
      return {};
  }
};

const generateObjectExample = (
  schema: Schema,
  definitions?: Record<string, Schema>,
): Record<string, unknown> => {
  if (!schema.properties) return {};

  const obj: Record<string, unknown> = {};
  const requiredFields = schema.required || [];

  // Include required fields
  for (const field of requiredFields) {
    if (schema.properties[field]) {
      obj[field] = generateExampleFromSchema(
        schema.properties[field],
        definitions,
      );
    }
  }

  // Include fields with examples or defaults
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    if (propSchema.example !== undefined || propSchema.default !== undefined) {
      obj[key] = generateExampleFromSchema(propSchema, definitions);
    }
  }

  // If no fields were included (no required fields and no examples/defaults),
  // include ALL available properties to create a complete example
  if (Object.keys(obj).length === 0) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      obj[key] = generateExampleFromSchema(propSchema, definitions);
    }
  }

  return obj;
};

const buildRequestBody = (
  operation: Operation,
  definitions?: Record<string, Schema>,
): string | undefined => {
  if (!operation.parameters) return undefined;

  const contentType =
    operation.consumes && operation.consumes.length > 0
      ? operation.consumes[0]
      : "application/json";

  // Handle body parameters (JSON/XML)
  const bodyParam = operation.parameters.find((p) => p.in === "body");
  if (bodyParam && bodyParam.schema) {
    const example = generateExampleFromSchema(bodyParam.schema, definitions);

    switch (contentType) {
      case "application/json":
        return JSON.stringify(example, null, 2);
      case "application/xml":
        // For XML, we'll return JSON for now (could be enhanced later)
        return JSON.stringify(example, null, 2);
      default:
        return JSON.stringify(example, null, 2);
    }
  }

  // Handle formData parameters (form-encoded data)
  const formDataParams = operation.parameters.filter(
    (p) => p.in === "formData",
  );
  if (formDataParams.length > 0) {
    const params = new URLSearchParams();

    for (const param of formDataParams) {
      // Include all formData parameters to create a complete example
      let value = "";

      // Priority: example > default > type-based
      if (param.example !== undefined) {
        value = safeStringify(param.example);
      } else if (param.default !== undefined) {
        value = safeStringify(param.default);
      } else {
        // Type-based fallbacks
        switch (param.type) {
          case "integer":
          case "number":
            value = "0";
            break;
          case "boolean":
            value = "true";
            break;
          case "string":
            value = "string";
            break;
          default:
            value = "string";
        }
      }

      if (value) {
        params.append(param.name, value);
      }
    }

    const formData = params.toString();
    return formData ? formData : undefined;
  }

  return undefined;
};

const safeStringify = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return JSON.stringify(value);
};

const buildQueryString = (
  operation: Operation,
  definitions?: Record<string, Schema>,
): string => {
  if (!operation.parameters) return "";

  const queryParams = operation.parameters.filter((p) => p.in === "query");
  if (queryParams.length === 0) return "";

  const params = new URLSearchParams();
  for (const param of queryParams) {
    // Include required parameters and parameters with examples/defaults
    if (
      param.required !== false ||
      param.example !== undefined ||
      param.default !== undefined
    ) {
      const value = getQueryParameterValue(param, definitions);
      if (value) {
        params.append(param.name, value);
      }
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const getQueryParameterValue = (
  param: Parameter,
  definitions?: Record<string, Schema>,
): string => {
  // Priority: example > default > enum > array items enum > schema resolution > type-based
  if (param.example !== undefined) return safeStringify(param.example);
  if (param.default !== undefined) return safeStringify(param.default);
  if (param.enum && param.enum.length > 0) return param.enum[0] ?? "example";
  if (param.items?.enum && param.items.enum.length > 0)
    return param.items.enum[0] ?? "example";

  // Resolve schema references if available
  if (param.schema && definitions) {
    const resolvedValue = generateExampleFromSchema(param.schema, definitions);
    return safeStringify(resolvedValue);
  }

  // Type-based fallbacks
  switch (param.type) {
    case "integer":
    case "number":
      return "0";
    case "boolean":
      return "true";
    case "array":
      return "string";
    default:
      return "string";
  }
};

const replacePathParameters = (
  path: string,
  operation: Operation,
  definitions?: Record<string, Schema>,
): string => {
  if (!operation.parameters) {
    return path.replace(/\{[^}]+\}/g, "1");
  }

  const pathParams = operation.parameters.filter((p) => p.in === "path");
  let result = path;

  for (const param of pathParams) {
    const placeholder = `{${param.name}}`;
    const value = getParameterValue(param, definitions);
    result = result.replace(placeholder, value);
  }

  // Replace any remaining placeholders with default values
  return result.replace(/\{[^}]+\}/g, "1");
};

const getParameterValue = (
  param: Parameter,
  definitions?: Record<string, Schema>,
): string => {
  // Priority: example > default > enum > schema resolution > type-based
  if (param.example !== undefined) return safeStringify(param.example);
  if (param.default !== undefined) return safeStringify(param.default);
  if (param.enum && param.enum.length > 0) return param.enum[0] ?? "1";

  // Resolve schema references if available
  if (param.schema && definitions) {
    const resolvedValue = generateExampleFromSchema(param.schema, definitions);
    return safeStringify(resolvedValue);
  }

  // Type-based fallbacks
  switch (param.type) {
    case "integer":
    case "number":
      return "0";
    case "boolean":
      return "true";
    case "string": {
      const name = param.name.toLowerCase();
      if (name.includes("id") || name.includes("key")) return "0";
      if (name.includes("name") || name.includes("user")) return "string";
      if (name.includes("email")) return "string";
      if (name.includes("token")) return "string";
      return "string";
    }
    default:
      return "string";
  }
};

const buildHeaders = (operation: Operation): Record<string, string[]> => {
  const headers: Record<string, string[]> = {};

  if (operation.parameters) {
    for (const param of operation.parameters) {
      if (param.in === "header") {
        let value = "";
        if (param.example !== undefined) {
          value = safeStringify(param.example);
        } else if (param.default !== undefined) {
          value = safeStringify(param.default);
        } else {
          value = "example";
        }
        if (value !== undefined) {
          headers[param.name] = [value];
        }
      }
    }
  }

  // Add content-type header for requests with body
  if (operation.consumes && operation.consumes.length > 0) {
    headers["Content-Type"] = [operation.consumes[0] ?? "application/json"];
  }

  return headers;
};

export const importTemplatesFromOpenApi = async (
  sdk: SDK<never, BackendEvents>,
  rawJson: string,
): Promise<number> => {
  sdk.console.log("Starting OpenAPI import...");

  const project = await sdk.projects.getCurrent();
  if (!project) {
    sdk.console.log("No current project found");
    return 0;
  }

  let spec: OpenApiSpec;
  try {
    spec = JSON.parse(rawJson) as OpenApiSpec;
    sdk.console.log("JSON parsed successfully");
  } catch (error) {
    sdk.console.log(`JSON parsing failed: ${error}`);
    return 0;
  }

  if (!spec.paths) {
    sdk.console.log("No paths found in spec");
    return 0;
  }

  sdk.console.log(`Found ${Object.keys(spec.paths).length} paths in spec`);

  const { host, port, isTls, basePath } = inferHostPortTls(spec);

  const store = TemplateStore.get();
  let created = 0;

  for (const [pathKey, methods] of Object.entries(spec.paths)) {
    for (const [methodKey, operation] of Object.entries(methods)) {
      const method = methodKey.toUpperCase();
      // Only standard HTTP methods
      if (
        !["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(
          method,
        )
      )
        continue;

      const fullPath = `${basePath || ""}${pathKey}`;
      // Replace placeholder path params with realistic values based on parameter definitions
      const resolvedPath = replacePathParameters(
        fullPath,
        operation,
        spec.definitions,
      );
      const queryString = buildQueryString(operation, spec.definitions);
      const fullUrl = `${isTls ? "https" : "http"}://${host}:${port}${resolvedPath}${queryString}`;

      // Try to create a real base request in Caido so the UI can load it later
      let createdTemplate: TemplateDTO | undefined = undefined;
      try {
        const requestSpec = new RequestSpec(fullUrl);
        requestSpec.setMethod(method);

        // Add headers
        const headers = buildHeaders(operation);
        for (const [headerName, headerValues] of Object.entries(headers)) {
          requestSpec.setHeader(headerName, headerValues.join(", "));
        }

        // Add request body if present
        const body = buildRequestBody(operation, spec.definitions);
        if (body !== undefined) {
          requestSpec.setBody(body);
        }

        const sent = await sdk.requests.send(requestSpec);
        const realRequest = sent.request;
        const realResponse =
          sent.response ?? ({ getCode: () => 200 } as unknown as Response);

        // Generate template ID manually to avoid issues with the request object
        const templateId = generateTemplateId(realRequest);
        const temp = toTemplate(realRequest, realResponse, templateId);
        // Preserve original placeholder path in template meta for user editing
        temp.meta.path = fullPath;
        createdTemplate = temp;
      } catch (error) {
        sdk.console.log(
          `Failed to send request for ${method} ${fullPath}: ${error}`,
        );
        // Fallback to synthetic template if sending failed
        const pseudoRequest: Pick<
          Request,
          | "getMethod"
          | "getUrl"
          | "getBody"
          | "getHeader"
          | "getId"
          | "getHost"
          | "getPort"
          | "getTls"
          | "getPath"
        > = {
          getId: () => generateID(),
          getMethod: () => method,
          getUrl: () => fullUrl,
          getBody: () => undefined,
          getHeader: () => undefined,
          getHost: () => host,
          getPort: () => port,
          getTls: () => isTls,
          getPath: () => resolvedPath,
        } as unknown as Request;

        const pseudoResponse = {
          getCode: () => 200,
        } as unknown as Response;

        const templateId = generateTemplateId(pseudoRequest as Request);
        if (store.templateExists(templateId)) continue;

        const temp = toTemplate(
          pseudoRequest as Request,
          pseudoResponse,
          templateId,
        );
        // Keep original placeholders in meta
        temp.meta.path = fullPath;
        createdTemplate = temp;
      }

      if (createdTemplate !== undefined) {
        const templateId = generateTemplateId(
          createdTemplate.requestId as unknown as Request,
        );
        if (store.templateExists(templateId)) continue;

        store.addTemplate(createdTemplate);

        await withProject(sdk, async (projectId) => {
          await createTemplate(sdk, projectId, createdTemplate);
          sdk.api.send("templates:created", createdTemplate);
        });
      }

      created += 1;
    }
  }

  sdk.console.log(`Import completed. Created ${created} templates.`);
  return created;
};

const generateTemplateId = (
  request: Request,
  dedupeHeaders: string[] = [],
): string => {
  try {
    let body = request.getBody()?.toText();
    if (body === undefined) {
      body = "";
    }
    const bodyHash = sha256Hash(body);
    let dedupe = `${request.getMethod()}~${request.getUrl()}~${bodyHash}`;
    dedupeHeaders.forEach((h) => {
      dedupe += `~${request.getHeader(h)?.join("~")}`;
    });
    return sha256Hash(dedupe);
  } catch (error) {
    // Fallback to a simple hash if the request object is malformed
    return sha256Hash(`${Date.now()}-${Math.random()}`);
  }
};

const toTemplate = (
  request: Request,
  response: Response,
  templateId: string = generateTemplateId(request),
): TemplateDTO => {
  return {
    id: templateId,
    requestId: request.getId(),
    authSuccessRegex: `HTTP/1[.]1 ${response.getCode()}`,
    rules: [],
    meta: {
      host: request.getHost(),
      port: request.getPort(),
      method: request.getMethod(),
      isTls: request.getTls(),
      path: request.getPath(),
    },
  };
};
