import { makeObservable, observable, action } from "mobx";
import { Config, Rule, RuleKey } from "../core/Config";
import { Playback } from "../core/Playback";

export class ConfigStore {
  private _config: Config;
  private _playback: Playback;

  public rule = Rule.life;
  public frameRate = 30;

  constructor(config: Config, playback: Playback) {
    this._config = config;
    this._playback = playback;

    makeObservable(this, {
      rule: observable,
      frameRate: observable,
      setRule: action,
      setFrameRate: action,
    });

    const rule = localStorage.getItem("rule");
    if (rule) this.setRule(rule as Rule);

    const frameRate = localStorage.getItem("frameRate");
    if (frameRate) this.setFrameRate(parseInt(frameRate, 10));
  }

  public getAllRules(): [string, string][] {
    const ruleKeys = Object.keys(Rule) as RuleKey[];

    return ruleKeys.map(ruleKey => {
      const ruleName = this._config.ruleNameByKey(ruleKey);
      const ruleValue = Rule[ruleKey];

      return [ruleName, ruleValue];
    });
  }

  public setRule(rule: Rule): void {
    localStorage.setItem("rule", rule);

    this._config.setRule(rule);

    this.rule = rule;
  }

  public setFrameRate(frameRate: number): void {
    localStorage.setItem("frameRate", frameRate.toString());

    this._playback.setFrameRate(frameRate);

    this.frameRate = frameRate;
  }
}
