// https://en.wikipedia.org/wiki/Life-like_cellular_automaton
// https://conwaylife.com/wiki/List_of_Life-like_cellular_automata
// http://www.mirekw.com/ca/rullex_life.html

export enum Rule {
  amoeba = "B357/S1358",
  assimilation = "B345/S4567",
  coral = "B3/S45678",
  dayAndNight = "B3678/S34678",
  diamoeba = "B35678/S5678",
  dryLife = "B37/S23",
  flakes = "B3/S012345678",
  gnarl = "B1/S1",
  highLife = "B36/S23",
  life = "B3/S23",
  longLife = "B345/S5",
  maze = "B3/S12345",
  mazeAlt1 = "B3/S1234",
  mazeAlt2 = "B37/S12345",
  move = "B368/S245",
  seeds = "B2/S",
  serviettes = "B234/S",
  stains = "B3678/S235678",
  threeFourLife = "B34/S34",
  twoByTwo = "B36/S125",
  walledCities = "B45678/S2345",
}

export type RuleKey = keyof typeof Rule;

const stylizedRuleNames: Partial<Record<Rule, string>> = {
  [Rule.dayAndNight]: "Day & Night",
  [Rule.dryLife]: "DryLife",
  [Rule.highLife]: "HighLife",
  [Rule.threeFourLife]: "34 Life",
  [Rule.twoByTwo]: "2x2",
};

export class Config {
  private _rule: Rule;

  public birthSet: Set<number>;
  public survivalSet: Set<number>;

  constructor() {
    const rule = Rule.life;
    const [birthSet, survivalSet] = this._parseRule(rule);

    this._rule = rule;
    this.birthSet = birthSet;
    this.survivalSet = survivalSet;
  }

  private _parseRule(rule: Rule): [Set<number>, Set<number>] {
    const halves = rule.split("/");

    const birthSet = new Set(
      halves[0]
        .substring(1)
        .split("")
        .map(s => parseInt(s, 10))
    );
    const survivalSet = new Set(
      halves[1]
        .substring(1)
        .split("")
        .map(s => parseInt(s, 10))
    );

    return [birthSet, survivalSet];
  }

  private _convertToTitlecase(key: RuleKey): string {
    const splitWords = key.replace(/([A-Z])/g, " $1");

    return splitWords.charAt(0).toUpperCase() + splitWords.slice(1);
  }

  public ruleNameByKey(key: RuleKey): string {
    const ruleValue = Rule[key];

    if (stylizedRuleNames[ruleValue]) {
      return stylizedRuleNames[ruleValue]!;
    } else {
      return this._convertToTitlecase(key);
    }
  }

  public getRule(): Rule {
    return this._rule;
  }

  public setRule(rule: Rule): void {
    [this.birthSet, this.survivalSet] = this._parseRule(rule);

    this._rule = rule;
  }
}
