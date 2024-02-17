import { prisma } from "@/src/setup";
import { Event, User } from "@prisma/client";
import puppeteer from "puppeteer";

function sortUsersByClass(users: User[]) {
  const classOrder = { Seconde: 0, Première: 1, Terminale: 2 } as Record<
    string,
    number
  >;

  function getClassOrder(classStr: string): [number, string] {
    const [className, classNum] = classStr.split(" ");
    return [classOrder[className], classNum];
  }

  users.sort((user1, user2) => {
    const [classOrder1, classNum1] = getClassOrder(user1.class);
    const [classOrder2, classNum2] = getClassOrder(user2.class);

    if (classOrder1 !== classOrder2) {
      return classOrder1 - classOrder2;
    } else {
      return classNum1.localeCompare(classNum2);
    }
  });

  return users;
}

const generateAttendancePage = async (event: Event, users: User[]) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feuille de présence</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid black;
            padding: 4px;
            text-align: center;
        }
        .big-checkbox {
            width: 25px;
            height: 25px;
        }
    </style>
    </head>
    <body>

    <h2>Feuille de présence pour ${event.name}</h2>

    <table>
    <thead>
        <tr>
        <th>Prénom et Nom</th>
        <th>Classe</th>
        <th>Présent</th>
        </tr>
    </thead>
    <tbody>
        ${sortUsersByClass(users)
          .map((user) => {
            return `<tr>
                <td>${user.name}</td>
                <td>${user.class}</td>
                <td><input type="checkbox" class="big-checkbox"></td>
                </tr>`;
          })
          .join("")}
    </tbody>
    </table>

    </body>
    </html>`;
};

const generateAttendancePDF = async (html: string) => {
  // Generate the PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    margin: { top: "10px", right: "20px", bottom: "10px", left: "20px" },
  });

  await browser.close();
  return pdf;
};

export const generateAttendance = async (event: Event) => {
  console.log({
    eventId: event.id,
    confirmed: true,
    cancelled: false,
    waitListed: false,
  });
  const users = await prisma.user.findMany({
    where: {
      registrations: {
        some: {
          eventId: event.id,
          confirmed: true,
          cancelled: false,
          waitListed: false,
        },
      },
    },
  });
  const html = await generateAttendancePage(event, users);
  return generateAttendancePDF(html);
};
