// Contratos compartilhados entre backend e frontend.
// Manter aqui apenas TIPOS TypeScript — nenhum runtime.

export type SportKey = 'futebol' | 'volei' | 'tenis' | 'skate';
export type UserRole = 'superadmin' | 'owner' | 'member';
export type TenantStatus = 'preview' | 'active' | 'suspended' | 'expired';
export type LicenseStatus = 'pending' | 'active' | 'expired' | 'cancelled';
export type ChampionshipStatus = 'draft' | 'active' | 'finished' | 'cancelled';
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled';
export type TransactionType = 'income' | 'expense';
export type ExportFormat = 'pdf' | 'csv';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenant?: TenantDTO;
}

export interface TenantDTO {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
}

export interface ChampionshipDTO {
  id: string;
  name: string;
  sportType: SportKey;
  status: ChampionshipStatus;
  startDate?: string;
  endDate?: string;
  rulesConfig?: Record<string, unknown>;
}

export interface ParticipantDTO {
  id: string;
  championshipId: string;
  name: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface MatchDTO {
  id: string;
  championshipId: string;
  homeParticipant: ParticipantDTO;
  awayParticipant: ParticipantDTO;
  status: MatchStatus;
  scheduledAt?: string;
  liveToken: string;
  homeScore: number;
  awayScore: number;
  timerSeconds: number;
  timerRunning: boolean;
}

export interface LiveMatchDTO {
  championship: { name: string; sportType: SportKey };
  match: Pick<MatchDTO, 'homeScore' | 'awayScore' | 'timerSeconds' | 'timerRunning' | 'status'> & {
    homeParticipant: { name: string };
    awayParticipant: { name: string };
    stage?: string;
  };
  isPreview: boolean;
}

export interface ScoreUpdateEvent {
  matchId: string;
  homeScore: number;
  awayScore: number;
  lastEntry?: { participantId: string; delta: number; at: string };
}

export interface TimerEvent {
  matchId: string;
  running: boolean;
  seconds: number;
  serverTime: string;
}
