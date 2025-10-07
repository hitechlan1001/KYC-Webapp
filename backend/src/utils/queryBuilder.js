export function buildSettlementQuery(user) {
  const filters = applyUserFilters(user);
  
  let query = `
    SELECT 
      Region_ID,
      Region_Name,
      Union_ID,
      Union_Name,
      \`Start Date\` as Start_Date,
      \`End Date\` as End_Date,
      bbjp_fee,
      bbjp_payouts,
      eco_earnings,
      eco_percentage,
      eco_tax_rebate,
      leaderboard_reward,
      net_settlement,
      other_adj,
      total_ev_cashout,
      total_hands,
      total_players,
      tournament_eco_earnings,
      tournament_eco_percentage,
      tournament_eco_tax_rebate,
      tournament_fee,
      tournament_winnings,
      union_fee,
      union_fee_percentage,
      union_tournament_fee,
      win_ratio,
      total_winnings,
      total_fee
    FROM \`GG Settle Region\`
    WHERE 1=1
  `;
  
  query += filters.whereClause;
  return { sql: query, params: filters.params };
}

export function buildClubSettlementQuery(user) {
  const filters = applyUserFilters(user);
  
  let query = `
    SELECT 
      Region_ID,
      Region_Name,
      Union_ID,
      Union_Name,
      Club_ID,
      Club_Name,
      \`Start Date\` as Start_Date,
      \`End Date\` as End_Date,
      bbjp_fee,
      bbjp_payouts,
      eco_earnings,
      eco_percentage,
      eco_tax_rebate,
      leaderboard_reward,
      net_settlement,
      other_adj,
      total_ev_cashout,
      total_hands,
      total_players,
      tournament_eco_earnings,
      tournament_eco_percentage,
      tournament_eco_tax_rebate,
      tournament_fee,
      tournament_winnings,
      union_fee,
      union_fee_percentage,
      union_tournament_fee,
      win_ratio,
      total_winnings,
      total_fee
    FROM \`GG Settle Club\`
    WHERE 1=1
  `;
  
  query += filters.whereClause;
  return { sql: query, params: filters.params };
}

