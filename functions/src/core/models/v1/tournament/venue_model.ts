import { Timestamp } from "firebase-admin/firestore";

export interface VenueModel {
  id?: string;
  name: string;
  abbreviation: string;
  number_of_courts: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  time_zone: string;
  tournament_id: string;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export const venueModelConverter = {
  toFirestore(venue: Partial<Omit<VenueModel, "id">>): FirebaseFirestore.DocumentData {
    const data: any = { ...venue };
    if (data.default_availability && typeof data.default_availability === "object") {
      for (const dateKey of Object.keys(data.default_availability)) {
        const tr = data.default_availability[dateKey];
        if (!tr) continue;

        const normalizeNested = (val: any) => {
          if (val == null) return null;
          if (typeof val === "object" && typeof val.toDate === "function") return val;
          if (val instanceof Date) return Timestamp.fromDate(val);
          if (typeof val === "string") {
            const timeOnlyMatch = /^\d{1,2}:\d{2}(:\d{2})?$/.test(val);
            try {
              const iso = timeOnlyMatch ? `${dateKey}T${val}` : val;
              const d = new Date(iso);
              if (!isNaN(d.getTime())) return Timestamp.fromDate(d);
            } catch (e) {}
            return null;
          }
          return null;
        };

        tr.start_time = normalizeNested(tr.start_time);
        tr.end_time = normalizeNested(tr.end_time);
        data.default_availability[dateKey] = tr;
      }
    }

    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) delete data[key];
    });

    delete data.id;
    return data;
  },

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): VenueModel {
    const data = snapshot.data();
    const availabilityData = data.default_availability;

    if (availabilityData && typeof availabilityData === "object") {
      for (const dateKey of Object.keys(availabilityData)) {
        const timeRange = availabilityData[dateKey];
        if (!timeRange) continue;
      }
    }

    return {
      id: snapshot.id,
      name: data.name ?? "Unnamed Venue",
      tournament_id: data.tournament_id ?? "",
      abbreviation: data.abbreviation ?? "",
      number_of_courts: data.number_of_courts ?? 0,
      address: data.address ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      zip: data.zip ?? "",
      notes: data.notes ?? "",
      time_zone: data.time_zone ?? "+08:00",
      created_at: data.created_at ?? null,
      updated_at: data.updated_at ?? null,
    };
  },
};
