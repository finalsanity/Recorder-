"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Clock3,
  Copy,
  Folder,
  FolderPlus,
  Grid2X2,
  LayoutDashboard,
  Link2,
  ListFilter,
  LogOut,
  Menu,
  Mic,
  Monitor,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Square,
  UploadCloud,
  Video,
  Volume2,
  X,
  Image as ImageIcon,
} from "lucide-react";

type Evidence = {
  id: string;
  name: string;
  type: "Recording" | "Screenshot";
  duration: string;
  size: string;
  folder: string;
  date: string;
  category: string;
  environment: string;
  tone: string;
};
type Tab = "Dashboard" | "Recordings" | "Folders" | "Settings";
type RecordState =
  | "idle"
  | "preparing"
  | "recording"
  | "paused"
  | "processing"
  | "ready"
  | "uploading"
  | "saved"
  | "error";

const seedEvidence: Evidence[] = [
  {
    id: "1",
    name: "Agent stops during deployment",
    type: "Recording",
    duration: "02:43",
    size: "84 MB",
    folder: "Regression / Sprint 26",
    date: "Today, 10:42 AM",
    category: "Bug",
    environment: "Staging",
    tone: "coral",
  },
  {
    id: "2",
    name: "Checkout confirmation state",
    type: "Screenshot",
    duration: "—",
    size: "1.8 MB",
    folder: "E2E / Checkout",
    date: "Yesterday, 4:18 PM",
    category: "E2E",
    environment: "QA",
    tone: "blue",
  },
  {
    id: "3",
    name: "Invite flow — missing toast",
    type: "Recording",
    duration: "01:16",
    size: "42 MB",
    folder: "Bugs",
    date: "Yesterday, 2:06 PM",
    category: "Bug",
    environment: "Dev",
    tone: "ink",
  },
  {
    id: "4",
    name: "Production smoke test",
    type: "Recording",
    duration: "04:08",
    size: "126 MB",
    folder: "Production",
    date: "Mon, 9:31 AM",
    category: "Production",
    environment: "Production",
    tone: "green",
  },
];

function Button({
  children,
  variant = "secondary",
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary:
      "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-dark)]",
    secondary:
      "border border-[var(--line-strong)] bg-white text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface-muted)]",
    ghost:
      "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
    danger: "bg-[#fff0ee] text-[#b84738] hover:bg-[#ffe4df]",
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[var(--accent)] text-white shadow-sm">
        <Activity size={18} strokeWidth={2.5} />
      </span>
      <span className="text-[19px] font-bold tracking-[-.04em]">trace</span>
    </div>
  );
}

function EvidenceCard({
  item,
  onCopy,
}: {
  item: Evidence;
  onCopy: (name: string) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
      <div
        className={`relative flex h-44 items-center justify-center overflow-hidden ${item.tone === "coral" ? "bg-[#f7d8d0]" : item.tone === "blue" ? "bg-[#dfe9fa]" : item.tone === "green" ? "bg-[#d9e9df]" : "bg-[#d9dee0]"}`}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 24%, rgba(255,255,255,.6) 25%, transparent 26%), linear-gradient(45deg, transparent 24%, rgba(255,255,255,.35) 25%, transparent 26%)",
            backgroundSize: "28px 28px",
          }}
        />
        {item.type === "Recording" ? (
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[var(--ink)] shadow-md transition-transform group-hover:scale-105">
            <Play size={19} fill="currentColor" />
          </span>
        ) : (
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[var(--blue)] shadow-md">
            <ImageIcon size={19} />
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold text-white">
          {item.duration}
        </span>
        <button
          aria-label={`More actions for ${item.name}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-white/80 text-[var(--ink)] opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 min-h-10 text-[15px] font-bold leading-5 tracking-[-.02em]">
            {item.name}
          </h3>
          <span
            className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${item.type === "Recording" ? "bg-[var(--accent-soft)] text-[var(--accent-dark)]" : "bg-[var(--blue-soft)] text-[var(--blue)]"}`}
          >
            {item.type}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <Folder size={13} /> <span className="truncate">{item.folder}</span>
          <span className="ml-auto shrink-0">{item.size}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
          <span className="text-[11px] text-[var(--muted)]">{item.date}</span>
          <button
            onClick={() => onCopy(item.name)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--blue)] transition-colors hover:bg-[var(--blue-soft)]"
          >
            <Copy size={13} /> Copy link
          </button>
        </div>
      </div>
    </article>
  );
}

