const partnersResult = {
  data: [
    { conversation_id: 'convo1', profiles: { id: 'userA', full_name: 'User A' } },
    { conversation_id: 'convo2', profiles: { id: 'userA', full_name: 'User A' } }, // Duplicate partner
    { conversation_id: 'convo3', profiles: { id: 'userB', full_name: 'User B' } },
  ]
};

const latestMsgsResult = {
  data: [
    { conversation_id: 'convo1', content: 'Old message', created_at: '2026-04-04T10:00:00Z' },
    { conversation_id: 'convo2', content: 'New message', created_at: '2026-04-04T12:00:00Z' },
  ]
};

const builtChats = [];
const processedPartnerIds = new Set();

// Sort partners by their latest message or conversation ID to ensure deterministic order before deduping
const sortedPartners = [...partnersResult.data].map(p => {
  const msg = latestMsgsResult.data?.find((m) => m.conversation_id === p.conversation_id);
  return { ...p, msg, sortTime: msg ? new Date(msg.created_at).getTime() : 0 };
}).sort((a, b) => b.sortTime - a.sortTime);

for (const partnerRaw of sortedPartners) {
  const partnerData = Array.isArray(partnerRaw.profiles) ? partnerRaw.profiles[0] : partnerRaw.profiles;
  const pId = partnerData?.id;
  const cId = partnerRaw.conversation_id;

  if (pId && !processedPartnerIds.has(pId)) {
    processedPartnerIds.add(pId);
    
    const msg = partnerRaw.msg;
    
    builtChats.push({
      id: cId,
      partner_id: pId,
      name: partnerData?.full_name || partnerData?.username || "Unknown Student",
      sortTime: partnerRaw.sortTime,
    });
  }
}

console.log("Built Chats:", JSON.stringify(builtChats, null, 2));
if (builtChats.length === 2 && builtChats[0].partner_id === 'userA' && builtChats[0].id === 'convo2') {
    console.log("SUCCESS: Deduplication worked and picked the latest conversation!");
} else {
    console.log("FAILURE: Deduplication failed.");
}
