export class RequestError extends Error {
  status?: number;

  static async from(response: Response): Promise<RequestError> {
    const message = await response.text() || response.statusText ||
      "An unknown error occurred. Please try again later.";
    const error = new RequestError(message);
    error.status = response.status;
    return error;
  }
}

export class ConnectionRefusedError extends RequestError {
  constructor(url: string) {
    super(`Unable to connect to ${url}`);
  }
}
