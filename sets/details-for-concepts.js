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
  },
  CausesDesire: {
    lineCount: 962,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `things ${concept} makes you want`
        : `things that make you want to ${concept.toLowerCase()}`;
    }
  },
  CreatedBy: {
    lineCount: 65,
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `creators of ${concept}`
        : `creations of ${concept}`;
    }
  },
  DefinedAs: {
    lineCount: 277,
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `definitions of ${concept}`
        : `things defined as ${concept}`;
    }
  },
  // DistinctFrom: {
  // lineCount: 277,
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `things distinct from ${concept}` : `huh ${concept}`;
  // }
  // },
  // Entails: {
  // lineCount: 92,
  // chance: 1,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `things that ${concept} entails` : `things entailed in ${concept}`;
  // }
  // }
  HasFirstSubevent: {
    lineCount: 816,
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `first steps of ${concept}`
        : `things that ${concept} is a first step of`;
    }
  },
  HasLastSubevent: {
    lineCount: 770,
    chance: 2,
    disallowUseEmitters: true, // Only works in the `concept =relation=> receivers` direction
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `final steps of ${concept}`
        : `things that ${concept} is the final step of`;
    }
  },
  HasPrerequisite: {
    lineCount: 3268,
    chance: 1,
    disallowUseEmitters: true,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `prerequisites of ${concept}`
        : `things that ${concept} is a prerequisite for`;
    }
  },
  HasProperty: {
    lineCount: 1685,
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `properties of ${concept}` : `${concept} things`;
    }
  },
  HasSubevent: {
    lineCount: 3219,
    chance: 2,
    disallowUseEmitters: true,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `steps of ${concept}`
        : `things that ${concept} is a step of`;
    }
  },
  InstanceOf: {
    lineCount: 219,
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `classifications of ${concept}`
        : `instances of ${concept}`;
    }
  },
  // IsA: {
  // lineCount: 52153,
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `${concept}` : `${concept} things`;
  // }
  // }
  MadeOf: {
    lineCount: 131,
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `${concept} materials`
        : `things made of ${concept}`;
    }
  },
  // MannerOf: {
  // lineCount: 3113,
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `way to ${concept}` : `things is a way to ${concept}`;
  // }
  // }
  MotivatedByGoal: {
    lineCount: 1313,
    chance: 2,
    disallowUseEmitters: true,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `motivations of ${concept}`
        : `things motivated by ${concept}`;
    }
  },
  // NotCapableOf: {
  // lineCount: 46,
  // chance: 1,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `things that ${concept} can't do` : `things that can't ${concept}`;
  // }
  // },
  // ReceivesAction: {
  // lineCount: 1245,
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `things done with ${concept}` : `things ${concept}`;
  // }
  // },
  //SimilarTo: {
  //SymbolOf: {
  // dbpedia_genre: {
  // lineCount: 1219,
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `genres ${concept} is in` : `things in the ${concept} genre`;
  // }
  // },
  dbpedia_influencedBy: {
    lineCount: 369,
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `influences of ${concept}`
        : `things influenced by ${concept}`;
    }
  }
};
