import {API} from "backend";
import { defineApp } from "./app";

// This is a mock backend for the SDK
// This is only for development purposes
const backend: API = {
  getRoles: () => {
    return [];
  },
  addRole: (name) => {
    return {
      id: Math.random().toString(),
      name,
      description: ""
    }
  },
  updateRole: (id, fields) => {
    return {
      id,
      ...fields
    }
  },
  deleteRole: (id) => {
  },
  getUsers: () => {
    return [];
  },
  addUser: (name) => {
    return {
      id: Math.random().toString(),
      name,
      roles: [],
      attributes: []
    }
  },
  updateUser: (id, fields) => {
    return {
      id,
      ...fields
    }
  },
  deleteUser: (id) => {
  }
}

const app = defineApp({
  backend
} as any);

app.mount("#app");
