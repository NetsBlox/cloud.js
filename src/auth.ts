export interface NetsBloxAuth {
  inject(opts: RequestInit): void;
}

export class TokenAuth implements NetsBloxAuth {
  private token: string;
  constructor(token: string) {
    this.token = token;
  }

  inject(opts: RequestInit): void {
    opts.headers = opts.headers || {};
    opts.headers["cookie"] = `netsblox=${this.token}`;
  }
}

export class HostCredentials implements NetsBloxAuth {
  private id: string;
  private secret: string;

  constructor(id: string, secret: string) {
    this.id = id;
    this.secret = secret;
  }

  inject(opts: RequestInit): void {
    opts.headers = opts.headers || {};
    opts.headers["X-Authorization"] = `${this.id}:${this.secret}`;
  }
}
