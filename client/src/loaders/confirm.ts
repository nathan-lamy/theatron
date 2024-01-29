import { client } from "@/lib/api";
import { LoaderFunctionArgs } from "react-router-dom";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const response = await client.events[":id"].$get({
    param: { id: params.eventId! },
    query: {
      email: url.searchParams.get("email")!,
      token: url.searchParams.get("token")!,
      i: url.searchParams.get("i")!,
    },
  });
  if (response.status !== 200) throw response;
  return response.json();
}
