import { Event, User } from "@prisma/client";

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

export const generateAttendanceSheet = async (event: Event, users: User[]) => {
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
            padding: 8px;
            text-align: center;
        }
        .big-checkbox {
            width: 30px;
            height: 30px;
        }
    </style>
    </head>
    <body>

    <h2>Feuille de présence pour ${event.name}</h2>

    <table>
    <thead>
        <tr>
        <th>Prénom et nom</th>
        <th>Classe</th>
        <th>Présent</th>
        </tr>
    </thead>
    <tbody>
        ${users
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

// Mock data
const event = { name: "Formation JavaScript" };
// Class must be Seconde, Première, or Terminale and a letter or a number
// Mock 20 users
const users = [
  { name: "John Doe", class: "Seconde A" },
  { name: "Jane Doe", class: "Seconde B" },
  { name: "Alice", class: "Seconde C" },
  { name: "Bob", class: "Seconde D" },
  { name: "Charlie", class: "Seconde E" },
  // Terminale
  { name: "John Doe", class: "Terminale A" },
  { name: "Jane Doe", class: "Terminale B" },
  { name: "Alice", class: "Terminale C" },
  { name: "Bob", class: "Terminale D" },
  { name: "Charlie", class: "Terminale E" },
  // Première
  { name: "John Doe", class: "Première A" },
  { name: "Jane Doe", class: "Première B" },
  { name: "Alice", class: "Première C" },
  { name: "Bob", class: "Première D" },
  { name: "Charlie", class: "Première E" },
];
