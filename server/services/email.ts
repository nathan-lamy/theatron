import { User } from "@prisma/client";
import Email from "email-templates";

const email = new Email({
  preview: {
    open: {
      app: "google-chrome",
      wait: false,
    },
  },
});

email
  .send({
    template: "on-wait-list",
    message: {
      to: "elon@spacex.com",
    },
    locals: {
      user: {
        name: "Elon Musk",
        email: "elon@spacex.com",
        class: "SpaceX",
      } as User,
      event: {
        id: 1,
        name: "SpaceX Launch",
        date: new Date(),
        // TODO:
        confirmBeforeDate: "31/12/2021",
      },
      link: "https://spacex.com",
    },
  })
  .then((res) => {
    console.log("res.originalMessage", res.originalMessage);
  })
  .catch(console.error);
