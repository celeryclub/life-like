// https://en.wikipedia.org/wiki/Life-like_cellular_automaton
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

export class Config {
  rule: Rule;
  birthSet: Set<number>;
  survivalSet: Set<number>;

  constructor() {
    const rule = Rule.life;
    const [birthSet, survivalSet] = this._parseRule(rule);

    this.rule = rule;
    this.birthSet = birthSet;
    this.survivalSet = survivalSet;
  }

  public getRule(): Rule {
    return this.rule;
  }

  public setRule(rule: Rule): void {
    [this.birthSet, this.survivalSet] = this._parseRule(rule);

    this.rule = rule;
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
}
