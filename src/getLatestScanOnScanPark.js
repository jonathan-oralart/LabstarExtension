import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import enNZ from 'date-fns/locale/en-NZ';
import { format, fromUnixTime, formatRelative } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyB4z3A0yat_bQIWLE5Jn5VY2D5rjwiazOU",
  authDomain: "oralart-barcode.firebaseapp.com",
  projectId: "oralart-barcode",
  storageBucket: "oralart-barcode.appspot.com",
  messagingSenderId: "710322497038",
  appId: "1:710322497038:web:3b2af30964b6237b097e5f",
  measurementId: "G-QZ2WSCGGG8"
};

export const app = initializeApp(firebaseConfig);

export async function getLatestScanOnScanPark(barcode, multipleLines = false) {
  const db = getFirestore(app);
  const scansRef = collection(db, "scans");
  const q = query(scansRef, where("barcode", "in", ["1886" + barcode, "1094" + barcode]), orderBy("scanTime", "desc"), limit(1));

  let querySnapshot = undefined
  try {
    querySnapshot = await getDocs(q);
  } catch (error) {
    return "Error"
  }
  if (querySnapshot.docs.length > 0) {
    const scanData = querySnapshot.docs[0].data();
    const scanTime = fromUnixTime(scanData.scanTime.seconds);
    const formatRelativeLocale = {
      lastWeek: "'Last' eeee",
      yesterday: "'Yesterday'",
      today: "'Today at' p",
      tomorrow: "'Tomorrow'",
      nextWeek: "'Next' eeee",
      other: 'dd/MM/yyyy',
    };

    const locale = {
      ...enNZ,
      formatRelative: (token) => formatRelativeLocale[token],
    };

    let formattedDate = formatRelative(scanTime, new Date(), { locale })
    const scanLink = multipleLines ? `<a href="https://scan-park.netlify.app/?search=${barcode}" target="_blank">${scanData.location}</a><div style="color: #929292;">${formattedDate}</div>` : `<a href="https://scan-park.netlify.app/?search=${barcode}" target="_blank">${scanData.location}</a> <span style="color: #929292;">${formattedDate}</span>`;
    return scanLink;
  } else {
    console.log("No matching documents.");
    return `<div style = "color: #929292;"> No Data</div>`;

  }
}