export default function QAApp() {
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [evidence, setEvidence] = useState(seedEvidence);
  const [query, setQuery] = useState("");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [showRecord, setShowRecord] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showEvidenceMode, setShowEvidenceMode] = useState(false);
  const [name, setName] = useState("");
  const [bugTitle, setBugTitle] = useState("Agent stops during deployment");
  const [copied, setCopied] = useState(false);
  const [mic, setMic] = useState(true);
  const [systemAudio, setSystemAudio] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (recordState !== "recording") return;
    const timer = window.setInterval(
      () => setElapsed((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [recordState]);
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!showRecord || (event.target as HTMLElement)?.tagName === "INPUT")
        return;
      if (
        event.code === "Space" &&
        ["recording", "paused"].includes(recordState)
      ) {
        event.preventDefault();
        togglePause();
      }
      if (event.key === "Escape" && recordState === "recording")
        stopRecording();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const copyLink = useCallback((label: string) => {
    void navigator.clipboard?.writeText(
      `https://onedrive.live.com/?trace=${encodeURIComponent(label)}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }, []);
  const startRecording = async () => {
    setRecordState("preparing");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: systemAudio,
      });
      streamRef.current = stream;
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      });
      if (mic) {
        try {
          const microphone = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          microphone
            .getAudioTracks()
            .forEach((track) => stream.addTrack(track));
        } catch {
          setMic(false);
        }
      }
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });
        recordingBlobRef.current = blob;
        setPreviewUrl((currentUrl) => {
          if (currentUrl) URL.revokeObjectURL(currentUrl);
          return URL.createObjectURL(blob);
        });
        setRecordState("processing");
        window.setTimeout(() => {
          setRecordState("ready");
          setShowSave(true);
        }, 700);
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      setElapsed(0);
      setRecordState("recording");
    } catch {
      setRecordState("error");
    }
  };
  const togglePause = () => {
    if (!recorderRef.current) return;
    if (recordState === "recording") {
      recorderRef.current.pause();
      setRecordState("paused");
    } else if (recordState === "paused") {
      recorderRef.current.resume();
      setRecordState("recording");
    }
  };
  const stopRecording = () => {
    if (!recorderRef.current) return;
    setRecordState("processing");
    recorderRef.current.stop();
    recorderRef.current = null;
  };
  const openRecorder = (bug = false) => {
    setShowRecord(true);
    setShowEvidenceMode(bug);
    setRecordState("idle");
    setElapsed(0);
  };
  const saveRecording = async () => {
    const finalName =
      name.trim() ||
      `Recording - ${new Date().toISOString().slice(0, 16).replace("T", " ").replaceAll(":", "-")}`;
    setRecordState("uploading");
    await new Promise((resolve) => window.setTimeout(resolve, 1300));
    setEvidence((items) => [
      {
        id: crypto.randomUUID(),
        name: finalName,
        type: "Recording",
        duration: formatTime(elapsed),
        size: `${Math.max(1, Math.round(chunksRef.current.reduce((sum, blob) => sum + blob.size, 0) / 1024 / 1024))} MB`,
        folder: "Regression / Sprint 26",
        date: "Just now",
        category: showEvidenceMode ? "Bug" : "Other",
        environment: "Staging",
        tone: "coral",
      },
      ...items,
    ]);
    setRecordState("saved");
    setShowSave(false);
  };
  const filtered = evidence.filter((item) =>
    `${item.name} ${item.folder} ${item.category} ${item.environment}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] flex-col border-r border-[var(--line)] bg-[#fbfcfc] px-4 py-6 lg:flex">
        <div className="px-3">
          <Logo />
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#9ba4a7]">
          Workspace
        </div>
        <nav className="mt-3 space-y-1">
          {(
            [
              ["Dashboard", LayoutDashboard],
              ["Recordings", Grid2X2],
              ["Folders", Folder],
              ["Settings", Settings],
            ] as const
          ).map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${tab === label ? "bg-white text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"}`}
            >
              <Icon size={17} strokeWidth={tab === label ? 2.4 : 1.8} />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-[var(--line)] bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />{" "}
            OneDrive development mode
          </div>
          <p className="mt-2 text-[11px] leading-4 text-[var(--muted)]">
            Mock provider active. Live OneDrive needs Entra and Graph
            configuration.
          </p>
          <button className="mt-3 text-[11px] font-bold text-[var(--blue)]">
            Manage connection <ArrowUpRight className="inline" size={12} />
          </button>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-[var(--line)] px-3 pt-5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dbe8e3] text-xs font-bold text-[#25624b]">
            JD
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">Local QA User</p>
            <p className="truncate text-[11px] text-[var(--muted)]">
              QA Engineer
            </p>
          </div>
          <button
            aria-label="Log out"
            className="ml-auto text-[var(--muted)] hover:text-[var(--ink)]"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <main className="lg:pl-[232px]">
        <header className="flex h-[76px] items-center justify-between border-b border-[var(--line)] bg-[#fbfcfc]/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-lg text-[var(--muted)] hover:bg-white lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="hidden text-sm font-semibold text-[var(--muted)] lg:block">
              {tab}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              aria-label="Help"
              className="grid h-10 w-10 place-items-center rounded-xl text-[var(--muted)] hover:bg-white"
            >
              <CircleHelp size={18} />
            </button>
            <button
              aria-label="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-[var(--muted)] hover:bg-white"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </button>
            <div className="hidden h-6 w-px bg-[var(--line)] sm:block" />
            <Button variant="primary" onClick={() => openRecorder()}>
              <Plus size={16} strokeWidth={2.5} /> Start recording
            </Button>
          </div>
        </header>
        <div className="mx-auto max-w-[1360px] px-5 py-8 sm:px-8 lg:px-12">
          {tab === "Dashboard" && (
            <>
              <section className="fade-up flex flex-col justify-between gap-7 md:flex-row md:items-end">
                <div>
                  <p className="mb-3 text-sm font-semibold text-[var(--accent-dark)]">
                    Tuesday, October 15, 2024
                  </p>
                  <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-.055em] sm:text-5xl">
                    Capture the moment.
                    <br />
                    <span className="text-[var(--muted)]">
                      Keep the context.
                    </span>
                  </h1>
                  <p className="mt-4 max-w-md text-[15px] leading-6 text-[var(--muted)]">
                    Your quiet workspace for turning bugs into evidence your
                    team can act on.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => openRecorder()} variant="primary">
                    <Video size={16} /> Start recording
                  </Button>
                  <Button onClick={() => openRecorder()}>
                    <ImageIcon size={16} /> Capture screenshot
                  </Button>
                </div>
              </section>
              <section className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Total evidence
                    </span>
                    <Grid2X2 size={17} className="text-[var(--muted)]" />
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-[-.05em]">
                    128
                  </p>
                  <p className="mt-1 text-xs text-[var(--success)]">
                    ↑ 12% this month
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      This week
                    </span>
                    <Clock3 size={17} className="text-[var(--muted)]" />
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-[-.05em]">
                    24
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    8 recordings · 16 screenshots
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      OneDrive storage
                    </span>
                    <UploadCloud size={17} className="text-[var(--muted)]" />
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-[-.05em]">
                    18.4{" "}
                    <span className="text-lg font-semibold text-[var(--muted)]">
                      GB
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    of 1 TB available
                  </p>
                </div>
              </section>
              <section className="mt-12">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-[-.03em]">
                      Recent evidence
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      The latest signals from your QA work.
                    </p>
                  </div>
                  <button
                    onClick={() => setTab("Recordings")}
                    className="text-sm font-bold text-[var(--blue)] hover:underline"
                  >
                    View library <ArrowUpRight className="inline" size={15} />
                  </button>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {evidence.map((item) => (
                    <EvidenceCard key={item.id} item={item} onCopy={copyLink} />
                  ))}
                </div>
              </section>
            </>
          )}
          {tab === "Recordings" && (
            <section className="fade-up">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--accent-dark)]">
                    Evidence library
                  </p>
                  <h1 className="text-4xl font-bold tracking-[-.055em]">
                    All recordings
                  </h1>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Everything you capture, organized and ready to share.
                  </p>
                </div>
                <Button variant="primary" onClick={() => openRecorder()}>
                  <Plus size={16} /> New evidence
                </Button>
              </div>
              <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-3 text-[var(--muted)]"
                    size={17}
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search names, folders, bug IDs..."
                    className="h-11 w-full rounded-xl bg-[var(--surface-muted)] pl-10 pr-3 text-sm outline-none placeholder:text-[#9ba4a7] focus:ring-2 focus:ring-[var(--blue)]/20"
                  />
                </div>
                <Button>
                  <ListFilter size={16} /> Filters <ChevronDown size={14} />
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-lg bg-[var(--ink)] px-3 py-2 text-xs font-bold text-white">
                  All evidence · {filtered.length}
                </span>
                {[
                  "Recording",
                  "Screenshot",
                  "Bug",
                  "Regression",
                  "Production",
                ].map((filter) => (
                  <button
                    key={filter}
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <EvidenceCard key={item.id} item={item} onCopy={copyLink} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-white py-20 text-center">
                  <Search className="mx-auto text-[var(--muted)]" />
                  <h2 className="mt-4 font-bold">No evidence found</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Try a different name, folder, or bug ID.
                  </p>
                </div>
              )}
            </section>
          )}
          {tab === "Folders" && (
            <section className="fade-up">
              <p className="mb-2 text-sm font-semibold text-[var(--accent-dark)]">
                OneDrive workspace
              </p>
              <h1 className="text-4xl font-bold tracking-[-.055em]">Folders</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                A clean home for the evidence your team needs to find again.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Bugs", 42, "#fff0ec"],
                  ["Regression", 31, "#edf3ff"],
                  ["E2E", 28, "#f3eee5"],
                  ["Production", 12, "#eaf8f1"],
                ].map(([folder, count, color]) => (
                  <button
                    key={folder}
                    className="group rounded-2xl border border-[var(--line)] bg-white p-5 text-left shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                  >
                    <span
                      style={{ background: color as string }}
                      className="grid h-11 w-11 place-items-center rounded-xl text-[var(--ink)]"
                    >
                      <Folder size={20} />
                    </span>
                    <h2 className="mt-5 font-bold">{folder}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {count} evidence items
                    </p>
                    <ArrowUpRight
                      className="mt-6 text-[var(--muted)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      size={16}
                    />
                  </button>
                ))}
                <button className="flex min-h-[176px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-transparent text-[var(--muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-dark)]">
                  <FolderPlus size={22} />
                  <span className="mt-3 text-sm font-bold">Create folder</span>
                </button>
              </div>
            </section>
          )}
          {tab === "Settings" && (
            <section className="fade-up max-w-3xl">
              <p className="mb-2 text-sm font-semibold text-[var(--accent-dark)]">
                Workspace settings
              </p>
              <h1 className="text-4xl font-bold tracking-[-.055em]">
                Settings
              </h1>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
                  <h2 className="font-bold">Profile</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Your Microsoft account details.
                  </p>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-[#dbe8e3] font-bold text-[#25624b]">
                      JD
                    </div>
                    <div>
                      <p className="font-bold">Local QA User</p>
                      <p className="text-sm text-[var(--muted)]">
                        local.qa@example.test
                      </p>
                    </div>
                    <span className="ml-auto rounded-lg bg-[var(--success-soft)] px-3 py-2 text-xs font-bold text-[var(--success)]">
                      Microsoft connected
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
                  <h2 className="font-bold">Recording defaults</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Set up Trace to match your daily workflow.
                  </p>
                  <div className="mt-5 divide-y divide-[var(--line)]">
                    <label className="flex items-center justify-between py-4 text-sm">
                      <span>
                        <span className="block font-semibold">Microphone</span>
                        <span className="text-xs text-[var(--muted)]">
                          Ask before each recording
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={mic}
                        onChange={() => setMic(!mic)}
                        className="h-5 w-5 accent-[var(--accent)]"
                      />
                    </label>
                    <label className="flex items-center justify-between py-4 text-sm">
                      <span>
                        <span className="block font-semibold">
                          System audio
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          Availability depends on browser and OS
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={systemAudio}
                        onChange={() => setSystemAudio(!systemAudio)}
                        className="h-5 w-5 accent-[var(--accent)]"
                      />
                    </label>
                    <div className="flex items-center justify-between py-4 text-sm">
                      <span>
                        <span className="block font-semibold">
                          Keyboard shortcuts
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          Space pause/resume · Esc stop
                        </span>
                      </span>
                      <span className="rounded-md bg-[var(--surface-muted)] px-2 py-1 font-mono text-xs">
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      {showRecord && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 grid place-items-center bg-[var(--ink)]/35 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-xl rounded-3xl border border-white/70 bg-[#fbfcfc] p-6 shadow-[var(--shadow-lg)] sm:p-8">
            {recordState === "idle" ||
            recordState === "preparing" ||
            recordState === "error" ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-[var(--accent-dark)]">
                      {showEvidenceMode ? "Bug evidence mode" : "New capture"}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">
                      Set the scene before you record.
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowRecord(false)}
                    className="grid h-10 w-10 place-items-center rounded-xl text-[var(--muted)] hover:bg-white"
                  >
                    <X size={19} />
                  </button>
                </div>
                {showEvidenceMode && (
                  <div className="mt-6 rounded-2xl bg-[var(--accent-soft)] p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
                      <Clipboard size={14} /> Bug evidence
                    </div>
                    <input
                      value={bugTitle}
                      onChange={(event) => setBugTitle(event.target.value)}
                      className="h-11 w-full rounded-xl border border-[#f5c8be] bg-white px-3 text-sm font-semibold outline-none"
                      placeholder="What went wrong?"
                    />
                    <div className="mt-3 flex gap-2">
                      <span className="rounded-lg bg-white px-2.5 py-2 text-xs font-bold text-[var(--muted)]">
                        BUG-118764
                      </span>
                      <span className="rounded-lg bg-white px-2.5 py-2 text-xs font-bold text-[var(--muted)]">
                        Staging
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-7">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Capture source
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      [Monitor, "Entire screen"],
                      [LayoutDashboard, "Window"],
                      [Grid2X2, "Browser tab"],
                    ].map(([Icon, label]) => (
                      <button
                        key={label as string}
                        className="flex min-h-[100px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-soft)] text-xs font-bold"
                      >
                        <Icon size={21} />
                        <span>{label as string}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setMic(!mic)}
                    className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-4 text-left hover:border-[var(--line-strong)]"
                  >
                    <span className="flex items-center gap-3">
                      <Mic size={18} />
                      <span>
                        <span className="block text-sm font-bold">
                          Microphone
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          {mic ? "On" : "Off"}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`h-5 w-9 rounded-full p-0.5 transition-colors ${mic ? "bg-[var(--accent)]" : "bg-[var(--line-strong)]"}`}
                    >
                      <span
                        className={`block h-4 w-4 rounded-full bg-white transition-transform ${mic ? "translate-x-4" : ""}`}
                      />
                    </span>
                  </button>
                  <button
                    onClick={() => setSystemAudio(!systemAudio)}
                    className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-4 text-left hover:border-[var(--line-strong)]"
                  >
                    <span className="flex items-center gap-3">
                      <Volume2 size={18} />
                      <span>
                        <span className="block text-sm font-bold">
                          System audio
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          Browser dependent
                        </span>
                      </span>
                    </span>
                    <span
                      className={`h-5 w-9 rounded-full p-0.5 transition-colors ${systemAudio ? "bg-[var(--accent)]" : "bg-[var(--line-strong)]"}`}
                    >
                      <span
                        className={`block h-4 w-4 rounded-full bg-white transition-transform ${systemAudio ? "translate-x-4" : ""}`}
                      />
                    </span>
                  </button>
                </div>
                <div className="mt-5 flex gap-3 rounded-xl bg-[#fff8eb] p-3 text-xs leading-5 text-[#795b2c]">
                  <span>!</span>
                  <span>
                    Screen recordings may contain passwords, tokens, customer
                    data, or other confidential information. Check your screen
                    before starting.
                  </span>
                </div>
                {recordState === "error" && (
                  <p className="mt-4 rounded-xl bg-[#fff0ee] p-3 text-sm font-semibold text-[#b84738]">
                    Screen sharing was cancelled or unavailable. Check your
                    browser permission and try again.
                  </p>
                )}
                <div className="mt-7 flex justify-end gap-3">
                  <Button onClick={() => setShowRecord(false)}>Cancel</Button>
                  <Button
                    variant="primary"
                    onClick={startRecording}
                    disabled={recordState === "preparing"}
                  >
                    {recordState === "preparing" ? (
                      "Opening picker..."
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-white" /> Start
                        recording
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : recordState === "recording" || recordState === "paused" ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex w-fit items-center gap-3 rounded-full bg-[#fff0ec] px-4 py-2 text-xs font-bold text-[var(--accent-dark)]">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--accent)]" />{" "}
                  {recordState === "paused" ? "Recording paused" : "Recording"}{" "}
                  · {formatTime(elapsed)}
                </div>
                <h2 className="mt-8 text-3xl font-bold tracking-[-.05em]">
                  Keep testing. We&apos;re on it.
                </h2>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {recordState === "paused"
                    ? "Resume when you are ready."
                    : "This controller stays out of your way."}
                </p>
                <div className="mt-10 flex justify-center gap-3">
                  <Button onClick={togglePause}>
                    {recordState === "paused" ? (
                      <Play size={16} />
                    ) : (
                      <Pause size={16} />
                    )}
                    {recordState === "paused" ? "Resume" : "Pause"}
                  </Button>
                  <Button variant="danger" onClick={stopRecording}>
                    <Square size={15} fill="currentColor" /> Stop
                  </Button>
                </div>
                <p className="mt-7 text-xs text-[var(--muted)]">
                  Space to pause · Esc to stop
                </p>
              </div>
            ) : recordState === "processing" ? (
              <div className="py-16 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Activity className="animate-pulse" />
                </div>
                <h2 className="mt-6 text-2xl font-bold">
                  Preparing your preview
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Keeping the original capture local until you choose Save.
                </p>
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                  <Check />
                </div>
                <h2 className="mt-5 text-2xl font-bold">Recording saved</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Your evidence is ready in the library.
                </p>
                <Button
                  className="mt-7"
                  variant="primary"
                  onClick={() => {
                    setShowRecord(false);
                    setTab("Recordings");
                  }}
                >
                  View recordings
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {showSave && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[#fbfcfc] p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--accent-dark)]">
                  Recording complete
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">
                  Save your evidence
                </h2>
              </div>
              <button
                onClick={() => setShowSave(false)}
                aria-label="Close save dialog"
                className="grid h-10 w-10 place-items-center rounded-xl text-[var(--muted)] hover:bg-white"
              >
                <X size={19} />
              </button>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[#d9dee0]">
              {previewUrl ? (
                <video
                  className="h-36 w-full bg-black object-contain"
                  controls
                  preload="metadata"
                  src={previewUrl}
                  aria-label="Recording preview"
                />
              ) : (
                <div className="flex h-36 items-center justify-center">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 shadow">
                    <Play size={17} fill="currentColor" />
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between bg-white/80 px-4 py-3 text-xs font-semibold">
                <span>Preview ready · {formatTime(elapsed)}</span>
                <span>
                  {chunksRef.current.length
                    ? "Capture complete"
                    : "Local preview"}
                </span>
              </div>
            </div>
            <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Recording name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={
                  showEvidenceMode
                    ? `BUG-118764-${bugTitle.toLowerCase().replaceAll(" ", "-")}`
                    : "Recording - 2024-10-15 10-42"
                }
                className="mt-2 h-12 w-full rounded-xl border border-[var(--line-strong)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--blue)]"
              />
            </label>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Save to OneDrive folder
              </p>
              <button className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-xl border border-[var(--line-strong)] bg-white px-3 text-left hover:border-[var(--ink)]">
                <Folder className="text-[var(--accent)]" size={18} />
                <span className="flex-1 text-sm font-semibold">
                  Default Recording Tool / Regression
                </span>
                <ChevronDown size={16} className="text-[var(--muted)]" />
              </button>
            </div>
            {recordState === "uploading" && (
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-bold">
                  <span>Uploading to OneDrive...</span>
                  <span>78%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <div className="h-full w-[78%] rounded-full bg-[var(--accent)]" />
                </div>
              </div>
            )}
            <div className="mt-7 flex justify-end gap-3">
              <Button
                disabled={recordState === "uploading"}
                onClick={() => {
                  setShowSave(false);
                  setShowRecord(false);
                  setRecordState("idle");
                }}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                disabled={recordState === "uploading"}
                onClick={saveRecording}
              >
                {recordState === "uploading" ? (
                  "Uploading..."
                ) : (
                  <>
                    <UploadCloud size={16} /> Save recording
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {copied && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)]"
        >
          <Check size={17} className="text-[#73d2a5]" /> Link copied to
          clipboard
        </div>
      )}
    </div>
  );
}
