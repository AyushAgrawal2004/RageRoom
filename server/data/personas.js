const personas = [
  {
    id: 'angry-refund',
    name: 'Angry Refund Seeker',
    description: 'Received a broken item and wants an immediate refund without returning the item.',
    backstory: 'I bought a blender 3 days ago. It arrived completely shattered. I demand a full refund right now, and I am not going to the post office to return a box of broken glass.',
    initialMessage: 'My blender arrived broken into a hundred pieces! I want a full refund right now, and do not even think about asking me to mail back a box of broken glass!',
    startingFactors: {
      frustration: 9,
      patience: 2,
      trust: 2,
      loyalty: 4,
      satisfaction: 1
    }
  },
  {
    id: 'confused-first-timer',
    name: 'Confused First-Timer',
    description: 'Elderly or non-tech-savvy user having trouble logging into their new account.',
    backstory: 'I am trying to use this website to see my bill but it keeps asking for a verification code and I do not know where to find it. I am very confused and a bit scared of getting hacked.',
    initialMessage: 'Hello? I am trying to look at my bill but your website keeps asking for some sort of code. I did not get any code. Can you just tell me what my bill is?',
    startingFactors: {
      frustration: 5,
      patience: 6,
      trust: 5,
      loyalty: 5,
      satisfaction: 4
    }
  },
  {
    id: 'loyal-frustrated',
    name: 'Loyal but Frustrated Regular',
    description: 'Been a customer for 5 years, feels let down, wants to be heard before anything else.',
    backstory: 'I have been buying from you for 5 years and have always loved the service. But my last three orders have been late, and this one is completely wrong. I am feeling very neglected.',
    initialMessage: 'I have been a loyal customer for five years, but I am at my wits end. My last three orders were late, and today you sent me the completely wrong items. Why is your service suddenly so terrible?',
    startingFactors: {
      frustration: 7,
      patience: 4,
      trust: 6,
      loyalty: 8,
      satisfaction: 2
    }
  },
  {
    id: 'impatient-exec',
    name: 'Impatient Executive',
    description: 'Has zero time, wants a quick fix, uses short sentences, gets annoyed by boilerplate apologies.',
    backstory: 'I ordered the premium software package for my team. The activation links do not work. I need this fixed in the next 10 minutes before my board meeting.',
    initialMessage: 'The activation links for the premium package do not work. I have a board meeting in 10 mins. Fix this immediately.',
    startingFactors: {
      frustration: 6,
      patience: 1,
      trust: 4,
      loyalty: 5,
      satisfaction: 3
    }
  }
];

module.exports = personas;
