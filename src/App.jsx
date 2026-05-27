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
  deleteDoc,
} from "firebase/firestore";

import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

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

  const [showEditModal, setShowEditModal] =
  useState(false);

const [showAddModal, setShowAddModal] =
  useState(false);

const [newArea, setNewArea] =
  useState("");

const [newCategory, setNewCategory] =
  useState("");

const [newEquipment, setNewEquipment] =
  useState("");

const [newItemName, setNewItemName] =
  useState("");

const [newPartNumber, setNewPartNumber] =
  useState("");

const [newStock, setNewStock] =
  useState("");

const [selectedItem, setSelectedItem] =
  useState(null);

const [manualQuantity, setManualQuantity] =
  useState("");
const [manualAction, setManualAction] =
  useState("");

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

const handleImportExcel = async (e) => {

  try {

    const file = e.target.files[0];

    if (!file) return;

    const data =
      await file.arrayBuffer();

    const workbook =
  XLSX.read(data);

const sheetName =
  workbook.SheetNames.find(
    (name) => name === "INV"
  );

const sheet =
  workbook.Sheets[sheetName];

    const jsonData =
  XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  await Promise.all(
  inventoryItems.map((item) =>
    deleteDoc(
      doc(db, "inventory", item.id)
    )
  )
);

    for (const row of jsonData) {
      console.log(row);

      const item = {
  area:
    String(row.AREA || "").trim(),

  category:
    String(row.CATEGORY || "").trim(),

  equipment:
    String(row.EQUIPMENT || "").trim(),

  name:
    String(row.ITEM || "").trim(),

  partNumber:
    String(row["PART NUMBER"] || "").trim(),

  stock:
    Number(row.INSTALLED) || 0,

  technician:
    "",

  transactionDate:
    "",
};
      if (
  item.area ||
  item.category ||
  item.equipment ||
  item.name ||
  item.partNumber
)
         {

  await addDoc(
    collection(
      db,
      "inventory"
    ),
    item
  );

}

    }

    setAlertMessage(
      "Excel imported successfully!"
    );

    setShowAlertModal(true);

  } catch (error) {

    console.log(error);

    setAlertMessage(
      "Excel import failed."
    );

    setShowAlertModal(true);

  }

};

const exportInventory = () => {
  

  

  const worksheet =
    XLSX.utils.json_to_sheet(
      data
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(

    workbook,

    worksheet,

    "Inventory"

  );

  const excelBuffer =
    XLSX.write(workbook, {

      bookType: "xlsx",

      type: "array",

    });

  const fileData =
    new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

  saveAs(
    fileData,
    "brewery_inventory.xlsx"
  );

};

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

  let scanner;

  if (showScannerModal) {

    scanner =
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
            JSON.parse(decodedText);

          setScannedItem(parsed);

          scanner.clear();

        } catch (err) {

          console.log(err);

        }

      },

      () => {}

    );

  }

  return () => {

    if (scanner) {

      scanner.clear().catch(() => {});

    }

  };

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
          placeholder="Email"
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

  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">

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
        <div className="grid gap-5 md:grid-cols-3">

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

         
          {/* EXPORT */}
<div
  onClick={exportInventory}
  className="cursor-pointer rounded-[32px] border border-zinc-800 bg-gradient-to-br from-green-500/20 to-emerald-500/10 p-8 transition hover:border-green-500 hover:scale-[1.01]"
>

  <div className="flex items-center justify-between">

    <div>

      <h2 className="text-3xl font-black">

        Export Inventory

      </h2>

      <p className="mt-3 text-zinc-300">

        Download realtime inventory
        as Excel file.

      </p>

    </div>

    <div className="text-6xl">

      📥

    </div>

  </div>

</div>

        </div>

        {/* IMPORT */}
<div className="mt-5 max-w-2xl">

  <label
    className="cursor-pointer rounded-[32px] border border-zinc-800 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-8 transition hover:border-cyan-500 hover:scale-[1.01] block"
  >

    <input
      type="file"
      accept=".xlsx,.xls"
      className="hidden"
      onChange={handleImportExcel}
    />

    <div className="flex items-center justify-between">

      <div>

        <h2 className="text-3xl font-black">

          Import Excel

        </h2>

        <p className="mt-3 text-zinc-300">

          Upload inventory Excel file
          automatically.

        </p>

      </div>

      <div className="text-6xl">

        📤

      </div>

    </div>

  </label>

</div>

        

        {/* TABLE */}
        <div className="mt-10 overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-950">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b border-zinc-800 bg-zinc-900">

                <tr className="text-left text-zinc-400">

                  <th className="px-6 py-5">
  AREA
</th>

<th className="px-6 py-5">
  CATEGORY
</th>

<th className="px-6 py-5">
  EQUIPMENT
</th>

                  <th className="px-6 py-5">
                    ITEM
                  </th>

                  <th className="px-6 py-5">
                    PART NUMBER
                  </th>

                  <th className="px-6 py-5">
  STOCK
