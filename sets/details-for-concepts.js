module.exports = {
  AtLocation: {
    lineCount: 15835,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `locations of ${concept}` : `things at ${concept}`;
    }
  },
  CapableOf: {
    lineCount: 10102,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `capabilities of ${concept}`
        : `things that can ${concept}`;
    }
  },
  Causes: {
    lineCount: 13252,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `results of ${concept}` : `causes of ${concept}`;
    }
  },
  HasA: {
    lineCount: 3636,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `aspects of ${concept}` : `havers of ${concept}`;
    }
  },
  PartOf: {
    lineCount: 8406,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `things ${concept} is a part of`
        : `part of ${concept}`;
    }
  },
  UsedFor: {
    lineCount: 14171,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `uses of ${concept}` : `things used for ${concept}`;
    }
  }
};
