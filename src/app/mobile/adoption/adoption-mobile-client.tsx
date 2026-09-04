"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  X,
  Loader2,
  CheckCircle2,
  LayoutGrid,
  Layers,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  expressAdoptionInterestAction,
  passAdoptionAnimalAction,
  resetAdoptionPassesAction,
  resetAllAdoptionSwipesAction,
  submitAdoptionApplicationAction,
} from "@/app/actions/adoption";
import { HOME_TYPE_OPTIONS, OTHER_VALUE } from "@/lib/forms/animal-field-options";
import { cn, formatStatus } from "@/lib/utils";

export interface AdoptionCardData {
  id: string;
  name: string;
  species: string;
  temperament?: string;
  bio?: string;
  photoUrl?: string;
  estimatedAge?: string;
  sex?: string;
  shelterName?: string;
}

interface AdoptionMobileClientProps {
  queue: AdoptionCardData[];
  interested: AdoptionCardData[];
  browse: AdoptionCardData[];
  appliedAnimalIds: string[];
  passedCount: number;
  applicantName: string;
  applicantEmail: string;
}

type Mode = "swipe" | "browse";
type Phase = "queue" | "match" | "apply" | "empty";

const SWIPE_THRESHOLD = 110;

export function AdoptionMobileClient({
  queue: initialQueue,
  interested: initialInterested,
  browse,
  appliedAnimalIds: initialApplied,
  passedCount: initialPassed,
  applicantName,
  applicantEmail,
}: AdoptionMobileClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("swipe");
  const [cards, setCards] = useState(initialQueue);
  const [interested, setInterested] = useState(initialInterested);
  const [appliedIds, setAppliedIds] = useState(() => new Set(initialApplied));
  const [passedCount, setPassedCount] = useState(initialPassed);
  const [phase, setPhase] = useState<Phase>(
    initialQueue.length === 0 ? "empty" : "queue",
  );
  const [matched, setMatched] = useState<AdoptionCardData | null>(null);
  const [applyAnimal, setApplyAnimal] = useState<AdoptionCardData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [resetPending, startReset] = useTransition();
  const startX = useRef(0);

  const current = cards[0] ?? null;

  function openApply(animal: AdoptionCardData) {
    setApplyAnimal(animal);
    setMatched(animal);
    setPhase("apply");
    setMode("swipe");
  }

  function afterRemoveFromQueue(animalId: string) {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== animalId);
      setPhase(next.length === 0 ? "empty" : "queue");
      return next;
    });
    setDragX(0);
  }

  async function onPass() {
    if (!current || pending) return;
    setPending(true);
    setError(null);
    const result = await passAdoptionAnimalAction(current.id);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPassedCount((n) => n + 1);
    setMatched(null);
    afterRemoveFromQueue(current.id);
  }

  async function onInterest() {
    if (!current || pending) return;
    setPending(true);
    setError(null);
    const result = await expressAdoptionInterestAction(current.id);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setInterested((prev) =>
      prev.some((a) => a.id === current.id) ? prev : [current, ...prev],
    );
    setMatched(current);
    setPhase("match");
    setDragX(0);
  }

  function keepBrowsingAfterMatch() {
    if (!matched) return;
    afterRemoveFromQueue(matched.id);
    setMatched(null);
  }

  function onApplied(animalId: string) {
    setAppliedIds((prev) => new Set(prev).add(animalId));
    setInterested((prev) => prev.filter((a) => a.id !== animalId));
    setApplyAnimal(null);
    setMatched(null);
    afterRemoveFromQueue(animalId);
  }

  function onPointerDown(clientX: number) {
    if (phase !== "queue" || pending) return;
    startX.current = clientX;
    setDragging(true);
  }

  function onPointerMove(clientX: number) {
    if (!dragging) return;
    setDragX(clientX - startX.current);
  }

  async function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX <= -SWIPE_THRESHOLD) {
      await onPass();
      return;
    }
    if (dragX >= SWIPE_THRESHOLD) {
      await onInterest();
      return;
    }
    setDragX(0);
  }

  function resetPasses() {
    startReset(async () => {
      setError(null);
      const result = await resetAdoptionPassesAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function resetAllSwipes() {
    startReset(async () => {
      setError(null);
      const result = await resetAllAdoptionSwipesAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (phase === "apply" && (applyAnimal || matched)) {
    const animal = applyAnimal ?? matched!;
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-sage/20 bg-white px-4 py-2.5">
          <h1 className="text-base font-bold text-graphite">Application</h1>
          <p className="text-[11px] text-graphite/50">
            Finish your interest in {animal.name}
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <ShortApplyForm
            animal={animal}
            applicantName={applicantName}
            applicantEmail={applicantEmail}
            onDone={() => onApplied(animal.id)}
            onCancel={() => {
              setApplyAnimal(null);
              setPhase(cards.length > 0 ? "queue" : "empty");
              setMatched(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-sage/20 bg-white px-4 pb-2 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-graphite">Adopt</h1>
            <p className="text-[11px] text-graphite/50">
              {mode === "swipe"
                ? "Swipe right if interested · left to pass"
                : "Browse all animals ready for a home"}
            </p>
          </div>
          <div className="flex shrink-0 rounded-full border border-sage/25 bg-bone p-0.5">
            <ModeChip
              active={mode === "swipe"}
              onClick={() => setMode("swipe")}
              icon={Layers}
              label="Swipe"
            />
            <ModeChip
              active={mode === "browse"}
              onClick={() => setMode("browse")}
              icon={LayoutGrid}
              label="List"
            />
          </div>
        </div>

        {interested.length > 0 ? (
          <button
            type="button"
            onClick={() => openApply(interested[0]!)}
            className="mt-2 flex min-h-10 w-full items-center justify-between rounded-xl border border-evergreen/25 bg-evergreen/5 px-3 text-left"
          >
            <span className="text-xs font-semibold text-evergreen">
              {interested.length} liked
              {interested.length === 1 ? " animal" : " animals"} · finish
              application
            </span>
            <Heart className="h-4 w-4 text-evergreen" aria-hidden />
          </button>
        ) : null}
      </header>

      {error ? (
        <p className="shrink-0 px-4 pt-2 text-sm text-rescue" role="alert">
          {error}
        </p>
      ) : null}

      {mode === "browse" ? (
        <BrowseList
          animals={browse}
          interestedIds={new Set(interested.map((a) => a.id))}
          appliedIds={appliedIds}
          onApply={openApply}
          onInterest={async (animal) => {
            setPending(true);
            const result = await expressAdoptionInterestAction(animal.id);
            setPending(false);
            if (result.error) {
              setError(result.error);
              return;
            }
            setInterested((prev) =>
              prev.some((a) => a.id === animal.id) ? prev : [animal, ...prev],
            );
            setCards((prev) => prev.filter((c) => c.id !== animal.id));
            openApply(animal);
          }}
          pending={pending}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-2 pt-2">
          {phase === "match" && matched ? (
            <MatchPause
              animal={matched}
              onApply={() => openApply(matched)}
              onKeepBrowsing={keepBrowsingAfterMatch}
            />
          ) : null}

          {phase === "empty" && !matched ? (
            <EmptySwipeState
              interestedCount={interested.length}
              passedCount={passedCount}
              resetPending={resetPending}
              onFinishInterest={() =>
                interested[0] ? openApply(interested[0]) : undefined
              }
              onResetPasses={resetPasses}
              onResetAll={resetAllSwipes}
              onOpenList={() => setMode("browse")}
            />
          ) : null}

          {phase === "queue" && current ? (
            <>
              <div
                className="relative mx-auto min-h-0 w-full max-w-sm flex-1 touch-none"
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLElement).setPointerCapture(
                    e.pointerId,
                  );
                  onPointerDown(e.clientX);
                }}
                onPointerMove={(e) => onPointerMove(e.clientX)}
                onPointerUp={() => void onPointerUp()}
                onPointerCancel={() => {
                  setDragging(false);
                  setDragX(0);
                }}
              >
                <AnimalCard
                  animal={current}
                  style={{
                    transform: `translateX(${dragX}px) rotate(${dragX / 28}deg)`,
                    transition: dragging ? "none" : "transform 160ms ease-out",
                  }}
                  passHint={dragX < -40}
                  likeHint={dragX > 40}
                />
              </div>

              <div className="mx-auto mt-2 flex w-full max-w-sm shrink-0 items-center justify-center gap-5 pb-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void onPass()}
                  className="flex min-h-12 min-w-12 items-center justify-center rounded-full border-2 border-rescue/30 bg-white text-rescue shadow-card active:scale-95 disabled:opacity-50"
                  aria-label="Pass"
                >
                  {pending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <X className="h-6 w-6" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void onInterest()}
                  className="flex min-h-12 min-w-12 items-center justify-center rounded-full border-2 border-evergreen/30 bg-evergreen text-white shadow-elevated active:scale-95 disabled:opacity-50"
                  aria-label="Interested"
                >
                  {pending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className="h-6 w-6" />
                  )}
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ModeChip({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Layers;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold",
        active ? "bg-white text-evergreen shadow-sm" : "text-graphite/50",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

function EmptySwipeState({
  interestedCount,
  passedCount,
  resetPending,
  onFinishInterest,
  onResetPasses,
  onResetAll,
  onOpenList,
}: {
  interestedCount: number;
  passedCount: number;
  resetPending: boolean;
  onFinishInterest: () => void;
  onResetPasses: () => void;
  onResetAll: () => void;
  onOpenList: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 text-center">
      <Heart className="h-10 w-10 text-evergreen/40" aria-hidden />
      <p className="mt-3 text-base font-semibold text-graphite">
        You&apos;re all caught up
      </p>
      <p className="mt-1.5 max-w-[17rem] text-sm text-graphite/55">
        {interestedCount > 0
          ? "You liked animals earlier. Finish an application, or reset passed cards to swipe again."
          : "No more animals in your swipe queue. Reset passes or browse the full list."}
      </p>

      <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
        {interestedCount > 0 ? (
          <Button
            className="min-h-11 w-full rounded-full"
            onClick={onFinishInterest}
          >
            Finish application ({interestedCount})
          </Button>
        ) : null}

        {passedCount > 0 ? (
          <Button
            variant="outline"
            className="min-h-11 w-full rounded-full"
            disabled={resetPending}
            onClick={onResetPasses}
          >
            {resetPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Show passed again ({passedCount})
          </Button>
        ) : null}

        <Button
          variant="outline"
          className="min-h-11 w-full rounded-full"
          disabled={resetPending}
          onClick={onResetAll}
        >
          Reset all swipes
        </Button>

        <Button
          variant="ghost"
          className="min-h-11 w-full rounded-full"
          onClick={onOpenList}
        >
          Open list view
        </Button>
      </div>
    </div>
  );
}

function BrowseList({
  animals,
  interestedIds,
  appliedIds,
  onApply,
  onInterest,
  pending,
}: {
  animals: AdoptionCardData[];
  interestedIds: Set<string>;
  appliedIds: Set<string>;
  onApply: (animal: AdoptionCardData) => void;
  onInterest: (animal: AdoptionCardData) => void | Promise<void>;
  pending: boolean;
}) {
  if (animals.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-graphite/55">
        No animals are ready for adoption right now.
      </p>
    );
  }

  return (
    <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
      {animals.map((animal) => {
        const applied = appliedIds.has(animal.id);
        const liked = interestedIds.has(animal.id);
        return (
          <li
            key={animal.id}
            className="flex gap-3 overflow-hidden rounded-2xl border border-sage/20 bg-white p-2.5 shadow-card"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sage/15">
              {animal.photoUrl ? (
                <Image
                  src={animal.photoUrl}
                  alt={animal.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-graphite">
                {animal.name}
              </p>
              <p className="truncate text-xs text-graphite/55">
                {[formatStatus(animal.species), animal.estimatedAge]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {animal.shelterName ? (
                <p className="mt-0.5 truncate text-[11px] text-evergreen">
                  {animal.shelterName}
                </p>
              ) : null}
              <div className="mt-2">
                {applied ? (
                  <span className="text-xs font-semibold text-evergreen">
                    Application submitted
                  </span>
                ) : liked ? (
                  <Button
                    size="sm"
                    className="min-h-9 rounded-full"
                    onClick={() => onApply(animal)}
                  >
                    Finish application
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-9 rounded-full"
                    disabled={pending}
                    onClick={() => void onInterest(animal)}
                  >
                    I&apos;m interested
                  </Button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function AnimalCard({
  animal,
  style,
  passHint,
  likeHint,
}: {
  animal: AdoptionCardData;
  style?: React.CSSProperties;
  passHint?: boolean;
  likeHint?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-sage/20 bg-white shadow-elevated"
      style={style}
    >
      <div className="relative min-h-0 flex-[1.35] bg-sage/15">
        {animal.photoUrl ? (
          <Image
            src={animal.photoUrl}
            alt={animal.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-graphite/40">
            No photo
          </div>
        )}
        {passHint ? (
          <span className="absolute left-3 top-3 rotate-[-12deg] rounded-lg border-2 border-rescue px-2.5 py-0.5 text-xs font-bold uppercase text-rescue">
            Pass
          </span>
        ) : null}
        {likeHint ? (
          <span className="absolute right-3 top-3 rotate-[12deg] rounded-lg border-2 border-evergreen px-2.5 py-0.5 text-xs font-bold uppercase text-evergreen">
            Interested
          </span>
        ) : null}
      </div>
      <div className="shrink-0 space-y-1 px-3.5 py-2.5">
        <h2 className="truncate text-lg font-bold text-graphite">
          {animal.name}
        </h2>
        <p className="truncate text-xs text-graphite/60">
          {[formatStatus(animal.species), animal.estimatedAge, animal.sex]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {animal.shelterName ? (
          <p className="truncate text-xs font-medium text-evergreen">
            {animal.shelterName}
          </p>
        ) : null}
        {animal.temperament ? (
          <p className="line-clamp-1 text-xs text-graphite/70">
            {animal.temperament}
          </p>
        ) : null}
        {animal.bio ? (
          <p className="line-clamp-2 text-xs text-graphite/65">{animal.bio}</p>
        ) : null}
      </div>
    </div>
  );
}

function MatchPause({
  animal,
  onApply,
  onKeepBrowsing,
}: {
  animal: AdoptionCardData;
  onApply: () => void;
  onKeepBrowsing: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-evergreen/10">
        <Heart className="h-7 w-7 text-evergreen" aria-hidden />
      </div>
      <h2 className="mt-4 text-xl font-bold text-graphite">It&apos;s a match</h2>
      <p className="mt-2 max-w-xs text-sm text-graphite/60">
        You liked {animal.name}. Fill out a short application now, or keep
        swiping. Liked animals stay under &quot;finish application&quot; at the
        top.
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Button className="min-h-11 w-full rounded-full" onClick={onApply}>
          Continue application
        </Button>
        <Button
          variant="outline"
          className="min-h-11 w-full rounded-full"
          onClick={onKeepBrowsing}
        >
          Keep swiping
        </Button>
      </div>
    </div>
  );
}

function ShortApplyForm({
  animal,
  applicantName,
  applicantEmail,
  onDone,
  onCancel,
}: {
  animal: AdoptionCardData;
  applicantName: string;
  applicantEmail: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [homeType, setHomeType] = useState("house");
  const [motivation, setMotivation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    const result = await submitAdoptionApplicationAction({
      animalId: animal.id,
      applicantName,
      applicantEmail,
      homeType,
      motivation,
      householdSize: 1,
    });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    window.setTimeout(() => onDone(), 900);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-evergreen" aria-hidden />
        <p className="mt-3 font-semibold text-graphite">Interest submitted</p>
        <p className="mt-1 text-sm text-graphite/55">
          Shelter staff will review your application.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold text-graphite">
          Interest in {animal.name}
        </h2>
        <p className="mt-1 text-xs text-graphite/55">
          Submitting as {applicantName} ({applicantEmail})
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Home type</Label>
        <div className="grid grid-cols-2 gap-2">
          {HOME_TYPE_OPTIONS.filter((o) => o.value !== OTHER_VALUE).map(
            (opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setHomeType(opt.value)}
                className={cn(
                  "min-h-11 rounded-xl border px-3 text-left text-sm font-medium",
                  homeType === opt.value
                    ? "border-evergreen bg-evergreen/8 text-evergreen"
                    : "border-sage/30 bg-white text-graphite/70",
                )}
              >
                {opt.label}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivation" className="text-sm font-semibold">
          Why this animal?
        </Label>
        <Textarea
          id="motivation"
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Share a short note for shelter staff..."
          className="rounded-xl"
        />
      </div>

      {error ? (
        <p className="text-sm text-rescue" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 flex-1 rounded-full"
          onClick={onCancel}
          disabled={pending}
        >
          Back
        </Button>
        <Button
          type="button"
          className="min-h-11 flex-1 rounded-full"
          onClick={() => void submit()}
          disabled={pending}
        >
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit
        </Button>
      </div>
    </div>
  );
}