</th>

<th className="px-6 py-5">
  TECHNICIAN
</th>

<th className="px-6 py-5">
  DATE
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
                      key={item.id}
                      className="border-b border-zinc-800 transition hover:bg-zinc-900"
                    >

                     

{/* AREA */}
<td className="px-6 py-5">

  <span className="text-zinc-300">

    {item.area || "-"}

  </span>

</td>

{/* CATEGORY */}
<td className="px-6 py-5">

  <span className="rounded-xl bg-orange-500/20 px-4 py-2 text-orange-400">

    {item.category || "-"}

  </span>

</td>

{/* EQUIPMENT */}
<td className="px-6 py-5">

  <span className="text-zinc-300">

    {item.equipment || "-"}

  </span>

</td>

{/* ITEM */}
<td className="px-6 py-5">

  <div>

    <h3 className="text-lg font-bold">

      {item.name}

    </h3>

  </div>

</td>

{/* PART NUMBER */}
<td className="px-6 py-5">

  <span className="text-zinc-300">

    {item.partNumber || "-"}

  </span>

</td>

{/* STOCK */}
<td className="px-6 py-5">

  <span className="font-bold text-green-400">

    {item.stock} pcs

  </span>

</td>


{/* TECHNICIAN */}
<td className="px-6 py-5">

  <span className="text-zinc-300">

    {item.technician || "-"}

  </span>

</td>

{/* DATE */}
<td className="px-6 py-5">

  <span className="text-zinc-300">

    {item.transactionDate || "-"}

  </span>

</td>

<td className="px-6 py-5">

  {Number(item.stock) <= 2 ? (

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

                       <div className="flex items-center gap-3">

 <button
  onClick={() => {
    setShowAddModal(true);
  }}
  className="rounded-xl bg-green-500/20 px-4 py-3 text-green-400 transition hover:bg-green-500/30"
>
  ➕
</button>

<button

  onClick={() => {

    setSelectedItem(item);

setManualAction("");

setManualQuantity("");

setShowEditModal(true);

  }}

  className="rounded-xl bg-zinc-800 px-4 py-3 text-orange-400 transition hover:bg-zinc-700"
>

  ✏️

</button>

<button

  onClick={() => {

    setGeneratedQR({

      itemName:
        item.name,

      category:
        item.category,

      partNumber:
        item.partNumber,

    });

    setShowQRModal(true);

  }}

  className="rounded-xl bg-violet-500/20 px-4 py-3 text-violet-400 transition hover:bg-violet-500/30"

>

  🧾

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

          {/* EDIT INVENTORY MODAL */}
{
  showEditModal &&
  selectedItem && (

    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6">

      <div className="w-full max-w-md rounded-[32px] border border-zinc-800 bg-black p-8">

        <h2 className="text-4xl font-black text-white">

          Edit Item

        </h2>

        <div className="mt-6 space-y-2">

          <h3 className="text-2xl font-bold text-white">

            {selectedItem.name}

          </h3>

          <p className="text-zinc-400">

            {selectedItem.partNumber}

          </p>

          <p className="text-zinc-400">

            Current Stock:
            {" "}
            {selectedItem.stock}

          </p>

        </div>

        {/* ACTIONS */}
        <div className="mt-8 grid grid-cols-2 gap-4">

          <button

            onClick={() =>
              setManualAction("ADD")
            }

            className={`rounded-2xl px-6 py-5 text-xl font-black transition ${
              manualAction === "ADD"

                ? "bg-green-500 text-black"

                : "bg-zinc-800 text-white"
            }`}
          >

            + ADD

          </button>

          <button

            onClick={() =>
              setManualAction("DEDUCT")
            }

            className={`rounded-2xl px-6 py-5 text-xl font-black transition ${
              manualAction === "DEDUCT"

                ? "bg-red-500 text-white"

                : "bg-zinc-800 text-white"
            }`}
          >

            - DEDUCT

          </button>

        </div>

        {/* QUANTITY */}
        <input
          type="number"
          min="0"
          value={manualQuantity}
          onChange={(e) => {
  const value = Math.max(
    0,
    Number(e.target.value)
  );

  setManualQuantity(value);
}}
          className="mt-6 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-2xl text-white outline-none"
        />

        {/* BUTTONS */}
        <div className="mt-8 space-y-4">

          {/* SAVE */}
          <button

            onClick={async () => {

              try {

                if (!manualAction) {

  setAlertMessage(
    "Please select ADD or DEDUCT."
  );

  setShowAlertModal(true);

  return;

}

                let newStock =
                  Number(
                    selectedItem.stock
                  );

                if (
                  manualAction ===
                  "ADD"
                ) {

                  newStock +=
                    Number(
                      manualQuantity
                    );

                } else {

                  if (
                    manualQuantity >
                    selectedItem.stock
                  ) {

                    setAlertMessage(
                      "Not enough stock."
                    );

                    setShowAlertModal(
                      true
                    );

                    return;

                  }

                  newStock -=
                    Number(
                      manualQuantity
                    );

                }

                await updateDoc(

  doc(
    db,
    "inventory",
    selectedItem.id
  ),

  {
    stock: newStock,

    technician: profileName,

    transactionDate:
      new Date().toLocaleString(),
  }

);

                setAlertMessage(
                  "Inventory updated"
                );

                setShowAlertModal(
                  true
                );

                setShowEditModal(
                  false
                );

              } catch (error) {

                setAlertMessage(
                  "Update failed"
                );

                setShowAlertModal(
                  true
                );

              }

            }}

            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-5 text-xl font-black text-white"
          >

            SAVE CHANGES

          </button>

          {/* DELETE */}
          <button

            onClick={async () => {

              try {

                await deleteDoc(

                  doc(
                    db,
                    "inventory",
                    selectedItem.id
                  )

                );

                setAlertMessage(
                  "Item deleted"
                );

                setShowAlertModal(
                  true
                );

                setShowEditModal(
                  false
                );

              } catch (error) {

                setAlertMessage(
                  "Delete failed"
                );

                setShowAlertModal(
                  true
                );

              }

            }}

            className="w-full rounded-2xl bg-red-500 px-6 py-5 text-xl font-black text-white"
          >

            DELETE ITEM

          </button>

          {/* CANCEL */}
          <button

            onClick={() =>
              setShowEditModal(
                false
              )
            }

            className="w-full rounded-2xl bg-zinc-800 px-6 py-5 text-xl font-black text-white"
          >

            CANCEL

          </button>

        </div>

      </div>

    </div>

  )
}

      </>

)}

