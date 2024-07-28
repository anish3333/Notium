import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { sendNotification } from "./notificationUtils";

export async function checkReminders(userId: string) {
  // console.log("User ID:", userId);

  const q = query(
    collection(db, "notes"),
    where("userId", "==", userId),
    where("reminderDate", "<=", Timestamp.fromDate(new Date())),
    where("reminderSent", "==", false)
  );

  const querySnapshot = await getDocs(q);
  // console.log("Query snapshot:", querySnapshot);
  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // console.log("Data:", data);

  querySnapshot.forEach(async (document) => {
    const noteData = document.data();

    sendNotification("Reminder", noteData.content.slice(0, 100) + "...");

    await updateDoc(doc(db, "notes", document.id), {
      reminderSent: true,
      reminderDate: null
    });
  });
}
