module.exports = {
  AtLocation: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `locations of ${concept}` : `things at ${concept}`;
    }
  },
  CapableOf: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `capabilities of ${concept}`
        : `things that can ${concept}`;
    }
  },
  Causes: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `results of ${concept}` : `causes of ${concept}`;
    }
  },
  HasA: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `aspects of ${concept}` : `havers of ${concept}`;
    }
  },
  PartOf: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `things ${concept} is a part of`
        : `part of ${concept}`;
    }
  },
  UsedFor: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `uses of ${concept}` : `things used for ${concept}`;
    }
  },
  CausesDesire: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `things ${concept} makes you want`
        : `things that make you want to ${concept.toLowerCase()}`;
    }
  },
  CreatedBy: {
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `creators of ${concept}`
        : `creations of ${concept}`;
    }
  },
  DefinedAs: {
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `definitions of ${concept}`
        : `things defined as ${concept}`;
    }
  },
  // DistinctFrom: {
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `things distinct from ${concept}` : `huh ${concept}`;
  // }
  // },
  // Entails: {
  // chance: 1,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `things that ${concept} entails` : `things entailed in ${concept}`;
  // }
  // }
  HasFirstSubevent: {
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `first steps of ${concept}`
        : `things that ${concept} is a first step of`;
    }
  },
  HasLastSubevent: {
    chance: 2,
    disallowUseEmitters: true, // Only works in the `concept =relation=> receivers` direction
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `final steps of ${concept}`
        : `things that ${concept} is the final step of`;
    }
  },
  HasPrerequisite: {
    chance: 1,
    disallowUseEmitters: true,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `prerequisites of ${concept}`
        : `things that ${concept} is a prerequisite for`;
    }
  },
  HasProperty: {
    chance: 2,
    formatTheme(concept, useReceivers) {
      return useReceivers ? `properties of ${concept}` : `${concept} things`;
    }
  },
  HasSubevent: {
    chance: 2,
    disallowUseEmitters: true,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `steps of ${concept}`
        : `things that ${concept} is a step of`;
    }
  },
  InstanceOf: {
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `classifications of ${concept}`
        : `instances of ${concept}`;
    }
  },
  // IsA: {
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `${concept}` : `${concept} things`;
  // }
  // }
  MadeOf: {
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `${concept} materials`
        : `things made of ${concept}`;
    }
  },
  // MannerOf: {
  // chance: 2,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `way to ${concept}` : `things is a way to ${concept}`;
  // }
  // }
  MotivatedByGoal: {
    chance: 2,
    disallowUseEmitters: true,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `motivations of ${concept}`
        : `things motivated by ${concept}`;
    }
  },
  // NotCapableOf: {
  // chance: 1,
  // formatTheme(concept, useReceivers) {
  // return useReceivers ? `things that ${concept} can't do` : `things that can't ${concept}`;
  // }
  // },
  // ReceivesAction: {
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
    chance: 1,
    formatTheme(concept, useReceivers) {
      return useReceivers
        ? `influences of ${concept}`
        : `things influenced by ${concept}`;
    }
  }
};
