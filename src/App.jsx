import React, {
  useState,
  useEffect,
} from "react";

import { db } from "./firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function ComicWebsite() {

  const [seriesList, setSeriesList] =
    useState([]);

  const [selectedSeries, setSelectedSeries] =
    useState(null);

  const [selectedChapter, setSelectedChapter] =
    useState(null);

  const [chapters, setChapters] =
    useState([]);

  // =========================
  // LOAD SERIES
  // =========================
  useEffect(() => {

    loadSeries();

  }, []);

  const loadSeries = async () => {

    const snapshot = await getDocs(
      collection(db, "series")
    );

    const loaded = [];

    snapshot.forEach((doc) => {

      loaded.push({
        id: doc.id,
        ...doc.data(),
      });

    });

    setSeriesList(loaded);

  };

  // =========================
  // LOAD CHAPTERS
  // =========================
  useEffect(() => {

    if (!selectedSeries) return;

    loadChapters();

  }, [selectedSeries]);

  const loadChapters = async () => {

    const q = query(
      collection(db, "chapters"),

      where(
        "seriesId",
        "==",
        selectedSeries.id
      )
    );

    const snapshot =
      await getDocs(q);

    const loaded = [];

    snapshot.forEach((doc) => {

      loaded.push({
        id: doc.id,
        ...doc.data(),
      });

    });

    setChapters(loaded);

  };

  // =========================
  // READER PAGE
  // =========================
  if (selectedSeries && selectedChapter) {

    return (

      <div className="min-h-screen bg-black text-white">

        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">

          <div className="mx-auto flex max-w-7xl items-center justify-between p-5">

            <div className="flex items-center gap-4">

  <button
    onClick={() =>
      setSelectedChapter(null)
    }
    className="rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 px-6 py-3 font-black text-white shadow-2xl shadow-pink-500/20 transition duration-300 hover:scale-105 hover:shadow-pink-500/40"
  >
    ← Back
  </button>

</div>

<h1 className="absolute left-1/2 -translate-x-1/2 text-5xl font-black tracking-tight text-white">

  {selectedChapter.title}

</h1>

<button
  onClick={() => {
    setSelectedChapter(null);
    setSelectedSeries(null);
  }}
  className="rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 px-6 py-3 font-black text-white shadow-2xl shadow-pink-500/20 transition duration-300 hover:scale-105 hover:shadow-pink-500/40"
>
  🏠 Home
</button>

          </div>

        </header>

        {/* READER */}
        <main className="mx-auto max-w-5xl px-3 py-10">

          <div className="space-y-8">

            {(selectedChapter.pages ||
              []
            ).map((page, index) => (

              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
              >

                <img
                  src={page}
                  className="w-full"
                  loading="lazy"
                />

              </div>

            ))}

          </div>

        </main>

      </div>

    );

  }

  // =========================
  // SERIES PAGE
  // =========================
  if (selectedSeries) {

    return (

      <div className="min-h-screen bg-black text-white">

        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">

          <div className="mx-auto flex max-w-6xl items-center justify-between p-4">

            <button
              onClick={() =>
                setSelectedSeries(null)
              }
              className="rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 px-6 py-3 font-black text-white shadow-2xl shadow-pink-500/20 transition duration-300 hover:scale-105 hover:shadow-pink-500/40"
            >
              ← Home
            </button>

          </div>

        </header>


        {/* CHAPTERS */}
        <main className="mx-auto max-w-6xl px-6 py-14">

          <div className="mb-10 flex items-center justify-between">

            <h3 className="text-5xl font-bold">
              Chapters
            </h3>

          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">

            {chapters.map(
              (chapter, index) => (

                <div
  key={index}
  className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600"
>

  <img
    src={
      chapter.pages?.[0] ||
      selectedSeries.cover
    }
    className="h-64 w-full object-cover"
  />

  <div className="p-8">

    <h4 className="text-3xl font-bold leading-tight text-white">
      {chapter.title}
    </h4>

    <p className="mt-3 text-zinc-400">
      Chapter #{index + 1}
    </p>

    <button
      onClick={() =>
        setSelectedChapter(
          chapter
        )
      }
      className="mt-8 w-full rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 py-5 text-xl font-black text-white shadow-2xl shadow-pink-500/20 transition duration-300 hover:scale-[1.02] hover:shadow-pink-500/40"
    >
      Read Chapter
    </button>

  </div>

</div>

              )
            )}

          </div>

        </main>

      </div>

    );

  }

  // =========================
  // HOME PAGE
  // =========================
  return (

    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">

          <h1 className="text-4xl font-black tracking-wide">
            KAEDE TOON
          </h1>

        </div>

      </header>

      {/* HOME */}
      <main className="mx-auto max-w-7xl px-6 py-14">

        <div className="mb-14 flex items-center justify-between">

          <h2 className="text-6xl font-bold">
            Comic Series
          </h2>

        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">

          {seriesList.map(
            (series, index) => (

              <div
                key={index}
                onClick={() =>
                  setSelectedSeries(series)
                }
                style={{
                  touchAction:
                    "manipulation",
                }}
                className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-zinc-600"
              >

                <div className="overflow-hidden">

                  <img
  src={series.cover}
  className="h-[260px] w-full object-cover"
/>

                </div>

                <div className="p-7">

                  <h4 className="text-4xl font-bold leading-tight">
                    {series.title}
                  </h4>

                  <p className="mt-4 text-lg text-zinc-400">
                    Romance, Drama
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </main>

    </div>

  );

}