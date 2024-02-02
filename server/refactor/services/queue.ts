import { Member } from "./sheets";

export const sortWaitList = (members: Member[]) =>
  members.sort((a, b) => {
    // Trie par priorité, puis par uid si les priorités sont égales
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    } else {
      return a.uid - b.uid;
    }
  });
