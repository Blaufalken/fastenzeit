import { useState, useEffect } from "react";

export default function FastenZeit() {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fastenzeit-entries");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [quote, setQuote] = useState("");
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState("");

  useEffect(() => {
    const quotes = [
      "Du fastest nicht nur, du befreist dich.",
      "Jede Stunde bringt dich näher zu dir selbst.",
      "Stille im Bauch, Klarheit im Kopf.",
      "Dein Körper dankt dir mit Leichtigkeit.",
      "Dein Wille ist stärker als dein Hunger.",
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("fastenzeit-entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    let interval: any;
    if (startTime && !endTime) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(startTime);
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        setTimer(`${hours}h ${minutes}min`);
        const percent = Math.min((diff / (72 * 3600)) * 100, 100);
        setProgress(percent);

        if (diff === 48 * 3600 || diff === 72 * 3600) {
          if (Notification.permission === "granted") {
            new Notification("FastenZeit", {
              body: `${diff / 3600} Stunden erreicht! 🎉`,
            });
          }
        }
      }, 60000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const handleStart = () => {
    setStartTime(new Date().toISOString());
    setEndTime(null);
    setNotes("");
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const handleEnd = () => {
    if (startTime) {
      const newEntry = {
        start: startTime,
        end: new Date().toISOString(),
        notes,
      };
      setEntries([newEntry, ...entries]);
      setStartTime(null);
      setEndTime(newEntry.end);
      setProgress(0);
      setTimer("");
    }
  };

  const getDuration = (start: string, end: string) => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto bg-gradient-to-br from-orange-100 via-pink-100 to-yellow-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-pink-600 drop-shadow">
        🌈 FastenZeit
      </h1>
      <p className="text-center italic text-pink-800">{quote}</p>

      <div className="bg-white shadow-lg rounded-xl p-4 space-y-2">
        <p>Starte ein neues Fastenfenster:</p>
        {!startTime ? (
          <button
            onClick={handleStart}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded"
          >
            Fasten starten
          </button>
        ) : (
          <>
            <p>Fasten gestartet: {new Date(startTime).toLocaleString()}</p>
            <p>Aktuelle Dauer: {timer}</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-pink-400 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <textarea
              placeholder="Wie fühlst du dich gerade?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mt-2"
            />
            <button
              onClick={handleEnd}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Fasten beenden
            </button>
          </>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-pink-700">Deine Fastenzeiten</h2>
        {entries.length === 0 && <p>Noch keine Einträge.</p>}
        {entries.map((entry, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p>
              <strong>Start:</strong> {new Date(entry.start).toLocaleString()}
            </p>
            <p>
              <strong>Ende:</strong> {new Date(entry.end).toLocaleString()}
            </p>
            <p>
              <strong>Dauer:</strong> {getDuration(entry.start, entry.end)}
            </p>
            {entry.notes && (
              <p>
                <strong>Notizen:</strong> {entry.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
