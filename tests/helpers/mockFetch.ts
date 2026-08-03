export const mockFetchJson = (body: unknown, ok = true, status = ok ? 200 : 500) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  }) as jest.Mock;
};

export const mockFetchReject = (error = new Error('Network timeout')) => {
  global.fetch = jest.fn().mockRejectedValue(error) as jest.Mock;
};
