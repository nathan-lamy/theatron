/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { client } from "@/lib/api";
import { ERRORS } from "@/lib/messages";
import type { EventPayload } from "@server/index";
import { LoaderFunctionArgs } from "react-router-dom";
import * as Sentry from "@sentry/react";

const MOCK_DATA = {
  event: {
    date: "01/01/2000",
    details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    id: "1",
    title: "Lorem ipsum",
  },
  user: {
    email: "adrien.saly@ac-nice.fr",
    name: "Adrien Saly",
  },
  confirmBeforeDate: "01/01/2000",
} as EventPayload;

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const response = await client.events[":id"]
    .$get({
      param: { id: params.eventId! },
      query: {
        email: url.searchParams.get("email")!,
        token: url.searchParams.get("token")!,
      },
    })
    .catch((err) => {
      if (err.name === "TypeError" && err.message?.startsWith("NetworkError"))
        return { error: ERRORS.NETWORK, ...MOCK_DATA };
      Sentry.captureException(err);
      return { error: {}, ...MOCK_DATA };
    });

  if ("error" in response) return response;
  else if (response.status === 200) return response.json();
  else if (response.status === 403 || response.status === 400)
    return { error: ERRORS.INVALID_LINK, ...MOCK_DATA };
  else if (response.status === 404)
    return { error: ERRORS.EXPIRED_LINK, ...MOCK_DATA };
  else throw response;
}
