import { BaseRequest } from "shared";

export class RequestStore {
  private static _store?: RequestStore;

  private requests: Map<string, BaseRequest>;

  private constructor() {
    this.requests = new Map();
  }

  static get(): RequestStore {
    if (!RequestStore._store) {
      RequestStore._store = new RequestStore();
    }

    return RequestStore._store;
  }

  getRequests() {
    return [...this.requests.values()];
  }

  addRequest(request: BaseRequest) {
    this.requests.set(request.id, request);
  }

  deleteRequest(requestId: string) {
    this.requests.delete(requestId);
  }

  toggleRequestRole(requestId: string, roleId: string) {
    const request = this.requests.get(requestId);
    if (request) {
      if (request.roleIds.includes(roleId)) {
        request.roleIds = request.roleIds.filter((id) => id !== roleId);
      } else {
        request.roleIds.push(roleId);
      }

      return request;
    }
  }

  toggleRequestUser(requestId: string, userId: string) {
    const request = this.requests.get(requestId);
    if (request) {
      if (request.userIds.includes(userId)) {
        request.userIds = request.userIds.filter((id) => id !== userId);
      } else {
        request.userIds.push(userId);
      }

      return request;
    }
  }
}

