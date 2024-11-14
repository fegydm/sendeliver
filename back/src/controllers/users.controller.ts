// .back/conrollers/users.controller.ts
import { Controller, Get, Route } from "tsoa";

@Route("users")
export class UsersController extends Controller {
  // Správne definovanie typu návratovej hodnoty metódy
  @Get("/")
  public async getUsers(): Promise<string[]> {
    return ["John", "Jane"];
  }
}
