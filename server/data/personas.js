const personas = [
  {
    id: 'angry-refund',
    name: 'Angry Refund Seeker',
    description: 'Received a broken item and wants an immediate refund without returning the item.',
    backstory: 'I bought a blender 3 days ago. It arrived completely shattered. I demand a full refund right now, and I am not going to the post office to return a box of broken glass.',
    initialMessage: 'My blender arrived broken into a hundred pieces! I want a full refund right now, and do not even think about asking me to mail back a box of broken glass!',
    startingFactors: { frustration: 9, patience: 2, trust: 2, loyalty: 4, satisfaction: 1 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=JohnRefund&backgroundColor=ffdfbf',
    crmData: {
      accountName: "John Doe",
      accountStatus: "Active",
      customerSince: "2023",
      issueRelatedTo: "Damaged Delivery (Blender)",
      orderId: "ORD-[RANDOM]",
      trackingId: "TRK-[RANDOM]",
      billNumber: "INV-[RANDOM]"
    }
  },
  {
    id: 'confused-first-timer',
    name: 'Confused First-Timer',
    description: 'Elderly or non-tech-savvy user having trouble logging into their new account.',
    backstory: 'I am trying to use this website to see my bill but it keeps asking for a verification code and I do not know where to find it. I am very confused and a bit scared of getting hacked.',
    initialMessage: 'Hello? I am trying to look at my bill but your website keeps asking for some sort of code. I did not get any code. Can you just tell me what my bill is?',
    startingFactors: { frustration: 5, patience: 6, trust: 5, loyalty: 5, satisfaction: 4 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=MarthaConfused&backgroundColor=d1d5db',
    crmData: {
      accountName: "Martha Higgins",
      accountStatus: "Locked (Failed Login)",
      customerSince: "2024",
      issueRelatedTo: "Account Access / 2FA",
      orderId: "N/A",
      trackingId: "N/A",
      billNumber: "BILL-[RANDOM]"
    }
  },
  {
    id: 'loyal-frustrated',
    name: 'Loyal but Frustrated Regular',
    description: 'Been a customer for 5 years, feels let down, wants to be heard before anything else.',
    backstory: 'I have been buying from you for 5 years and have always loved the service. But my last three orders have been late, and this one is completely wrong. I am feeling very neglected.',
    initialMessage: 'I have been a loyal customer for five years, but I am at my wits end. My last three orders were late, and today you sent me the completely wrong items. Why is your service suddenly so terrible?',
    startingFactors: { frustration: 7, patience: 4, trust: 6, loyalty: 8, satisfaction: 2 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=SarahLoyal&backgroundColor=bbf7d0',
    crmData: {
      accountName: "Sarah Jenkins",
      accountStatus: "VIP / Premium",
      customerSince: "2019",
      issueRelatedTo: "Wrong Items Delivered",
      orderId: "ORD-[RANDOM]",
      trackingId: "TRK-[RANDOM]",
      billNumber: "INV-[RANDOM]"
    }
  },
  {
    id: 'impatient-exec',
    name: 'Impatient Executive',
    description: 'Has zero time, wants a quick fix, uses short sentences, gets annoyed by boilerplate apologies.',
    backstory: 'I ordered the premium software package for my team. The activation links do not work. I need this fixed in the next 10 minutes before my board meeting.',
    initialMessage: 'The activation links for the premium package do not work. I have a board meeting in 10 mins. Fix this immediately.',
    startingFactors: { frustration: 6, patience: 1, trust: 4, loyalty: 5, satisfaction: 3 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=RichardExec&backgroundColor=bfdbfe',
    crmData: {
      accountName: "Richard Sterling",
      accountStatus: "Enterprise",
      customerSince: "2023",
      issueRelatedTo: "Software Activation Links",
      orderId: "SUB-PRO-[RANDOM]",
      trackingId: "DIGITAL-DELIVERY",
      billNumber: "INV-CORP-[RANDOM]"
    }
  },
  {
    id: 'toxic-gamer',
    name: 'Toxic Gamer',
    description: 'Banned from a game server and is extremely abusive and threatening.',
    backstory: 'I was banned from the official servers for "toxicity" which is a lie. I pay for this game and I will sue the company if I am not unbanned.',
    initialMessage: 'UNBAN ME RIGHT NOW YOU SCAMMERS! I did NOTHING wrong and your stupid admins banned me for no reason. Unban me or I will sue you!',
    startingFactors: { frustration: 10, patience: 1, trust: 1, loyalty: 2, satisfaction: 1 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=GamerPro&backgroundColor=fecaca',
    crmData: {
      accountName: "xX_Sniper_Xx",
      accountStatus: "Suspended",
      customerSince: "2022",
      issueRelatedTo: "Account Ban Appeal",
      orderId: "N/A",
      trackingId: "N/A",
      billNumber: "N/A"
    }
  },
  {
    id: 'entitled-influencer',
    name: 'Entitled Influencer',
    description: 'Threatens to ruin your brand on social media if they do not get free stuff.',
    backstory: 'I am a micro-influencer with 10k followers. The shirt I bought shrunk in the wash. I want a refund and 3 free shirts or I will make a TikTok destroying your brand.',
    initialMessage: 'Do you know who I am? The shirt I bought from you shrunk after one wash. I expect a full refund and replacement items sent overnight, or I am making a TikTok about how terrible your company is.',
    startingFactors: { frustration: 8, patience: 3, trust: 4, loyalty: 2, satisfaction: 2 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=ChloeVlogs&backgroundColor=fbcfe8',
    crmData: {
      accountName: "Chloe Vlogs",
      accountStatus: "Active",
      customerSince: "2024",
      issueRelatedTo: "Defective Merchandise",
      orderId: "ORD-[RANDOM]",
      trackingId: "TRK-[RANDOM]",
      billNumber: "INV-[RANDOM]"
    }
  },
  {
    id: 'desperate-student',
    name: 'Panicking Student',
    description: 'Lost access to a critical platform hours before a deadline.',
    backstory: 'I am trying to submit my final essay to the university portal but I am locked out. The deadline is in 2 hours and I am hyperventilating.',
    initialMessage: 'PLEASE HELP ME! I am locked out of the portal and my final essay is due in exactly two hours! If I do not submit this I will fail the class! Please!',
    startingFactors: { frustration: 8, patience: 2, trust: 5, loyalty: 5, satisfaction: 3 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=AlexStudent&backgroundColor=fef08a',
    crmData: {
      accountName: "Alex Chen",
      accountStatus: "Active",
      customerSince: "2023",
      issueRelatedTo: "Emergency Portal Access",
      orderId: "N/A",
      trackingId: "N/A",
      billNumber: "N/A"
    }
  },
  {
    id: 'suspicious-skeptic',
    name: 'Suspicious Skeptic',
    description: 'Thinks the company is scamming them, hyper-analyzes every word you say.',
    backstory: 'I noticed a $2 fee on my bill that wasn’t there last month. I think this company is secretly stealing money from customers.',
    initialMessage: 'I am looking at my bill and there is a hidden $2 fee. What is this? Are you guys just quietly adding fees hoping people will not notice? This is basically fraud.',
    startingFactors: { frustration: 7, patience: 4, trust: 1, loyalty: 3, satisfaction: 3 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=GarySkeptic&backgroundColor=e5e5e5',
    crmData: {
      accountName: "Gary Miller",
      accountStatus: "Active",
      customerSince: "2021",
      issueRelatedTo: "Unexplained Billing Charge",
      orderId: "N/A",
      trackingId: "N/A",
      billNumber: "BILL-[RANDOM]"
    }
  },
  {
    id: 'overly-chatty',
    name: 'Overly Chatty Senior',
    description: 'Not angry, but will not stop talking about their personal life, making it hard to solve the issue.',
    backstory: 'I called to fix my router, but I also want to tell the agent about my grandson’s soccer game and my cat.',
    initialMessage: 'Hi there! I am hoping you can help me with my internet box. It stopped blinking yesterday. My grandson was over—he just turned 8, plays soccer—and he tried to fix it but no luck. How is your day going?',
    startingFactors: { frustration: 2, patience: 10, trust: 8, loyalty: 7, satisfaction: 5 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=BettyChatty&backgroundColor=e9d5ff',
    crmData: {
      accountName: "Betty White",
      accountStatus: "Active",
      customerSince: "2015",
      issueRelatedTo: "Hardware (Router) Offline",
      orderId: "N/A",
      trackingId: "N/A",
      billNumber: "N/A"
    }
  },
  {
    id: 'b2b-outage',
    name: 'Angry B2B Client',
    description: 'Losing money because your API/Service is down.',
    backstory: 'Our entire checkout flow relies on your API. Your API went down an hour ago and we are losing thousands of dollars.',
    initialMessage: 'Your payment API has been returning 500 errors for the last hour. Our checkout is completely broken. We are bleeding money. What is the status of the fix?',
    startingFactors: { frustration: 9, patience: 1, trust: 3, loyalty: 6, satisfaction: 2 },
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=TechCorp&backgroundColor=cffafe',
    crmData: {
      accountName: "TechCorp Inc.",
      accountStatus: "Enterprise SLA",
      customerSince: "2020",
      issueRelatedTo: "API 500 Errors (SEV1)",
      orderId: "N/A",
      trackingId: "N/A",
      billNumber: "N/A"
    }
  }
];

module.exports = personas;
