const fakeDelay = (ms) => new Promise(res => setTimeout(res, ms));

const api = {
  get: async (url) => {
    await fakeDelay(300);

    if (url.includes('dashboard')) {
      return {
        data: {
          users: 120,
          leads: 450,
          revenue: 12000
        }
      };
    }

    if (url.includes('vendors')) {
      return {
        data: [
          { id: 1, name: "Vendor 1" },
          { id: 2, name: "Vendor 2" }
        ]
      };
    }

    if (url.includes('customers')) {
      return {
        data: [
          { id: 1, name: "Customer 1" },
          { id: 2, name: "Customer 2" }
        ]
      };
    }

    return { data: [] };
  },

  post: async () => ({ data: { success: true } }),
  put: async () => ({ data: { success: true } }),
  delete: async () => ({ data: { success: true } }),
};

export default api;
