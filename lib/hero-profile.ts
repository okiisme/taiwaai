export interface HeroProfile {
  name: string
  description: string
}

export function getHeroProfile(hope: number, efficacy: number, resilience: number, optimism: number): HeroProfile {
  const scores = { hope, efficacy, resilience, optimism }
  const allGreaterThan = (val: number) => Object.values(scores).every(s => s > val)
  const allLessThan = (val: number) => Object.values(scores).every(s => s < val)

  if (allGreaterThan(7.0)) {
    return {
      name: "フルチャージ型",
      description: "全ての心理的資本が高く、チームを牽引する行動力に満ちています。"
    }
  }

  if (hope > 7.0 && efficacy > 7.0 && optimism < 3.0) {
    return {
      name: "内発悲観型",
      description: "自分にはできる意志と能力があるが、環境や未来に対して悲観的です。"
    }
  }

  if (hope > 7.0 && efficacy < 3.0) {
    return {
      name: "夢見型",
      description: "理想や希望は持っていますが、現状を自分が変えられる自信が不足しています。"
    }
  }

  if (resilience > 7.0 && hope < 5.0 && efficacy < 5.0) {
    return {
      name: "消耗継続型",
      description: "耐え抜く力はありますが、未来への希望や自信が低下しており、疲労が蓄積しやすい状態です。"
    }
  }

  if (allLessThan(5.0)) {
    return {
      name: "観察モード推奨",
      description: "全体的なエネルギーが低下しています。まずは無理に行動せず、状況を観察・整理することが推奨されます。"
    }
  }

  // 動的生成
  const entries = [
    { key: "Hope", label: "希望", value: hope },
    { key: "Efficacy", label: "効力感", value: efficacy },
    { key: "Resilience", label: "回復力", value: resilience },
    { key: "Optimism", label: "楽観性", value: optimism }
  ]

  entries.sort((a, b) => b.value - a.value)
  const highest = entries[0]
  const lowest = entries[entries.length - 1]

  return {
    name: `${highest.label}優位・${lowest.label}劣位型`,
    description: `「${highest.label}」がチームを支える強みである一方、「${lowest.label}」が課題となっています。強みを活かしつつ弱みを補うアプローチが有効です。`
  }
}
