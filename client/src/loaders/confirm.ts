import { client } from "@/lib/api";
import { ERRORS } from "@/lib/messages";
import { LoaderFunctionArgs } from "react-router-dom";
import * as Sentry from "@sentry/react";

// TODO: Update this mock data
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
    hasConfirmed: false,
  },
  confirmBeforeDate: "01/01/2000",
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { data, error } = await client.events[params.eventId!][""].get({
    $query: {
      email: url.searchParams.get("email")!,
      token: url.searchParams.get("token")!,
    },
  });

  if (data?.success) return data;
  if (error) {
    if (error.status === 400 || error.status === 403)
      return { error: ERRORS.INVALID_LINK, ...MOCK_DATA };
    if (error.status === 401 || error.status === 404)
      return { error: ERRORS.EXPIRED_LINK, ...MOCK_DATA };
    Sentry.captureException(error);
    throw error;
  }
}
