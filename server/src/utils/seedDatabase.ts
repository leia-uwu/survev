import { generateId } from "lucia";
import type { MatchDataTable } from "../api/db/schema";

// Helper functions
 function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
 }
 
 function chunk<T>(array: T[], size: number): T[][] {
  return Array.from(
    { length: Math.ceil(array.length / size) },
    (_, i) => array.slice(i * size, i * size + size)
  );
 }
 

export function generateMatchHistory(userId: string, numPlayers = 70): MatchDataTable[] {
  const gameId = generateId(15);
  const playerIds = Array.from({ length: numPlayers }, (_, i) => i + 1);
  const teams = chunk(shuffle([...playerIds]), 4); // 4 players per team
  const aliveTime = Math.floor(Math.random() * 300) + 60; // 60-360 seconds

  return playerIds.map(id => {
    const team = teams.find(t => t.includes(id))!;
    const teamId = teams.indexOf(team) + 1;
    const kills = Math.floor(Math.random() * 8); // 0-7 kills
    
    // Get random victims from other teams
    const victims = shuffle(playerIds.filter(p => !team.includes(p)))
      .slice(0, kills);
    
    const died = Math.random() > 0.5;
    const killer = died ? 
      playerIds.find(p => !team.includes(p))! : 
      0;
 
    return {
      gameId,
      userId,
      slug: (Math.random() > 0.2 ? `player${id}` : null),
      username: `Player${id}`,
      player_id: id,
      team_id: teamId,
      time_alive: died ? Math.floor(Math.random() * aliveTime) : aliveTime,
      rank: teamId,
      died,
      kills,
      damage_dealt: Math.floor(Math.random() * 1000),
      damage_taken: Math.floor(Math.random() * 500),
      killer_id: killer,
      killed_ids: victims
    };
  });
 }
