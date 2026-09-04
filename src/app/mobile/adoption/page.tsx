import { requireAuth } from "@/lib/auth/session";
import {
  getAdoptionMobileDataForUser,
  getShelterById,
} from "@/lib/data/service";
import {
  AdoptionMobileClient,
  type AdoptionCardData,
} from "./adoption-mobile-client";

async function toCards(
  animals: Awaited<ReturnType<typeof getAdoptionMobileDataForUser>>["queue"],
) {
  const shelterNames = new Map<string, string>();
  await Promise.all(
    animals.map(async (animal) => {
      if (!animal.shelterId || shelterNames.has(animal.shelterId)) return;
      const shelter = await getShelterById(animal.shelterId);
      if (shelter) shelterNames.set(animal.shelterId, shelter.name);
    }),
  );

  return animals.map(
    (animal): AdoptionCardData => ({
      id: animal.id,
      name: animal.name ?? animal.temporaryId,
      species: animal.species,
      temperament: animal.temperament,
      bio: animal.bio,
      photoUrl: animal.photoUrl,
      estimatedAge: animal.estimatedAge,
      sex: animal.sex,
      shelterName: animal.shelterId
        ? shelterNames.get(animal.shelterId)
        : undefined,
    }),
  );
}

export default async function MobileAdoptionPage() {
  const session = await requireAuth("/mobile/adoption");
  const data = await getAdoptionMobileDataForUser(
    session.user.id,
    session.user.email,
  );

  const [queue, interested, browse] = await Promise.all([
    toCards(data.queue),
    toCards(data.interested),
    toCards(data.browse),
  ]);

  return (
    <AdoptionMobileClient
      queue={queue}
      interested={interested}
      browse={browse}
      appliedAnimalIds={data.appliedAnimalIds}
      passedCount={data.passedCount}
      applicantName={session.user.name}
      applicantEmail={session.user.email}
    />
  );
}
