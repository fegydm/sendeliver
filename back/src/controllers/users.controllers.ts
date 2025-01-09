export class UsersController {
  public async getUsers(): Promise<string[]> {
      return ["John", "Jane"];
  }
}