{/* ADD ITEM MODAL */}
{showAddModal && (

  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">

    <div className="w-full max-w-lg rounded-[32px] border border-zinc-800 bg-zinc-950 p-8">

      <h2 className="mb-6 text-3xl font-black">
        Add New Item
      </h2>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="Area"
          value={newArea}
          onChange={(e) =>
            setNewArea(e.target.value)
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Category"
          value={newCategory}
          onChange={(e) =>
            setNewCategory(e.target.value)
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Equipment"
          value={newEquipment}
          onChange={(e) =>
            setNewEquipment(e.target.value)
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Item"
          value={newItemName}
          onChange={(e) =>
            setNewItemName(e.target.value)
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Part Number"
          value={newPartNumber}
          onChange={(e) =>
            setNewPartNumber(e.target.value)
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

        <input
          type="number"
          placeholder="Stock"
          value={newStock}
          onChange={(e) =>
            setNewStock(e.target.value)
          }
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none"
        />

      </div>

      <div className="mt-6 flex gap-3">

        <button
          onClick={async () => {

            try {

              await addDoc(
                collection(db, "inventory"),
                {
                  area: newArea,
                  category: newCategory,
                  equipment: newEquipment,
                  name: newItemName,
                  partNumber: newPartNumber,
                  stock: Number(newStock),

                  technician:
                    profileName,

                  transactionDate:
                    new Date().toLocaleString(),
                }
              );

              setAlertMessage(
                "New item added successfully."
              );

              setShowAlertModal(true);

              setShowAddModal(false);

              setNewArea("");
              setNewCategory("");
              setNewEquipment("");
              setNewItemName("");
              setNewPartNumber("");
              setNewStock("");

            } catch (error) {

              setAlertMessage(
                "Add item failed."
              );

              setShowAlertModal(true);

            }

          }}
          className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 font-black"
        >

          ADD ITEM

        </button>

        <button
          onClick={() =>
            setShowAddModal(false)
          }
          className="rounded-2xl bg-zinc-800 px-5 py-4 font-bold"
        >

          Cancel

        </button>

      </div>

    </div>

  </div>

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

  setScanAction("");

  setScanQuantity(1);

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

  // UPDATE EXISTING FIREBASE DOC
 await updateDoc(

  doc(
    db,
    "inventory",
    existingItem.id
  ),

  {
    stock: newStock,

    technician: profileName,

    transactionDate:
      new Date().toLocaleString(),
  }

);
} else {

  // CREATE NEW ITEM ONLY IF NOT EXIST

  const newItem = {

    name:
      scannedItem.itemName,

    partNumber:
      scannedItem.partNumber,

    category:
      scannedItem.category,

    stock:
      Number(scanQuantity),

  };

  await addDoc(

    collection(
      db,
      "inventory"
    ),

    newItem

  );

}

    // RELOAD INVENTORY

   setScannedItem(null);

setScanAction("");

setScanQuantity(1);

setShowScannerModal(false);

setTimeout(() => {

  setAlertMessage(
    `${scanAction} successful`
  );

  setShowAlertModal(true);

}, 300);

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
