import handleRequest from "../server.js";

export default async function vercelHandler(request, response) {
  return handleRequest(request, response);
}
