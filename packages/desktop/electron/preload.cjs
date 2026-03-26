const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,

  accounts: {
    list: (opts) => ipcRenderer.invoke("accounts:list", opts),
    getById: (id) => ipcRenderer.invoke("accounts:getById", id),
    create: (data) => ipcRenderer.invoke("accounts:create", data),
    update: (id, data) => ipcRenderer.invoke("accounts:update", id, data),
    archive: (id) => ipcRenderer.invoke("accounts:archive", id),
  },

  transactions: {
    list: (filter) => ipcRenderer.invoke("transactions:list", filter),
    listWithDetails: (filter) => ipcRenderer.invoke("transactions:listWithDetails", filter),
    getWithDetails: (id) => ipcRenderer.invoke("transactions:getWithDetails", id),
    create: (data) => ipcRenderer.invoke("transactions:create", data),
    update: (id, data) => ipcRenderer.invoke("transactions:update", id, data),
    delete: (id) => ipcRenderer.invoke("transactions:delete", id),
    spendingByCategory: (from, to) => ipcRenderer.invoke("transactions:spendingByCategory", from, to),
    monthlyTrend: (accountId, months) => ipcRenderer.invoke("transactions:monthlyTrend", accountId, months),
  },

  categories: {
    list: (opts) => ipcRenderer.invoke("categories:list", opts),
    listAsTree: (opts) => ipcRenderer.invoke("categories:listAsTree", opts),
    create: (data) => ipcRenderer.invoke("categories:create", data),
    update: (id, data) => ipcRenderer.invoke("categories:update", id, data),
    archive: (id) => ipcRenderer.invoke("categories:archive", id),
  },

  currencies: {
    listActive: () => ipcRenderer.invoke("currencies:listActive"),
    listAll: () => ipcRenderer.invoke("currencies:listAll"),
    getByCode: (code) => ipcRenderer.invoke("currencies:getByCode", code),
    toggleActive: (code, isActive) => ipcRenderer.invoke("currencies:toggleActive", code, isActive),
    formatAmount: (amount, code) => ipcRenderer.invoke("currencies:formatAmount", amount, code),
    formatWithSymbol: (amount, code) => ipcRenderer.invoke("currencies:formatWithSymbol", amount, code),
    toSmallestUnit: (displayAmount, code) => ipcRenderer.invoke("currencies:toSmallestUnit", displayAmount, code),
    getLatestRate: (from, to) => ipcRenderer.invoke("currencies:getLatestRate", from, to),
    saveRate: (data) => ipcRenderer.invoke("currencies:saveRate", data),
    convert: (amount, from, to) => ipcRenderer.invoke("currencies:convert", amount, from, to),
  },

  settings: {
    get: (key) => ipcRenderer.invoke("settings:get", key),
    set: (key, value) => ipcRenderer.invoke("settings:set", key, value),
  },
});
