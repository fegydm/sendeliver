// ./back/src/controllers/users.controller.ts
import { Controller, Get, Route } from "tsoa";

@Route("users")
export class UsersController extends Controller {
  @Get("/")
  public async getUsers(): Promise<string[]> {
    return ["John", "Jane"];
  }
}
