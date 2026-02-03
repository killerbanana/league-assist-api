import { Timestamp } from "firebase-admin/firestore";

export interface TimelineTemplateTask {
  name: string;
  description: string;
  offset: number;
  order: number;
}

export interface AdmissionPrice {
  adult?: number;
  student?: number;
  spectator?: number;
  parent?: number;
}

export interface VenueGate {
  id: string;
  label?: string;
}

export interface VenueAdmissionConfig extends AdmissionPrice {
  number_of_admissions?: number;
  gates?: VenueGate[];
}

export interface AdmissionConfig {
  default?: AdmissionPrice;
  venues?: Record<string, VenueAdmissionConfig>;
  courts?: Record<string, AdmissionPrice>;
  games?: Record<string, AdmissionPrice>;
}

export interface TournamentConfig {
  id?: string;
  user_id: string;
  created_date: Timestamp;
  updated_date: Timestamp;
  max_point_differential: number;
  box_scores: { is_enabled: boolean };
  leaderboard: {
    is_enabled: boolean;
    number_of_players: number;
    player_only: boolean;
  };
  live_feed: {
    is_enabled: boolean;
    game_id: string;
  };
  admission_config?: AdmissionConfig;
  timeline_template?: TimelineTemplateTask[];
  tournament_logo?: string;
  instagram_handle?: string;
  contact_email?: string;
  website_url?: string;
  schedule_increment?: number;
  time_between_games?: number;
  allow_back_to_back: boolean;
  display_standings_metrics: {
    PD: boolean;
    PF: boolean;
    PA: boolean;
    W: boolean;
    L: boolean;
    win_percentage: boolean;
  };
}

export const tournamentConfigConverter = {
  toFirestore: (config: Omit<TournamentConfig, "id">): FirebaseFirestore.DocumentData => {
    return {
      user_id: config.user_id,
      created_date: config.created_date,
      updated_date: config.updated_date,
      box_scores: config.box_scores,
      leaderboard: config.leaderboard,
      live_feed: config.live_feed,
      admission_config: config.admission_config || null,
      timeline_template: config.timeline_template || [],
      tournament_logo: config.tournament_logo,
      instagram_handle: config.instagram_handle,
      contact_email: config.contact_email,
      website_url: config.website_url,
      schedule_increment: config.schedule_increment,
      time_between_games: config.time_between_games,
      allow_back_to_back: config.allow_back_to_back,
      max_point_differential: config.max_point_differential,
      display_standings_metrics: config.display_standings_metrics,
    };
  },
  fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot): TournamentConfig => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      user_id: data.user_id,
      created_date: data.created_date,
      updated_date: data.updated_date,
      box_scores: data.box_scores,
      leaderboard: data.leaderboard,
      live_feed: data.live_feed,
      admission_config: data.admission_config,
      timeline_template: data.timeline_template,
      tournament_logo: data.tournament_logo,
      instagram_handle: data.instagram_handle,
      contact_email: data.contact_email,
      website_url: data.website_url,
      schedule_increment: data.schedule_increment,
      time_between_games: data.time_between_games,
      allow_back_to_back: data.allow_back_to_back,
      max_point_differential: data.max_point_differential,
      display_standings_metrics: data.display_standings_metrics,
    };
  },
};

export interface VenueAdmission {
  id: string;
  tournament_id: string;
  venue_id: string;
  venue_name: string;
  number_of_admissions: number;
  admission_id: string;
  gate_label?: string;
  login_email: string;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export const venueAdmissionConverter = {
  toFirestore: (data: Omit<VenueAdmission, "id">): FirebaseFirestore.DocumentData => {
    return {
      tournament_id: data.tournament_id,
      venue_id: data.venue_id,
      venue_name: data.venue_name,
      number_of_admissions: data.number_of_admissions,
      admission_id: data.admission_id,
      gate_label: data.gate_label || null,
      login_email: data.login_email,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },
  fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot): VenueAdmission => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      tournament_id: data.tournament_id,
      venue_id: data.venue_id,
      venue_name: data.venue_name,
      number_of_admissions: data.number_of_admissions,
      admission_id: data.admission_id,
      gate_label: data.gate_label,
      login_email: data.login_email,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },
};
