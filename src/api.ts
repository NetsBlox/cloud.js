/**
 * A simple (stateless) TS API wrapper for the NetsBlox cloud.
 */

// TODO: how to handle authentication?
// options:
//  - httpOnly cookie (probably should be the default)
//  - Authorization header for services

export default class NetsBloxApi {
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchJson(url, opts): Promise<any> {
    // TODO: handle authentication
  }

  async getProjectList(username: string): ProjectMetadata[] {
    return await this.fetchJson(
      `/projects/user/${username}`,
    ) as ProjectMetadata[];
  }
}
