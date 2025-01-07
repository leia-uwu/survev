import { generateId } from "lucia";
import type { MatchDataTable } from "../api/db/schema";
import { TeamMode } from "../../../shared/gameConfig";

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
 }

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
 

export function generateMatchHistory(userId: string, slug: string, numPlayers = 70): MatchDataTable[] {
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
      mapId: 1,
      region: getRandomItem(["na", "eu", "as"]),
      createdAt: new Date(),
      teamTotal: team.length,
      teamMode: getRandomItem([TeamMode.Solo, TeamMode.Duo, TeamMode.Squad]),
      gameId,
      userId,
      slug: (Math.random() > 0.2 ? slug : null),
      username: `Player${id}`,
      playerId: id,
      teamId: teamId,
      timeAlive: died ? Math.floor(Math.random() * aliveTime) : aliveTime,
      rank: teamId,
      died,
      kills,
      damageDealt: Math.floor(Math.random() * 1000),
      damageTaken: Math.floor(Math.random() * 500),
      killerId: killer,
      killedIds: victims
    };
  });
 }
