import type { SettingsDTO } from "shared";

const noStylingFilter: string = `req.ext.nlike:"%.css" AND req.ext.nlike:"%.woff" AND req.ext.nlike:"%.woff2" AND req.ext.nlike:"%.ttf" AND req.ext.nlike:"%.eot"`;
const noImagesFilter: string = `req.ext.nlike:"%.apng" AND req.ext.nlike:"%.avif" AND req.ext.nlike:"%.gif" AND req.ext.nlike:"%.jpg" AND req.ext.nlike:"%.jpeg" AND req.ext.nlike:"%.pjpeg" AND req.ext.nlike:"%.pjp" AND req.ext.nlike:"%.png" AND req.ext.nlike:"%.svg" AND req.ext.nlike:"%.webp" AND req.ext.nlike:"%.bmp" AND req.ext.nlike:"%.ico" AND req.ext.nlike:"%.cur" AND req.ext.nlike:"%.tif" AND req.ext.nlike:"%.tiff"`;
const noJSFilter: string = `req.ext.nlike:"%.js"`

export class SettingsStore {
  private static _store?: SettingsStore;

  private settings: SettingsDTO;


  private constructor() {
    this.settings = {
      autoCaptureRequests: "off",
      autoRunAnalysis: true,
      deDuplicateHeaders: [],
      defaultFilterHTTPQL: `(${noStylingFilter} AND ${noImagesFilter} AND ${noJSFilter})`,
    };
  }

  static get(): SettingsStore {
    if (!SettingsStore._store) {
      SettingsStore._store = new SettingsStore();
    }

    return SettingsStore._store;
  }

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings: SettingsDTO) {
    this.settings = { ...newSettings };
    return this.settings;
  }
}