export function buildClubQuery(user, options = {}) {
  const { search, region_id, club_id } = options;
  
  let query = `
    SELECT 
      ID,
      Name,
      Region_ID,
      Region_Name,
      Union_ID,
      Union_Name,
      Fee,
      fee_type,
      Eco,
      eco_type,
      eco_earnings_type,
      BBJ,
      ECode_flag,
      MTT_Fee,
      MTT_Eco,
      net_settlement_type
    FROM \`GG Club\`
    WHERE 1=1
  `;
  
  const params = [];
  
  if (club_id) {
    query += ` AND ID = ?`;
    params.push(club_id);
  }
  
  if (region_id) {
    query += ` AND Region_ID = ?`;
    params.push(region_id);
  }
  
  if (search) {
    query += ` AND (Name LIKE ? OR Region_Name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  
  const filters = applyUserFilters(user);
  query += filters.whereClause;
  params.push(...filters.params);
  
  return { sql: query, params };
}

export function buildMemberQuery(user, options = {}) {
  const { search, club_id } = options;
  
  let query = `
    SELECT 
      ID as Member_ID,
      Nickname,
      Club_ID,
      Club_Name,
      Region_ID,
      Region_Name,
      Union_ID,
      Union_Name,
      Role,
      Agent_ID,
      Agent_Nickname,
      Manager_ID,
      Manager_Nickname,
      \`Super Agent_ID\` as Super_Agent_ID,
      \`Super Agent_Nickname\` as Super_Agent_Nickname,
      \`Last Active\` as Last_Active,
      Country
    FROM \`GG Member\`
    WHERE 1=1
  `;
  
  const params = [];
  
  if (club_id) {
    query += ` AND Club_ID = ?`;
    params.push(club_id);
  }
  
  if (search) {
    query += ` AND (Nickname LIKE ? OR Agent_Nickname LIKE ? OR Manager_Nickname LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  const filters = applyUserFilters(user);
  query += filters.whereClause;
  params.push(...filters.params);
  
  return { sql: query, params };
}

export function applyUserFilters(user) {
  let whereClause = '';
  const params = [];
  
  if (!user) {
    return { whereClause, params };
  }
  
  switch (user.role) {
    case 'admin':
      break;
      
    case 'union_head':
      if (user.union_id) {
        whereClause += ` AND Union_ID = ?`;
        params.push(user.union_id);
      }
      break;
      
    case 'regional_head':
      if (user.region_id) {
        whereClause += ` AND Region_ID = ?`;
        params.push(user.region_id);
      }
      break;
      
    case 'club_owner':
    case 'sa_manager':
      if (user.club_id) {
        whereClause += ` AND Club_ID = ?`;
        params.push(user.club_id);
      }
      break;
      
    case 'super_agent':
      // Super agents can only see data for their club
      if (user.club_id) {
        whereClause += ` AND Club_ID = ?`;
        params.push(user.club_id);
      } else {
        // If no club_id, show no data
        whereClause += ` AND 1=0`;
      }
      break;
      
    case 'agent':
      // Agents can only see data for their club
      if (user.club_id) {
        whereClause += ` AND Club_ID = ?`;
        params.push(user.club_id);
      } else {
        // If no club_id, show no data
        whereClause += ` AND 1=0`;
      }
      break;
      
    case 'player':
      // Players can only see data for their club
      if (user.club_id) {
        whereClause += ` AND Club_ID = ?`;
        params.push(user.club_id);
      } else {
        // If no club_id, show no data
        whereClause += ` AND 1=0`;
      }
      break;
      
    default:
      whereClause += ` AND 1=0`;
      break;
  }
  
  return { whereClause, params };
}

// Region-specific filter function for tables without Club_ID column
export function applyRegionUserFilters(user) {
  let whereClause = '';
  const params = [];
  
  if (!user) {
    return { whereClause, params };
  }
  
  switch (user.role) {
    case 'admin':
      break;
      
    case 'union_head':
      if (user.union_id) {
        whereClause += ` AND Union_ID = ?`;
        params.push(user.union_id);
      }
      break;
      
    case 'regional_head':
      if (user.region_id) {
        whereClause += ` AND Region_ID = ?`;
        params.push(user.region_id);
      }
      break;
      
    case 'club_owner':
    case 'sa_manager':
    case 'super_agent':
    case 'agent':
    case 'player':
      // For region-level data, club-level users should see data based on their region
      if (user.region_id) {
        whereClause += ` AND Region_ID = ?`;
        params.push(user.region_id);
      } else {
        // If no region_id, show no data
        whereClause += ` AND 1=0`;
      }
      break;
      
    default:
      whereClause += ` AND 1=0`;
      break;
  }
  
  return { whereClause, params };
}

export function hasWritePermission(user, entityType, entityId) {
  if (!user) return false;
  
  if (user.role === 'admin') return true;
  
  const permissionKey = `${entityType}_${entityId}`;
  const permission = user.permissions[permissionKey];
  
  return permission === 'write' || permission === 'admin';
}

export function addPagination(query, page, limit) {
  const offset = (page - 1) * limit;
  return `${query} LIMIT ${limit} OFFSET ${offset}`;
}

export function addSorting(query, sortBy, sortOrder = 'ASC') {
  return `${query} ORDER BY ${sortBy} ${sortOrder}`;
}

// Consolidated role-based filters function (replaces duplicated buildRoleBasedFilters)
export function buildRoleBasedFilters(user) {
  const filters = applyUserFilters(user);
  
  return {
    whereClause: filters.whereClause,
    params: filters.params,
    description: getFilterDescription(user)
  };
}

function getFilterDescription(user) {
  if (!user) return 'No user - no data access';
  
  switch (user.role) {
    case 'admin':
      return 'Admin access - showing all data';
    case 'union_head':
      return user.union_id ? `Filtered by Union ID: ${user.union_id}` : 'No union access';
    case 'regional_head':
      return user.region_id ? `Filtered by Region ID: ${user.region_id}` : 'No region access';
    case 'club_owner':
      return user.club_id ? `Filtered by Club ID: ${user.club_id}` : 'No club access';
    case 'sa_manager':
      return user.manager_id && user.club_id ? 
        `Filtered by Manager ID: ${user.manager_id} and Club ID: ${user.club_id}` : 
        'No manager/club access';
    case 'super_agent':
      return user.club_id ? `Filtered by Club ID: ${user.club_id}` : 'No club access';
    case 'agent':
      return user.club_id ? `Filtered by Club ID: ${user.club_id}` : 'No club access';
    case 'player':
      return user.club_id ? `Filtered by Club ID: ${user.club_id}` : 'No club access';
    default:
      return 'No access';
  }
}