import { httpRouter } from "convex/server";
import { storeUser } from "./users";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: storeUser,
});

export default http;
