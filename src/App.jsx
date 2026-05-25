import React, {
  useState,
  useEffect,
} from "react";

import {

  signInWithEmailAndPassword,

  createUserWithEmailAndPassword,

  onAuthStateChanged,

  signOut,

  updateProfile,

} from "firebase/auth";

import {
  db,
  auth,
} from "./firebase";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function App() {

  // =========================
  // STATES
  // =========================
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  
  const [showSignupModal, setShowSignupModal] =
  useState(false);

const [isLoggedIn, setIsLoggedIn] =
  useState(false);

const [username, setUsername] =
  useState("");

const [password, setPassword] =
  useState("");

const [signupName, setSignupName] =
  useState("");

const [signupPosition, setSignupPosition] =
  useState("");

const [signupUsername, setSignupUsername] =
  useState("");

const [signupPassword, setSignupPassword] =
  useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [inventoryItems, setInventoryItems] =
    useState([]);

  const [profileName, setProfileName] =
    useState(
      localStorage.getItem("profileName") || ""
    );

  const [profilePosition, setProfilePosition] =
    useState(
      localStorage.getItem("profilePosition") || ""
    );

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [showAlertModal, setShowAlertModal] =
  useState(false);

const [alertMessage, setAlertMessage] =
  useState("");

  const [categories] = useState([
    {
      id: 1,
      name: "All Items",
      icon: "📦",
    },
    {
      id: 2,
      name: "Brewhouse/RMH",
      icon: "🏭",
    },
    {
      id: 3,
      name: "Filtration/Cellars",
      icon: "🧪",
    },
    {
      id: 4,
      name: "Eng'g PNS",
      icon: "🛠️",
    },
    {
      id: 5,
      name: "WTP",
      icon: "💧",
    },
    {
      id: 6,
      name: "WWTP",
      icon: "♻️",
    },
  ]);

  const [selectedCategory, setSelectedCategory] =
    useState("All Items");

  const [showQRModal, setShowQRModal] =
  useState(false);

const [qrItemName, setQrItemName] =
  useState("");

const [qrCategory, setQrCategory] =
  useState("");

const [qrPartNumber, setQrPartNumber] =
  useState("");

const [generatedQR, setGeneratedQR] =
  useState(null);

const [showScannerModal, setShowScannerModal] =
  useState(false);

const [scannedItem, setScannedItem] =
  useState(null);

const [scanAction, setScanAction] =
  useState("");

const [scanQuantity, setScanQuantity] =
  useState(1);

useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(

      auth,

      (user) => {

        if (user) {

          setIsLoggedIn(true);

          setProfileName(
            user.displayName || ""
          );

        } else {

          setIsLoggedIn(false);

        }

      }

    );

  return () => unsubscribe();

}, []);

  // =========================
  // LOAD INVENTORY
  // =========================
  useEffect(() => {

  const unsubscribe =
    onSnapshot(

      collection(
        db,
        "inventory"
      ),

      (snapshot) => {

        const loaded = [];

        snapshot.forEach((doc) => {

          loaded.push({

            id: doc.id,
            ...doc.data(),

          });

        });

        setInventoryItems(
          loaded
        );

      }

    );

  return () => unsubscribe();

}, []);


  // =========================
  // FILTER ITEMS
  // =========================
  const filteredItems =
    inventoryItems.filter((item) => {

      const matchesSearch =
        item.name
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        item.partNumber
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesCategory =
        selectedCategory ===
          "All Items" ||

        item.category ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );

    });

    useEffect(() => {

  if (showScannerModal) {

    const scanner =
      new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: 250,
        },
        false
      );

    scanner.render(

      (decodedText) => {

        try {

          const parsed =
            JSON.parse(
              decodedText
            );

          setScannedItem(
            parsed
          );

          scanner.clear();

        } catch (err) {

          console.log(err);

        }

      },

      () => {}

    );

  }

}, [showScannerModal]);

  return (

    <div className="min-h-screen bg-black text-white">
      {!isLoggedIn && (

  <div className="flex min-h-screen items-center justify-center bg-black p-4">

    <div className="w-full max-w-md rounded-[32px] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">

      {/* LOGO */}
      <div className="mb-8 text-center">

        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink-500 to-violet-600 text-5xl">

          🏭

        </div>

        <h1 className="text-4xl font-black">

          BREWERY IMS

        </h1>

        <p className="mt-2 text-zinc-400">

          Inventory Management System

        </p>

      </div>

      {/* USERNAME */}
      <div className="mb-4">

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none focus:border-pink-500"
        />

      </div>

      {/* PASSWORD */}
      <div className="mb-6">

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none focus:border-pink-500"
        />

      </div>

      {/* LOGIN */}
      <button
        onClick={async () => {

         try {

  const userCredential =

    await signInWithEmailAndPassword(

      auth,

      username,

      password

    );

  setProfileName(

    userCredential.user.displayName || ""

  );

  setIsLoggedIn(true);

} catch (error) {

  setAlertMessage(
    "Invalid email or password."
  );

  setShowAlertModal(true);


        

          }

        }}
        className="mb-4 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 font-black transition hover:scale-[1.02]"
      >

        LOGIN

      </button>

      {/* SIGNUP */}
      <button
        onClick={() =>
          setShowSignupModal(true)
        }
        className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 font-black transition hover:bg-zinc-800"
      >

        CREATE ACCOUNT

      </button>

    </div>

  </div>

)}

{/* ALERT MODAL */}
{showAlertModal && (

  <div className="fixed inset-0 z-[9999] bg-black/80 p-4">

    <div className="w-full max-w-md rounded-[32px] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">

      <h2 className="mb-4 text-3xl font-black text-white">

        ⚠️ System Message

      </h2>

      <p className="mb-8 text-zinc-300">

        {alertMessage}

      </p>

      <button
        onClick={() =>
          setShowAlertModal(false)
        }
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 font-black text-white transition hover:scale-[1.02]"
      >

        OK

      </button>

    </div>

  </div>

)}

      

      {/* LOGOUT MODAL */}
      {showLogoutModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">

          <div className="w-full max-w-md rounded-[32px] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">

            <h2 className="mb-4 text-3xl font-black">

              🚪 Logout

            </h2>

            <p className="mb-8 text-zinc-400">

              Are you sure you want to logout?

            </p>

            <div className="flex gap-3">

              <button
                onClick={async () => {

                await signOut(auth);

setIsLoggedIn(false);

setShowLogoutModal(false);

                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 px-5 py-4 font-black transition hover:scale-[1.02]"
              >

                Yes Logout

              </button>

              <button
                onClick={() =>
                  setShowLogoutModal(
                    false
                  )
                }
                className="rounded-2xl bg-zinc-800 px-5 py-4 font-bold transition hover:bg-zinc-700"
              >

                Cancel

              </button>

            </div>

          </div>

        </div>

      )}

      {/* SIGNUP MODAL */}
{showSignupModal && (

  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4">

    <div className="w-full max-w-md rounded-[32px] border border-zinc-800 bg-zinc-950 p-8">

      <h2 className="mb-6 text-3xl font-black">

        Create Account

      </h2>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          value={signupName}
          onChange={(e) =>
            setSignupName(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Job Position"
          value={signupPosition}
          onChange={(e) =>
            setSignupPosition(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Email"
          value={signupUsername}
          onChange={(e) =>
            setSignupUsername(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={signupPassword}
          onChange={(e) =>
            setSignupPassword(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

      </div>

      <div className="mt-6 flex gap-3">

        <button
          onClick={async () => {

          try {

  const userCredential =

    await createUserWithEmailAndPassword(

      auth,

      signupUsername,

      signupPassword

    );

  await updateProfile(

    userCredential.user,

    {

      displayName:
        signupName,

    }

  );

  setProfileName(
    signupName
  );

  setProfilePosition(
    signupPosition
  );

  setIsLoggedIn(true);

  setShowSignupModal(false);

  setSignupName("");

  setSignupPosition("");

  setSignupUsername("");

  setSignupPassword("");

  setAlertMessage(
    "Account created successfully!"
  );

  setShowAlertModal(true);

} catch (error) {

  setAlertMessage(
    error.message
  );

  setShowAlertModal(true);

}


          }}
          className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 font-black"
        >

          CREATE

        </button>

        <button
          onClick={() =>
            setShowSignupModal(
              false
            )
          }
          className="rounded-2xl bg-zinc-800 px-5 py-4 font-bold"
        >

          Cancel

        </button>

      </div>

    </div>

  </div>

)}


      {isLoggedIn && (

<>
      {sidebarOpen && (

        <div className="fixed inset-0 z-50 flex">

          <div
            onClick={() =>
              setSidebarOpen(false)
            }
            className="absolute inset-0 bg-black/70"
          />

         <div className="relative z-50 flex h-screen w-[280px] flex-col border-r border-zinc-800 bg-zinc-950 p-6">

            <h2 className="mb-8 text-3xl font-black">

              BREWERY IMS

            </h2>

            <div className="flex h-full flex-col">

              {/* DASHBOARD */}
              <button
                onClick={() => {

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });

                  setSidebarOpen(false);

                }}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500/20 to-violet-500/20 px-5 py-4 text-left text-lg font-bold transition hover:scale-[1.02]"
              >

                📊 Dashboard

              </button>

              {/* PROFILE */}
<button
  className="mt-4 w-full rounded-2xl bg-zinc-900 px-5 py-4 text-left text-lg font-bold transition hover:bg-zinc-800"
>

  👤 {profileName || "User"}

</button>

{/* PUSH LOGOUT TO BOTTOM */}
<div className="mt-auto pt-6">

  <button
    onClick={() => {
      setSidebarOpen(false);
      setShowLogoutModal(true);
    }}
    className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 px-5 py-4 text-left text-lg font-black text-white transition hover:scale-[1.02]"
  >

    🚪 Logout

  </button>

</div>

            </div>

          </div>

        </div>

      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/95 backdrop-blur">

        <div className="flex items-center gap-4 px-4 py-4">

          {/* HAMBURGER */}
          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4 transition hover:bg-zinc-800"
          >

            ☰

          </button>

          {/* LOGO */}
          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-3xl shadow-lg shadow-pink-500/20">

              🏭

            </div>

            <div>

              <h1 className="text-2xl font-black tracking-wide text-white sm:text-3xl">

                BREWERY INVENTORY

              </h1>

              <p className="text-sm text-zinc-400">

                Inventory Management System

              </p>

              {profileName && (

                <p className="mt-1 text-xs text-pink-400">

                  {profileName} • {profilePosition}

                </p>

              )}

            </div>

          </div>

          {/* SEARCH + LOGOUT */}
          <div className="ml-auto flex items-center gap-3">

            {/* SEARCH */}
            <div className="hidden w-full max-w-2xl md:block">

              <input
                type="text"
                placeholder="Search by item name or part number..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none transition focus:border-pink-500"
              />

            </div>

            {/* LOGOUT */}
            <button
              onClick={() =>
                setShowLogoutModal(
                  true
                )
              }
             className="hidden rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4 font-black text-white shadow-lg shadow-red-500/20 transition hover:scale-[1.02] lg:block"
            >

              🚪 Logout

            </button>

          </div>

        </div>

        {/* MOBILE SEARCH */}
        <div className="px-4 pb-4 md:hidden">

          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
          />

        </div>

      </header>

      {/* MAIN */}
      <main className="px-4 py-6">

        {/* ACTION CARDS */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* SCAN */}
<div
  onClick={() => {
    setShowScannerModal(true);
  }}
  className="cursor-pointer rounded-[32px] border border-zinc-800 bg-gradient-to-br from-pink-500/20 to-fuchsia-500/10 p-8 transition hover:border-pink-500 hover:scale-[1.01]"
>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black">

                  Scan QR Code

                </h2>

                <p className="mt-3 text-zinc-300">

                  Scan inventory QR code
                  to update stock realtime.

                </p>

              </div>

              <div className="text-6xl">

                📷

              </div>

            </div>

          </div>

          {/* GENERATE */}
<div
  onClick={() => {
    setShowQRModal(true);
    setGeneratedQR(null);
  }}
  className="cursor-pointer rounded-[32px] border border-zinc-800 bg-gradient-to-br from-violet-500/20 to-purple-500/10 p-8 transition hover:border-violet-500 hover:scale-[1.01]"
>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black">

                  Generate QR

                </h2>

                <p className="mt-3 text-zinc-300">

                  Generate printable QR
                  labels for inventory items.

                </p>

              </div>

              <div className="text-6xl">

                🧾

              </div>

            </div>

          </div>

        </div>

        {/* CATEGORIES */}
        <div className="mt-10">

          <h2 className="mb-5 text-3xl font-black">

            Categories

          </h2>

          <div className="flex gap-4 overflow-x-auto pb-3">

            {categories.map((cat) => (

              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    cat.name
                  )
                }
                className={`min-w-[220px] rounded-[28px] border p-6 text-left transition ${
                  selectedCategory ===
                  cat.name
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >

                <div className="text-5xl">

                  {cat.icon}

                </div>

                <h3 className="mt-5 text-2xl font-bold">

                  {cat.name}

                </h3>

              </button>

            ))}

          </div>

        </div>

        {/* TABLE */}
        <div className="mt-10 overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-950">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b border-zinc-800 bg-zinc-900">

                <tr className="text-left text-zinc-400">

                  <th className="px-6 py-5">
                    ITEM
                  </th>

                  <th className="px-6 py-5">
                    PART NUMBER
                  </th>

                  <th className="px-6 py-5">
                    CATEGORY
                  </th>

                  <th className="px-6 py-5">
                    STOCK
                  </th>

                  <th className="px-6 py-5">
                    STATUS
                  </th>

                  <th className="px-6 py-5">
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredItems.map(
                  (item, index) => (

                    <tr
                      key={index}
                      className="border-b border-zinc-800 transition hover:bg-zinc-900"
                    >

                      <td className="px-6 py-5">

                       <div>

  <h3 className="text-lg font-bold">

    {item.name}

  </h3>

</div>

                      </td>

                      <td className="px-6 py-5">

                        {item.partNumber}

                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-xl bg-orange-500/20 px-4 py-2 text-orange-400">

                          {item.category}

                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span className="font-bold text-green-400">

                          {item.stock} pcs

                        </span>

                      </td>

                      <td className="px-6 py-5">

                        {item.stock <= 5 ? (

                          <span className="rounded-xl bg-red-500/20 px-4 py-2 text-red-400">

                            Low Stock

                          </span>

                        ) : (

                          <span className="rounded-xl bg-green-500/20 px-4 py-2 text-green-400">

                            In Stock

                          </span>

                        )}

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex gap-3">

                          <button className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700">

                            👁

                          </button>

                          <button className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700">

                            ✏️

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>


          </main>

      </>

)}

{/* QR GENERATOR MODAL */}
{showQRModal && (

 <div className="fixed inset-0 z-[500] overflow-y-auto bg-black/80 p-4">

   <div className="mx-auto my-10 w-full max-w-lg rounded-[32px] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-black">

            Generate QR

          </h2>

          <p className="mt-2 text-zinc-400">

            Create printable inventory QR labels

          </p>

        </div>

        <button
          onClick={() => {
            setShowQRModal(false);
            setGeneratedQR(null);
          }}
          className="rounded-2xl bg-zinc-800 px-4 py-3 font-bold transition hover:bg-zinc-700"
        >

          ✖

        </button>

      </div>

      {/* INPUTS */}
      <div className="space-y-4">

        {/* ITEM NAME */}
        <input
          type="text"
          placeholder="Item Name"
          value={qrItemName}
          onChange={(e) =>
            setQrItemName(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none transition focus:border-pink-500"
        />

        {/* CATEGORY */}
        <input
          type="text"
          placeholder="Category"
          value={qrCategory}
          onChange={(e) =>
            setQrCategory(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none transition focus:border-pink-500"
        />

        {/* PART NUMBER */}
        <input
          type="text"
          placeholder="Part Number"
          value={qrPartNumber}
          onChange={(e) =>
            setQrPartNumber(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none transition focus:border-pink-500"
        />

      </div>

      {/* GENERATE BUTTON */}
      <button
       onClick={() => {

  if (

    !qrItemName ||
    !qrCategory ||
    !qrPartNumber

  ) {

    setAlertMessage(
      "Please complete all QR fields."
    );

    setShowAlertModal(true);

    return;

  }

  setGeneratedQR({

    itemName: qrItemName,

    category: qrCategory,

    partNumber: qrPartNumber,

  });

}}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 font-black transition hover:scale-[1.01]"
      >

        GENERATE QR CODE

      </button>

      {/* QR RESULT */}
      {generatedQR && (

        <div className="mt-8 rounded-[32px] border border-zinc-800 bg-black p-8 text-center">

         <div
  id="qr-print-area"
  className="inline-block rounded-3xl bg-white p-6"
>

            <QRCodeCanvas
              value={JSON.stringify(
                generatedQR
              )}
              size={220}
            />

            <h3 className="mt-5 text-2xl font-black text-black">

              {generatedQR.itemName}

            </h3>

            <p className="mt-1 text-black">

              {generatedQR.partNumber}

            </p>

            <p className="text-sm text-zinc-600">

              {generatedQR.category}

            </p>

          </div>

          {/* PRINT */}
          {/* ACTION BUTTONS */}
<div className="mt-6 flex justify-center gap-3">

  {/* PRINT */}
  <button
   onClick={() => {

  const canvas =
    document.querySelector("canvas");

  const qrImage =
    canvas.toDataURL("image/png");

  const printWindow =
    window.open(
      "",
      "",
      "width=900,height=700"
    );

  printWindow.document.write(`
    <html>

      <head>

        <title>
          QR Label
        </title>

        <style>

          body{
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            background:white;
            font-family:Arial;
          }

          .label{
            width:320px;
            border:2px solid black;
            border-radius:20px;
            padding:25px;
            text-align:center;
          }

          img{
            width:220px;
            height:220px;
            object-fit:contain;
          }

          h1{
            margin-top:15px;
            font-size:28px;
          }

          p{
            margin:6px 0;
            font-size:18px;
          }

        </style>

      </head>

      <body onload="window.print()">

        <div class="label">

          <img src="${qrImage}" />

          <h1>
            ${generatedQR.itemName}
          </h1>

          <p>
            ${generatedQR.partNumber}
          </p>

          <p>
            ${generatedQR.category}
          </p>

        </div>

      </body>

    </html>
  `);

  printWindow.document.close();

}}
    className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-4 font-black"
  >

    🖨 PRINT

  </button>

  {/* CANCEL */}
  <button
    onClick={() => {
      setGeneratedQR(null);
      setShowQRModal(false);
    }}
    className="rounded-2xl bg-zinc-800 px-6 py-4 font-black transition hover:bg-zinc-700"
  >

    ✖ CANCEL

  </button>

</div>

        </div>

      )}

    </div>

  </div>

)}

{/* QR SCANNER MODAL */}
{showScannerModal && (

  <div className="fixed inset-0 z-[600] overflow-y-auto bg-black/90 p-4">

    <div className="mx-auto my-10 w-full max-w-xl rounded-[32px] border border-zinc-800 bg-zinc-950 p-8">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-black">

            Scan QR Code

          </h2>

          <p className="mt-2 text-zinc-400">

            Point camera at QR label

          </p>

        </div>

        <button
          onClick={() => {
            setShowScannerModal(false);
            setScannedItem(null);
          }}
          className="rounded-2xl bg-zinc-800 px-4 py-3"
        >

          ✖

        </button>

      </div>

      {/* CAMERA */}
      {!scannedItem && (

        <div className="overflow-hidden rounded-3xl border border-zinc-800">

         <div
  id="reader"
  className="overflow-hidden rounded-3xl"
/>

        </div>

      )}

      {/* SCANNED RESULT */}
      {scannedItem && (

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-6">

          <h3 className="text-2xl font-black">

            {scannedItem.itemName}

          </h3>

          <p className="mt-2 text-zinc-400">

            {scannedItem.partNumber}

          </p>

          <p className="text-zinc-400">

            {scannedItem.category}

          </p>

          {/* ACTION */}
          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              onClick={() =>
                setScanAction("ADD")
              }
              className={`rounded-2xl px-5 py-4 font-black transition ${
                scanAction === "ADD"
                  ? "bg-green-500 text-black"
                  : "bg-zinc-800"
              }`}
            >

              ➕ ADD

            </button>

            <button
              onClick={() =>
                setScanAction(
                  "DEDUCT"
                )
              }
              className={`rounded-2xl px-5 py-4 font-black transition ${
                scanAction ===
                "DEDUCT"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-800"
              }`}
            >

              ➖ DEDUCT

            </button>

          </div>

          {/* QUANTITY */}
          <input
            type="number"
            min="1"
            value={scanQuantity}
            onChange={(e) =>
              setScanQuantity(
                Number(
                  e.target.value
                )
              )
            }
            className="mt-5 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
          />

          {/* CONFIRM */}
          <button
           onClick={async () => {

            if (!scanAction) {

  setAlertMessage(
    "Please select ADD or DEDUCT."
  );

  setShowAlertModal(true);

  return;

}

  try {

    const existingItem =
      inventoryItems.find(
        (item) =>
          item.partNumber ===
          scannedItem.partNumber
      );

    

    if (existingItem) {

     let newStock;
if (scanAction === "ADD") {

  newStock =

    Number(existingItem.stock) +

    Number(scanQuantity);

} else {

  if (

    Number(scanQuantity) >

    Number(existingItem.stock)

  ) {

    setAlertMessage(
      "Not enough stock available."
    );

    setShowAlertModal(true);

    return;

  }

  newStock =

    Number(existingItem.stock) -

    Number(scanQuantity);

}

      // UPDATE FIREBASE
     await updateDoc(
  doc(
    db,
    "inventory",
    existingItem.id
  ),
  {
    stock: newStock,
  }
);

} else {

      const newItem = {

        name:
          scannedItem.itemName,

        partNumber:
          scannedItem.partNumber,

        category:
          scannedItem.category,

        stock:
          scanAction === "ADD"
            ? scanQuantity
            : 0,

      

      };

      // SAVE TO FIREBASE
      await addDoc(
        collection(
          db,
          "inventory"
        ),
        newItem
      );

    }

    // RELOAD INVENTORY

    setAlertMessage(
      `${scanAction} successful`
    );

    setShowAlertModal(
      true
    );

    setScannedItem(null);

    setScanAction("");

    setScanQuantity(1);

    setShowScannerModal(
      false
    );

  } catch (error) {

    console.log(error);

    setAlertMessage(
      "Firebase update failed"
    );

    setShowAlertModal(
      true
    );

  }

}}

          
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 font-black"
          >

            CONFIRM UPDATE

          </button>

        </div>

      )}

  

    </div>

  </div>

)}

</div>

);

}
