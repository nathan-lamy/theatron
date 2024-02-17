import { client } from "@/lib/api";
import { ERRORS } from "@/lib/messages";
import { LoaderFunctionArgs } from "react-router-dom";
import * as Sentry from "@sentry/react";

const MOCK_DATA = {
  event: {
    id: "1",
    title: "Mock Event",
    name: "Mock Event",
    details: "Mock Event",
    date: new Date(1, 1, 2024),
  },
  user: {
    email: "email@email.email",
    name: "Mock User",
  },
  registration: {
    confirmed: false,
    waitListed: false,
    confirmBefore: "2022-01-01",
  },
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
