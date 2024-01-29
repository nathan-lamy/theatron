import { client } from "@/lib/api";
import { LoaderFunctionArgs } from "react-router-dom";

// TODO: Errors to handle :
// * 400: Bad Request (missing email, token, or i)
// * 403: Forbidden (invalid token)
// * 404: Not Found (soit l'user s'est désinscrit, soit sa place a été donnée à quelqu'un d'autre)
export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const response = await client.events[":id"].$get({
    param: { id: params.eventId! },
    query: {
      email: url.searchParams.get("email")!,
      token: url.searchParams.get("token")!,
    },
  });
  if (response.status !== 200) throw response;
  return response.json();
}
